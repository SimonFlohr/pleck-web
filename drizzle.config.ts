import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import * as ws from "ws";

config({ path: ".env.local" });

neonConfig.webSocketConstructor = ws.WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
