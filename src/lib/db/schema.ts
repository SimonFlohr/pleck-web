import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Placeholder table to prove the migration pipeline works.
// Replace later.
export const healthCheck = pgTable("health_check", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// —— family_circles —————————————————————————————————————————
export const familyCircles = pgTable("family_circles", {
  id: serial("id").primaryKey(),
  ownerClerkId: text("owner_clerk_id").notNull(),
  name: text("name").notNull(),
  avatarKey: text("avatar_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// —— members ————————————————————————————————————————————————
export const memberRoleEnum = pgEnum("member_role", ["owner", "member"]);

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id")
    .notNull()
    .references(() => familyCircles.id, { onDelete: "cascade" }),
  clerkId: text("clerk_id").notNull(),
  role: memberRoleEnum("role").notNull().default("member"),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
