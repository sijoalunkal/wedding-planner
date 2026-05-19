-- ============================================================
-- Nikah Planner — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- EVENTS table
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null default 'wedding',
  date       date not null,
  time       text,
  venue      text,
  notes      text,
  color      text default '#c4a882',
  created_at timestamptz default now()
);

-- GUESTS table
create table if not exists public.guests (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid references public.events(id) on delete cascade,
  name       text not null,
  type       text not null default 'individual',   -- individual | group
  count      integer not null default 1,
  rsvp       text not null default 'pending',       -- pending | confirmed | declined
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

-- EXPENSES table
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete cascade,
  category    text not null,
  description text not null,
  amount      numeric(12,2) not null default 0,
  paid        boolean not null default false,
  notes       text,
  created_at  timestamptz default now()
);

-- ============================================================
-- Enable Row Level Security (RLS) — open access for now
-- You can add auth later to restrict to logged-in users only
-- ============================================================

alter table public.events   enable row level security;
alter table public.guests   enable row level security;
alter table public.expenses enable row level security;

-- Allow full public access (single-user or family use)
create policy "Allow all events"   on public.events   for all using (true) with check (true);
create policy "Allow all guests"   on public.guests   for all using (true) with check (true);
create policy "Allow all expenses" on public.expenses for all using (true) with check (true);

-- ============================================================
-- Optional: seed with sample data to test
-- ============================================================
-- insert into public.events (name, type, date, time, venue, color)
-- values
--   ('Engagement Ceremony', 'engagement', '2025-11-15', '18:00', 'Grand Ballroom, Lahore', '#c084fc'),
--   ('Wedding Reception',   'wedding',    '2025-12-20', '19:30', 'Rose Garden Hall, Karachi', '#fb923c');
