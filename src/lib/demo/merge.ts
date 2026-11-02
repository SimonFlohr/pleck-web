import type { FeedGroup, FeedItem } from "@/lib/feed/types";

export function mergeDemoItems(
  groups: FeedGroup[],
  extras: FeedItem[],
  q: string,
): FeedGroup[] {
  const needle = q.trim().toLowerCase();
  const incoming = extras.filter((item) => {
    if (item.id >= 0) return false;
    if (!needle) return true;
    return (item.textContent ?? "").toLowerCase().includes(needle);
  });

  const next = groups.map((group) => ({
    date: group.date,
    items: group.items.filter((item) => item.id >= 0),
  }));

  for (const item of incoming) {
    let group = next.find((entry) => entry.date === item.authorLocalDate);
    if (!group) {
      group = { date: item.authorLocalDate, items: [] };
      next.push(group);
    }
    group.items.push(item);
  }

  for (const group of next) {
    group.items.sort((a, b) => {
      if (a.createdAt === b.createdAt) return b.id - a.id;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }

  next.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return next.filter((group) => group.items.length > 0);
}
