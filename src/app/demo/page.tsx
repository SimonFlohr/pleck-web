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

export default async function DemoPage({ searchParams }: Props) {
  const viewer = await getViewer({ forceDemo: true });

  if (viewer.status !== "member") {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs sm:p-8">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            The demo circle isn&apos;t ready yet
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The sample household hasn&apos;t been added to this database.
          </p>
        </div>
      </main>
    );
  }

  const params = await searchParams;

  return (
    <CircleFeed
      member={viewer.member}
      demo
      q={firstParam(params.q)?.trim() ?? ""}
      lang={firstParam(params.lang)}
      tz={firstParam(params.tz)}
    />
  );
}
