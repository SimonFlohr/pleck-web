"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mergePages } from "@/lib/feed/groups";
import type { FeedPage } from "@/lib/feed/types";
import { formatDayHeader, type Reader } from "@/lib/format";
import { SparkCard } from "./spark-card";
import { EmptyState } from "./empty-state";

type Props = {
  initialPage: FeedPage;
  reader: Reader;
  currentMember: { id: number; role: "owner" | "member" };
  q: string;
};

export function FeedList({ initialPage, reader, currentMember, q }: Props) {
  const [groups, setGroups] = useState(initialPage.groups);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevInitialPage, setPrevInitialPage] = useState(initialPage);

  if (initialPage !== prevInitialPage) {
    setPrevInitialPage(initialPage);
    setGroups(initialPage.groups);
    setCursor(initialPage.nextCursor);
  }

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ cursor });
      if (q) params.set("q", q);
      const res = await fetch(`/api/feed?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page: FeedPage = await res.json();
      setGroups((prev) => mergePages(prev, page.groups));
      setCursor(page.nextCursor);
    } catch {
      setError("Couldn't load more. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (groups.length === 0)
    return <EmptyState q={q} language={reader.language} />;

  function handleDelete(sparkId: number) {
    setGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== sparkId),
        }))
        .filter((group) => group.items.length > 0),
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {groups.map((group) => (
        <section key={group.date} aria-labelledby={`day-${group.date}`}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px w-3 sm:w-5 bg-border/80" />
            <h2
              id={`day-${group.date}`}
              className="text-xs sm:text-sm font-medium tracking-tight text-muted-foreground"
              suppressHydrationWarning
            >
              {formatDayHeader(group.date, reader)}
            </h2>
            <div className="h-px flex-1 bg-border/80" />
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {group.items.map((item) => (
              <SparkCard
                key={item.id}
                item={item}
                reader={reader}
                currentMember={currentMember}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      ))}

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {cursor && (
        <div className="flex justify-center pt-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loading}
            className="h-8 gap-1.5 px-4 text-xs font-medium cursor-pointer shadow-2xs hover:bg-muted"
          >
            {loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Loading…</span>
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
