import { fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import { sparks } from "@/lib/db/schema";
import { getViewer } from "@/lib/auth/viewer";
import { localDate } from "@/lib/local-date";
import { createSparkSchema } from "@/lib/sparks/schema";
import {
  isAllowedPhotoMime,
  mediaKeyBelongsToCircle,
} from "@/lib/sparks/policy";
import { enqueueCategorization } from "@/lib/categorize";
import { demoWriteResponse } from "@/lib/demo/guard";

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
  const viewer = await getViewer();
  const blocked = demoWriteResponse(viewer);
  if (blocked) return blocked;
  if (viewer.status !== "member") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { member } = viewer;

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

    if (!mediaKeyBelongsToCircle(media.key, member.circleId)) {
      return Response.json({ error: "Invalid media key" }, { status: 403 });
    }
    if (!isAllowedPhotoMime(media.mime)) {
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

  const [spark] = await db
    .insert(sparks)
    .values(values)
    .returning({ id: sparks.id, authorLocalDate: sparks.authorLocalDate });

  enqueueCategorization(spark.id);

  return Response.json({ spark }, { status: 201 });
}
