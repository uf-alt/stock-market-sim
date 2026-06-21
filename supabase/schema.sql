-- ── StockSim Schema ───────────────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor
-- NOTE: Disable email confirmation for easy testing:
--   Authentication → Email Templates → uncheck "Confirm email"

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  level      int  not null default 1,
  xp         int  not null default 0,
  xp_to_next int  not null default 500,
  streak     int  not null default 0,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- ── portfolios ────────────────────────────────────────────────────────────────
create table if not exists portfolios (
  id             uuid primary key references auth.users(id) on delete cascade,
  cash_balance   numeric not null default 100000,
  realized_gain  numeric not null default 0,
  updated_at     timestamptz not null default now()
);

alter table portfolios enable row level security;

create policy "portfolios: own row" on portfolios
  for all using (auth.uid() = id);

-- ── holdings ─────────────────────────────────────────────────────────────────
create table if not exists holdings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  ticker              text not null,
  name                text not null,
  shares              numeric not null,
  avg_cost            numeric not null,
  current_price       numeric not null,
  total_cost          numeric not null,
  total_value         numeric not null,
  unrealized_gain     numeric not null default 0,
  unrealized_gain_pct numeric not null default 0,
  allocation          numeric not null default 0,
  unique (user_id, ticker)
);

alter table holdings enable row level security;

create policy "holdings: own rows" on holdings
  for all using (auth.uid() = user_id);

-- ── transactions ──────────────────────────────────────────────────────────────
create table if not exists transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('buy', 'sell')),
  ticker     text not null,
  name       text not null,
  shares     numeric not null,
  price      numeric not null,
  total      numeric not null,
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "transactions: own rows" on transactions
  for all using (auth.uid() = user_id);

-- ── watchlist ─────────────────────────────────────────────────────────────────
create table if not exists watchlist (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker  text not null,
  unique (user_id, ticker)
);

alter table watchlist enable row level security;

create policy "watchlist: own rows" on watchlist
  for all using (auth.uid() = user_id);
