-- =====================================================
-- TASK MANAGEMENT SYSTEM
-- Assignable tasks, follow-up threads, reminders
-- =====================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'waiting', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_category') then
    create type public.task_category as enum ('coaching', 'compliance', 'qa_followup', 'rta_followup', 'training', 'investigation', 'admin', 'other');
  end if;
end $$;

-- TASKS
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  category public.task_category not null default 'other',
  -- Ownership
  created_by uuid not null references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  -- Scheduling
  due_date timestamptz,
  reminder_at timestamptz,
  completed_at timestamptz,
  -- Context linking — what this task is about
  related_type text, -- e.g. 'qa_evaluation', 'rta_infraction', 'audit_queue'
  related_id uuid,
  -- Meta
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- Users can see tasks assigned to them, created by them, or on their team
drop policy if exists "tasks_select_own_or_team" on public.tasks;
create policy "tasks_select_own_or_team" on public.tasks
  for select using (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'executive', 'supervisor', 'qa_senior', 'rta')
          or p.team_id = tasks.team_id
        )
    )
  );

drop policy if exists "tasks_insert_authenticated" on public.tasks;
create policy "tasks_insert_authenticated" on public.tasks
  for insert with check (
    created_by = auth.uid()
  );

drop policy if exists "tasks_update_participants" on public.tasks;
create policy "tasks_update_participants" on public.tasks
  for update using (
    assigned_to = auth.uid()
    or created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'executive', 'supervisor', 'qa_senior', 'rta')
    )
  );

drop policy if exists "tasks_delete_creator_or_admin" on public.tasks;
create policy "tasks_delete_creator_or_admin" on public.tasks
  for delete using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'supervisor')
    )
  );

-- TASK FOLLOW-UPS (comment/activity thread)
create table if not exists public.task_follow_ups (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete set null,
  body text not null,
  kind text not null default 'comment' check (kind in (
    'comment', 'status_change', 'assignment', 'due_date_change', 'system'
  )),
  -- Optional fields for structured activity entries
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

alter table public.task_follow_ups enable row level security;

drop policy if exists "follow_ups_select" on public.task_follow_ups;
create policy "follow_ups_select" on public.task_follow_ups
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_follow_ups.task_id
        and (
          t.assigned_to = auth.uid()
          or t.created_by = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid()
              and (p.role in ('admin', 'executive', 'supervisor', 'qa_senior', 'rta') or p.team_id = t.team_id)
          )
        )
    )
  );

drop policy if exists "follow_ups_insert" on public.task_follow_ups;
create policy "follow_ups_insert" on public.task_follow_ups
  for insert with check (author_id = auth.uid());

-- TASK REMINDERS (scheduled email/notification triggers)
create table if not exists public.task_reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'email' check (channel in ('email', 'in_app', 'both')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.task_reminders enable row level security;

drop policy if exists "reminders_select" on public.task_reminders;
create policy "reminders_select" on public.task_reminders
  for select using (
    exists (
      select 1 from public.tasks t
      where t.id = task_reminders.task_id
        and (t.assigned_to = auth.uid() or t.created_by = auth.uid())
    )
  );

drop policy if exists "reminders_insert" on public.task_reminders;
create policy "reminders_insert" on public.task_reminders
  for insert with check (
    exists (
      select 1 from public.tasks t
      where t.id = task_reminders.task_id
        and (t.assigned_to = auth.uid() or t.created_by = auth.uid())
    )
  );

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- Auto-set completed_at when status becomes completed
create or replace function public.tasks_auto_complete()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status <> 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_auto_complete_trg on public.tasks;
create trigger tasks_auto_complete_trg before update on public.tasks
  for each row execute function public.tasks_auto_complete();

-- Indexes
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_related on public.tasks(related_type, related_id);
create index if not exists idx_follow_ups_task on public.task_follow_ups(task_id, created_at);
create index if not exists idx_reminders_pending on public.task_reminders(remind_at) where sent_at is null;
