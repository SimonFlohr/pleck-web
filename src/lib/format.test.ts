import { describe, expect, it } from "vitest";
import { formatDayHeader, formatStamp, type Reader } from "./format";

const now = new Date("2026-11-04T18:00:00.000Z");
const iso = now.toISOString();

const chicago: Reader = { language: "en", timezone: "America/Chicago" };
const amsterdam: Reader = { language: "nl", timezone: "Europe/Amsterdam" };
const auckland: Reader = { language: "en", timezone: "Pacific/Auckland" };

function clock(locale: "en-US" | "nl-NL", timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(now);
}

describe("day headers", () => {
  it("says today or yesterday in the reader's language", () => {
    expect(formatDayHeader("2026-11-04", chicago, now)).toBe(
      "Today · Wednesday, November 4",
    );
    expect(formatDayHeader("2026-11-03", chicago, now)).toBe(
      "Yesterday · Tuesday, November 3",
    );
    expect(formatDayHeader("2026-11-04", amsterdam, now)).toBe(
      "Vandaag · woensdag 4 november",
    );
  });

  it("keeps the author's calendar date when the reader is already on the next day", () => {
    expect(formatDayHeader("2026-11-04", auckland, now)).toBe(
      "Yesterday · Wednesday, November 4",
    );
  });

  it("prints an older day as a date, and includes the year when it is a different year", () => {
    expect(formatDayHeader("2026-10-04", chicago, now)).toBe(
      "Sunday, October 4",
    );
    expect(formatDayHeader("2025-11-04", chicago, now)).toBe(
      "Tuesday, November 4, 2025",
    );
  });
});

describe("stamps", () => {
  it("uses the author's clock and the reader's language", () => {
    expect(formatStamp(iso, "America/Chicago", chicago)).toBe(
      clock("en-US", "America/Chicago"),
    );
    expect(formatStamp(iso, "Europe/Amsterdam", amsterdam)).toBe(
      clock("nl-NL", "Europe/Amsterdam"),
    );
  });

  it("names the author's city only when the reader is in another zone", () => {
    expect(formatStamp(iso, "America/New_York", chicago)).toBe(
      `${clock("en-US", "America/New_York")} · New York`,
    );
  });
});
