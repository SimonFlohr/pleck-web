export type SparkType = "photo" | "voice" | "text";

export type FeedCursor = {
  d: string; // author_local_date, yyyy-MM-dd
  c: string; // created_at, ISO 8601 UTC
  i: number; // id
};

export type FeedItem = {
  id: number;
  type: SparkType;
  textContent: string | null;
  authorMemberId: number;
  authorName: string;
  authorTimezone: string;
  authorLocalDate: string; // yyyy-MM-dd
  createdAt: string; // ISO 8601 UTC. A string so it survives JSON.
  mediaKey: string | null;
  mediaMime: string | null;
  mediaUrl: string | null; // filled in by PLK-38
};

export type FeedGroup = { date: string; items: FeedItem[] };

export type FeedPage = {
  groups: FeedGroup[];
  nextCursor: string | null; // null = no more pages
};
