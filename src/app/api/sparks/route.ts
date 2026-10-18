import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { sparks } from "@/lib/db/schema";
import { getViewer } from "@/lib/auth/viewer";
import { localDate } from "@/lib/local-date";
import { ALLOWED_TYPES } from "@/lib/media-types";
import { createSparkSchema } from "@/lib/sparks/schema";
import { enqueueCategorization } from "@/lib/categorize";

/**
 * EXIF DateTimeOriginal has no timezone, e.g. "2026:10:04 18:55:00".
 * Interpret it in the author's zone.
 */
function exifToInstant(raw: string | undefined, zone: string): Date | null {
  if (!raw) return null;
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const instant = fromZonedTime(`${y}-${mo}-${d}T${h}:${mi}:${s}`, zone);
  if (Number.isNaN(instant.getTime())) return null;
  if (instant.getTime() > Date.now() + 86_400_000) return null; // camera clock in the future
  return instant;
}

export async function POST(req: Request) {
  // 1. Auth + membership
  const viewer = await getViewer();
  if (viewer.status !== "member") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { member } = viewer;

  // 2. Validate
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSparkSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid spark", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // 3. Snapshot time context. One `now` for both columns, so they can never disagree,
  //    and created_at gets millisecond precision.
  const now = new Date();
  const base = {
    circleId: member.circleId,
    authorMemberId: member.id,
    authorTimezone: member.timezone,
    authorLocalDate: localDate(now, member.timezone),
    createdAt: now,
  };

  let values: typeof sparks.$inferInsert;

  if (input.type === "text") {
    values = { ...base, type: "text", textContent: input.textContent };
  } else {
    const { media } = input;

    // The key must belong to THIS member's circle. Otherwise a malicious
    // client could attach another circle's object to its own spark.
    if (
      !media.key.startsWith(`circles/${member.circleId}/sparks/`) ||
      media.key.includes("..")
    ) {
      return Response.json({ error: "Invalid media key" }, { status: 403 });
    }
    if (!media.mime.startsWith("image/") || !ALLOWED_TYPES[media.mime]) {
      return Response.json(
        { error: "Unsupported media type" },
        { status: 400 },
      );
    }

    values = {
      ...base,
      type: "photo",
      textContent: input.textContent || null,
      mediaKey: media.key,
      mediaMime: media.mime,
      mediaSizeBytes: media.sizeBytes,
      mediaSha256: media.sha256,
      mediaOriginalFilename: media.originalFilename ?? null,
      happenedAt: exifToInstant(input.exifDateTime, member.timezone),
    };
  }

  // 4. Persist
  const [spark] = await db
    .insert(sparks)
    .values(values)
    .returning({ id: sparks.id, authorLocalDate: sparks.authorLocalDate });

  // 5. Categorization
  enqueueCategorization(spark.id);

  return Response.json({ spark }, { status: 201 });
}
