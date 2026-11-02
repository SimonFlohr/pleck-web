import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { Composer } from "@/components/composer/composer";
import { demoHomeHref, firstParam, resolveDemoReader } from "@/lib/demo/reader";

type Props = {
  searchParams: Promise<{
    lang?: string | string[];
    tz?: string | string[];
    demo?: string | string[];
  }>;
};

export default async function ComposePage({ searchParams }: Props) {
  const params = await searchParams;
  const viewer = await getViewer(
    firstParam(params.demo) === "1" ? { forceDemo: true } : undefined,
  );
  if (viewer.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (viewer.status === "demo-unavailable" || viewer.status === "no-circle") {
    redirect("/");
  }

  const homeHref = viewer.demo
    ? demoHomeHref(
        resolveDemoReader(viewer.member, {
          lang: firstParam(params.lang),
          tz: firstParam(params.tz),
        }),
      )
    : "/";

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mono text-lg font-medium tracking-tight">
          New spark
        </h1>
        <Link
          href={homeHref}
          className="text-sm text-muted-foreground hover:underline"
        >
          Cancel
        </Link>
      </div>
      <Composer
        circleId={viewer.member.circleId}
        afterPostHref={homeHref}
        demoAuthor={
          viewer.demo
            ? {
                id: viewer.member.id,
                displayName: viewer.member.displayName,
                timezone: viewer.member.timezone,
              }
            : undefined
        }
      />
    </main>
  );
}
