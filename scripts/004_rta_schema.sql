-- =====================================================
-- RTA (REAL-TIME ATTENDANCE) SYSTEM
-- Breaks, infractions, thresholds, auto-escalation
-- =====================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'agent_activity_status') then
    create type public.agent_activity_status as enum (
      'active', 'lunch', 'break', 'meeting', 'training', 'coaching', 'restroom', 'technical_issue', 'offline'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'infraction_severity') then
    create type public.infraction_severity as enum ('minor', 'moderate', 'major', 'severe');
  end if;
  if not exists (select 1 from pg_type where typname = 'infraction_status') then
    create type public.infraction_status as enum (
      'recorded', 'notified', 'acknowledged', 'disputed', 'resolved', 'escalated'
    );
  end if;
end $$;

-- BREAK TYPE CONFIG (scheduled durations per status)
create table if not exists public.rta_break_types (
  id uuid primary key default gen_random_uuid(),
  status public.agent_activity_status not null unique,
  label text not null,
  scheduled_duration_minutes integer not null,
  max_duration_minutes integer not null,
  daily_limit_minutes integer,
  counts_toward_daily boolean not null default true,
  requires_approval boolean not null default false,
  color_token text, -- e.g. 'rose-500'
  created_at timestamptz not null default now()
);

-- RTA THRESHOLDS (business rules that create infractions when broken)
create table if not exists public.rta_thresholds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  -- What triggers this threshold
  trigger_type text not null check (trigger_type in (
    'break_over_scheduled',          -- break exceeds scheduled duration
    'break_over_max',                -- break exceeds max allowed
    'daily_break_over_limit',        -- total daily break time exceeded
    'late_start',                    -- shift started late by X minutes
    'early_end',                     -- shift ended early by X minutes
    'unscheduled_offline',           -- offline during scheduled time
    'repeated_infractions'           -- N infractions in rolling window
  )),
  break_type_id uuid references public.rta_break_types(id) on delete cascade,
  -- Threshold config
  minutes_over integer, -- how many minutes over to trigger
  rolling_window_days integer, -- for repeated_infractions
  count_threshold integer, -- e.g. 3 infractions in window
  -- Response
  severity public.infraction_severity not null default 'minor',
  auto_create_infraction boolean not null default true,
  auto_notify_agent boolean not null default true,
  auto_escalate_to_supervisor boolean not null default false,
  auto_create_task boolean not null default false,
  task_template text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AGENT ACTIVITY / STATUS SNAPSHOTS
create table if not exists public.rta_agent_status (
  agent_id uuid primary key references public.profiles(id) on delete cascade,
  current_status public.agent_activity_status not null default 'offline',
  status_since timestamptz not null default now(),
  shift_start_time time,
  shift_end_time time,
  scheduled_break_minutes integer not null default 60,
  total_break_minutes_today integer not null default 0,
  day_key date not null default current_date, -- for daily resets
  current_break_id uuid,
  updated_at timestamptz not null default now()
);

-- BREAK SESSIONS (log of every status change that isn't "active")
create table if not exists public.rta_break_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  status public.agent_activity_status not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer, -- computed on end
  scheduled_duration_minutes integer,
  went_over boolean,
  over_by_minutes integer,
  notes text,
  created_infraction_id uuid, -- if auto-infraction was created
  created_at timestamptz not null default now()
);

-- INFRACTIONS
create table if not exists public.rta_infractions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  agent_team_id uuid references public.teams(id) on delete set null,
  threshold_id uuid references public.rta_thresholds(id) on delete set null,
  break_session_id uuid references public.rta_break_sessions(id) on delete set null,
  -- Details
  infraction_type text not null,
  description text not null,
  severity public.infraction_severity not null,
  evidence text, -- JSON or text describing the rule + data
  occurred_at timestamptz not null,
  -- Workflow
  status public.infraction_status not null default 'recorded',
  recorded_by uuid references public.profiles(id) on delete set null,
  is_auto_created boolean not null default false,
  -- Agent response
  notified_at timestamptz,
  acknowledged_at timestamptz,
  dispute_reason text,
  disputed_at timestamptz,
  -- Resolution
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,
  -- Escalation
  escalated_to uuid references public.profiles(id) on delete set null,
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RTA NOTIFICATIONS (message log)
create table if not exists public.rta_notifications (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  infraction_id uuid references public.rta_infractions(id) on delete cascade,
  break_session_id uuid references public.rta_break_sessions(id) on delete cascade,
  kind text not null check (kind in (
    'approaching_limit',   -- 5 min before break ends
    'break_ended',         -- natural end reminder
    'over_limit',          -- currently over
    'infraction_recorded', -- new infraction
    'escalation'
  )),
  channel text not null default 'in_app' check (channel in ('in_app', 'email', 'both')),
  title text not null,
  body text,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.rta_break_types enable row level security;
alter table public.rta_thresholds enable row level security;
alter table public.rta_agent_status enable row level security;
alter table public.rta_break_sessions enable row level security;
alter table public.rta_infractions enable row level security;
alter table public.rta_notifications enable row level security;

drop policy if exists "break_types_select" on public.rta_break_types;
create policy "break_types_select" on public.rta_break_types
  for select using (auth.role() = 'authenticated');

drop policy if exists "break_types_admin" on public.rta_break_types;
create policy "break_types_admin" on public.rta_break_types
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta', 'executive'))
  );

