-- Phase 2: Community Chat + VC Features
-- Run this in Supabase SQL Editor after the initial schema.sql

-- 1. Community Messages (Open Chat)
create table if not exists community_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  channel text not null default 'general',
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now()
);

-- Indexes for fast channel queries
create index if not exists community_messages_channel_idx on community_messages(channel, created_at desc);

-- RLS
alter table community_messages enable row level security;
create policy "Community messages are publicly readable" on community_messages for select using (true);
create policy "Authenticated users can post messages" on community_messages for insert with check (auth.uid() = user_id);

-- 2. Add VC fields to listings
alter table listings add column if not exists seeks_investment boolean default false;
alter table listings add column if not exists investment_round text check (investment_round in ('pre-seed','seed','series-a','series-b'));
alter table listings add column if not exists monthly_revenue_range text check (monthly_revenue_range in ('<10k','10k-100k','>100k'));

-- Index for investor deal flow queries
create index if not exists listings_investment_idx on listings(seeks_investment, stage, created_at desc) where is_active = true;

-- 3. Update role_category enum to include 'investor'
-- Note: Postgres doesn't allow removing enum values, only adding.
-- Since we used text-based approach in practice, this is fine.
-- If role_category is the enum type, run:
-- alter type role_category add value if not exists 'investor';

-- If you used the enum from schema.sql, run the line above.
-- The app handles 'investor' as a valid category regardless.
