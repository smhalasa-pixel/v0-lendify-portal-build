-- =====================================================
-- QA SYSTEM — Scorecards, evaluations, audit queue, disputes
-- =====================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'qa_audit_priority') then
    create type public.qa_audit_priority as enum ('normal', 'high', 'urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'qa_audit_status') then
    create type public.qa_audit_status as enum (
      'pending', 'in_progress', 'submitted', 'approved', 'disputed', 'resolved', 'cancelled'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'qa_call_type') then
    create type public.qa_call_type as enum ('inbound', 'outbound', 'transfer', 'callback');
  end if;
  if not exists (select 1 from pg_type where typname = 'qa_scorecard_type') then
    create type public.qa_scorecard_type as enum ('sales', 'service', 'retention', 'collections', 'onboarding');
  end if;
end $$;

-- SCORECARDS (template definitions)
create table if not exists public.qa_scorecards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type public.qa_scorecard_type not null,
  is_active boolean not null default true,
  total_points integer not null default 100,
  passing_score numeric(5,2) not null default 80,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SCORECARD CRITERIA
create table if not exists public.qa_scorecard_criteria (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.qa_scorecards(id) on delete cascade,
  category text not null,
  label text not null,
  description text,
  points integer not null default 5,
  is_critical boolean not null default false, -- auto-fail if violated
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- AUDIT QUEUE (calls flagged for QA review)
create table if not exists public.qa_audit_queue (
  id uuid primary key default gen_random_uuid(),
  call_id text not null, -- external call system ID
  call_date timestamptz not null,
  call_duration_seconds integer,
  call_type public.qa_call_type not null default 'inbound',
  call_recording_url text,
  -- Agent
  agent_id uuid not null references public.profiles(id) on delete cascade,
  agent_team_id uuid references public.teams(id) on delete set null,
  -- Client context
  client_name text,
  client_id text,
  -- Queue routing
  assigned_to uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz,
  priority public.qa_audit_priority not null default 'normal',
  status public.qa_audit_status not null default 'pending',
  due_date timestamptz not null default (now() + interval '48 hours'),
  reason text, -- why was this call flagged
  -- SLA tracking
  submitted_at timestamptz,
  approved_at timestamptz,
  delivered_at timestamptz,
  -- Created/updated
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EVALUATIONS (actual QA audit results)
create table if not exists public.qa_evaluations (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.qa_audit_queue(id) on delete set null,
  scorecard_id uuid not null references public.qa_scorecards(id) on delete restrict,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  evaluator_id uuid not null references public.profiles(id) on delete set null,
  -- Call context (snapshot)
  call_id text not null,
  call_date timestamptz not null,
  call_duration_seconds integer,
  call_type public.qa_call_type,
  client_name text,
  -- Results
  overall_score numeric(5,2) not null,
  max_score integer not null default 100,
  passed boolean not null,
  -- Narrative
  strengths text[],
  improvements text[],
  critical_failures text[],
  notes text,
  -- Workflow
  status public.qa_audit_status not null default 'submitted',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  -- Agent delivery
  delivered_at timestamptz,
  delivered_to_email text,
  acknowledged_at timestamptz,
  -- Dispute
  dispute_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EVALUATION SCORES (per-criterion breakdown)
create table if not exists public.qa_evaluation_scores (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.qa_evaluations(id) on delete cascade,
  criterion_id uuid references public.qa_scorecard_criteria(id) on delete set null,
  category text not null,
  label text not null,
  points_earned numeric(5,2) not null,
  points_possible numeric(5,2) not null,
  comment text,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

-- DISPUTES
create table if not exists public.qa_disputes (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.qa_evaluations(id) on delete cascade,
  raised_by uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  evidence text,
  status text not null default 'open' check (status in ('open', 'under_review', 'upheld', 'overturned', 'partial')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  resolution text,
  -- New score after resolution
  revised_score numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CALIBRATION SESSIONS (senior QA aligning team scoring)
create table if not exists public.qa_calibration_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  call_id text not null,
  call_recording_url text,
  scorecard_id uuid references public.qa_scorecards(id) on delete set null,
  scheduled_at timestamptz not null,
  facilitator_id uuid references public.profiles(id) on delete set null,
  expected_score numeric(5,2),
  tolerance numeric(5,2) default 5.0, -- acceptable variance
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.qa_calibration_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.qa_calibration_sessions(id) on delete cascade,
  analyst_id uuid not null references public.profiles(id) on delete cascade,
  submitted_score numeric(5,2) not null,
  variance numeric(5,2), -- calculated: submitted - expected
  within_tolerance boolean,
  submitted_at timestamptz not null default now(),
  notes text,
  unique (session_id, analyst_id)
);

-- RLS
alter table public.qa_scorecards enable row level security;
alter table public.qa_scorecard_criteria enable row level security;
alter table public.qa_audit_queue enable row level security;
alter table public.qa_evaluations enable row level security;
alter table public.qa_evaluation_scores enable row level security;
alter table public.qa_disputes enable row level security;
alter table public.qa_calibration_sessions enable row level security;
alter table public.qa_calibration_scores enable row level security;

-- Everyone in QA can read scorecards; only senior QA/admin can modify
drop policy if exists "scorecards_select" on public.qa_scorecards;
create policy "scorecards_select" on public.qa_scorecards
  for select using (auth.role() = 'authenticated');

drop policy if exists "scorecards_qa_write" on public.qa_scorecards;
create policy "scorecards_qa_write" on public.qa_scorecards
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_trainer')
    )
  );

drop policy if exists "criteria_select" on public.qa_scorecard_criteria;
create policy "criteria_select" on public.qa_scorecard_criteria
  for select using (auth.role() = 'authenticated');

drop policy if exists "criteria_qa_write" on public.qa_scorecard_criteria;
create policy "criteria_qa_write" on public.qa_scorecard_criteria
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_trainer')
    )
  );

-- Audit queue — QA roles can see all; agents see their own; supervisors see team
drop policy if exists "audit_queue_select" on public.qa_audit_queue;
create policy "audit_queue_select" on public.qa_audit_queue
  for select using (
    agent_id = auth.uid()
    or assigned_to = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (
          p.role in ('admin', 'executive', 'qa_senior', 'qa_analyst', 'qa_trainer')
          or (p.role in ('supervisor', 'leadership') and p.team_id = qa_audit_queue.agent_team_id)
        )
    )
  );

drop policy if exists "audit_queue_qa_write" on public.qa_audit_queue;
create policy "audit_queue_qa_write" on public.qa_audit_queue
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer')
    )
  );