drop policy if exists "thresholds_select" on public.rta_thresholds;
create policy "thresholds_select" on public.rta_thresholds
  for select using (auth.role() = 'authenticated');

drop policy if exists "thresholds_rta_write" on public.rta_thresholds;
create policy "thresholds_rta_write" on public.rta_thresholds
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta'))
  );

drop policy if exists "agent_status_select" on public.rta_agent_status;
create policy "agent_status_select" on public.rta_agent_status
  for select using (
    agent_id = auth.uid()
    or exists (
      select 1 from public.profiles p, public.profiles agent_p
      where p.id = auth.uid() and agent_p.id = agent_id
        and (
          p.role in ('admin', 'executive', 'rta', 'qa_senior')
          or (p.role in ('supervisor', 'leadership') and p.team_id = agent_p.team_id)
        )
    )
  );

drop policy if exists "agent_status_self_update" on public.rta_agent_status;
create policy "agent_status_self_update" on public.rta_agent_status
  for all using (agent_id = auth.uid());

drop policy if exists "agent_status_rta_update" on public.rta_agent_status;
create policy "agent_status_rta_update" on public.rta_agent_status
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta'))
  );

drop policy if exists "break_sessions_select" on public.rta_break_sessions;
create policy "break_sessions_select" on public.rta_break_sessions
  for select using (
    agent_id = auth.uid()
    or exists (
      select 1 from public.profiles p, public.profiles agent_p
      where p.id = auth.uid() and agent_p.id = agent_id
        and (
          p.role in ('admin', 'executive', 'rta', 'qa_senior')
          or (p.role in ('supervisor', 'leadership') and p.team_id = agent_p.team_id)
        )
    )
  );

drop policy if exists "break_sessions_agent_write" on public.rta_break_sessions;
create policy "break_sessions_agent_write" on public.rta_break_sessions
  for all using (agent_id = auth.uid());

drop policy if exists "break_sessions_rta_write" on public.rta_break_sessions;
create policy "break_sessions_rta_write" on public.rta_break_sessions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta'))
  );

drop policy if exists "infractions_select" on public.rta_infractions;
create policy "infractions_select" on public.rta_infractions
  for select using (
    agent_id = auth.uid()
    or exists (
      select 1 from public.profiles p, public.profiles agent_p
      where p.id = auth.uid() and agent_p.id = agent_id
        and (
          p.role in ('admin', 'executive', 'rta', 'qa_senior')
          or (p.role in ('supervisor', 'leadership') and p.team_id = agent_p.team_id)
        )
    )
  );

drop policy if exists "infractions_rta_write" on public.rta_infractions;
create policy "infractions_rta_write" on public.rta_infractions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta', 'supervisor'))
  );

drop policy if exists "infractions_agent_dispute" on public.rta_infractions;
create policy "infractions_agent_dispute" on public.rta_infractions
  for update using (agent_id = auth.uid())
  with check (
    -- Agents can only update dispute fields
    agent_id = auth.uid()
  );

drop policy if exists "notifications_select_own" on public.rta_notifications;
create policy "notifications_select_own" on public.rta_notifications
  for select using (
    agent_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta'))
  );

drop policy if exists "notifications_rta_write" on public.rta_notifications;
create policy "notifications_rta_write" on public.rta_notifications
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'rta'))
  );

-- Triggers
drop trigger if exists thresholds_updated_at on public.rta_thresholds;
create trigger thresholds_updated_at before update on public.rta_thresholds
  for each row execute function public.set_updated_at();

drop trigger if exists infractions_updated_at on public.rta_infractions;
create trigger infractions_updated_at before update on public.rta_infractions
  for each row execute function public.set_updated_at();

drop trigger if exists agent_status_updated_at on public.rta_agent_status;
create trigger agent_status_updated_at before update on public.rta_agent_status
  for each row execute function public.set_updated_at();

-- Auto-compute break session duration on end
create or replace function public.rta_finalize_break_session()
returns trigger
language plpgsql
as $$
declare
  over_threshold integer;
begin
  if new.ended_at is not null and (old.ended_at is null or old.ended_at is distinct from new.ended_at) then
    new.duration_minutes = ceil(extract(epoch from (new.ended_at - new.started_at)) / 60.0);
    if new.scheduled_duration_minutes is not null then
      new.over_by_minutes = greatest(0, new.duration_minutes - new.scheduled_duration_minutes);
      new.went_over = new.over_by_minutes > 0;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists break_sessions_finalize on public.rta_break_sessions;
create trigger break_sessions_finalize before update on public.rta_break_sessions
  for each row execute function public.rta_finalize_break_session();

-- Indexes
create index if not exists idx_break_sessions_agent on public.rta_break_sessions(agent_id, started_at desc);
create index if not exists idx_break_sessions_open on public.rta_break_sessions(agent_id) where ended_at is null;
create index if not exists idx_infractions_agent on public.rta_infractions(agent_id, occurred_at desc);
create index if not exists idx_infractions_status on public.rta_infractions(status);
create index if not exists idx_notifications_agent on public.rta_notifications(agent_id, sent_at desc);
create index if not exists idx_notifications_unread on public.rta_notifications(agent_id) where read_at is null;
