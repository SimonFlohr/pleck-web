import type { Language } from "@/lib/format";

const COPY = {
  en: {
    noResults: (q: string) => `Nothing found for “${q}”.`,
    voiceHint: "Voice notes aren't searchable yet.",
    empty: "No sparks yet. Post the first one!",
  },
  nl: {
    noResults: (q: string) => `Niets gevonden voor “${q}”.`,
    voiceHint: "Spraakberichten zijn nog niet doorzoekbaar.",
    empty: "Nog geen sparks. Plaats de eerste!",
  },
} satisfies Record<Language, unknown>;

export function EmptyState({ q, language }: { q: string; language: Language }) {
  const t = COPY[language];
  return (
    <div className="py-16 text-center text-muted-foreground">
      {q ? (
        <>
          <p>{t.noResults(q)}</p>
          <p className="mt-1 text-sm">{t.voiceHint}</p>
        </>
      ) : (
        <p>{t.empty}</p>
      )}
    </div>
  );
}
