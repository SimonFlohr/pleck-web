import { auth, currentUser } from "@clerk/nextjs/server";
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

  let [member] = await db
    .select()
    .from(members)
    .where(eq(members.clerkUserId, userId))
    .limit(1);

  const clerkUser = await currentUser();

  // If not linked by clerkUserId yet, auto-link by verified email on sign-in
  if (!member && clerkUser) {
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      ) ?? clerkUser.emailAddresses[0];
    const userEmail = primaryEmail?.emailAddress.toLowerCase();

    if (userEmail) {
      const [byEmail] = await db
        .select()
        .from(members)
        .where(eq(members.email, userEmail))
        .limit(1);

      if (byEmail) {
        const avatarUrl = clerkUser.imageUrl ?? byEmail.avatarUrl;
        await db
          .update(members)
          .set({
            clerkUserId: userId,
            ...(clerkUser.imageUrl ? { avatarUrl: clerkUser.imageUrl } : {}),
          })
          .where(eq(members.id, byEmail.id));

        member = {
          ...byEmail,
          clerkUserId: userId,
          avatarUrl,
        };
      }
    }
  }

  if (!member) {
    return { status: "no-circle", clerkUserId: userId };
  }

  // Transparently sync profile picture from Clerk if changed or missing
  if (clerkUser?.imageUrl && member.avatarUrl !== clerkUser.imageUrl) {
    await db
      .update(members)
      .set({ avatarUrl: clerkUser.imageUrl })
      .where(eq(members.id, member.id));
    member.avatarUrl = clerkUser.imageUrl;
  }

  return { status: "member", member };
}
