# 🅿 Pleck

Pleck is currently a private vault for one family. A member posts a spark (e.g., a photo, voice note, or few lines of text) and the circle sees it on a shared feed. Days are grouped by the author's local date, so the feed does not reshuffle when a reader's timezone differs. Times are shown on the author's clock, in the reader's language. If those timezones differ, the stamp includes the author's city.

The name is the Dutch word _plek_, a place or a spot.

Currently, there is no public join flow. Signing up with Clerk does not put you in a circle: someone has to add a member row first. On sign-in, and again through the Clerk webhook, that row gets linked when the email matches.

## ✅ Current state

You can sign in, read the feed, search spark text, page through older days, post a photo or a text spark, and delete your own. Owners can delete anyone's spark in the circle. Photos upload straight to S3 from the browser. The original is capped at 50 MB, and Pleck downscales it before upload.

A few things are intentionally unfinished:

- Voice notes show up in the feed. Playback is not built yet. The card says so.
- Spark categorization (`milestone`, `everyday`, `occasion`) is a column on the row. `enqueueCategorization` does not call anything yet.
- A weekly digest is not in this repo, but will be implemented as part of the eventual v1 release.

## 💻 Demo

`/demo` is a separate demo circle, not the family one. Signed-out visitors land on sign-in at `/`. "Try demo" in the header opens the demo.

Posts made there stay in the browser tab and a refresh clears them. They are not written to the database or to S3. Create, upload, and delete all reject the demo member. That member's email is `demo@pleck.dev`, and both sign-in and the Clerk webhook are unable to link it.

The banner can switch the sample between English and Dutch, and between Chicago and Amsterdam timezones, so you can see how the same sparks read in each. The day groups remain identical, whereas the labels and the city suffix change.

Seed it with `npm run db:seed-demo`. That script only replaces sparks in the circle named "Pleck demo".

## 📊 Tech stack

- Next.js 16 (App Router) and React 19. The Clerk middleware file is `src/proxy.ts`.
- TypeScript, Tailwind CSS 4, and the shadcn components vendored in `src/components/ui`.
- Postgres on Neon, accessed with Drizzle ORM. Migrations are in `drizzle/`.
- Clerk for sign-in. Membership is Pleck's table, not Clerk's.
- S3 for spark media, via a presigned PUT. The app never proxies the file.
- Node 22 in CI.

## ∴ Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`. The app reads that file, not `.env`.

| Variable                                                                                                    | What it's for                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                              | Neon connection string. `sslmode=require` should stay on.                                                                                       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`                                                     | Clerk instance.                                                                                                                                 |
| `CLERK_WEBHOOK_SECRET`                                                                                      | Svix secret for `POST /api/webhooks/clerk`. User updates still work without it in local dev if you sign in once and the email matches a member. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL` | Already set. Leave them unless you move the routes.                                                                                             |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`                            | Bucket the browser uploads photos to. The dev default in the example is `pleck-media-dev-use2` in `us-east-2`.                                  |

Apply migrations, then start the app:

```bash
npm run db:migrate
npm run dev
```

`next dev` picks its own port if 3000 is taken. The port is in the terminal output.

To see the family feed you need a member row whose email matches the Clerk user. `npm run db:init-prod` creates the real circle without wiping other data. Read `src/lib/db/init-family.ts` before you run it. It is currently pointed at a specific household.

## 📝 Scripts

| Script                            | What it does                                                                                                                                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Next dev server.                                                                                                                                                                                                                                          |
| `npm run build` / `npm run start` | Production build and serve.                                                                                                                                                                                                                               |
| `npm run lint`                    | ESLint.                                                                                                                                                                                                                                                   |
| `npm run db:generate`             | Write a migration from `src/lib/db/schema.ts`.                                                                                                                                                                                                            |
| `npm run db:migrate`              | Apply migrations in `drizzle/`.                                                                                                                                                                                                                           |
| `npm run db:seed-demo`            | Reset sparks in the "Pleck demo" circle. Safe to re-run.                                                                                                                                                                                                  |
| `npm run db:seed`                 | **Deletes every circle, member, and spark**, then inserts the dev household and the demo circle. It aborts if `DATABASE_URL` looks like production. Do not point it at a database you care about, and do not set `FORCE_DEV_SEED` to get past that check. |
| `npm run db:init-prod`            | Non-destructive setup for the real circle.                                                                                                                                                                                                                |

Commits run eslint, `tsc --noEmit`, and Prettier through lint-staged. CI on `main` and on pull requests runs lint, the type check, and `npm run build`.

## 🗂️ Where things live

```
src/app/                  pages and route handlers
src/app/api/feed          paged feed
src/app/api/sparks        create and delete
src/app/api/upload        presigned S3 PUT
src/app/api/webhooks/clerk
src/components/feed       feed, spark card, demo banner
src/components/composer   text and photo composer
src/lib/auth/viewer.ts    signed-out, no circle, or the member
src/lib/feed              query, day grouping, presigned reads
src/lib/sparks            create and delete
src/lib/demo              sample circle, in-memory posts, write guard
src/lib/db/schema.ts      circles, members, sparks
src/proxy.ts              Clerk middleware
```

A spark belongs to one circle and one author. The author's timezone and local date are stored on the row at insert time. Soft delete is `deletedAt`. Feed queries ignore those rows.

Demo photos are files in `public/demo`. Anything else is a key in S3, and the feed route hands the browser a short-lived GET URL.
