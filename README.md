# Fiege Live Warehouse Dashboard

A recreation of the `fiege-dash-live.lovable.app/top5` warehouse TV board: a public leaderboard display plus an admin panel to manage the data behind it, backed by a live Supabase database (writes broadcast to the TV board in real time).

## What's included

- **`/top5`** — live TV board: Top 5 Pickers / Top 5 Packers, clock, banner message, full-screen mode.
- **`/bottom5`** — same layout for a Bottom 5 board.
- **`/units`** — the second alternating TV screen (units to pick/pack, backlog, overpicks, etc).
- **`/admin`** — password-gated 4-step wizard:
  1. **Outbound SIC Data** — import a CSV/XLSX to auto-fill the 24-hour Pick/Pack grid, with live UPMH (units per man-hour) calculation and validation.
  2. **Units to Pick/Pack** — manual counters for board 2.
  3. **Top 5 Board** — names + units for top pickers/packers, plus the banner message.
  4. **Bottom 5 Board** — same for the bottom 5.
  - **Save & Broadcast** pushes everything live to the TV boards instantly (Supabase Realtime). **Reset for New Day** clears the current report date.

## Getting started

```bash
npm install
npm run dev
```

This ships pre-configured (via `.env`) to write into a Supabase project already set up for you, with the required tables and realtime already enabled — it should work immediately.

- TV board: `http://localhost:5173/top5`
- Admin: `http://localhost:5173/admin` (default password: `fiege-admin` — **change this**, see below)

## Configuration

Copy `.env.example` to `.env` if you ever want to point this at a different Supabase project:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
VITE_ADMIN_PASSWORD=choose-a-password
```

If you use a different/new Supabase project, run the schema in `supabase/schema.sql` against it first (creates the tables, enables Row Level Security, and adds the tables to the realtime publication).

### About the admin password

Like the original site, this is a **UI-level gate only** (checked in the browser, not enforced by the database). It stops casual tinkering on a shared screen, but anyone with your Supabase anon key could still write to the tables directly via the API. For a public/production rollout, the recommended upgrade is real Supabase Auth (a login user + RLS policies that require `authenticated`) instead of the shared client-side password — happy to wire that up if you want it.

## Deploying

This is a static Vite app — it deploys to Netlify, Vercel, Cloudflare Pages, or any static host:

```bash
npm run build
```

Then upload the `dist/` folder (or connect the repo for git-based deploys). Set the same three environment variables in your host's dashboard.

For the actual warehouse TVs: open `/top5` (and `/units`, `/bottom5` if you use them) in a browser, tap **Full Screen**, and leave it running — tapping the screen keeps it awake via the Wake Lock API where supported.

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Supabase (Postgres + Realtime), react-router-dom, PapaParse + SheetJS for CSV/Excel import.
