import type { FeedItem } from "@/lib/feed/types";

const EMPTY: FeedItem[] = [];
let sparks: FeedItem[] = EMPTY;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeDemoSparks(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readDemoSparks(): FeedItem[] {
  return sparks;
}

export function emptyDemoSparks(): FeedItem[] {
  return EMPTY;
}

export function nextDemoSparkId(): number {
  seq += 1;
  return -(Date.now() * 100 + seq);
}

export function saveDemoSpark(item: FeedItem) {
  if (typeof window === "undefined") {
    throw new Error("Demo sparks are kept in the browser");
  }
  sparks = [item, ...sparks.filter((spark) => spark.id !== item.id)];
  emit();
}

export function removeDemoSpark(id: number) {
  sparks = sparks.filter((spark) => spark.id !== id);
  emit();
}
