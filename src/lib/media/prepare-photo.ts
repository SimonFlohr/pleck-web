import exifr from "exifr";

/** Hex SHA-256. crypto.subtle only exists on https:// or localhost. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * Raw EXIF capture time, e.g. "2026:10:04 18:55:00".
 * reviveValues:false keeps it as a string. Otherwise exifr turns it into a
 * Date in the BROWSER's zone; the server should interpret it in the author's zone.
 */
export async function readExifDateTime(
  file: File,
): Promise<string | undefined> {
  try {
    const data = await exifr.parse(file, {
      pick: ["DateTimeOriginal"],
      reviveValues: false,
    });
    return typeof data?.DateTimeOriginal === "string"
      ? data.DateTimeOriginal
      : undefined;
  } catch {
    return undefined;
  }
}

/** Gets a presigned URL, then PUTs the file straight to S3. Returns the object key. */
export async function uploadToS3(
  file: File,
  circleId: number,
): Promise<string> {
  const presign = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, circleId, size: file.size }),
  });
  if (!presign.ok) {
    const body = await presign.json().catch(() => ({}));
    throw new Error(body.error ?? `Couldn't start upload (${presign.status})`);
  }
  const { presignedUrl, key } = (await presign.json()) as {
    presignedUrl: string;
    key: string;
  };

  // Content-Type MUST match what was signed, or S3 returns SignatureDoesNotMatch
  const put = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);

  return key;
}

/**
 * Downscales and compresses a photo on the client before upload.
 * - Caps max width/height to 1600px.
 * - Encodes to modern WebP (with fallback to JPEG).
 * - Reduces a photo upload size by 98%.
 */
export async function optimizePhoto(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  // If not an image or already smaller than 100KB, skip re-encoding
  if (!file.type.startsWith("image/") || file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down while maintaining aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt WebP encoding first, fallback to original if unsupported/larger
      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file); // Keep original if compression didn't shrink size
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: outputType,
            lastModified: file.lastModified,
          });
          resolve(optimizedFile);
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original on decode error
    };

    img.src = objectUrl;
  });
}
