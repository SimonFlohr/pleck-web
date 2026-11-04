import { describe, expect, it } from "vitest";
import { localDate } from "./local-date";

const instant = "2026-11-05T04:30:00.000Z";

describe("author local date", () => {
  it("keeps a spark on the author's calendar day", () => {
    expect(localDate(instant, "America/Chicago")).toBe("2026-11-04");
    expect(localDate(new Date(instant), "America/Chicago")).toBe("2026-11-04");
  });

  it("can be a different day for someone in another zone", () => {
    expect(localDate(instant, "Europe/Amsterdam")).toBe("2026-11-05");
  });
});
