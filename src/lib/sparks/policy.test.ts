import { describe, expect, it } from "vitest";
import {
  isAllowedPhotoMime,
  mediaKeyBelongsToCircle,
  sparkDeleteAccess,
} from "./policy";

const spark = { authorMemberId: 2, circleId: 7 };

describe("deleting a spark", () => {
  it("lets the author delete their own spark", () => {
    expect(
      sparkDeleteAccess({ id: 2, circleId: 7, role: "member" }, spark),
    ).toBe("ok");
  });

  it("lets the circle owner delete someone else's spark", () => {
    expect(
      sparkDeleteAccess({ id: 1, circleId: 7, role: "owner" }, spark),
    ).toBe("ok");
  });

  it("refuses another member of the circle", () => {
    expect(
      sparkDeleteAccess({ id: 3, circleId: 7, role: "member" }, spark),
    ).toBe("not-author-or-owner");
  });

  it("refuses a spark that belongs to another circle, even for an owner", () => {
    expect(
      sparkDeleteAccess(
        { id: 1, circleId: 7, role: "owner" },
        { ...spark, circleId: 8 },
      ),
    ).toBe("outside-circle");
  });
});

describe("media keys", () => {
  it("must live under this circle and must not climb out", () => {
    expect(mediaKeyBelongsToCircle("circles/7/sparks/a/original.jpg", 7)).toBe(
      true,
    );
    expect(mediaKeyBelongsToCircle("circles/17/sparks/a/original.jpg", 7)).toBe(
      false,
    );
    expect(
      mediaKeyBelongsToCircle("circles/7/sparks/../../8/sparks/a.jpg", 7),
    ).toBe(false);
    expect(mediaKeyBelongsToCircle("other/7/sparks/a.jpg", 7)).toBe(false);
  });
});

describe("photo types", () => {
  it("allows the image types a spark can store, and not audio or gif", () => {
    expect(isAllowedPhotoMime("image/jpeg")).toBe(true);
    expect(isAllowedPhotoMime("image/png")).toBe(true);
    expect(isAllowedPhotoMime("image/heic")).toBe(true);
    expect(isAllowedPhotoMime("image/gif")).toBe(false);
    expect(isAllowedPhotoMime("audio/mpeg")).toBe(false);
  });
});
