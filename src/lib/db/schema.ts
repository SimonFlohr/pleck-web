import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Placeholder table to prove the migration pipeline works.
// Replace later.
export const healthCheck = pgTable("health_check", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
