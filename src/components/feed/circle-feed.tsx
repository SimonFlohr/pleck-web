import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DemoBanner } from "@/components/feed/demo-banner";
import { FeedList } from "@/components/feed/feed-list";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { PullToRefresh } from "@/components/feed/pull-to-refresh";
import { ScrollToTop } from "@/components/feed/scroll-to-top";
import { SearchBar } from "@/components/feed/search-bar";
import type { Member } from "@/lib/auth/viewer";
import { demoQuery, resolveDemoReader } from "@/lib/demo/reader";
import { loadFeedPage } from "@/lib/feed/load";
import type { Reader } from "@/lib/format";

const SEARCH_PLACEHOLDER = {
  en: "Search sparks",
  nl: "Zoek in sparks",
} as const;

export async function CircleFeed({
  member,
  demo,
  q,
  lang,
  tz,
}: {
  member: Member;
  demo: boolean;
  q: string;
  lang?: string;
  tz?: string;
}) {
  const reader: Reader = demo
    ? resolveDemoReader(member, { lang, tz })
    : { language: member.language, timezone: member.timezone };

  const firstPage = await loadFeedPage(member.circleId, { q });
  const currentMember = { id: member.id, role: member.role };
  const composeHref = demo
    ? `/compose?${demoQuery(reader)}&demo=1`
    : "/compose";

  return (
    <main className="mx-auto w-full max-w-2xl px-3.5 pb-24 sm:max-w-3xl sm:px-6">
      <h1 className="sr-only">{demo ? "Pleck demo feed" : "Pleck feed"}</h1>
      <PullToRefresh>
        {demo && <DemoBanner reader={reader} q={q} />}
        <FeedToolbar>
          <Suspense fallback={<div className="h-8 flex-1" />}>
            <SearchBar placeholder={SEARCH_PLACEHOLDER[reader.language]} />
          </Suspense>
          <Link
            href={composeHref}
            className={buttonVariants({
              size: "sm",
              className:
                "gap-1 rounded-full px-3 text-xs font-medium shadow-2xs sm:text-sm",
            })}
          >
            <Plus className="size-3.5 sm:size-4" />
            <span>New spark</span>
          </Link>
        </FeedToolbar>
        <FeedList
          key={q}
          initialPage={firstPage}
          reader={reader}
          currentMember={currentMember}
          q={q}
          demo={demo}
        />
      </PullToRefresh>
      <ScrollToTop />
    </main>
  );
}
