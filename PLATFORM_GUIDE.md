# Forge — Complete Telesales Operations Platform

## Platform Overview

A unified workplace for a debt settlement telesales floor with 24 agents → 3 team leads → 1 supervisor → executives + admin.

---

## Core Systems

### 1. **Authentication & Roles** (`lib/auth-context.tsx`, Login Page)
- 9 roles with hierarchy-based access: Agent, Team Lead, Supervisor, Executive, Admin, QA Analyst, QA Senior, QA Trainer, RTA Monitor
- Mock login with one-click sign-in for each role (test credentials on `/login`)
- Mock JWT-like session storage

### 2. **Team Scoping** (`lib/team-scope.ts`)
- Single source of truth for "who sees what" based on hierarchy
- Agent sees self only; Lead sees their 8 agents; Supervisor sees 3 teams (~24 agents); Exec/Admin see floor-wide
- Used across Dashboard, Leaderboards, Commissions, Clawbacks, Coaching, Tasks, QA, RTA

### 3. **Targets System** (`lib/targets.ts` + `/admin/targets`)
- Admin-only page to set monthly targets at org/team/agent scope
- Cascade resolution: agent override > team target > org default
- Metrics: Units Closed, Debt Enrolled, Qualified Conversion, QC Score, Dials, Talk Time, Revenue
- Wired into Agent Goal Ring and KPI tiles so they reflect admin-set targets, not hardcoded values
- Can view actual vs target + historical variance

### 4. **Messaging System** (`lib/messaging.ts` + `/inbox`)
- Role-scoped direct messages (agents DM their lead/super; leads DM peers + super, etc.)
- Thread-based conversation view
- Read/unread tracking
- Recipients filtered by role hierarchy + accessibility

### 5. **Notifications Center** (`lib/notifications.ts` + header bell)
- Role-scoped notification feed in header dropdown
- Event types: message received, task assigned, coaching scheduled, QA eval published, target update, clawback risk, announcement pinned
- Each notification role-filtered (e.g., only leads/supervisors see floor-wide metrics alerts)

### 6. **Visibility Audit** (`lib/visibility-audit.ts`)
- Matrix documenting every role's page access (agent can't see /admin, QA analyst can only see /qa, etc.)
- Data visibility scopes (agent sees self, lead sees team, supervisor sees all teams, etc.)
- `canAccessPage(user, pathname)` helper + audit stats for admin hub health check

---

## Agent-Specific Experience

### Agent Dashboard (`components/agent/*`)
**Completely reimagined for motivation & engagement:**
- **Hero Banner**: Name, team, live clock, streak counter, floor rank, team rank with daily up/down
- **Money Ticker**: Animated earnings count + MTD total, avg/day, personal best (dynamically labeled when browsing history)
- **Goal Ring**: Monthly close target with visual ring + Today/Week bars + % complete
- **Rank Card**: Team leaderboard window (2 above, agent highlighted, 2 below) with "climb X to catch #Y" badge
- **KPI Tiles**: Units Closed, Debt Enrolled, Qualified Conversion, QC Score — all 4 primary metrics with targets from admin system, sub-metrics, and progress bars
- **Pace Tracker**: Today vs yesterday hour-by-hour bars with "on pace?" indicator
- **Activity Snapshot**: Dials (with delta), connect rate, talk time/AHT, pipeline count/value, callbacks + follow-ups
- **Achievements**: 10 badges (First Blood, Hat Trick, Five Alarm, On Fire, Dialer, Gold Standard, Late Bird, Whale Hunter, Grinder, Clockwork) with lock/unlock + daily earned pulsing
- **Period Selector** (NEW): Toggle Today/WTD/MTD/QTD/YTD/Custom to view historical performance; all KPIs + metrics dynamically recompute for selected range

All data is real (pulled from commissions, leaderboard, pipeline, QA evals) and updates live.

---

## Leadership & Supervisor Experience

### Dashboards
- **Dashboard** (Leadership/Supervisor): Live Floor Status widget showing team utilization, agent status split, today's calls/AHT, KPI snapshot scoped to their team(s)
- **Team Performance Table**: Agents on their team ranked by closes/debt/conversion
- **Leaderboards**: Can toggle "My Team / All Floor" to see ranked agents scoped or org-wide; agent + team views
- **Daily Huddle** (/huddle, leads+ only): One-screen stand-up runbook with yesterday's MVPs, pacing targets, attention flags, hot leads, announcements

