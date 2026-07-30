# Wrapped

Gift-planning social app. Next.js App Router + Tailwind v4, Firebase (Auth +
Firestore) for data, Claude API for gift-idea generation. Full product spec
lives in README.md; setup/known-gaps are in README.md's "Getting started"
section.

## Structure

- `src/lib/firebase.ts` — Firebase client init (reads `NEXT_PUBLIC_FIREBASE_*` env vars)
- `src/lib/data.ts` — all Firestore reads/writes (users, friendships, wishlist, gift ideas, events)
- `src/lib/types.ts`, `src/lib/constants.ts` — shared types, sports/scents/colors lists
- `src/context/AuthContext.tsx` — current user + live profile doc
- `src/app/(app)/` — authenticated routes (home, profile, friend/[uid], ideas), wrapped in bottom-tab nav
- `src/app/api/generate-ideas/route.ts` — server route calling the Claude API (keeps `ANTHROPIC_API_KEY` server-side)
- `firestore.rules` — enforces the privacy model below

## Privacy model (important — don't break this)

- A friend's private gift notes about a person (`giftIdeas/{targetUid}_{authorUid}/items`)
  are readable only by that author — never the target, never another friend.
- A "bought" mark on a wishlist item is stored per-viewer under the item
  (`users/{uid}/wishlist/{itemId}/boughtBy/{viewerUid}`) so only the person who
  bought it can see that mark.
- The wishlist owner's own `liked`/`received` fields are public to signed-in
  users (friends need to see what's already been received).
