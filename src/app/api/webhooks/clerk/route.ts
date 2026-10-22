import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  // 1. Verify the webhook signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
    event = JSON.parse(body) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // 2. Only handle user.created and session.created
  if (
    event.type !== "user.created" &&
    event.type !== "session.created" &&
    event.type !== "user.updated"
  ) {
    return new Response("Ignored", { status: 200 });
  }

  let clerkUserId: string;
  let email: string | undefined;
  let imageUrl: string | undefined;

  if (event.type === "user.created" || event.type === "user.updated") {
    clerkUserId = event.data.id;
    imageUrl = event.data.image_url;
    const primaryEmail =
      event.data.email_addresses.find(
        (e) => e.id === event.data.primary_email_address_id,
      ) ?? event.data.email_addresses[0];
    email = primaryEmail?.email_address.toLowerCase();
  } else if (event.type === "session.created") {
    clerkUserId = event.data.user_id;

    // Fast path: already linked by clerk_user_id?
    const [byClerkId] = await db
      .select()
      .from(members)
      .where(eq(members.clerkUserId, clerkUserId))
      .limit(1);
    if (byClerkId) {
      console.log(`Already linked: ${byClerkId.displayName} (${clerkUserId})`);
      return new Response("Already linked", { status: 200 });
    }

    // Try user payload embedded in session event first, fallback to Clerk API
    if (event.data.user?.email_addresses?.length) {
      const primaryEmail =
        event.data.user.email_addresses.find(
          (e) => e.id === event.data.user?.primary_email_address_id,
        ) ?? event.data.user.email_addresses[0];
      email = primaryEmail?.email_address.toLowerCase();
      imageUrl = event.data.user.image_url;
    } else {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
        user.emailAddresses[0];
      email = primaryEmail?.emailAddress.toLowerCase();
      imageUrl = user.imageUrl;
    }
  } else {
    return new Response("Ignored", { status: 200 });
  }

  if (!email) {
    console.log(`User ${clerkUserId} has no email address — skipping link`);
    return new Response("No email address", { status: 200 });
  }

  // 3. Already linked by clerk_user_id?
  const [byClerkId] = await db
    .select()
    .from(members)
    .where(eq(members.clerkUserId, clerkUserId))
    .limit(1);

  if (byClerkId) {
    console.log(`Already linked: ${byClerkId.displayName} (${clerkUserId})`);
    return new Response("Already linked", { status: 200 });
  }

  // 4. Match by email where clerk_user_id is null
  const [byEmail] = await db
    .select()
    .from(members)
    .where(and(eq(members.email, email), isNull(members.clerkUserId)))
    .limit(1);

  if (byEmail) {
    await db
      .update(members)
      .set({
        clerkUserId: clerkUserId,
        ...(imageUrl ? { avatarUrl: imageUrl } : {}),
      })
      .where(eq(members.id, byEmail.id));

    console.log(`Linked: ${byEmail.displayName} → ${clerkUserId}`);
    return new Response("Linked", { status: 200 });
  }

  // 5. No match — not in any circle yet (PLK-17/18 handle this)
  console.log(`No circle match: ${email} (${clerkUserId})`);
  return new Response("No circle match", { status: 200 });
}
