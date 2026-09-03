# Fiege Live Warehouse Dashboard

A recreation of the `fiege-dash-live.lovable.app/top5` warehouse TV board: a public leaderboard display plus an admin panel to manage the data behind it, backed by a live Supabase database (writes broadcast to the TV board in real time).

**Live:** https://maztouliatos-png.github.io/fiege-dashboard/#/top5 (deploys automatically from `main` via GitHub Actions)

## What's included

- **`/#/top5`** — the public TV board. This is a single screen that auto-rotates every 30s through three views, matching the original exactly:
  1. **Top 5** — Top 5 Pickers / Top 5 Packers, trophy icon, red/cyan, editable banner message.
  2. **Bottom 5 / "Focus 5"** — same layout in orange, trend-down icon, fixed encouragement banner.
  3. **Performance Board** — 6 stat tiles (Pick/Pack UPMH and units packed, both "last hour" and "cumulative"), computed live from the hourly data entered in Admin — nothing extra to fill in.
- **`/#/admin`** — password-gated 4-step wizard:
  1. **Outbound SIC Data** — import a CSV/XLSX to auto-fill the 24-hour Pick/Pack grid, with live UPMH (units per man-hour) calculation and validation.
  2. **Units to Pick/Pack** — manual counters for board 2.
  3. **Top 5 Board** — names + units for top pickers/packers, plus the banner message.
  4. **Bottom 5 Board** — same for the bottom 5.
  - **Save & Broadcast** pushes everything live to the TV boards instantly (Supabase Realtime). **Reset for New Day** clears the current report date.

Routes use `#/...` (hash routing) rather than plain paths — that's what lets a direct link like `/#/admin` work correctly on GitHub Pages, which can't do server-side rewrites the way Netlify/Vercel can.

## Getting started

```bash
npm install
npm run dev
```

This ships pre-configured (via `.env` for local dev, `.env.production` for the deployed build) to write into a Supabase project already set up for you, with the required tables and realtime already enabled — it should work immediately.

- TV board: `http://localhost:5173/#/top5`
- Admin: `http://localhost:5173/#/admin` (default password: `fiege-admin` — **change this**, see below)

## Configuration

Copy `.env.example` to `.env` if you ever want to point this at a different Supabase project:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_ADMIN_PASSWORD=choose-a-password
```

`.env.production` holds the same three variables and is what the GitHub Actions build reads — edit that (and push) to change the deployed site's Supabase project or admin password.

If you use a different/new Supabase project, run the schema in `supabase/schema.sql` against it first (creates the tables, enables Row Level Security, and adds the tables to the realtime publication).

### About the admin password

Like the original site, this is a **UI-level gate only** (checked in the browser, not enforced by the database) — and because this repo is public, it's even more visible than usual: it sits in plain text in `.env.production` and gets inlined into the built JS either way. It stops casual tinkering on a shared screen, but anyone who looks at the repo or opens devtools can read it, and anyone with your Supabase anon key could write to the tables directly via the API regardless of the password. For real protection, the recommended upgrade is Supabase Auth (a login user + RLS policies that require `authenticated`) instead of the shared client-side password — happy to wire that up if you want it.

## Deploying

This repo auto-deploys to **GitHub Pages** on every push to `main` via `.github/workflows/deploy-pages.yml` (build with Vite, publish `dist/` via `actions/deploy-pages`). Nothing to run manually — just push.

It's still a plain static build, so it also deploys to Netlify, Vercel, Cloudflare Pages, etc. if you'd rather host it elsewhere:

```bash
npm run build
```

Then upload the `dist/` folder (or connect the repo for git-based deploys) and set the same three environment variables in your host's dashboard. If you move off GitHub Pages, switch `HashRouter` back to `BrowserRouter` in `src/main.tsx` and drop the `base` override in `vite.config.ts` — those two exist specifically to work around GitHub Pages having no server-side rewrites.

For the actual warehouse TVs: open `/#/top5` in a browser, tap **Full Screen**, and leave it running — it auto-rotates through all three views on its own, and tapping the screen keeps it awake via the Wake Lock API where supported.

### The Performance Board's targets

The Pick UPMH (210) and Pack UPMH (135) targets shown on the Performance Board are fixed constants in `src/components/tv/PerformanceView.tsx` — the original site doesn't expose a way to configure them either. Edit those two numbers directly if your targets change.

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Supabase (Postgres + Realtime), react-router-dom, PapaParse + SheetJS for CSV/Excel import.
