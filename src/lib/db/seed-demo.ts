import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { config } from "dotenv";
import { randomUUID } from "crypto";
import { fromZonedTime } from "date-fns-tz";
import { familyCircles, members, sparks } from "./schema";
import { localDate } from "../local-date";
import { DEMO_CIRCLE_NAME, DEMO_MEMBER_EMAIL } from "../demo/constants";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

const CHICAGO = "America/Chicago";
const AMSTERDAM = "Europe/Amsterdam";

const DEMO_MEMBERS = [
  {
    displayName: "Alex",
    email: DEMO_MEMBER_EMAIL,
    role: "member" as const,
    timezone: CHICAGO,
    language: "en" as const,
  },
  {
    displayName: "Mara",
    email: "mara@pleck.dev",
    role: "owner" as const,
    timezone: CHICAGO,
    language: "en" as const,
  },
  {
    displayName: "Jonas",
    email: "jonas@pleck.dev",
    role: "member" as const,
    timezone: AMSTERDAM,
    language: "nl" as const,
  },
  {
    displayName: "Noor",
    email: "noor@pleck.dev",
    role: "member" as const,
    timezone: AMSTERDAM,
    language: "nl" as const,
  },
  {
    displayName: "Leo",
    email: "leo@pleck.dev",
    role: "member" as const,
    timezone: CHICAGO,
    language: "en" as const,
  },
];

type SparkSeed = {
  author: string;
  type: "photo" | "voice" | "text";
  text: string | null;
  at: Date;
  mediaKey?: string;
};

function addDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

function atLocal(zone: string, ymd: string, time: string): Date {
  return fromZonedTime(`${ymd}T${time}`, zone);
}

function recent(zone: string, time: string, now: Date): Date {
  const today = localDate(now, zone);
  const instant = atLocal(zone, today, time);
  if (instant.getTime() < now.getTime() - 60_000) return instant;
  return atLocal(zone, addDays(today, -1), time);
}

function daysAgo(zone: string, days: number, time: string, now: Date): Date {
  return atLocal(zone, addDays(localDate(now, zone), -days), time);
}

function buildSparks(now: Date): SparkSeed[] {
  return [
    {
      author: "Alex",
      type: "text",
      text: "Home from the airport. The suitcase is still in the hall.",
      at: recent(CHICAGO, "16:20:00", now),
    },
    {
      author: "Mara",
      type: "photo",
      text: "Supper's on. The whole table this time.",
      at: recent(CHICAGO, "19:10:00", now),
      mediaKey: "demo/supper.jpg",
    },
    {
      author: "Jonas",
      type: "text",
      text: "Net thuis. Het was een lange dag 🌙",
      at: recent(AMSTERDAM, "00:40:00", now),
    },
    {
      author: "Leo",
      type: "text",
      text: "I rode my bike with no training wheels!!",
      at: recent(CHICAGO, "15:05:00", now),
    },
    {
      author: "Noor",
      type: "photo",
      text: "Ochtendwandeling door het park",
      at: daysAgo(AMSTERDAM, 1, "09:20:00", now),
      mediaKey: "demo/park.jpg",
    },
    {
      author: "Mara",
      type: "voice",
      text: "Calling everyone before bed",
      at: daysAgo(CHICAGO, 1, "21:30:00", now),
    },
    {
      author: "Jonas",
      type: "text",
      text: "Tomaten uit de tuin, eindelijk rijp 🍅",
      at: daysAgo(AMSTERDAM, 2, "12:10:00", now),
    },
    {
      author: "Leo",
      type: "photo",
      text: "Drew the whole family, even the dog",
      at: daysAgo(CHICAGO, 2, "16:40:00", now),
      mediaKey: "demo/drawing.jpg",
    },
    {
      author: "Noor",
      type: "text",
      text: "Nieuwe planten voor de vensterbank 🌱",
      at: daysAgo(AMSTERDAM, 3, "11:00:00", now),
    },
    {
      author: "Mara",
      type: "text",
      text: "FaceTime after dinner. Leo showed the drawing.",
      at: daysAgo(CHICAGO, 3, "18:15:00", now),
    },
    {
      author: "Jonas",
      type: "voice",
      text: null,
      at: daysAgo(AMSTERDAM, 4, "08:05:00", now),
    },
    {
      author: "Leo",
      type: "text",
      text: "LEGO set is finished. It took all week.",
      at: daysAgo(CHICAGO, 4, "13:30:00", now),
    },
    {
      author: "Noor",
      type: "photo",
      text: "Bloemen van de markt",
      at: daysAgo(AMSTERDAM, 5, "16:00:00", now),
      mediaKey: "demo/flowers.jpg",
    },
    {
      author: "Alex",
      type: "text",
      text: "Movie night. Leo picked the same film again.",
      at: daysAgo(CHICAGO, 5, "20:40:00", now),
    },
    {
      author: "Jonas",
      type: "text",
      text: "Koffie voordat het huis wakker wordt ☕",
      at: daysAgo(AMSTERDAM, 6, "07:50:00", now),
    },
    {
      author: "Leo",
      type: "text",
      text: "First day at the new school",
      at: daysAgo(CHICAGO, 6, "14:10:00", now),
    },
    {
      author: "Noor",
      type: "photo",
      text: "Pannenkoeken voor het ontbijt",
      at: daysAgo(AMSTERDAM, 7, "10:30:00", now),
      mediaKey: "demo/pancakes.jpg",
    },
    {
      author: "Mara",
      type: "text",
      text: "Rooftop after dinner. The skyline was clear.",
      at: daysAgo(CHICAGO, 8, "19:05:00", now),
    },
  ];
}

