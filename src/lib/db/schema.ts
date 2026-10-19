import {
  boolean,
  date,
  index,
  integer,
  bigint,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ══════════════════════════════════════════════
//  Enums
// ══════════════════════════════════════════════

export const memberRoleEnum = pgEnum("member_role", ["owner", "member"]);
export const circleTierEnum = pgEnum("circle_tier", ["free", "premium"]);
export const sparkTypeEnum = pgEnum("spark_type", ["photo", "voice", "text"]);
export const aiCategoryEnum = pgEnum("ai_category", [
  "milestone",
  "everyday",
  "occasion",
]);
export const memberLanguageEnum = pgEnum("member_language", ["en", "nl"]);

// ══════════════════════════════════════════════
//  family_circles
// ══════════════════════════════════════════════

export const familyCircles = pgTable("family_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerMemberId: integer("owner_member_id"),
  joinToken: text("join_token").notNull(),
  tier: circleTierEnum("tier").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ══════════════════════════════════════════════
//  members
// ══════════════════════════════════════════════

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id")
    .notNull()
    .references(() => familyCircles.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id"),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  role: memberRoleEnum("role").notNull().default("member"),
  timezone: text("timezone").notNull().default("America/Chicago"),
  language: memberLanguageEnum("language").notNull().default("en"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ══════════════════════════════════════════════
//  sparks
// ══════════════════════════════════════════════

export const sparks = pgTable(
  "sparks",
  {
    id: serial("id").primaryKey(),
    circleId: integer("circle_id")
      .notNull()
      .references(() => familyCircles.id, { onDelete: "cascade" }),
    authorMemberId: integer("author_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    authorTimezone: text("author_timezone").notNull(),
    authorLocalDate: date("author_local_date").notNull(),
    type: sparkTypeEnum("type").notNull(),
    textContent: text("text_content"),
    mediaKey: text("media_key"),
    mediaMime: text("media_mime"),
    mediaSizeBytes: bigint("media_size_bytes", { mode: "number" }),
    mediaSha256: text("media_sha256"),
    mediaOriginalFilename: text("media_original_filename"),
    happenedAt: timestamp("happened_at", { withTimezone: true }),
    aiCategory: aiCategoryEnum("ai_category"),
    categoryOverridden: boolean("category_overridden").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("sparks_feed_idx")
      .on(table.circleId, table.authorLocalDate, table.createdAt, table.id)
      .where(sql`${table.deletedAt} is null`),
    index("sparks_text_trgm_idx").using(
      "gin",
      table.textContent.op("gin_trgm_ops"),
    ),
  ],
);
