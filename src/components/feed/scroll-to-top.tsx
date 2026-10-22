"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Loader2 } from "lucide-react";

const SCROLL_THRESHOLD = 300;

export function ScrollToTop() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleScrollTopAndRefresh() {
    if (refreshing) return;
    setRefreshing(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleScrollTopAndRefresh}
      aria-label="Scroll to top and refresh feed"
      className={`fixed bottom-4 right-4 sm:right-4 z-40 flex size-10 sm:size-11 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-muted hover:border-border active:scale-95 cursor-pointer ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      {refreshing ? (
        <Loader2 className="size-4 sm:size-5 animate-spin text-muted-foreground" />
      ) : (
        <ArrowUp className="size-4 sm:size-5 stroke-[2.25]" />
      )}
    </button>
  );
}
