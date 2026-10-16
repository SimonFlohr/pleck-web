import type { FeedGroup, FeedItem } from "./types";

export function groupByDay(items: FeedItem[]): FeedGroup[] {
  const groups: FeedGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.date === item.authorLocalDate) {
      last.items.push(item);
    } else {
      groups.push({ date: item.authorLocalDate, items: [item] });
    }
  }
  return groups;
}

export function mergePages(
  existing: FeedGroup[],
  incoming: FeedGroup[],
): FeedGroup[] {
  if (existing.length === 0) return incoming;
  if (incoming.length === 0) return existing;

  const lastExisting = existing[existing.length - 1];
  const [firstIncoming, ...rest] = incoming;

  if (lastExisting.date !== firstIncoming.date)
    return [...existing, ...incoming];

  return [
    ...existing.slice(0, -1),
    {
      date: lastExisting.date,
      items: [...lastExisting.items, ...firstIncoming.items],
    },
    ...rest,
  ];
}
