import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { familyCircles, members, sparks } from "./schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

// Initial owner setup (new members can be added later in Neon or Drizzle Studio)
const INITIAL_MEMBERS = [
  {
    displayName: "Simon",
    email: "simonflohr22@gmail.com",
    role: "owner" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
];

async function initFamily() {
  console.log("🛡️ Initializing Real Family Circle (Non-destructive)...\n");

  // 1. Purge accidental mock seed data if present ("Flohr–de Jong")
  const [mockCircle] = await db
    .select()
    .from(familyCircles)
    .where(eq(familyCircles.name, "Flohr–de Jong"))
    .limit(1);

  if (mockCircle) {
    console.log(
      "  🧹 Found accidental mock data ('Flohr–de Jong'). Cleaning it up...",
    );
    await db.delete(sparks).where(eq(sparks.circleId, mockCircle.id));
    await db.delete(members).where(eq(members.circleId, mockCircle.id));
    await db.delete(familyCircles).where(eq(familyCircles.id, mockCircle.id));
    console.log("  ✓ Mock sparks, members, and circle removed.\n");
  }

  // 2. Check if real "Flohr" circle already exists
  const [existingCircle] = await db
    .select()
    .from(familyCircles)
    .where(eq(familyCircles.name, "Flohr"))
    .limit(1);

  let circle = existingCircle;

  if (!circle) {
    console.log("  Creating family circle 'Flohr'...");
    const [newCircle] = await db
      .insert(familyCircles)
      .values({
        name: "Flohr",
        joinToken: randomUUID(),
        tier: "free",
      })
      .returning();
    circle = newCircle;
    console.log(`  ✓ Created circle "${circle.name}" (id: ${circle.id})\n`);
  } else {
    console.log(
      `  ✓ Existing circle found: "${circle.name}" (id: ${circle.id})\n`,
    );
  }

  // 2. Insert owner if non-existent
  console.log("  Registering owner member slot...");
  for (const m of INITIAL_MEMBERS) {
    const existing = await db
      .select()
      .from(members)
      .where(eq(members.email, m.email.toLowerCase()))
      .limit(1);

    if (existing.length === 0) {
      // Try linking Clerk user ID immediately if Clerk secret is configured
      let clerkUserId: string | null = null;
      if (process.env.CLERK_SECRET_KEY) {
        try {
          const { clerkClient } = await import("@clerk/nextjs/server");
          const client = await clerkClient();
          const clerkUsers = await client.users.getUserList({
            emailAddress: [m.email],
          });
          if (clerkUsers.data[0]) {
            clerkUserId = clerkUsers.data[0].id;
          }
        } catch {
          // Webhook will link upon sign-in if not available now
        }
      }

      const [inserted] = await db
        .insert(members)
        .values({
          circleId: circle.id,
          displayName: m.displayName,
          email: m.email.toLowerCase(),
          role: m.role,
          timezone: m.timezone,
          language: m.language,
          clerkUserId,
        })
        .returning();

      const linkedStr = inserted.clerkUserId
        ? ` (linked to ${inserted.clerkUserId})`
        : " (pending sign-in link)";
      console.log(`  ✓ Added ${m.displayName} <${m.email}>${linkedStr}`);

      if (m.role === "owner" && !circle.ownerMemberId) {
        await db
          .update(familyCircles)
          .set({ ownerMemberId: inserted.id })
          .where(eq(familyCircles.id, circle.id));
        console.log(`  ✓ Set ${m.displayName} as circle owner`);
      }
    } else {
      console.log(`  • Already registered: ${m.displayName} <${m.email}>`);
    }
  }

  console.log("\n✅ Production family initialization complete.");
  console.log("Add new family members via Neon SQL Console or Drizzle Studio.");
}

initFamily().catch((err) => {
  console.error("Init failed:", err);
  process.exit(1);
});
