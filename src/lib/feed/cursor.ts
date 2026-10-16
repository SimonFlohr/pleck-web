import type { FeedCursor } from "./types";

export function encodeCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(
  raw: string | null | undefined,
): FeedCursor | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    const valid =
      typeof p?.d === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.d) &&
      typeof p?.c === "string" &&
      !Number.isNaN(Date.parse(p.c)) &&
      Number.isInteger(p?.i);
    return valid ? (p as FeedCursor) : null;
  } catch {
    return null;
  }
}
