import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FeedList } from "@/components/feed/feed-list";
import { getViewer } from "@/lib/auth/viewer";
import { loadFeedPage } from "@/lib/feed/load";
import { Suspense } from "react";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { SearchBar } from "@/components/feed/search-bar";
import { PullToRefresh } from "@/components/feed/pull-to-refresh";
import { ScrollToTop } from "@/components/feed/scroll-to-top";

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const SEARCH_PLACEHOLDER = {
  en: "Search sparks",
  nl: "Zoek in sparks",
} as const;

export default async function FeedPage({ searchParams }: Props) {
  const viewer = await getViewer();

  if (viewer.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  if (viewer.status === "no-circle") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            You&apos;re not in a circle yet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Pleck is a private family vault. Ask your circle owner for a join
            link to get started.
          </p>
        </div>
      </main>
    );
  }

  const { member } = viewer;
  const { q: rawQ } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";

  const firstPage = await loadFeedPage(member.circleId, { q });
  const reader = { language: member.language, timezone: member.timezone };
  const currentMember = { id: member.id, role: member.role };

  return (
    <main className="mx-auto w-full max-w-2xl sm:max-w-3xl px-3.5 sm:px-6 pb-24">
      <h1 className="sr-only">Pleck feed</h1>
      <PullToRefresh>
        <FeedToolbar>
          <Suspense fallback={<div className="h-8 flex-1" />}>
            <SearchBar placeholder={SEARCH_PLACEHOLDER[member.language]} />
          </Suspense>
          <Link
            href="/compose"
            className={buttonVariants({
              size: "sm",
              className:
                "gap-1 rounded-full px-3 text-xs sm:text-sm font-medium shadow-2xs",
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
        />
      </PullToRefresh>
      <ScrollToTop />
    </main>
  );
}
