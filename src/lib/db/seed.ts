import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
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
    email: "simon@pleck.dev",
    role: "owner" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Gizzell",
    email: "gizzell@pleck.dev",
    role: "member" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Aaliyah",
    email: "aaliyah@pleck.dev",
    role: "member" as const,
    timezone: "America/Chicago",
    language: "en" as const,
  },
  {
    displayName: "Nico",
    email: "nico@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Femke",
    email: "femke@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Eline",
    email: "eline@pleck.dev",
    role: "member" as const,
    timezone: "Europe/Amsterdam",
    language: "nl" as const,
  },
  {
    displayName: "Daniel",
    email: "daniel@pleck.dev",
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
// Week 2: Oct 11–18 2026
// Week 3: Oct 19–25 2026
// EU DST: clocks fall back Oct 25 at 03:00 → 02:00
// US DST: clocks fall back Nov 1 (out of seed range — tested separately)

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

  // ── Week 2 ──────────────────────────────────────────
  {
    authorName: "Nico",
    utcIso: "2026-10-12T07:00:00Z",
    type: "photo",
    textContent: "Zondagochtend pannenkoeken 🥞",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-12T16:00:00Z",
    type: "photo",
    textContent: "Drew a picture of our whole family ❤️",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-13T01:00:00Z",
    type: "photo",
    textContent: "Chicago skyline from the rooftop",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-13T15:30:00Z",
    type: "text",
    textContent: "Started building a LEGO Technic set with Eline",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-13T15:45:00Z",
    type: "photo",
    textContent: "Het LEGO project begint!",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-14T09:00:00Z",
    type: "text",
    textContent: "Eline had een 10 voor haar toets! 🎓",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-14T23:30:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-15T18:00:00Z",
    type: "text",
    textContent: "Aaliyah lost her second tooth 🦷",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-16T12:00:00Z",
    type: "text",
    textContent: "Nieuwe recept geprobeerd, stamppot met rookworst",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-16T21:00:00Z",
    type: "text",
    textContent: "The tooth fairy brought me 5 dollars!!! 🧚",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-17T08:30:00Z",
    type: "photo",
    textContent: "Herfstbladeren in de achtertuin 🍂",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-17T14:00:00Z",
    type: "photo",
    textContent: "LEGO Technic halfway done",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-18T10:00:00Z",
    type: "text",
    textContent: "Vandaag naar opa en oma! 🏡",
  },

  // ── Week 3 ──────────────────────────────────────────
  {
    authorName: "Simon",
    utcIso: "2026-10-19T16:00:00Z",
    type: "photo",
    textContent: "Sunday brunch at the new spot on Division",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-19T20:00:00Z",
    type: "text",
    textContent: "Aaliyah sleeping on Simon's lap, not moving for an hour",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-20T06:30:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-20T13:00:00Z",
    type: "photo",
    textContent: "Nieuwe planten voor de vensterbank 🌱",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-21T15:00:00Z",
    type: "text",
    textContent: "I can ride my bike without training wheels!! 🚲",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-21T17:30:00Z",
    type: "text",
    textContent: "LEGO Technic finished! Took us a week and a half",
  },
  {
    authorName: "Eline",
    utcIso: "2026-10-22T09:00:00Z",
    type: "photo",
    textContent: "Ons LEGO meesterwerk! 🏗️",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-22T23:00:00Z",
    type: "text",
    textContent:
      "FaceTimed with everyone tonight, Aaliyah showed off her bike skills to opa",
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-23T14:00:00Z",
    type: "photo",
    textContent: "Fall decorations are up 🎃",
  },
  {
    authorName: "Nico",
    utcIso: "2026-10-23T16:00:00Z",
    type: "text",
    textContent:
      "Trots op Aaliyah met haar fiets! Facetime was gezellig vanavond",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-24T07:00:00Z",
    type: "text",
    textContent:
      "Vrijdagochtend, koffie en stilte voordat iedereen wakker is ☕",
  },
  // ★ EU DST EDGE CASE — Oct 25 2026, clocks fall back 03:00→02:00
  {
    authorName: "Eline",
    utcIso: "2026-10-25T01:30:00Z", // 03:30 CEST → 02:30 CET
    type: "text",
    textContent: "Kon niet slapen, de klok ging terug vannacht ⏰",
    tag: "eu-dst-fallback",
  },
  {
    authorName: "Daniel",
    utcIso: "2026-10-25T10:00:00Z",
    type: "photo",
    textContent: "Extra hour of sleep = extra pancakes",
    tag: "eu-dst-morning-after",
  },
  {
    authorName: "Aaliyah",
    utcIso: "2026-10-25T17:00:00Z",
    type: "photo",
    textContent: "Pumpkin painting with mama! 🎃",
  },
  {
    authorName: "Simon",
    utcIso: "2026-10-25T22:00:00Z",
    type: "text",
    textContent: "Week three wrapped. This vault is filling up fast.",
  },
  {
    authorName: "Femke",
    utcIso: "2026-10-25T19:00:00Z",
    type: "voice",
    textContent: null,
  },
  {
    authorName: "Gizzell",
    utcIso: "2026-10-25T21:00:00Z",
    type: "text",
    textContent:
      "Watching the sunset from the back porch, thinking about how lucky we are 🧡",
  },
];

// ══════════════════════════════════════════════
//  Runner
// ══════════════════════════════════════════════

async function seed() {
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
  const insertedMembers = await db
    .insert(members)
    .values(
      MEMBERS.map((m) => ({
        circleId: circle.id,
        displayName: m.displayName,
        email: m.email,
        role: m.role,
        timezone: m.timezone,
        language: m.language,
      })),
    )
    .returning();

  const memberByName = new Map(insertedMembers.map((m) => [m.displayName, m]));

  for (const m of insertedMembers) {
    console.log(
      `  ✓ ${m.displayName} (${m.timezone}, ${m.language}, ${m.role})`,
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