export async function ensureDemoCircle() {
  console.log("Ensuring demo circle...\n");

  let [circle] = await db
    .select()
    .from(familyCircles)
    .where(eq(familyCircles.name, DEMO_CIRCLE_NAME))
    .limit(1);

  if (!circle) {
    [circle] = await db
      .insert(familyCircles)
      .values({
        name: DEMO_CIRCLE_NAME,
        joinToken: randomUUID(),
        tier: "free",
      })
      .returning();
    console.log(`  ✓ Created "${circle.name}" (id: ${circle.id})`);
  } else {
    console.log(`  ✓ Found "${circle.name}" (id: ${circle.id})`);
  }

  for (const member of DEMO_MEMBERS) {
    const [existing] = await db
      .select()
      .from(members)
      .where(eq(members.email, member.email))
      .limit(1);

    if (existing && existing.circleId !== circle.id) {
      throw new Error(
        `${member.email} already belongs to circle ${existing.circleId}`,
      );
    }

    if (!existing) {
      await db.insert(members).values({
        circleId: circle.id,
        displayName: member.displayName,
        email: member.email,
        role: member.role,
        timezone: member.timezone,
        language: member.language,
        clerkUserId: null,
      });
      console.log(`  ✓ Added ${member.displayName}`);
    } else {
      await db
        .update(members)
        .set({
          displayName: member.displayName,
          role: member.role,
          timezone: member.timezone,
          language: member.language,
          clerkUserId: null,
        })
        .where(eq(members.id, existing.id));
      console.log(`  • Updated ${member.displayName}`);
    }
  }

  const circleMembers = await db
    .select()
    .from(members)
    .where(eq(members.circleId, circle.id));
  const byName = new Map(
    circleMembers.map((member) => [member.displayName, member]),
  );
  const mara = byName.get("Mara");
  if (!mara) throw new Error("Demo owner Mara is missing");

  await db
    .update(familyCircles)
    .set({ ownerMemberId: mara.id })
    .where(eq(familyCircles.id, circle.id));

  await db.delete(sparks).where(eq(sparks.circleId, circle.id));

  const now = new Date();
  const values = buildSparks(now).map((spark) => {
    const author = byName.get(spark.author);
    if (!author) throw new Error(`Unknown demo member: ${spark.author}`);
    return {
      circleId: circle.id,
      authorMemberId: author.id,
      authorTimezone: author.timezone,
      authorLocalDate: localDate(spark.at, author.timezone),
      type: spark.type,
      textContent: spark.text,
      mediaKey: spark.mediaKey ?? null,
      mediaMime: spark.mediaKey ? "image/jpeg" : null,
      createdAt: spark.at,
    };
  });

  const inserted = await db
    .insert(sparks)
    .values(values)
    .returning({ id: sparks.id });
  console.log(`  ✓ ${inserted.length} demo sparks\n`);
}

const invokedDirectly = process.argv[1]?.includes("seed-demo");
if (invokedDirectly) {
  ensureDemoCircle()
    .then(() => {
      console.log("Demo circle ready.");
    })
    .catch((err) => {
      console.error("Demo seed failed:", err);
      process.exit(1);
    });
}
