import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { Composer } from "@/components/composer/composer";

export default async function ComposePage() {
  const viewer = await getViewer();
  if (viewer.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (viewer.status === "no-circle") redirect("/");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">New spark</h1>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          Cancel
        </Link>
      </div>
      <Composer circleId={viewer.member.circleId} />
    </main>
  );
}
