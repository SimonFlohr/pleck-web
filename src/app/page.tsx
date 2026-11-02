import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CircleFeed } from "@/components/feed/circle-feed";
import { getViewer } from "@/lib/auth/viewer";
import { firstParam } from "@/lib/demo/reader";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    lang?: string | string[];
    tz?: string | string[];
  }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const viewer = await getViewer();

  if (viewer.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  if (viewer.status === "no-circle") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs sm:p-8">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            You&apos;re not in a circle yet
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Pleck is a private family vault. Ask your circle owner for a join
            link to get started.
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="/demo"
              className="font-medium text-foreground hover:underline"
            >
              Try the demo
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (viewer.status === "demo-unavailable") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  const params = await searchParams;

  return (
    <CircleFeed
      member={viewer.member}
      demo={viewer.demo}
      q={firstParam(params.q)?.trim() ?? ""}
      lang={firstParam(params.lang)}
      tz={firstParam(params.tz)}
    />
  );
}
