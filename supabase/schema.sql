-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type role_category as enum ('cofounder', 'developer', 'designer', 'marketing', 'sales', 'other');
create type compensation_type as enum ('equity', 'salary', 'both');
create type startup_stage as enum ('idea', 'mvp', 'revenue', 'funded');

-- Profiles table (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  skills text[] default '{}',
  location text,
  created_at timestamptz default now()
);

-- Listings table
create table listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  role_category role_category not null,
  compensation_type compensation_type not null,
  equity_percent int check (equity_percent >= 0 and equity_percent <= 100),
  stage startup_stage not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations table
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) on delete set null,
  participant_1 uuid not null references profiles(id) on delete cascade,
  participant_2 uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(participant_1, participant_2, listing_id)
);

-- Messages table
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at on listings
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listings_updated_at
  before update on listings
  for each row execute function update_updated_at();

-- Row Level Security
alter table profiles enable row level security;
alter table listings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Listings: anyone can read active listings, only owner can create/update/delete
create policy "Active listings are viewable by everyone" on listings for select using (is_active = true or auth.uid() = user_id);
create policy "Authenticated users can create listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on listings for delete using (auth.uid() = user_id);

-- Conversations: only participants can read
create policy "Participants can view conversations" on conversations for select using (auth.uid() = participant_1 or auth.uid() = participant_2);
create policy "Authenticated users can create conversations" on conversations for insert with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages: only conversation participants can read/write
create policy "Participants can view messages" on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);
create policy "Participants can send messages" on messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);
create policy "Participants can update messages (mark read)" on messages for update using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);

-- Storage bucket for avatars (run in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- create policy "Avatar images are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
-- create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users can update their own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
