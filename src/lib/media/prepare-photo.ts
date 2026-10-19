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
