import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { s3, BUCKET } from "@/lib/s3";
import { randomUUID } from "crypto";
import { ALLOWED_TYPES, MAX_SIZE_BYTES } from "@/lib/media-types";

// ── Config ────────────────────────────────────
const PRESIGN_EXPIRES_SECONDS = 300; // 5 minutes

// ── Route ─────────────────────────────────────
export async function POST(req: Request) {
  // 1. Authenticate
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse + validate request body
  let body: { contentType?: string; circleId?: number | string; size?: number };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { contentType, size } = body;
  const circleId = Number(body.circleId);

  if (!contentType || !circleId || Number.isNaN(circleId)) {
    return Response.json(
      { error: "contentType and valid circleId are required" },
      { status: 400 },
    );
  }

  // Validate file size cap (if provided by client)
  if (size && size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: "File size exceeds the 50MB limit" },
      { status: 400 },
    );
  }

  // 3. Validate content type allowlist
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    return Response.json(
      {
        error: `Unsupported content type: ${contentType}`,
        allowed: Object.keys(ALLOWED_TYPES),
      },
      { status: 400 },
    );
  }

  // 4. Verify user is a member of this circle
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.clerkUserId, clerkUserId))
    .limit(1);

  if (!member || member.circleId !== circleId) {
    return Response.json(
      { error: "Not a member of this circle" },
      { status: 403 },
    );
  }

  // 5. Build S3 key
  const sparkId = randomUUID();
  const key = `circles/${circleId}/sparks/${sparkId}/original.${ext}`;

  // 6. Generate presigned URL
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: PRESIGN_EXPIRES_SECONDS,
  });

  // 7. Return URL and metadata to client
  return Response.json({
    presignedUrl,
    key,
    sparkId,
    expiresIn: PRESIGN_EXPIRES_SECONDS,
  });
}
