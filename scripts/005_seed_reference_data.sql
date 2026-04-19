-- =====================================================
-- Seed reference data — break types, thresholds, scorecards
-- Safe to re-run (uses on conflict do nothing)
-- =====================================================

-- BREAK TYPES
insert into public.rta_break_types (status, label, scheduled_duration_minutes, max_duration_minutes, daily_limit_minutes, counts_toward_daily, requires_approval, color_token) values
  ('active',          'Active',           0,   0,   null, false, false, 'emerald-500'),
  ('lunch',           'Lunch',           30,  45,   45,  true,  false, 'blue-500'),
  ('break',           'Break',           15,  20,   30,  true,  false, 'amber-500'),
  ('meeting',         'Meeting',         60,  90,   null, false, false, 'indigo-500'),
  ('training',        'Training',        60, 120,   null, false, false, 'purple-500'),
  ('coaching',        'Coaching',        30,  45,   null, false, false, 'violet-500'),
  ('restroom',        'Restroom',         5,  10,   15,  true,  false, 'sky-500'),
  ('technical_issue', 'Technical Issue',  0,  60,   null, false, true,  'orange-500'),
  ('offline',         'Offline',          0,   0,   null, false, false, 'slate-500')
on conflict (status) do update set
  label = excluded.label,
  scheduled_duration_minutes = excluded.scheduled_duration_minutes,
  max_duration_minutes = excluded.max_duration_minutes,
  daily_limit_minutes = excluded.daily_limit_minutes,
  counts_toward_daily = excluded.counts_toward_daily,
  requires_approval = excluded.requires_approval,
  color_token = excluded.color_token;

-- THRESHOLDS (business rules)
-- We key on name to allow re-running
insert into public.rta_thresholds (name, description, trigger_type, minutes_over, severity, auto_create_infraction, auto_notify_agent, auto_escalate_to_supervisor, auto_create_task)
select * from (values
  ('Break > 5 min over scheduled',      'Break exceeded scheduled duration by 5+ minutes',  'break_over_scheduled',    5,  'minor'::infraction_severity,    true, true, false, false),
  ('Break > 10 min over scheduled',     'Break exceeded scheduled duration by 10+ minutes', 'break_over_scheduled',   10,  'moderate'::infraction_severity, true, true, true,  true),
  ('Break over max hard limit',         'Break exceeded the maximum allowed duration',      'break_over_max',          0,  'major'::infraction_severity,    true, true, true,  true),
  ('Daily break time exceeded',         'Total daily break time exceeded the limit',        'daily_break_over_limit',  0,  'moderate'::infraction_severity, true, true, true,  false),
  ('Late shift start',                  'Shift started 10+ minutes late',                   'late_start',             10,  'minor'::infraction_severity,    true, true, false, false),
  ('Significant late start',            'Shift started 30+ minutes late',                   'late_start',             30,  'major'::infraction_severity,    true, true, true,  true),
  ('Early shift end',                   'Shift ended 10+ minutes early',                    'early_end',              10,  'minor'::infraction_severity,    true, true, false, false)
) as v(name, description, trigger_type, minutes_over, severity, auto_create_infraction, auto_notify_agent, auto_escalate_to_supervisor, auto_create_task)
where not exists (select 1 from public.rta_thresholds t where t.name = v.name);

-- DEFAULT SCORECARDS
insert into public.qa_scorecards (name, type, description, total_points, passing_score, is_active)
select * from (values
  ('Sales Call Scorecard',    'sales'::qa_scorecard_type,    'Standard scorecard for inbound/outbound sales calls', 100, 80::numeric, true),
  ('Customer Service Scorecard', 'service'::qa_scorecard_type, 'Scorecard for service and support interactions', 100, 85::numeric, true),
  ('Retention Call Scorecard','retention'::qa_scorecard_type,'Scorecard for retention & save attempts',            100, 80::numeric, true),
  ('Collections Scorecard',   'collections'::qa_scorecard_type,'Compliance-focused collections scorecard',         100, 90::numeric, true),
  ('Onboarding Scorecard',    'onboarding'::qa_scorecard_type,'New account onboarding calls',                       100, 85::numeric, true)
) as v(name, type, description, total_points, passing_score, is_active)
where not exists (select 1 from public.qa_scorecards s where s.name = v.name);

-- SAMPLE CRITERIA (only for Sales scorecard, if it just got created)
with sales as (select id from public.qa_scorecards where name = 'Sales Call Scorecard')
insert into public.qa_scorecard_criteria (scorecard_id, category, label, description, points, is_critical, display_order)
select s.id, v.category, v.label, v.description, v.points, v.is_critical, v.display_order
from sales s,
  (values
    ('Opening',     'Greeting & Introduction',       'Proper greeting with name, company, compliance disclaimer', 5, false, 1),
    ('Opening',     'Call Purpose Clearly Stated',   'Agent clearly communicated purpose of call',                5, false, 2),
    ('Discovery',   'Needs Assessment',              'Agent asked appropriate discovery questions',               10, false, 3),
    ('Discovery',   'Active Listening',              'Agent listened and acknowledged customer responses',        10, false, 4),
    ('Solution',    'Product Knowledge',             'Agent demonstrated accurate product knowledge',             15, false, 5),
    ('Solution',    'Benefit Articulation',          'Solution positioned with clear benefits to customer',       15, false, 6),
    ('Compliance',  'Required Disclosures',          'All required compliance disclosures provided',              15, true,  7),
    ('Compliance',  'Truthful Representation',       'No misrepresentation or misleading statements',             15, true,  8),
    ('Closing',     'Next Steps Confirmed',          'Clear next steps communicated and confirmed',               5, false, 9),
    ('Closing',     'Professional Close',            'Professional and courteous closing',                        5, false, 10)
  ) as v(category, label, description, points, is_critical, display_order)
where not exists (
  select 1 from public.qa_scorecard_criteria c where c.scorecard_id = s.id and c.label = v.label
);
