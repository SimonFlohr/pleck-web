import type { Language, Reader } from "@/lib/format";

export const DEMO_LANGUAGES = ["en", "nl"] as const;
export const DEMO_TIMEZONES = ["America/Chicago", "Europe/Amsterdam"] as const;

export type DemoLanguage = (typeof DEMO_LANGUAGES)[number];
export type DemoTimezone = (typeof DEMO_TIMEZONES)[number];

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isDemoLanguage(
  value: string | undefined,
): value is DemoLanguage {
  return value === "en" || value === "nl";
}

export function isDemoTimezone(
  value: string | undefined,
): value is DemoTimezone {
  return value === "America/Chicago" || value === "Europe/Amsterdam";
}

export function resolveDemoReader(
  member: { language: Language; timezone: string },
  raw: { lang?: string; tz?: string },
): Reader {
  return {
    language: isDemoLanguage(raw.lang) ? raw.lang : member.language,
    timezone: isDemoTimezone(raw.tz) ? raw.tz : member.timezone,
  };
}

export function demoQuery(reader: Reader, q?: string): string {
  const params = new URLSearchParams();
  params.set("lang", reader.language);
  params.set("tz", reader.timezone);
  if (q) params.set("q", q);
  return params.toString();
}

export function demoHomeHref(reader: Reader, q?: string): string {
  return `/demo?${demoQuery(reader, q)}`;
}
