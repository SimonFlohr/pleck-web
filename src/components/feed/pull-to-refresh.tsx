"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
}

const PULL_THRESHOLD = 56; // px to drag before triggering refresh
const MAX_PULL = 84; // max drag ceiling

export function PullToRefresh({ children, onRefresh }: Props) {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startY = useRef(0);
  const isPulling = useRef(false);
  const pullYRef = useRef(0);

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (window.scrollY <= 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isPulling.current || refreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && window.scrollY <= 0) {
        if (e.cancelable) e.preventDefault();
        const dampened = Math.min(Math.pow(diff, 0.8), MAX_PULL);
        pullYRef.current = dampened;
        setPullY(dampened);
        setIsDragging(true);
      } else if (diff < 0) {
        pullYRef.current = 0;
        setPullY(0);
        setIsDragging(false);
        isPulling.current = false;
      }
    }

    async function handleTouchEnd() {
      if (!isPulling.current) return;
      isPulling.current = false;
      setIsDragging(false);

      if (pullYRef.current >= PULL_THRESHOLD && !refreshing) {
        setRefreshing(true);
        pullYRef.current = 50;
        setPullY(50);

        try {
          if (onRefresh) {
            await onRefresh();
          } else {
            router.refresh();
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        } catch {
          window.location.reload();
        } finally {
          setRefreshing(false);
          pullYRef.current = 0;
          setPullY(0);
        }
      } else {
        pullYRef.current = 0;
        setPullY(0);
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing, onRefresh, router]);

  const progress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <div className="relative">
      <div
        style={{
          height: pullY > 0 ? `${pullY}px` : 0,
          transition: isDragging
            ? "none"
            : "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="flex items-center justify-center overflow-hidden"
        aria-hidden={pullY === 0}
      >
        <div
          style={{
            opacity: Math.min(pullY / 24, 1),
            transform: `scale(${Math.min(0.6 + progress * 0.4, 1)})`,
          }}
          className="flex size-9 items-center justify-center rounded-full border border-primary/35 bg-card shadow-sm"
        >
          <Loader2
            className={`size-4 text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
            style={{
              transform: refreshing
                ? undefined
                : `rotate(${progress * 270}deg)`,
            }}
          />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
