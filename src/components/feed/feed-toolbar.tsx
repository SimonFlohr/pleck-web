"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function FeedToolbar({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    function sync() {
      frame = 0;
      const node = ref.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY;
      node.style.backgroundPosition = `center ${-top}px`;
    }
    function requestSync() {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    }

    sync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    return () => {
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="feed-toolbar sticky top-0 z-10 -mx-3.5 mb-4 flex items-center justify-between gap-3 px-3.5 py-3 sm:mx-0 sm:px-0"
    >
      {children}
    </div>
  );
}