### Calls Command Center
- **Command Center** (`/calls`): Live agent call cards showing status (on call, ACW, break, idle), duration, client name, script adherence; team rollup; queue depth; compliance watch (DNC, out-of-state, recording gaps, adherence dips)
- **Floor TV** (`/calls/floor`): Full-screen wall-mounted display with big call counts, agents in visual grid, attention flags, real-time metrics
- **RingCentral Config** (supervisor/admin only): JWT/webhook setup for live connection to actual `/restapi/v1.0/presence` + `/telephony/sessions` endpoints

### Scoped Data
- Commissions/Clawbacks/QA/RTA/Coaching/Tasks: All show only their team's data by default; supervisors see all their teams
- Targeting/Goals/Targets: Can view what was set for their team; can't edit (admin-only)

---

## Operations & Admin

### Admin Hub (`/admin`)
- Unified command center with quick-access cards:
  - **Targets Center**: Set org/team/agent targets monthly; view actuals vs targets; see cascade breakdown
  - **User Management**: Manage roles, team assignments, commission rates
  - **System Settings**: Global defaults, commission tiers, clawback rules, shift times
  - **Announcements**: Platform-wide messages
  - **Scripts**: Call scripts for agents
  - **Knowledge Base**: FAQs, policies
  - **Compliance**: Audit log, commission history, clawback disputes
  - **System Health**: Page visibility audit, targets status, messaging volume

### Targets Center
- **Org-level**: Set base target (e.g., 15 units/month for all agents)
- **Team-level**: Override per team (e.g., Team A gets 20/month)
- **Agent-level**: Override specific agents (e.g., Sarah gets 18/month)
- View actual vs target with variance % and trend
- Cascade resolution shown (where value came from)
- Can set multiple metrics + multiple periods

---

## Communication Hierarchy

**Messaging** (`/inbox`):
- **Agent → Lead**: Can DM their team lead, supervisor (chain), any QA/admin
- **Lead → Agents**: Can DM their agents + team lead peer + supervisor + QA/admin
- **Supervisor → Leads/Agents**: Can DM all leads, all agents on their teams + any peer super + exec/admin
- **Exec/Admin → Everyone**: Can DM anyone

**Notifications**:
- **Agents**: Message received, task assigned, coaching scheduled, clawback risk, announcement pinned
- **Leads**: ↑ + QA eval published, target update, floor-wide adherence alert
- **Supervisors**: ↑ + all floor-wide metrics alerts + commission variance
- **Executives**: All alerts org-wide
- **Admins**: All + system health alerts

---

## Data Flow & Real Sources

All metrics, targets, and KPIs pull from the mock data system:

| System | Source | Update Frequency |
|--------|--------|------------------|
| Agent Commissions | `dataService.getCommissions(userId)` | Real-time |
| Agent Leaderboard Rank | `dataService.getLeaderboard(period)` | Per period |
| Team Metrics | `dataService.getDashboardMetrics(teamId)` | Real-time |
| QC Scores | `dataService.getQAEvaluations()` | On eval publish |
| Targets | `targets` object in localStorage (via `useTargets()`) | On save from admin |
| Messages | `messaging` object in localStorage (via messaging lib) | On send |
| Notifications | Computed from events + user role + data | On relevant action |

---

## Visibility Matrix (Audit)

