# Wrapped 🎁

A social app for planning thoughtful gifts with friends and family. Connect
with people, keep private notes on what they're into, build a gift idea list
for them, and get AI-assisted suggestions — all without the person themselves
ever seeing what's being planned for them.

## Features

- **Profiles** — name, bio, an emoji avatar, and self-reported "things I like
  to do" / "favorite things" that friends can use as a starting point.
- **Friends** — search by name or username, send/accept/decline friend
  requests.
- **Feed** — see when friends join or connect with each other. Deliberately
  excludes anything gift- or note-related so nobody's surprise gets spoiled.
- **Private gift guides** — for each friend, you keep your own notes
  (activities you've done together, favorite things you've noticed) and your
  own list of gift ideas. These are strictly scoped per (friend, you) pair:
  the friend can't see any of it, and other mutual friends' notes/ideas about
  the same person stay completely separate from yours.
- **AI-generated ideas** — a "Generate more ideas" page (a separate link from
  your manual list) suggests gifts based on the friend's profile plus your
  private notes about them. Currently backed by a rule-based keyword matcher
  (`src/lib/giftSuggestions.ts`) behind a clean function signature — swap in a
  real Claude API call there without touching any callers.

## Getting started

```bash
npm install                # also runs `prisma generate` via postinstall
cp .env.example .env       # set a real SESSION_SECRET before deploying anywhere
npm run db:migrate         # creates prisma/dev.db (SQLite) and applies the schema
npm run db:seed            # optional: adds demo users alice / ben / cara (password: password123)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying (e.g. to view it on a phone, Chromebook, or anywhere outside your own machine)

Running `npm run dev` only serves the app on your own computer — nothing
outside your network can open it. To get a real link that opens in Chrome on
any device, deploy it. This section is purely additive: it doesn't change how
`npm run dev` works locally, on this machine or anyone else's.

The app auto-detects its database at startup — if `TURSO_DATABASE_URL` is
set, it uses a hosted database (below); otherwise it uses the local SQLite
file exactly as before. Nothing to toggle by hand.

### 1. Create a free hosted database (Turso)

A deployed app has no persistent local disk to keep a SQLite file on, so it
needs a hosted one. [Turso](https://turso.tech) is SQLite-compatible and has a
free tier — no CLI required:

1. Sign up at [turso.tech](https://turso.tech) and create a new database from
   the web dashboard.
2. Open its **SQL console** in the dashboard and paste in the contents of
   [`prisma/migrations/20260729185424_init/migration.sql`](prisma/migrations/20260729185424_init/migration.sql)
   to create the tables, then run it.
3. From the database's "Connect" page, copy the **URL** (starts with
   `libsql://`) and create/copy an **auth token**.

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and
   import this repository.
2. Before the first deploy, add these environment variables (Project
   Settings → Environment Variables):
   - `TURSO_DATABASE_URL` — the `libsql://...` URL from step 1
   - `TURSO_AUTH_TOKEN` — the auth token from step 1
   - `SESSION_SECRET` — any long random string (e.g. generate one with
     `openssl rand -base64 32`)
3. Deploy. Vercel gives you a `https://your-project.vercel.app` URL — open
   that in Chrome on any device, including a Chromebook.

Sign up for an account through that URL the same way you would locally; the
seed script only runs against your local dev database, so a fresh deployment
starts empty.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- Prisma 7 with the `@prisma/adapter-better-sqlite3` driver adapter (local
  SQLite file) by default, or `@prisma/adapter-libsql` (hosted Turso) when
  `TURSO_DATABASE_URL` is set — see `src/lib/prisma.ts`
- Auth: bcrypt password hashing + signed JWT session cookies (`jose`), route
  protection via `src/proxy.ts`
- Server Actions for all mutations (signup/login, profile edits, friend
  requests, notes, gift ideas)

## Project layout

- `src/app/(auth)` — login/signup (public)
- `src/app/(app)` — everything behind auth: feed, friends, profile (`/u/[username]`),
  gift guides (`/guide/[username]` and `/guide/[username]/generated`)
- `src/app/actions` — Server Actions
- `src/lib` — auth, Prisma client, friend-status helpers, validation, the gift
  suggestion generator
- `prisma/schema.prisma` — data model
