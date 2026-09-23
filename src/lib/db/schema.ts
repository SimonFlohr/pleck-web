import { date, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

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
