import type { Viewer } from "@/lib/auth/viewer";

export function demoWriteResponse(viewer: Viewer): Response | null {
  if (viewer.status === "member" && viewer.demo) {
    return Response.json(
      { error: "Demo sparks stay in this browser until you refresh." },
      { status: 403 },
    );
  }
  return null;
}
