# Mujtamaaty (مجتمعاتي) — Community-First Learning Platform (Frontend-only demo)

A bilingual (Arabic / English) e-learning platform UI, built with **Next.js 14 (App Router)**, **TypeScript**
and **Tailwind CSS**. This repo is **frontend-only**: there is no real server. All data lives in local JSON files
under `data/` and is read directly at render time, so your backend engineer can build the real Laravel API against
the exact same shapes (see `lib/types.ts`, modeled field-for-field on the supplied database schema) without
guessing the contract.

The platform is **community-first**: every content creator owns exactly one `Community`, which bundles their
courses. Students browse and subscribe to communities (free or paid, for a fixed subscription period) to unlock
every course inside — a course can also exist standalone (no community) for future flexibility, though there is
no public browsing page for that case yet. The demo only supports two account types end-to-end — **student** and
**content creator** — there is no admin dashboard in this build.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/ar` (Arabic, RTL) by default. Switch language from the
globe icon in the navbar, which takes you to the same page under `/en`.

```bash
npm run build && npm run start   # production build
```

## Previewing account types

Since there is no backend/auth server, use the **"Preview as"** menu in the top navbar to sign in instantly as:

- **Student** — Nour Hassan (subscribed to a few communities, so you can see "My communities" / feed / watch page)
- **Content Creator** — Ahmed Nabil (has a published community, courses, sales, a feed to moderate)

You can also use the real-looking **Login / Register** forms:
- Login accepts any of the seed emails in `data/students.json` / `data/creators.json` (e.g.
  `nour.hassan@student.marefa.dev`, `ahmed.nabil@marefa.dev`). Password is not actually checked.
- Register creates a new local student/content-creator account; a new creator automatically gets an (inactive,
  free) community, matching the platform rule that every creator has exactly one community.

## What's implemented

**Guest** — Home, Communities (browse/search/filter/sort/pagination), Community details (course cards + free intro
video, locked curriculum, subscribe CTA), Creator profile (bio + gated community feed preview), Login, Register.

**Student** (adds to guest) — My communities, Course details inside a community (full curriculum once subscribed),
Watch course (lesson list + player), Community feed (post / edit / delete / nested comments / like — separate page
from community details), Profile settings.

**Content creator** — Dashboard, My community (edit name/description/type/status/free-or-priced subscription), My
courses (CRUD, auto-linked to the creator's own community), Lessons per course (CRUD, per-lesson free toggle),
Earnings, Withdrawal requests (Vodafone Cash / InstaPay payout details), Community feed moderation (delete any
post/comment, cannot edit), Profile settings.

## Architecture notes for your backend engineer

- `lib/types.ts` — TypeScript shapes mirroring the DB schema: `User`/`Student`/`Creator`/`Admin`, `Category`,
  `Community` (with `categoryId`, `discountPercentage`, `subscriptionDurationDays`), `Course` (with
  `discountPercentage`), `Lesson`, `Payment` (**polymorphic** — `payableType` of `"course" | "community"`),
  `Enrollment` (standalone course purchases only — direct `courseId`), `CommunitySubscription` (community
  subscriptions with `startsAt`/`endsAt`/`status`, kept separate from `Enrollment` since community access is
  time-boxed and renewable while a course purchase is permanent), `Review` (**polymorphic** —
  `reviewableType` of `"course" | "community"`), `CommunityPost`, `PostComment` (self-referencing `parentId` for
  nested replies), `PostReaction`, `WithdrawalRequest`, `Setting` (key-value). This is the starting point for
  Laravel migrations / API resources. The `Admin` role/type still exists in the schema (admin accounts are meant
  to be provisioned directly, not self-registered) but this build ships no admin UI.
- `data/*.json` — the mock database, one file per table. Swapping this project onto a real API later means
  replacing the functions in `lib/data.ts` with `fetch()` calls that return the same shapes.
- `lib/auth-context.tsx` — a **client-only, localStorage-backed** stand-in for real authentication. There is no
  password check and no session cookie; replace this with real auth (Sanctum/JWT) when the backend is ready. Also
  exposes `subscribeToCommunity` (writes a `Payment` + `CommunitySubscription` pair, with `endsAt` computed from
  the community's `subscriptionDurationDays`) and `purchaseCourse` (writes a `Payment` + `Enrollment` pair).
- `lib/platform-store.tsx` — a single generalized localStorage-backed store (`usePlatformStore`) that layers edits
  on top of every JSON table (courses, communities, posts, comments, reactions, enrollments, community
  subscriptions, payments, withdrawal requests, users, categories, settings). Every interactive feature in the
  demo — subscribing, posting, moderating, profile edits — persists through a page refresh via this one store,
  following the override/added/deletedIds pattern per collection.
- Nested comment replies are modeled as a flat table (`PostComment.parentId`) and assembled into a tree by
  `getCommentsByPost` in `lib/data.ts` / inline in `CommunityFeed.tsx`.
- "Is this student currently subscribed?" is computed in application logic (`isSubscribed` in `lib/data.ts` /
  `lib/auth-context.tsx`), not a DB constraint: the latest `CommunitySubscription` row for
  `(studentId, communityId)` with `status === "active"` and `endsAt > now()`. A real backend needs a scheduled job
  to flip lapsed rows to `"expired"`.

## i18n

- Route-based locales: every page lives under `/ar/...` or `/en/...` (`app/[locale]/...`).
- `middleware.ts` detects the browser's `Accept-Language` and redirects `/` to the right locale.
- Dictionaries: `lib/i18n/dictionaries/{ar,en}.json`. `dir="rtl"` / `dir="ltr"` is set on `<html>` automatically.
- Prices, numbers and dates use `Intl.NumberFormat` / `Intl.DateTimeFormat` per locale (see `lib/format.ts`).

## SEO & performance

- Server-rendered content pages (home, communities, community details, course-in-community, creator profile) for
  full crawlability, with per-page `generateMetadata`, canonical alternates, and Open Graph tags.
- `app/sitemap.ts` and `app/robots.ts` (private/dashboard routes and the community feed are disallowed).
- Static params (`generateStaticParams`) for communities, courses-in-communities and creators so those pages can be
  statically generated.
- No client-side data fetching waterfalls — all catalog data is imported at build/render time from JSON.
- Fonts (`Inter` for Latin, `Noto Sans Arabic` for Arabic, `IBM Plex Mono` for numbers) are loaded through
  `next/font` with `display: swap`.
- Interactive-only code (auth, subscribe flow, community feed, dashboards) is isolated in client components so the
  public marketing/catalog pages ship minimal JS.

## Design system

- Palette, type and the dashed "seal" motif (used for the logo, verified badges and thumbnails) are defined in
  `tailwind.config.ts` and `components/Seal.tsx` — no external image dependency, so the whole thing renders
  correctly even with no internet access.
- The home page hero expects a photo at `public/images/hero-creator.jpg` (any reasonably wide/landscape image
  works — the `<img>` is `aspect-[4/3]` and `object-cover`). Drop a file there and it picks it up automatically.
