-- Minimal test to verify script execution works
create table if not exists public._v0_test (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);
