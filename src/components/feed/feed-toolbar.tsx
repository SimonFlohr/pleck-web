import type { ReactNode } from "react";

export function FeedToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="feed-toolbar sticky top-0 z-10 -mx-3.5 mb-4 sm:mx-0">
      <div
        className="pleck-fade flex items-center justify-between gap-3 px-3.5 py-3 sm:px-0"
        style={{ animationDelay: "80ms" }}
      >
        {children}
      </div>
    </div>
  );
}
