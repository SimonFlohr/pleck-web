import Link from "next/link";
import { demoHomeHref } from "@/lib/demo/reader";
import type { Reader } from "@/lib/format";
import { zoneCity } from "@/lib/format";

const COPY = {
  en: {
    eyebrow: "Sample circle",
    body: "You’re browsing as Alex. Search sparks, click on a photo spark to view it, and post/delete sparks as Alex — refreshing the page restores the original sparks. Switch between English and Dutch labels, as well as Chicago and Amsterdam timezones, to see how the sparks would look in each scenario.",
    language: "LANGUAGE",
    timezone: "TIMEZONE",
    english: "English",
    dutch: "Nederlands",
  },
  nl: {
    eyebrow: "Voorbeeldkring",
    body: "Je kijkt mee als Alex. Zoek naar sparks, klik op een foto spark om het te bekijken, en plaats/verwijder sparks als Alex — ververs de pagina om de originele sparks terug te krijgen. Wissel zowel tussen Engelse en Nederlandse labels, als tussen Chicago en Amsterdam tijdzones, om te zien hoe de sparks eruit zouden zien in elke scenario.",
    language: "TAAL",
    timezone: "TIJDZONE",
    english: "English",
    dutch: "Nederlands",
  },
} as const;

const ZONES = ["America/Chicago", "Europe/Amsterdam"] as const;
const LANGS = ["en", "nl"] as const;

export function DemoBanner({ reader, q }: { reader: Reader; q: string }) {
  const t = COPY[reader.language];

  return (
    <section className="mb-4 rounded-2xl border border-border/80 bg-card/30 px-4 py-3.5 shadow-xs">
      <p className="font-mono text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
        {t.eyebrow}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
        {t.body}
      </p>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[0.7rem] text-muted-foreground">
            {t.language}
          </span>
          {LANGS.map((lang) => {
            const active = reader.language === lang;
            const label = lang === "en" ? t.english : t.dutch;
            return (
              <Link
                key={lang}
                href={demoHomeHref({ ...reader, language: lang }, q)}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[0.7rem] text-muted-foreground">
            {t.timezone}
          </span>
          {ZONES.map((timezone) => {
            const active = reader.timezone === timezone;
            return (
              <Link
                key={timezone}
                href={demoHomeHref({ ...reader, timezone }, q)}
                aria-current={active ? "true" : undefined}
                className={
                  active
                    ? "rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              >
                {zoneCity(timezone)}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
