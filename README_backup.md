# pleck-web

> A private, timezone-aware way for one family spread across two countries to stay part of each other's everyday life.

## Why this exists

My household lives in one country; my parents and my sister's family live in the Netherlands. The tools that already exist don't fit that gap — a group chat gets noisy and the quiet members drift out of it, a shared album is a one-way highlight reel that doesn't say how anyone's actually doing, and scheduling a call across multiple time zones is a small puzzle every single time.

Pleck closes that gap. A household member drops in a **spark** — a photo, a voice note, or a few lines of text — in seconds. Pleck compiles the week's sparks into a digest and delivers it to each recipient at a sensible hour in _their_ timezone, in their language. Recipients reply by web or by email without ever creating an account.

Seven people, one private circle: a household of three, and four family members across two households in the Netherlands. Invite-only, no public sign-up, by design — until it's proven itself here first.

_Pleck — from the Dutch_ plek, _"place" or "spot."_

## Status

🚧 **v0.1 (MVP) in progress** — nothing shipped yet.

## Stack

- Next.js 16 (App Router) + React + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui — components are vendored into components/ui/ and committed, not installed as a dependency
- Typography: Fraunces (display) + Karla (body)
- PostgreSQL (Neon) + Drizzle ORM
- Clerk — auth for household members; recipients need no account
- AWS — S3 (spark media) · SES (digest send + inbound reply parsing) · EventBridge + Lambda (scheduled compilation and delivery)
- Anthropic API — spark categorization (milestone / everyday / occasion)
- Vercel · GitHub Actions CI
- Vitest + Playwright

## Local development

> Filled in during Epic 0 (PLK-1 → PLK-12). Nothing to run yet.

Will need local credentials for Neon (`DATABASE_URL`), Clerk, AWS (S3 + SES), and the Anthropic API. PLK-19 seeds one circle with all seven members on real timezones, so digest scheduling can be exercised locally without waiting a week for one to fire.

## License

Private — see [LICENSE](LICENSE).
