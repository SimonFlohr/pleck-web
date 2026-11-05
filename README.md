# 🅿 Pleck ![Verify](https://img.shields.io/github/actions/workflow/status/SimonFlohr/pleck-web/ci.yml?branch=main&label=Verify)

> A private feed for one family. Sparks land on a shared timeline, grouped by the author's local day.

## 🧐 Why this exists

A member posts a spark — a photo, a voice note, or a few lines of text — and the circle reads it together. Days stay grouped by the author's local date, so another timezone does not reshuffle the feed. Stamps use the author's clock and the reader's language (English or Dutch). When the zones differ, the stamp adds the author's city.

_Pleck — from the Dutch_ plek, _"place" or "spot."_

There is no public join. Clerk sign-up does not add you to a circle. A member row has to exist first, and sign-in (and the Clerk webhook) links it when the email matches.

## 🚨 Status

The feed is usable. You can sign in, search spark text, page older days, post a photo or text spark, and delete your own. Owners can delete any spark in the circle. Photos upload straight to S3, capped at 50 MB, and are downscaled first.

Not built yet:

- Voice notes render. Playback does not.
- Categorization is a column. `enqueueCategorization` does not call anything.
- The weekly digest is planned for v1 and is not in this repo.

### Demo

`/demo` is a separate circle. Signed-out visitors still sign in at `/`. Posts there stay in the browser tab until refresh, and create, upload, and delete reject `demo@pleck.dev`. The banner switches English/Dutch and Chicago/Amsterdam. Day groups stay put. Labels and the city suffix change.

## 📊 Technology stack

- Next.js 16 (App Router) + React 19 + TypeScript. Clerk's middleware is `src/proxy.ts`.
- Tailwind CSS 4 + shadcn/ui, vendored in `src/components/ui` and committed.
- PostgreSQL (Neon) + Drizzle ORM. Migrations in `drizzle/`.
- Clerk for sign-in. Membership is Pleck's `members` table.
- S3 for spark media, via a presigned PUT. The app does not proxy the file.
- Node 22 in CI. GitHub Actions runs lint, `tsc --noEmit`, and `npm run build`. Commits run the same checks through lint-staged, plus Prettier.

## 🚧 Local development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

The app reads `.env.local`. You need `DATABASE_URL`, the Clerk keys, and the S3 bucket settings from `.env.example`. `CLERK_WEBHOOK_SECRET` is for `POST /api/webhooks/clerk`. Local sign-in still links a member when the email matches, even if the webhook is not set up yet.

`next dev` picks another port when 3000 is taken. Use the port it prints.

The family feed needs a member row on the Clerk user's email. `npm run db:init-prod` creates that circle without wiping other data. Read `src/lib/db/init-family.ts` first. It targets a specific household.

`npm run db:seed-demo` only replaces sparks in the circle named "Pleck demo". `npm run db:seed` deletes every circle, member, and spark, then inserts the dev household and the demo circle. It aborts if `DATABASE_URL` looks like production. Do not point it at a database you care about, and do not set `FORCE_DEV_SEED` to get past that check.

`npm run db:generate` writes a migration from `src/lib/db/schema.ts`.

## License

MIT — see [LICENSE](LICENSE).
