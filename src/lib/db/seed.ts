import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import { familyCircles, members, sparks } from "./schema";
import { localDate } from "../local-date";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

// ══════════════════════════════════════════════
//  Members
// ══════════════════════════════════════════════

const MEMBERS = [
  {
    displayName: "Simon",
    email: "simonflohr31@gmail.com",
    role: "owner" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Gizzell",
    email: "simonflohr31+gizzell@pleck.dev",
    role: "member" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Aaliyah",
    email: "simonflohr31+aaliyah@pleck.dev",
    role: "member" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Nico",
    email: "simonflohr31+nico@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Femke",
    email: "simonflohr31+femke@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Eline",
    email: "simonflohr31+eline@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Daniel",
    email: "simonflohr31+daniel@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "en" as const, // reads English in the Netherlands
  },
];

// ══════════════════════════════════════════════
//  Spark definitions
//  ~40 sparks across 3 weeks, every author, both languages
// ══════════════════════════════════════════════

interface SparkDef {
  authorName: string;
  utcIso: string;
  type: "photo" | "voice" | "text";
  textContent: string | null;
  tag?: string; // human label for edge-case identification
}

// Week 1: Oct 4–10 2026
// Week 2: Oct 11–17 2026

const SPARK_DEFS: SparkDef[] = [
  // ── Week 1 ──────────────────────────────────────────
  // SUNDAY DINNER — 18:55 Chicago = 01:55 Monday Amsterdam
  {
    authorName: "Simon",
    utcIso: "2026-10-04T23:55:00Z",
    type: "photo",
    textContent: "Sunday dinner, whole table set",
    tag: "sunday-dinner",
  },
  // THE "TOMORROW" ROW — Femke at 00:30 Mon AMS = 17:30 Sun Chicago
  {
    authorName: "Femke",
    utcIso: "2026-10-04T22:30:00Z",
    type: "text",
    textContent: "Net thuis, wat een mooie dag gehad 🌙",
    tag: "tomorrow",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-05T14:00:00Z",
    type: "photo",
    textContent: "Aaliyah's first day at the new school!",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-05T16:30:00Z",
    type: "text",
    textContent: "Vandaag in de tuin gewerkt, tomaten zijn rijp 🍅",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-06T19:00:00Z",
    type: "text",
    textContent: "Made a new friend today!!! 🎉",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-06T10:15:00Z",
    type: "photo",
    textContent: "Ochtendwandeling door het park",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-07T08:00:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-07T22:30:00Z",
    type: "text",
    textContent: "Late night coding session, new feature shipped 🚀",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-08T11:00:00Z",
    type: "photo",
    textContent: "Bloemen van de markt 💐",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-08T20:00:00Z",
    type: "text",
    textContent: "Family movie night — Aaliyah picked Encanto again 😂",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-09T07:00:00Z",
    type: "text",
    textContent:
      "Vrijdagochtend, koffie en stilte voordat iedereen wakker is ☕",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-09T16:00:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-10T15:00:00Z",
    type: "text",
    textContent: "I can ride my bike without training wheels!! 🚲",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-10T17:30:00Z",
    type: "text",
    textContent: "LEGO Technic finished! Took us a week and a half",
  },

  // ── Week 2 ──────────────────────────────────────────
  {
    authorName: "Nico",
    utcIso: "2026-10-11T07:00:00Z",
    type: "photo",
    textContent: "Zondagochtend pannenkoeken 🥞",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-11T16:00:00Z",
    type: "photo",
    textContent: "Sunday brunch at the new spot on Division",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-11T20:00:00Z",
    type: "text",
    textContent: "Aaliyah sleeping on Simon's lap, not moving for an hour",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-12T16:00:00Z",
    type: "photo",
    textContent: "Drew a picture of our whole family ❤️",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-12T15:30:00Z",
    type: "text",
    textContent: "Started building a LEGO Technic set with Eline",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-12T15:45:00Z",
    type: "photo",
    textContent: "Het LEGO project begint!",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-12T23:00:00Z",
    type: "photo",
    textContent: "Chicago skyline from the rooftop",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-13T09:00:00Z",
    type: "text",
    textContent: "Eline had een 10 voor haar toets! 🎓",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-13T13:00:00Z",
    type: "photo",
    textContent: "Nieuwe planten voor de vensterbank 🌱",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-13T23:30:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-14T09:00:00Z",
    type: "photo",
    textContent: "Ons LEGO meesterwerk! 🏗️",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-14T18:00:00Z",
    type: "text",
    textContent: "Aaliyah lost her second tooth 🦷",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-14T23:00:00Z",
    type: "text",
    textContent:
      "FaceTimed with everyone tonight, Aaliyah showed off her bike skills to opa",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-15T12:00:00Z",
    type: "text",
    textContent: "Nieuwe recept geprobeerd, stamppot met rookworst",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-15T14:00:00Z",
    type: "photo",
    textContent: "LEGO Technic halfway done",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-15T21:00:00Z",
    type: "text",
    textContent: "The tooth fairy brought me 5 dollars!!! 🧚",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-16T08:30:00Z",
    type: "photo",
    textContent: "Herfstbladeren in de achtertuin 🍂",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-16T14:00:00Z",
    type: "photo",
    textContent: "Fall decorations are up 🎃",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-16T16:00:00Z",
    type: "text",
    textContent:
      "Trots op Aaliyah met haar fiets! Facetime was gezellig vanavond",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-17T01:30:00Z",
    type: "text",
    textContent: "Kon niet slapen EN door mijn wekker geslapen!! ⏰",
    tag: "eu-dst-fallback",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-17T09:00:00Z",
    type: "text",
    textContent: "Vandaag naar opa en oma! 🏡",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-17T10:00:00Z",
    type: "photo",
    textContent: "Extra hour of sleep = extra pancakes",
    tag: "eu-dst-morning-after",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-17T15:00:00Z",
    type: "photo",
    textContent: "Pumpkin painting with mama! 🎃",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-17T17:00:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-17T18:00:00Z",
    type: "text",
    textContent: "Week two wrapped. This vault is filling up fast.",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-17T20:00:00Z",
    type: "text",
    textContent:
      "Watching the sunset from the back porch, thinking about how lucky we are 🧡",
  },
];

