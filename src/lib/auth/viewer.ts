import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

export type Member = typeof members.$inferSelect;

export type Viewer =
  | { status: "signed-out" }
  | { status: "no-circle"; clerkUserId: string }
  | { status: "member"; member: Member };

export async function getViewer(): Promise<Viewer> {
  const { userId } = await auth();
  if (!userId) return { status: "signed-out" };

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.clerkUserId, userId))
    .limit(1);

  return member
    ? { status: "member", member }
    : { status: "no-circle", clerkUserId: userId };
}
