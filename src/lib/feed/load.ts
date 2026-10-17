import { presignGet } from "@/lib/s3";
import { getFeedPage, type FeedQueryOptions } from "./query";
import type { FeedPage } from "./types";

export async function loadFeedPage(
  circleId: number,
  opts: FeedQueryOptions = {},
): Promise<FeedPage> {
  const page = await getFeedPage(circleId, opts);

  const groups = await Promise.all(
    page.groups.map(async (group) => ({
      ...group,
      items: await Promise.all(
        group.items.map(async (item) => ({
          ...item,
          mediaUrl: item.mediaKey ? await presignGet(item.mediaKey) : null,
        })),
      ),
    })),
  );

  return { ...page, groups };
}
