import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { DEMO_MEMBER_EMAIL } from "@/lib/demo/constants";

export type Member = typeof members.$inferSelect;

export type Viewer =
  | { status: "signed-out" }
  | { status: "no-circle"; clerkUserId: string }
  | { status: "demo-unavailable" }
  | { status: "member"; member: Member; demo: boolean };

function memberViewer(member: Member): Viewer {
  return {
    status: "member",
    member,
    demo: member.email.toLowerCase() === DEMO_MEMBER_EMAIL,
  };
}

async function loadDemoMember(): Promise<Member | null> {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.email, DEMO_MEMBER_EMAIL))
    .limit(1);
  return member ?? null;
}

export async function getViewer(options?: {
  forceDemo?: boolean;
}): Promise<Viewer> {
  if (options?.forceDemo) {
    const demoMember = await loadDemoMember();
    if (demoMember) return memberViewer(demoMember);
    return { status: "demo-unavailable" };
  }

  const { userId } = await auth();

  if (userId) {
    let [member] = await db
      .select()
      .from(members)
      .where(eq(members.clerkUserId, userId))
      .limit(1);

    const clerkUser = await currentUser();

    if (!member && clerkUser) {
      const primaryEmail =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        ) ?? clerkUser.emailAddresses[0];
      const userEmail = primaryEmail?.emailAddress.toLowerCase();

      if (userEmail && userEmail !== DEMO_MEMBER_EMAIL) {
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

    if (member) {
      if (
        member.email.toLowerCase() !== DEMO_MEMBER_EMAIL &&
        clerkUser?.imageUrl &&
        member.avatarUrl !== clerkUser.imageUrl
      ) {
        await db
          .update(members)
          .set({ avatarUrl: clerkUser.imageUrl })
          .where(eq(members.id, member.id));
        member.avatarUrl = clerkUser.imageUrl;
      }

      return memberViewer(member);
    }
  }

  if (!userId) return { status: "signed-out" };
  return { status: "no-circle", clerkUserId: userId };
}
