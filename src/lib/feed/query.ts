import { and, desc, eq, ilike, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, sparks } from "@/lib/db/schema";
import { decodeCursor, encodeCursor } from "./cursor";
import { groupByDay } from "./groups";
import type { FeedItem, FeedPage } from "./types";

export const PAGE_SIZE = 15; // 40 seeded sparks → 3 pages, so "Load more" shows up twice

export type FeedQueryOptions = {
  cursor?: string | null;
  q?: string | null;
  limit?: number;
};

function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export async function getFeedPage(
  circleId: number,
  opts: FeedQueryOptions = {},
): Promise<FeedPage> {
  const limit = opts.limit ?? PAGE_SIZE;
  const cursor = decodeCursor(opts.cursor);
  const q = opts.q?.trim();

  const conditions: SQL[] = [
    eq(sparks.circleId, circleId),
    isNull(sparks.deletedAt),
  ];

  if (cursor) {
    conditions.push(
      sql`(${sparks.authorLocalDate}, ${sparks.createdAt}, ${sparks.id})
          < (${cursor.d}::date, ${cursor.c}::timestamptz, ${cursor.i})`,
    );
  }

  if (q) {
    // The pg_trgm GIN index (PLK-40) makes ILIKE '%term%' fast
    conditions.push(ilike(sparks.textContent, `%${escapeLike(q)}%`));
  }

  // Fetch one extra row to find out whether another page exists
  const rows = await db
    .select({
      id: sparks.id,
      type: sparks.type,
      textContent: sparks.textContent,
      authorMemberId: sparks.authorMemberId,
      authorName: members.displayName,
      authorTimezone: sparks.authorTimezone,
      authorLocalDate: sparks.authorLocalDate,
      createdAt: sparks.createdAt,
      mediaKey: sparks.mediaKey,
      mediaMime: sparks.mediaMime,
    })
    .from(sparks)
    .innerJoin(members, eq(members.id, sparks.authorMemberId))
    .where(and(...conditions))
    .orderBy(
      desc(sparks.authorLocalDate),
      desc(sparks.createdAt),
      desc(sparks.id),
    )
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const items: FeedItem[] = pageRows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    mediaUrl: null,
  }));

  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeCursor({ d: last.authorLocalDate, c: last.createdAt, i: last.id })
      : null;

  return { groups: groupByDay(items), nextCursor };
}
