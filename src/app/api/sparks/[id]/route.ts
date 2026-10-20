import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { sparks } from "@/lib/db/schema";
import { getViewer } from "@/lib/auth/viewer";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, { params }: Props) {
  const viewer = await getViewer();
  if (viewer.status !== "member") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await params;
  const sparkId = Number(rawId);
  if (!Number.isInteger(sparkId) || sparkId <= 0) {
    return Response.json({ error: "Invalid spark ID" }, { status: 400 });
  }

  // 1. Fetch spark (only active rows)
  const [spark] = await db
    .select({
      id: sparks.id,
      circleId: sparks.circleId,
      authorMemberId: sparks.authorMemberId,
    })
    .from(sparks)
    .where(and(eq(sparks.id, sparkId), isNull(sparks.deletedAt)))
    .limit(1);

  if (!spark) {
    return Response.json({ error: "Spark not found" }, { status: 404 });
  }

  // 2. Ensure spark belongs to the user's circle
  if (spark.circleId !== viewer.member.circleId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Permission: author or circle owner
  const isAuthor = spark.authorMemberId === viewer.member.id;
  const isOwner = viewer.member.role === "owner";

  if (!isAuthor && !isOwner) {
    return Response.json(
      { error: "You don't have permission to delete this spark" },
      { status: 403 },
    );
  }

  // 4. Soft delete
  await db
    .update(sparks)
    .set({ deletedAt: new Date() })
    .where(eq(sparks.id, sparkId));

  return Response.json({ success: true, id: sparkId });
}
