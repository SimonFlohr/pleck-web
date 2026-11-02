import { getViewer } from "@/lib/auth/viewer";
import { loadFeedPage } from "@/lib/feed/load";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const viewer = await getViewer(
    searchParams.get("demo") === "1" ? { forceDemo: true } : undefined,
  );
  if (viewer.status !== "member") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const page = await loadFeedPage(viewer.member.circleId, {
    cursor: searchParams.get("cursor"),
    q: searchParams.get("q"),
  });

  return Response.json(page);
}
