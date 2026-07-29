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

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4
- Prisma 7 with the `@prisma/adapter-better-sqlite3` driver adapter (SQLite)
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
