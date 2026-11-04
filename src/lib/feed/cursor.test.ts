import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "./cursor";

const cursor = {
  d: "2026-11-04",
  c: "2026-11-04T18:00:00.000Z",
  i: 42,
};

function raw(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

describe("feed cursor", () => {
  it("round-trips the local date, the created time, and the id", () => {
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it.each([
    ["missing", null],
    ["blank", ""],
    ["undecodable", "@@@"],
    ["unrelated", raw({ hello: "world" })],
    ["bad date", raw({ ...cursor, d: "11/04/2026" })],
    ["bad time", raw({ ...cursor, c: "yesterday" })],
    ["fractional id", raw({ ...cursor, i: 1.5 })],
  ])("ignores a %s cursor", (_label, value) => {
    expect(decodeCursor(value)).toBeNull();
  });
});
