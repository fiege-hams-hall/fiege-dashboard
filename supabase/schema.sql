-- Fiege Live Warehouse Dashboard — schema
-- Run this against a fresh Supabase project to reproduce the tables this app needs.

create table if not exists fiege_report_days (
  report_date date primary key,
  banner_message text,
  units_to_pick integer,
  units_to_pack integer,
  pre_processed_failed integer,
  backlog_orders integer,
  overpicks integer,
  updated_at timestamptz not null default now()
);

create table if not exists fiege_hourly_data (
  id uuid primary key default gen_random_uuid(),
  report_date date not null references fiege_report_days(report_date) on delete cascade,
  hour_index smallint not null check (hour_index between 0 and 23),
  hour_slot text not null,
  pick_plan numeric,
  pick_units numeric,
  pick_hours numeric,
  pack_plan numeric,
  pack_units numeric,
  pack_hours numeric,
  unique (report_date, hour_index)
);

create table if not exists fiege_leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  report_date date not null references fiege_report_days(report_date) on delete cascade,
  board_type text not null check (board_type in ('top5','bottom5')),
  role text not null check (role in ('picker','packer')),
  rank smallint not null check (rank between 1 and 5),
  employee_name text,
  units numeric,
  unique (report_date, board_type, role, rank)
);

alter table fiege_report_days enable row level security;
alter table fiege_hourly_data enable row level security;
alter table fiege_leaderboard_entries enable row level security;

-- Public (anon) read access so the TV board can display without login.
create policy "public read report_days" on fiege_report_days for select using (true);
create policy "public read hourly_data" on fiege_hourly_data for select using (true);
create policy "public read leaderboard" on fiege_leaderboard_entries for select using (true);

-- Public (anon) write access -- matches the original app (admin panel has no server-side auth).
-- The frontend adds a UI-level password gate on /admin. See README for the upgrade path to
-- real Supabase Auth if you want database-level write protection.
create policy "public write report_days" on fiege_report_days for all using (true) with check (true);
create policy "public write hourly_data" on fiege_hourly_data for all using (true) with check (true);
create policy "public write leaderboard" on fiege_leaderboard_entries for all using (true) with check (true);

-- Enable realtime broadcasting for live TV board updates.
alter publication supabase_realtime add table fiege_report_days;
alter publication supabase_realtime add table fiege_hourly_data;
alter publication supabase_realtime add table fiege_leaderboard_entries;
