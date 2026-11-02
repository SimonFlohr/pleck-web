import { presignGet } from "@/lib/s3";
import { getFeedPage, type FeedQueryOptions } from "./query";
import type { FeedPage } from "./types";

const LOCAL_MEDIA = /^demo\/[a-z0-9-]+\.(svg|webp|jpe?g|png)$/;

async function mediaUrlFor(key: string | null): Promise<string | null> {
  if (!key) return null;
  if (LOCAL_MEDIA.test(key)) return `/${key}`;
  return presignGet(key);
}

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
          mediaUrl: await mediaUrlFor(item.mediaKey),
        })),
      ),
    })),
  );

  return { ...page, groups };
}