-- Evaluations — agent sees their own, QA sees all, supervisor sees team
drop policy if exists "evaluations_select" on public.qa_evaluations;
create policy "evaluations_select" on public.qa_evaluations
  for select using (
    agent_id = auth.uid()
    or evaluator_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'executive', 'qa_senior', 'qa_analyst', 'qa_trainer', 'supervisor', 'leadership')
    )
  );

drop policy if exists "evaluations_qa_write" on public.qa_evaluations;
create policy "evaluations_qa_write" on public.qa_evaluations
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer')
    )
  );

drop policy if exists "eval_scores_select" on public.qa_evaluation_scores;
create policy "eval_scores_select" on public.qa_evaluation_scores
  for select using (
    exists (
      select 1 from public.qa_evaluations e
      where e.id = qa_evaluation_scores.evaluation_id
        and (e.agent_id = auth.uid() or e.evaluator_id = auth.uid()
             or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','qa_senior','qa_analyst','qa_trainer','supervisor','leadership','executive')))
    )
  );

drop policy if exists "eval_scores_qa_write" on public.qa_evaluation_scores;
create policy "eval_scores_qa_write" on public.qa_evaluation_scores
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer')
    )
  );

-- Disputes — agent raises, QA reviews
drop policy if exists "disputes_select" on public.qa_disputes;
create policy "disputes_select" on public.qa_disputes
  for select using (
    raised_by = auth.uid()
    or reviewer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer', 'supervisor')
    )
  );

drop policy if exists "disputes_insert_agent" on public.qa_disputes;
create policy "disputes_insert_agent" on public.qa_disputes
  for insert with check (raised_by = auth.uid());

drop policy if exists "disputes_qa_update" on public.qa_disputes;
create policy "disputes_qa_update" on public.qa_disputes
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_trainer')
    )
  );

-- Calibration sessions — QA only
drop policy if exists "calibration_sessions_qa" on public.qa_calibration_sessions;
create policy "calibration_sessions_qa" on public.qa_calibration_sessions
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer')
    )
  );

drop policy if exists "calibration_scores_qa" on public.qa_calibration_scores;
create policy "calibration_scores_qa" on public.qa_calibration_scores
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'qa_senior', 'qa_analyst', 'qa_trainer')
    )
  );

-- Triggers
drop trigger if exists scorecards_updated_at on public.qa_scorecards;
create trigger scorecards_updated_at before update on public.qa_scorecards
  for each row execute function public.set_updated_at();

drop trigger if exists audit_queue_updated_at on public.qa_audit_queue;
create trigger audit_queue_updated_at before update on public.qa_audit_queue
  for each row execute function public.set_updated_at();

drop trigger if exists evaluations_updated_at on public.qa_evaluations;
create trigger evaluations_updated_at before update on public.qa_evaluations
  for each row execute function public.set_updated_at();

drop trigger if exists disputes_updated_at on public.qa_disputes;
create trigger disputes_updated_at before update on public.qa_disputes
  for each row execute function public.set_updated_at();

-- Auto-populate passed flag based on score + scorecard passing_score
create or replace function public.qa_evaluations_set_passed()
returns trigger
language plpgsql
as $$
declare
  pass_threshold numeric;
begin
  select passing_score into pass_threshold from public.qa_scorecards where id = new.scorecard_id;
  new.passed = (new.overall_score >= coalesce(pass_threshold, 80));
  return new;
end;
$$;

drop trigger if exists evaluations_set_passed on public.qa_evaluations;
create trigger evaluations_set_passed before insert or update on public.qa_evaluations
  for each row execute function public.qa_evaluations_set_passed();

-- Indexes
create index if not exists idx_audit_queue_assigned on public.qa_audit_queue(assigned_to, status);
create index if not exists idx_audit_queue_status on public.qa_audit_queue(status, due_date);
create index if not exists idx_audit_queue_agent on public.qa_audit_queue(agent_id);
create index if not exists idx_evaluations_agent on public.qa_evaluations(agent_id, call_date desc);
create index if not exists idx_evaluations_evaluator on public.qa_evaluations(evaluator_id, created_at desc);
create index if not exists idx_evaluations_status on public.qa_evaluations(status);
create index if not exists idx_disputes_evaluation on public.qa_disputes(evaluation_id, status);
