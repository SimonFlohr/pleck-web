import { ALLOWED_TYPES } from "@/lib/media-types";

type MemberRef = {
  id: number;
  circleId: number;
  role: "owner" | "member";
};

type SparkRef = {
  authorMemberId: number;
  circleId: number;
};

export type DeleteAccess = "ok" | "outside-circle" | "not-author-or-owner";

export function sparkDeleteAccess(
  member: MemberRef,
  spark: SparkRef,
): DeleteAccess {
  if (spark.circleId !== member.circleId) return "outside-circle";
  if (member.role === "owner" || spark.authorMemberId === member.id) {
    return "ok";
  }
  return "not-author-or-owner";
}

export function mediaKeyBelongsToCircle(
  key: string,
  circleId: number,
): boolean {
  return key.startsWith(`circles/${circleId}/sparks/`) && !key.includes("..");
}

export function isAllowedPhotoMime(mime: string): boolean {
  return mime.startsWith("image/") && Boolean(ALLOWED_TYPES[mime]);
}
