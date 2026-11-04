import { describe, expect, it } from "vitest";
import { createSparkSchema } from "./schema";

const FIFTY_MB = 50 * 1024 * 1024;

const media = {
  key: "circles/1/sparks/a/original.jpg",
  mime: "image/jpeg",
  sizeBytes: 1024,
  sha256: "a".repeat(64),
};

describe("creating a spark", () => {
  it("requires text, trims it, and stops at 2000 characters", () => {
    const parsed = createSparkSchema.safeParse({
      type: "text",
      textContent: "  hello  ",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ type: "text", textContent: "hello" });
    }

    expect(
      createSparkSchema.safeParse({ type: "text", textContent: "   " }).success,
    ).toBe(false);
    expect(
      createSparkSchema.safeParse({
        type: "text",
        textContent: "a".repeat(2000),
      }).success,
    ).toBe(true);
    expect(
      createSparkSchema.safeParse({
        type: "text",
        textContent: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("accepts a photo at the 50MB cap with a sha256, and rejects the rest", () => {
    expect(
      createSparkSchema.safeParse({
        type: "photo",
        media: { ...media, sizeBytes: FIFTY_MB },
      }).success,
    ).toBe(true);

    expect(
      createSparkSchema.safeParse({
        type: "photo",
        media: { ...media, sizeBytes: FIFTY_MB + 1 },
      }).success,
    ).toBe(false);
    expect(
      createSparkSchema.safeParse({
        type: "photo",
        media: { ...media, sha256: "not-a-hash" },
      }).success,
    ).toBe(false);
    expect(createSparkSchema.safeParse({ type: "photo" }).success).toBe(false);
  });

  it("does not accept a voice spark yet", () => {
    expect(createSparkSchema.safeParse({ type: "voice" }).success).toBe(false);
  });
});