// ══════════════════════════════════════════════
//  Runner
// ══════════════════════════════════════════════

async function seed() {
  // 🚨 SAFETY CIRCUIT BREAKER (Tier 1): Endpoint & Environment Sniffing
  const dbUrl = process.env.DATABASE_URL ?? "";
  const PROD_ENDPOINT_MARKERS = [
    "ep-polished-darkness",
    "production",
    "prod",
    "pleck_prod",
  ];

  const isProdEndpoint = PROD_ENDPOINT_MARKERS.some((marker) =>
    dbUrl.toLowerCase().includes(marker),
  );
  const isProdEnv =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  if ((isProdEndpoint || isProdEnv) && process.env.FORCE_DEV_SEED !== "true") {
    console.error("\n❌ FATAL: SEED SCRIPT ABORTED!");
    console.error(
      "Detected production database connection (ep-polished-darkness / production).",
    );
    console.error("This script completely wipes all sparks and member tables.");
    console.error(
      "To prevent catastrophic family data loss, execution was halted.\n",
    );
    process.exit(1);
  }

  // 🚨 SAFETY CIRCUIT BREAKER (Tier 2): Pre-deletion Database Content Inspection
  try {
    const [prodCircle] = await db
      .select()
      .from(familyCircles)
      .where(eq(familyCircles.name, "Flohr"))
      .limit(1);

    const [prodOwner] = await db
      .select()
      .from(members)
      .where(eq(members.email, "simonflohr22@gmail.com"))
      .limit(1);

    if (prodCircle || prodOwner) {
      console.error("\n❌ FATAL: SEED SCRIPT ABORTED!");
      console.error(
        "Found real family circle 'Flohr' or owner 'simonflohr22@gmail.com' in this database!",
      );
      console.error(
        "seed.ts is strictly forbidden from running against real family vaults.",
      );
      console.error(
        "Execution halted immediately before deleting any records.\n",
      );
      process.exit(1);
    }
  } catch {
    // Non-blocking if tables are not yet created
  }

  console.log("🌱 Seeding database...\n");

  // 1. Clear existing data (reverse FK order)
  console.log("  Clearing existing data...");
  await db.delete(sparks);
  await db.delete(members);
  await db.delete(familyCircles);

  // 2. Create the circle
  console.log("  Creating family circle...");
  const [circle] = await db
    .insert(familyCircles)
    .values({
      name: "Flohr–de Jong",
      joinToken: randomUUID(),
      tier: "free",
    })
    .returning();

  console.log(`  ✓ Circle "${circle.name}" (id: ${circle.id})\n`);

  // 3. Insert members
  console.log("  Creating members...");

  // Auto-link existing Clerk users by email so active dev sessions aren't unlinked
  const clerkUsersByEmail = new Map<string, string>();
  try {
    if (process.env.CLERK_SECRET_KEY) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const clerkUsers = await client.users.getUserList();
      for (const u of clerkUsers.data) {
        for (const e of u.emailAddresses) {
          clerkUsersByEmail.set(e.emailAddress.toLowerCase(), u.id);
        }
      }
    }
  } catch {
    // Non-blocking: if Clerk API is unreachable, seed still succeeds
  }

  const insertedMembers = await db
    .insert(members)
    .values(
      MEMBERS.map((m) => {
        const clerkUserId =
          clerkUsersByEmail.get(m.email.toLowerCase()) ?? null;
        return {
          circleId: circle.id,
          displayName: m.displayName,
          email: m.email,
          role: m.role,
          timezone: m.timezone,
          language: m.language,
          clerkUserId,
        };
      }),
    )
    .returning();

  const memberByName = new Map(insertedMembers.map((m) => [m.displayName, m]));

  for (const m of insertedMembers) {
    const linkedStr = m.clerkUserId ? ` · linked to ${m.clerkUserId}` : "";
    console.log(
      `  ✓ ${m.displayName} (${m.timezone}, ${m.language}, ${m.role}${linkedStr})`,
    );
  }

  // 4. Set owner_member_id on the circle
  const simon = memberByName.get("Simon")!;
  await db.execute(
    `UPDATE family_circles SET owner_member_id = ${simon.id} WHERE id = ${circle.id}`,
  );
  console.log(`\n  ✓ Circle owner → Simon (member id: ${simon.id})\n`);

  // 5. Insert sparks
  console.log("  Creating sparks...");
  const sparkValues = SPARK_DEFS.map((def) => {
    const member = memberByName.get(def.authorName);
    if (!member) throw new Error(`Unknown member: ${def.authorName}`);

    const utcInstant = new Date(def.utcIso);
    const authorLocalDateStr = localDate(utcInstant, member.timezone);

    return {
      circleId: circle.id,
      authorMemberId: member.id,
      authorTimezone: member.timezone,
      authorLocalDate: authorLocalDateStr,
      type: def.type,
      textContent: def.textContent,
      createdAt: utcInstant,
    };
  });

  const insertedSparks = await db
    .insert(sparks)
    .values(sparkValues)
    .returning();

  console.log(`  ✓ ${insertedSparks.length} sparks created\n`);

  // 6. Summary
  const byAuthor = new Map<string, number>();
  for (const def of SPARK_DEFS) {
    byAuthor.set(def.authorName, (byAuthor.get(def.authorName) ?? 0) + 1);
  }
  console.log("  By member:");
  for (const [name, count] of byAuthor) {
    console.log(`    ${name}: ${count}`);
  }

  const types = { photo: 0, voice: 0, text: 0 };
  for (const def of SPARK_DEFS) types[def.type]++;
  console.log(
    `\n  By type: ${types.photo} photo, ${types.voice} voice, ${types.text} text`,
  );

  // 7. Edge-case verification
  const femke = memberByName.get("Femke")!;
  const sundayDinner = SPARK_DEFS.find((d) => d.tag === "sunday-dinner")!;
  const tomorrow = SPARK_DEFS.find((d) => d.tag === "tomorrow")!;
  const euDst = SPARK_DEFS.find((d) => d.tag === "eu-dst-fallback")!;

  console.log("\n  Edge cases:");
  console.log(
    `    Sunday dinner → CHI: ${localDate(sundayDinner.utcIso, simon.timezone)}, AMS: ${localDate(sundayDinner.utcIso, femke.timezone)}`,
  );
  console.log(
    `    "Tomorrow"    → AMS: ${localDate(tomorrow.utcIso, femke.timezone)}, CHI: ${localDate(tomorrow.utcIso, simon.timezone)}`,
  );
  console.log(
    `    EU DST        → AMS: ${localDate(euDst.utcIso, femke.timezone)}`,
  );

  console.log("\n🌱 Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
