-- =====================================================
-- Lendify Portal — Foundation Schema
-- Profiles, teams, and shared reference tables
-- =====================================================

-- =====================================================
-- 1. ENUMS
-- =====================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'agent',
      'leadership',
      'supervisor',
      'executive',
      'admin',
      'qa_senior',
      'qa_analyst',
      'qa_trainer',
      'rta'
    );
  end if;
end $$;

-- =====================================================
-- 2. TABLES (create all tables first, before any policies)
-- =====================================================

-- TEAMS
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  leader_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PROFILES (mirrors auth.users, holds business role/team info)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role public.user_role not null default 'agent',
  team_id uuid references public.teams(id) on delete set null,
  hire_date date,
  status text not null default 'active' check (status in ('active', 'inactive', 'on_leave', 'terminated')),
  phone text,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Now add FK from teams.leader_id -> profiles.id (after profiles exists)
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'teams_leader_id_fkey' and table_name = 'teams'
  ) then
    alter table public.teams
      add constraint teams_leader_id_fkey
      foreign key (leader_id) references public.profiles(id) on delete set null;
  end if;
end $$;

-- =====================================================
-- 3. RLS
-- =====================================================
alter table public.teams enable row level security;
alter table public.profiles enable row level security;

-- Helper function to check if current user has elevated role.
-- SECURITY DEFINER avoids RLS recursion when policies query profiles.
create or replace function public.has_role(required_roles text[])
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role_val text;
begin
  select role::text into user_role_val from public.profiles where id = auth.uid();
  return user_role_val = any(required_roles);
end;
$$;

-- Teams policies
drop policy if exists "teams_select_all" on public.teams;
create policy "teams_select_all" on public.teams for select using (auth.role() = 'authenticated');

drop policy if exists "teams_admin_write" on public.teams;
create policy "teams_admin_write" on public.teams
  for all using (public.has_role(array['admin', 'executive']));

-- Profiles policies
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update using (public.has_role(array['admin', 'executive']));

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.has_role(array['admin', 'executive']));

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.has_role(array['admin']));

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'agent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists teams_updated_at on public.teams;
create trigger teams_updated_at before update on public.teams
  for each row execute function public.set_updated_at();

-- =====================================================
-- 5. INDEXES
-- =====================================================
create index if not exists idx_profiles_team on public.profiles(team_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_manager on public.profiles(manager_id);
create index if not exists idx_teams_leader on public.teams(leader_id);
