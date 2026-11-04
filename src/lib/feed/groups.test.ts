import { describe, expect, it } from "vitest";
import { groupByDay, mergePages } from "./groups";
import type { FeedItem } from "./types";

function spark(
  id: number,
  authorLocalDate: string,
  createdAt: string,
): FeedItem {
  return {
    id,
    type: "text",
    textContent: "a spark",
    authorMemberId: 1,
    authorName: "Sam",
    authorAvatarUrl: null,
    authorTimezone: "America/Chicago",
    authorLocalDate,
    createdAt,
    mediaKey: null,
    mediaMime: null,
    mediaUrl: null,
  };
}

const later = spark(3, "2026-11-04", "2026-11-05T03:00:00.000Z");
const earlier = spark(2, "2026-11-04", "2026-11-04T20:00:00.000Z");
const previous = spark(1, "2026-11-03", "2026-11-04T02:00:00.000Z");

describe("day groups", () => {
  it("folds one ordered page into a group per local day", () => {
    expect(groupByDay([later, earlier, previous])).toEqual([
      { date: "2026-11-04", items: [later, earlier] },
      { date: "2026-11-03", items: [previous] },
    ]);
  });

  it("leaves feed order alone, so a day only groups while it is contiguous", () => {
    const again = spark(4, "2026-11-04", "2026-11-04T15:00:00.000Z");

    expect(
      groupByDay([later, previous, again]).map((group) => group.date),
    ).toEqual(["2026-11-04", "2026-11-03", "2026-11-04"]);
  });

  it("stitches a day that was split across two pages", () => {
    const older = spark(0, "2026-11-02", "2026-11-02T18:00:00.000Z");

    expect(
      mergePages(
        [
          { date: "2026-11-04", items: [later] },
          { date: "2026-11-03", items: [previous] },
        ],
        [
          { date: "2026-11-03", items: [earlier] },
          { date: "2026-11-02", items: [older] },
        ],
      ),
    ).toEqual([
      { date: "2026-11-04", items: [later] },
      { date: "2026-11-03", items: [previous, earlier] },
      { date: "2026-11-02", items: [older] },
    ]);
  });

  it("appends a page that starts on a new day, and ignores an empty page", () => {
    const first = [{ date: "2026-11-04", items: [later] }];
    const next = [{ date: "2026-11-02", items: [previous] }];

    expect(mergePages(first, next)).toEqual([...first, ...next]);
    expect(mergePages(first, [])).toEqual(first);
    expect(mergePages([], first)).toEqual(first);
  });
});
