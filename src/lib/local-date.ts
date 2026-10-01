import { formatInTimeZone } from "date-fns-tz";

export const localDate = (instant: Date | string, zone: string) => {
  const d = typeof instant === "string" ? new Date(instant) : instant;
  return formatInTimeZone(d, zone, "yyyy-MM-dd");
};
