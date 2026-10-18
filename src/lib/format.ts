import { localDate } from "@/lib/local-date";

export type Language = "en" | "nl";
export type Reader = { language: Language; timezone: string };

const LOCALES: Record<Language, string> = { en: "en-US", nl: "nl-NL" };
export const toLocale = (lang: Language) => LOCALES[lang];

/** "America/Chicago" → "Chicago", "America/New_York" → "New York" */
export const zoneCity = (tz: string) =>
  (tz.split("/").pop() ?? tz).replace(/_/g, " ");

const DAY_MS = 86_400_000;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Day header for a date-only string (yyyy-MM-dd).
export function formatDayHeader(
  dateStr: string,
  reader: Reader,
  now = new Date(),
): string {
  const locale = toLocale(reader.language);
  const today = localDate(now, reader.timezone);
  const date = new Date(`${dateStr}T00:00:00Z`);

  const full = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(dateStr.slice(0, 4) !== today.slice(0, 4)
      ? { year: "numeric" as const }
      : {}),
    timeZone: "UTC",
  }).format(date);

  const diffDays = Math.round(
    (date.getTime() - Date.parse(`${today}T00:00:00Z`)) / DAY_MS,
  );

  // "Today" / "Vandaag", "Yesterday" / "Gisteren", and "Tomorrow" / "Morgen"
  if (Math.abs(diffDays) <= 1) {
    const rel = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      diffDays,
      "day",
    );
    return `${capitalize(rel)} · ${full}`;
  }
  return full;
}

// Author's clock, reader's language, city suffix when zones differ.
export function formatStamp(
  createdAtIso: string,
  authorTimezone: string,
  reader: Reader,
): string {
  const time = new Intl.DateTimeFormat(toLocale(reader.language), {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: authorTimezone,
  }).format(new Date(createdAtIso));

  return authorTimezone === reader.timezone
    ? time
    : `${time} · ${zoneCity(authorTimezone)}`;
}