| Page | Agent | Lead | Super | Exec | Admin | QA | RTA |
|------|-------|------|-------|------|-------|----|----|
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `/inbox` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/calls` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `/calls/floor` | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| `/calls/ringcentral` | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `/huddle` | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `/admin` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `/admin/targets` | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `/qa` | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `/rta` | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| `/leaderboards` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## Quick Start: A Month in the Life

**Week 1: Setup**
1. Admin logs in → `/admin/targets` → Sets org target: 15 closes/agent, $650k debt/agent
2. Admin creates team overrides: Sales Team A gets 18 closes, B gets 15, C gets 12
3. Admin creates two agent overrides: Sarah (top performer) 25 closes, junior agent 10

**Daily: Agent Flow**
1. Agent logs in → Sees personalized hero + goal ring + today's pace
2. Sees their real commissions earned today, MTD, and paycheck projection
3. Checks "My Queue" for callbacks due, pending follow-ups
4. Dials through pipeline; each close updates real-time on their dashboard
5. Gets badge at 5 AM close ("Late Bird") + notification
6. Receives coaching note from lead in inbox

**Daily: Team Lead Flow**
1. Lead logs in → Sees their 8 agents on dashboard cards
2. Clicks `/calls` → Views all 8 agents' live call state (on call, ACW, idle)
3. Sees daily huddle page for 15-min stand-up talking points
4. Opens `/inbox` → Messages from supervisor about floor targets, responds to agent question
5. Navigates `/coaching` → Schedules call with agent Sarah for 2 PM (notification sent to Sarah)
6. Views `/leaderboards` → Sees his team's top 3, checks if they're on pace

**Daily: Supervisor Flow**
1. Supervisor logs in → Sees all 24 agents (3 teams) on dashboard
2. Clicks `/calls` → Sees all 24 agent cards, filters by team, checks compliance watch
3. Views `/admin/targets` → Checks if all teams are on pace vs. monthly targets (real-time variance)
4. Navigates `/qa` → Reviews QC evals from his team's evaluators, sees aggregate scores
5. Opens `/inbox` → Messages from leads about hiring questions, from exec about floor pacing
6. Runs command from `/calls/floor` → Sends big TV display to agents' monitor
7. Sets supervisor-level target overrides in `/admin/targets` for a struggling team (bumps down from 15 to 12)

**Weekly: Executive Flow**
1. Executive logs in → Dashboard shows floor-wide metrics (all 24 agents, all 3 teams)
2. Navigates `/leaderboards` → Views entire floor rankings, sees top/bottom performers
3. Checks `/commissions` → Reviews all payouts, identifies any clawback risks
4. Views `/admin/targets` → Compares this month vs. last month vs. target, sees variance %
5. Scrolls `/inbox` → Messages from all supervisors about staffing, performance
6. Reviews `/qa` → Full audit trail of evaluations, scores by team

**Monthly: Admin Flow**
1. Admin logs in → `/admin` hub shows Targets status card: "All targets set ✓", "95% on pace"
2. Navigates `/admin/targets` → Reviews entire month's actuals vs. targets, sees which teams/agents beat/missed
3. Prepares next month targets in `/admin/targets` → Sets new org baseline, team overrides, special agent cases
4. Runs system audit from `/visibility-audit` → Verifies every role sees correct pages (page matrix check)
5. Reviews messaging volume from notifications audit → Identifies bottlenecks (e.g., "RTA team not using Inbox")
6. Configures `/calls/ringcentral` → Updates JWT token, tests webhook connectivity

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **State**: React hooks + Context for auth, messaging, notifications
- **Storage**: Mock localStorage for targets, messages, notifications (ready to swap for backend DB)
- **Icons**: lucide-react
- **Charts**: Recharts (via shadcn/ui charts)
- **Toasts**: sonner

---

## Files & Structure

```
/app/(dashboard)/
  ├── /admin/
  │   ├── page.tsx (Admin Hub)
  │   └── /targets/page.tsx (Targets Center)
  ├── /calls/
  │   ├── page.tsx (Command Center)
  │   ├── /floor/page.tsx (Floor TV)
  │   └── /ringcentral/page.tsx (RingCentral config)
  ├── /inbox/
  │   ├── page.tsx (Message list)
  │   └── /[threadId]/page.tsx (Single thread)
  ├── /dashboard/page.tsx (Agent-specific or org view)
  ├── /huddle/page.tsx (Daily Huddle for leads)
  ├── /leaderboards/page.tsx (Leaderboard with scoping)
  ├── /commissions/page.tsx (Scoped by team)
  ├── /clawbacks/page.tsx (Scoped by team)
  ├── /coaching/page.tsx (Scoped by team)
  ├── /qa/ (QA pages)
  ├── /rta/ (RTA pages)
  └── layout.tsx (Header with Inbox + Bell)

/components/
  ├── /agent/ (Agent dashboard components)
  ├── /calls/ (Command Center components)
  ├── /header/ (Inbox button, Notification bell)
  ├── /dashboard/ (Floor Status, KPI cards, etc.)
  └── /ui/ (shadcn/ui primitives)

/lib/
  ├── auth-context.tsx (Session + user role)
  ├── team-scope.ts (Who sees what data)
  ├── targets.ts (Target resolution, hooks)
  ├── messaging.ts (DM library + role scoping)
  ├── notifications.ts (Event-driven feeds)
  ├── visibility-audit.ts (Page access matrix)
  ├── mock-data.ts (All operational data)
  └── types.ts (TypeScript interfaces)
```

---

## Future Enhancements

- **Real Backend**: Swap localStorage for PostgreSQL + auth0/clerk
- **RingCentral Integration**: Wire to actual `/presence` API + webhooks
- **Real-time**: Socket.io for live agent status, call updates, inbox messages
- **Reporting**: PDF exports, scheduled email reports, advanced drill-down
- **Compliance**: Full audit trail, call recording links, TCPA verification
- **Mobile**: React Native companion app for agents on floor
- **Workflow Automation**: Zapier/Make integrations for external CRM/dialer sync
- **ML**: Predictive close modeling, agent coaching recommendations, churn risk scoring
