# EventLens

## Complete Multi-Tenant SaaS Build Workbook

> A guided, checkpoint-based workbook for building a portfolio-quality multi-tenant analytics SaaS from scratch using a hosted Supabase project.

---

# 0. Project Overview

## What are we building?

**EventLens** is a multi-tenant analytics platform.

A developer integrates EventLens into their application and sends events such as:

```text
user_signed_up
product_viewed
checkout_started
purchase_completed
```

EventLens processes those events and provides analytics such as:

* Event volume
* Active users
* Top events
* Time-series analytics
* Segmentation
* Retention
* Cohorts
* CSV exports
* Usage limits

The important engineering problem is:

> Multiple independent organizations use the same application, while their data remains isolated.

---

# 1. The Core Multi-Tenant Model

The basic hierarchy is:

```text
User
  │
  ▼
Tenant
  │
  ▼
Project
  │
  ▼
Event
```

Example:

```text
Maryanne
   │
   ▼
Acme Inc.
   │
   ├── Website
   │     ├── user_signed_up
   │     ├── product_viewed
   │     └── purchase_completed
   │
   └── Mobile App
         ├── user_signed_up
         └── product_viewed
```

Another customer might have:

```text
Globex Inc.
   │
   └── Website
         ├── user_signed_up
         └── purchase_completed
```

Acme must never be able to access Globex's data.

That is the central requirement around which the application is designed.

---

# 2. Technology Stack

## Backend

```text
Node.js
TypeScript
Express
```

## Database

```text
Hosted Supabase PostgreSQL
```

The database is hosted by Supabase.

You are **not** running a local Supabase database and you are **not** using the Supabase CLI for this project.

Database management will primarily happen through:

```text
Supabase Dashboard
        ↓
SQL Editor
        ↓
Hosted PostgreSQL database
```

---

## Supabase Data Access

The application can communicate with the hosted Supabase project through the Supabase Data API:

```text
Node.js API
     │
     ▼
Supabase Data API
     │
     ▼
Hosted PostgreSQL
```

The project credentials come from your Supabase Dashboard.

---

## Direct database connection

You also have access to the PostgreSQL database connection string.

This provides a second possible connection path:

```text
Node.js
   │
   ▼
PostgreSQL connection
   │
   ▼
Supabase PostgreSQL
```

We will use the connection method that makes sense for each part of the application rather than unnecessarily introducing another tool.

For the initial application, the Supabase JavaScript client/Data API is sufficient for normal database operations.

A direct PostgreSQL connection can be introduced later if the project benefits from direct SQL access, migrations, reporting queries, or other PostgreSQL-specific functionality.

---

## Authentication

```text
Supabase Auth
```

---

## Database authorization

```text
PostgreSQL Row Level Security
```

---

## Background processing

```text
Redis
BullMQ
```

---

## Frontend

Use a frontend stack you are comfortable with.

For example:

```text
React
TypeScript
```

The backend architecture is the main focus of this portfolio project.

---

## Version control

```text
Git
GitHub
```

---

# 3. Final Architecture

Eventually the application will look approximately like:

```text
                         ┌─────────────────┐
                         │    Frontend     │
                         │    Dashboard    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Node / API    │
                         │                 │
                         │ Authentication  │
                         │ Tenants         │
                         │ Projects        │
                         │ Events          │
                         │ Analytics       │
                         └────────┬────────┘
                                  │
                   ┌──────────────┼──────────────┐
                   │              │              │
                   ▼              ▼              ▼
             Supabase         Redis          External
             PostgreSQL       / BullMQ       Services
                   │              │
                   │              ▼
                   │          ┌─────────┐
                   │          │ Worker  │
                   │          └────┬────┘
                   │               │
                   └───────────────┘
```

The database lives remotely:

```text
                   Internet
                      │
                      ▼
               ┌──────────────┐
               │   Supabase   │
               │   Project    │
               ├──────────────┤
               │ Auth         │
               │ Data API     │
               │ PostgreSQL   │
               │ RLS          │
               └──────────────┘
```

There is **no local Supabase stack** in this project.

---

# 4. Development Philosophy

This project is intentionally divided into phases.

Each phase has:

1. **Goal**
2. **Concepts**
3. **Tasks**
4. **Checkpoint**
5. **Definition of done**
6. **Things not to build yet**

The rule is:

```text
Understand
    ↓
Design
    ↓
Implement
    ↓
Test
    ↓
Verify
    ↓
Commit
```

Do not build five features before testing the first one.

---

# 5. Complete Roadmap

```text
PHASE 0
Project Setup
        ↓
PHASE 1
Hosted Database Foundation
        ↓
PHASE 2
Authentication
        ↓
PHASE 3
Tenants & Projects
        ↓
PHASE 4
Multi-Tenant Authorization
        ↓
PHASE 5
Event Ingestion
        ↓
PHASE 6
Background Processing
        ↓
PHASE 7
Analytics
        ↓
PHASE 8
Dashboard
        ↓
PHASE 9
Retention & Cohorts
        ↓
PHASE 10
Segmentation
        ↓
PHASE 11
CSV Exports
        ↓
PHASE 12
Usage Limits & Rate Limiting
        ↓
PHASE 13
Data Retention
        ↓
PHASE 14
Testing
        ↓
PHASE 15
Deployment
        ↓
PHASE 16
Portfolio Polish
```

---

# PHASE 0 — Project Setup

## Goal

Create a boring, working TypeScript API.

No multi-tenancy yet.

No analytics.

No Redis.

No frontend.

---

## 0.1 Create the project

```bash
mkdir eventlens
cd eventlens

git init
npm init -y
```

---

## 0.2 Install dependencies

```bash
npm install express cors dotenv @supabase/supabase-js
```

```bash
npm install -D typescript tsx @types/node @types/express @types/cors
```

---

## 0.3 Create the folders

```bash
mkdir -p apps/api/src/lib

touch apps/api/src/app.ts
touch apps/api/src/server.ts
touch apps/api/src/lib/supabase.ts

touch .env
touch .env.example
touch .gitignore
touch tsconfig.json
touch README.md
```

Initial structure:

```text
eventlens/
├── apps/
│   └── api/
│       └── src/
│           ├── app.ts
│           ├── server.ts
│           └── lib/
│               └── supabase.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 0.4 Configure TypeScript

`tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["apps/**/*.ts"]
}
```

---

## 0.5 Configure npm scripts

`package.json`

```json
{
  "scripts": {
    "dev": "tsx watch apps/api/src/server.ts",
    "build": "tsc",
    "start": "node dist/apps/api/src/server.js"
  }
}
```

---

## 0.6 Create the Express application

`apps/api/src/app.ts`

```typescript
import express from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});
```

---

## 0.7 Create the server

`apps/api/src/server.ts`

```typescript
import "dotenv/config";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
```

---

## 0.8 Environment variables

Your `.env` will contain the credentials for your **hosted Supabase project**.

Initially:

```env
PORT=3000

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

If you later need the server-only secret or direct PostgreSQL connection, those can be added separately:

```env
SUPABASE_SECRET_KEY=
DATABASE_URL=
```

Do not add credentials that the application does not currently need.

---

## 0.9 Git ignore

`.gitignore`

```gitignore
.env
node_modules/
dist/
.DS_Store
*.log
```

---

## 0.10 Test the API

```bash
npm run dev
```

Then:

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok"
}
```

---

# Checkpoint 0

* [ ] API starts
* [ ] `/health` works
* [ ] TypeScript works
* [ ] `tsx` watch works
* [ ] `.env` is ignored
* [ ] `node_modules` is ignored

Commit:

```bash
git add .
git commit -m "chore: initialize EventLens API"
```

---

# PHASE 1 — Hosted Supabase Database Foundation

## Goal

Connect your Node API to your **existing hosted Supabase project** and create the initial multi-tenant database schema.

There is deliberately:

```text
NO Supabase CLI
NO local Supabase instance
NO `supabase init`
NO `supabase start`
NO local database reset
NO local Supabase migrations
```

Your database is already online.

The workflow is:

```text
Supabase Dashboard
       ↓
SQL Editor
       ↓
Hosted PostgreSQL
       ↓
Node API
```

---

# 1.1 Understand the Supabase project

Open your Supabase project in the dashboard.

You will be working with:

```text
Supabase Project
│
├── Authentication
├── Data API
├── PostgreSQL Database
├── SQL Editor
└── Database settings
```

For this project, the most important pieces are:

```text
PostgreSQL
Data API
Auth
RLS
```

---

# 1.2 Get your project credentials

From the Supabase project dashboard, obtain the credentials you need.

Your application will use:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

These allow your Node API to communicate with the Supabase Data API.

---

# 1.3 Keep the secret key server-side

Supabase also provides a server-side secret credential.

If your project uses a secret key, store it only in:

```text
.env
```

For example:

```env
SUPABASE_SECRET_KEY=
```

Never expose the secret key to:

```text
React
browser JavaScript
HTML
mobile clients
GitHub
```

It is a server-side credential.

---

# 1.4 Database connection string

Your Supabase project also provides PostgreSQL connection details.

For example:

```env
DATABASE_URL=
```

Keep this in `.env`.

Do not commit it.

The connection string is different from the Data API credentials.

Think of the two approaches as:

```text
SUPABASE_URL
      +
SUPABASE_PUBLISHABLE_KEY
      ↓
Supabase Data API
```

versus:

```text
DATABASE_URL
      ↓
PostgreSQL connection
      ↓
Supabase PostgreSQL
```

For the initial EventLens API, use the Supabase JavaScript client/Data API unless there is a specific reason to connect directly to PostgreSQL.

---

# 1.5 Create the database schema

Because you are using the hosted database, create the schema directly through:

```text
Supabase Dashboard
        ↓
SQL Editor
```

Create a new SQL query.

The initial schema should contain:

```text
tenants
tenant_members
projects
events
```

---

# 1.6 Create tenant roles

Run this in the Supabase SQL Editor:

```sql
create type public.tenant_role as enum (
  'owner',
  'admin',
  'member'
);
```

---

# 1.7 Create tenants

```sql
create table public.tenants (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(trim(name)) >= 2),

  created_at timestamptz not null default now()
);
```

---

# 1.8 Create tenant memberships

```sql
create table public.tenant_members (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  role public.tenant_role not null default 'member',

  created_at timestamptz not null default now(),

  unique (tenant_id, user_id)
);
```

This establishes:

```text
Supabase Auth user
        ↓
tenant_members
        ↓
tenant
```

---

# 1.9 Create projects

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  name text not null
    check (char_length(trim(name)) >= 2),

  api_key text not null unique,

  created_at timestamptz not null default now()
);
```

---

# 1.10 Create events

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  event_name text not null
    check (char_length(trim(event_name)) >= 1),

  user_id text,

  properties jsonb not null default '{}'::jsonb,

  occurred_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);
```

---

# 1.11 Add indexes

Run:

```sql
create index tenant_members_user_id_idx
  on public.tenant_members(user_id);

create index tenant_members_tenant_id_idx
  on public.tenant_members(tenant_id);

create index projects_tenant_id_idx
  on public.projects(tenant_id);

create index events_project_id_idx
  on public.events(project_id);

create index events_occurred_at_idx
  on public.events(occurred_at);

create index events_project_occurred_at_idx
  on public.events(project_id, occurred_at);
```

---

# 1.12 Enable Row Level Security

Enable RLS on all application tables:

```sql
alter table public.tenants
enable row level security;

alter table public.tenant_members
enable row level security;

alter table public.projects
enable row level security;

alter table public.events
enable row level security;
```

At this stage, **do not create broad "allow everything" policies**.

The policies will be designed during the multi-tenant authorization phase.

---

# 1.13 Verify the database in Supabase

Use the Supabase Dashboard to verify:

```text
tenants
tenant_members
projects
events
```

Also verify:

```text
foreign keys
indexes
RLS enabled
```

You should be able to see the tables through the Supabase Table Editor.

---

# 1.14 Create the Supabase client

`apps/api/src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY"
  );
}

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
```

---

# 1.15 Why we are not using the Supabase CLI

This project does not need:

```bash
npm install -D supabase
```

or:

```bash
npx supabase init
```

or:

```bash
npx supabase start
```

or:

```bash
npx supabase db reset
```

because your database already exists online.

The database workflow is:

```text
Write SQL
   ↓
Supabase SQL Editor
   ↓
Hosted PostgreSQL
   ↓
Node API connects to it
```

This is simpler for your current setup.

---

# 1.16 Database types

Because we are not using the Supabase CLI to generate local types, don't make type generation a Phase 1 requirement.

Initially, your application can work with the database through the Supabase client.

If we later want strongly typed generated database types, we can introduce an appropriate generation workflow separately.

That is an optimization for developer experience, not something that should block the database foundation.

---

# 1.17 Database health endpoint

Import the client into your application:

```typescript
import { supabase } from "./lib/supabase.js";
```

Then add:

```typescript
app.get("/health/database", async (_req, res) => {
  const { error } = await supabase
    .from("tenants")
    .select("id")
    .limit(1);

  if (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });

    return;
  }

  res.json({
    status: "ok",
  });
});
```

Test:

```bash
curl http://localhost:3000/health/database
```

Expected:

```json
{
  "status": "ok"
}
```

---

# 1.18 If the database connection fails

Check these in order:

```text
1. Is SUPABASE_URL correct?

2. Is SUPABASE_PUBLISHABLE_KEY correct?

3. Is .env being loaded?

4. Is the Supabase project online?

5. Does the tenants table exist?

6. Is the table name correct?

7. Is RLS blocking the query?
```

Do not immediately rewrite the connection code.

---

# Checkpoint 1

* [ ] Hosted Supabase project exists
* [ ] `tenants` exists
* [ ] `tenant_members` exists
* [ ] `projects` exists
* [ ] `events` exists
* [ ] Relationships work
* [ ] Indexes exist
* [ ] RLS is enabled
* [ ] Supabase URL is configured
* [ ] Data API credential is configured
* [ ] API can connect to Supabase
* [ ] `/health/database` works
* [ ] No Supabase CLI is required

Commit:

```bash
git add .
git commit -m "feat: connect API to hosted Supabase database"
```

---

# PHASE 2 — Authentication

## Goal

Answer:

> Who is this user?

Supabase Auth handles identity.

Your application will eventually receive an authenticated user:

```text
Request
   ↓
Supabase Auth
   ↓
User ID
```

---

# 2.1 Understand authentication vs authorization

Authentication:

```text
Who are you?
```

Authorization:

```text
What are you allowed to access?
```

Do not confuse them.

A user can successfully authenticate and still have zero access to a particular tenant.

---

# 2.2 Configure Supabase Auth

Use your hosted Supabase project's:

```text
Authentication
```

configuration.

For the initial version:

```text
Email + Password
```

Do not build OAuth yet.

---

# 2.3 Add auth middleware

Conceptually:

```text
HTTP request
      ↓
Authorization header
      ↓
Supabase access token
      ↓
Authenticated user
      ↓
req.user
```

Create:

```text
apps/api/src/middleware/auth.ts
```

The middleware should:

1. Read the `Authorization` header.
2. Extract the bearer token.
3. Ask Supabase to validate/get the user.
4. Reject invalid tokens.
5. Attach the authenticated user to the request.

---

# 2.4 Test authentication

Create:

```text
User A
```

Authenticate.

Then verify your API can identify:

```text
User A's ID
```

---

# Checkpoint 2

* [ ] User can register
* [ ] User can log in
* [ ] API receives access token
* [ ] API can identify the user
* [ ] Invalid token is rejected
* [ ] Protected route cannot be accessed anonymously

---

# Do Not Build Yet

* [ ] Google login
* [ ] Password reset UI
* [ ] MFA
* [ ] Social login
* [ ] Fancy auth UI

Get the core identity system working first.

---

# PHASE 3 — Tenants & Projects

## Goal

Allow authenticated users to create organizations and projects.

---

# 3.1 Create tenant

Endpoint:

```http
POST /tenants
```

Request:

```json
{
  "name": "Acme Inc."
}
```

The server should:

1. Get authenticated user.
2. Create tenant.
3. Add user to `tenant_members`.
4. Make the user `owner`.

Conceptually:

```text
User
 ↓
Create Tenant
 ↓
Tenant created
 ↓
Membership created
 ↓
User = owner
```

---

# 3.2 List user's tenants

```http
GET /tenants
```

Return only tenants the current user belongs to.

---

# 3.3 Create project

```http
POST /tenants/:tenantId/projects
```

Request:

```json
{
  "name": "Acme Website"
}
```

Before creating it:

```text
Is current user a member of this tenant?
```

If no:

```text
403 Forbidden
```

---

# 3.4 List projects

```http
GET /tenants/:tenantId/projects
```

Only return projects belonging to that tenant.

---

# 3.5 Generate project API key

Each project needs an ingestion credential.

Conceptually:

```text
Project
   │
   └── API key
```

The API key identifies which project is sending events.

Do not use the user's Supabase access token for event ingestion.

The customer's application needs its own project credential.

---

# Checkpoint 3

You should be able to:

```text
User
 ↓
Create tenant
 ↓
Become owner
 ↓
Create project
 ↓
Get project API key
```

Test:

* [ ] Create tenant
* [ ] User becomes owner
* [ ] Create project
* [ ] List projects
* [ ] Unauthorized user cannot create project
* [ ] Project belongs to correct tenant

---

# PHASE 4 — Multi-Tenant Authorization

## Goal

This is the most important phase.

We need to prove:

```text
Tenant A
    ↓
User A
    ↓
Can access A's data
```

but:

```text
Tenant B
    ↓
User B
```

cannot be accessed by User A.

---

# 4.1 Create test tenants

Create:

```text
User A
Tenant A
Project A
```

And:

```text
User B
Tenant B
Project B
```

---

# 4.2 Test cross-tenant access

Try:

```http
GET /tenants/TENANT_B/projects
```

using User A's token.

Expected:

```text
403 Forbidden
```

or an intentionally non-disclosing `404`.

---

# 4.3 Application-level authorization

Create a reusable concept:

```text
requireTenantMembership()
```

Its responsibility:

```text
authenticated user
       +
tenant ID
       ↓
membership lookup
       ↓
allowed / denied
```

Don't scatter membership checks randomly throughout every controller.

---

# 4.4 Database-level authorization

Now write PostgreSQL RLS policies in the **Supabase SQL Editor**.

Conceptually:

```text
auth.uid()
   ↓
tenant_members
   ↓
tenant membership
   ↓
allowed row
```

For example, a project should be visible only if the current authenticated user belongs to the project's tenant.

The important architecture is:

```text
Application authorization
        +
PostgreSQL RLS
```

Both contribute to tenant isolation.

---

# 4.5 Security test matrix

| Test                 | Expected |
| -------------------- | -------- |
| User A → Tenant A    | Allowed  |
| User A → Tenant B    | Denied   |
| User B → Tenant B    | Allowed  |
| User B → Tenant A    | Denied   |
| Anonymous → Tenant A | Denied   |
| User A → Project A   | Allowed  |
| User A → Project B   | Denied   |

---

# Checkpoint 4

Do not continue until these tests pass.

This is the point where you can honestly say:

> "I have implemented multi-tenancy."

Everything after this builds on that foundation.

---

# PHASE 5 — Event Ingestion

## Goal

Allow a customer's application to send events.

---

# 5.1 API endpoint

```http
POST /v1/events
```

Example:

```json
{
  "event": "purchase_completed",
  "user_id": "user_123",
  "properties": {
    "amount": 25000,
    "currency": "NGN"
  }
}
```

---

# 5.2 Authentication model

Unlike dashboard requests, this endpoint uses:

```text
Project API key
```

Flow:

```text
Customer Application
        │
        │ API key
        ▼
POST /v1/events
        │
        ▼
Validate API key
        │
        ▼
Identify project
        │
        ▼
Validate event
        │
        ▼
Store event
```

---

# 5.3 Validate input

Required:

```text
event
```

Optional:

```text
user_id
properties
occurred_at
```

Reject:

```json
{}
```

and:

```json
{
  "event": ""
}
```

---

# 5.4 Event response

Return something simple:

```json
{
  "id": "event-id",
  "accepted": true
}
```

---

# Checkpoint 5

* [ ] Valid API key accepted
* [ ] Invalid API key rejected
* [ ] Event saved
* [ ] Invalid event rejected
* [ ] Event belongs to correct project
* [ ] Project belongs to correct tenant
* [ ] API never trusts a client-provided tenant ID

---

# PHASE 6 — Background Processing

## Goal

Separate:

```text
receiving events
```

from:

```text
processing events
```

---

# 6.1 Why queues?

Imagine the API receives:

```text
10,000 events
```

You don't want each HTTP request doing:

```text
validate
 ↓
insert
 ↓
calculate analytics
 ↓
update aggregates
 ↓
calculate retention
 ↓
return
```

Instead:

```text
HTTP request
     ↓
Validate
     ↓
Queue job
     ↓
Return
```

Worker:

```text
Queue
 ↓
Worker
 ↓
Process
 ↓
Aggregate
```

---

# 6.2 Add Redis

Use Redis as the queue backend.

---

# 6.3 Install BullMQ

```bash
npm install bullmq ioredis
```

---

# 6.4 Create queue

Structure:

```text
apps/
├── api/
│   └── src/
│
└── worker/
    └── src/
        └── worker.ts
```

---

# 6.5 Event queue

Conceptually:

```text
event-processing
```

Job:

```json
{
  "eventId": "evt_123"
}
```

---

# 6.6 Worker

Worker:

```text
receive event ID
      ↓
load event
      ↓
process event
      ↓
update analytics
```

---

# 6.7 Retry failures

A job should not necessarily die forever because of one temporary error.

Configure retries.

Conceptually:

```text
Attempt 1
   ↓
failed
   ↓
Attempt 2
   ↓
failed
   ↓
Attempt 3
```

Eventually:

```text
failed jobs
```

can be inspected separately.

---

# Checkpoint 6

* [ ] Redis works
* [ ] BullMQ queue works
* [ ] API creates jobs
* [ ] Worker consumes jobs
* [ ] Event processing works
* [ ] Failed jobs retry
* [ ] Worker can run independently from API

---

# PHASE 7 — Analytics

## Goal

Turn raw events into useful information.

Do not build every metric at once.

---

# 7.1 Event count

Endpoint:

```http
GET /projects/:projectId/analytics/events/count
```

Example:

```json
{
  "count": 18342
}
```

---

# 7.2 Events by name

Example:

```text
purchase_completed    4,320
product_viewed        9,421
checkout_started      2,104
user_signed_up        2,497
```

---

# 7.3 Time-series event volume

Example:

```text
Date        Events

Monday      1,200
Tuesday     1,540
Wednesday   1,320
Thursday    1,890
```

Support date ranges:

```text
today
7 days
30 days
custom
```

---

# 7.4 Active users

Define:

> A user is active if they generated at least one event during the selected period.

Then:

```text
DAU
WAU
MAU
```

---

# 7.5 Unique users

Count unique `user_id` values.

Be careful with:

```text
NULL
```

because anonymous events do not necessarily identify a user.

---

# 7.6 Aggregation strategy

Start by calculating analytics directly from events.

Only optimize when you've identified an actual query bottleneck.

Later, introduce:

```text
event_aggregates
```

for frequently requested metrics.

---

# Checkpoint 7

* [ ] Total events works
* [ ] Event breakdown works
* [ ] Date filtering works
* [ ] Active users works
* [ ] Unique users works
* [ ] Analytics are tenant/project scoped
* [ ] Tests verify counts

---

# PHASE 8 — Dashboard

## Goal

Make the system visible.

---

# 8.1 Dashboard structure

```text
┌───────────────────────────────────────────┐
│ Acme Website                              │
├───────────────────────────────────────────┤
│                                           │
│ Events       Active Users       Events/day │
│ 18,342       2,481              1,834      │
│                                           │
├───────────────────────────────────────────┤
│                                           │
│ Event Volume                              │
│                                           │
│        ╭────╮                             │
│    ╭───╯    ╰──╮                          │
│ ───╯           ╰────                      │
│                                           │
├───────────────────────────────────────────┤
│ Top Events                                │
│                                           │
│ purchase_completed       4,320            │
│ product_viewed           9,421            │
│ checkout_started         2,104            │
└───────────────────────────────────────────┘
```

---

# 8.2 Dashboard pages

Start with:

```text
/dashboard
/projects
/projects/:id
/projects/:id/events
```

---

# 8.3 Project switcher

Users belonging to multiple tenants/projects should be able to switch context.

Conceptually:

```text
Acme Inc.
  ├── Website
  └── Mobile App

Globex
  └── Website
```

---

# Checkpoint 8

* [ ] Login works
* [ ] Tenant switch works
* [ ] Project switch works
* [ ] Dashboard loads analytics
* [ ] No project leaks another project's data
* [ ] Empty states work
* [ ] Loading states work
* [ ] Error states work

---

# PHASE 9 — Retention & Cohorts

## Goal

Move beyond basic event counting.

---

# 9.1 Define retention

Example:

A user signs up on:

```text
January 1
```

Then:

```text
Day 0     100%
Day 1      42%
Day 7      21%
Day 14     14%
Day 30      9%
```

The exact definition must be documented.

---

# 9.2 Cohorts

Group users according to a shared starting point.

Example:

```text
January signup cohort
February signup cohort
March signup cohort
```

Then compare:

```text
users
activity
retention
purchases
```

---

# 9.3 Important decision

Before coding, define:

```text
What event counts as signup?
What counts as returning?
What time zone is used?
What happens to anonymous users?
```

Don't hide these decisions inside SQL.

Document them.

---

# Checkpoint 9

* [ ] Retention definition documented
* [ ] Cohort definition documented
* [ ] Retention query works
* [ ] Cohort query works
* [ ] Results are tenant/project scoped
* [ ] Edge cases tested

---

# PHASE 10 — Segmentation

## Goal

Allow users to analyze subsets of their audience.

---

# 10.1 Basic filters

Start with:

```text
country
plan
device
platform
```

Example:

```text
plan = "pro"
```

---

# 10.2 Multiple filters

Support:

```text
plan = "pro"
AND
country = "Nigeria"
```

Then:

```text
plan = "pro"
OR
plan = "enterprise"
```

Do not build a full programming language.

---

# 10.3 Segment storage

Eventually:

```text
segments
```

could contain:

```text
id
project_id
name
definition
created_at
```

Example definition:

```json
{
  "filters": [
    {
      "field": "plan",
      "operator": "equals",
      "value": "pro"
    }
  ]
}
```

---

# Checkpoint 10

* [ ] Basic filters work
* [ ] Multiple filters work
* [ ] Saved segments work
* [ ] Segment cannot cross project boundaries
* [ ] Invalid filter definitions are rejected

---

# PHASE 11 — CSV Exports

## Goal

Allow users to export their data.

---

# 11.1 Simple export

Endpoint:

```http
GET /projects/:id/exports/events.csv
```

For small datasets:

```text
Database
   ↓
Generate CSV
   ↓
HTTP response
```

---

# 11.2 Large export

For large datasets:

```text
Request
   ↓
Create export job
   ↓
Queue
   ↓
Worker
   ↓
Generate CSV
   ↓
Store file
   ↓
Download
```

---

# 11.3 Export status

Example:

```json
{
  "id": "export_123",
  "status": "processing"
}
```

Later:

```json
{
  "id": "export_123",
  "status": "completed",
  "download_url": "..."
}
```

---

# Checkpoint 11

* [ ] Small exports work
* [ ] Large exports are asynchronous
* [ ] Export belongs to correct project
* [ ] Unauthorized users cannot export another tenant's data
* [ ] Failed exports are handled

---

# PHASE 12 — Usage Limits & Rate Limiting

## Goal

Protect the API and introduce SaaS-style limits.

---

# 12.1 Rate limiting

For example:

```text
Maximum ingestion requests/minute
```

Redis can track request counts.

Conceptually:

```text
request
   ↓
Redis counter
   ↓
under limit?
   ├── yes → continue
   └── no  → 429
```

---

# 12.2 Usage limits

Example:

```text
Free
100,000 events/month

Pro
1,000,000 events/month
```

These are illustrative limits, not a pricing recommendation.

---

# 12.3 Usage table

Eventually:

```text
usage_records

id
project_id
period_start
period_end
event_count
```

---

# Checkpoint 12

* [ ] Rate limit exists
* [ ] 429 response works
* [ ] Usage is tracked
* [ ] Usage is project/tenant scoped
* [ ] Limits are enforced
* [ ] Tests cover boundary conditions

---

# PHASE 13 — Data Retention

## Goal

Control how long raw events are stored.

Example:

```text
30 days
90 days
365 days
```

---

# 13.1 Retention policy

Eventually:

```text
projects
    ↓
retention_days
```

---

# 13.2 Scheduled cleanup

Conceptually:

```text
Scheduled job
      ↓
Find expired events
      ↓
Delete/archive
```

---

# 13.3 Important design question

Before deleting anything, decide:

```text
Are analytics based on raw events?
```

If yes, deleting raw events may destroy historical analytics.

This is why production analytics systems often separate:

```text
raw events
```

from:

```text
aggregated data
```

---

# Checkpoint 13

* [ ] Retention policy exists
* [ ] Expired events can be identified
* [ ] Cleanup job works
* [ ] Analytics remain correct after cleanup
* [ ] Tenant boundaries remain intact

---

# PHASE 14 — Testing

## Goal

Turn the project from "it works on my machine" into something you can defend in an interview.

---

# 14.1 Unit tests

Test small functions.

Examples:

```text
calculateActiveUsers()
calculateRetention()
buildSegmentQuery()
validateEvent()
```

---

# 14.2 Integration tests

Test API + database.

Examples:

```text
create tenant
create project
create event
retrieve analytics
```

---

# 14.3 Authentication tests

```text
anonymous request
authenticated request
expired token
invalid token
```

---

# 14.4 Multi-tenancy tests

These are critical.

```text
User A → Tenant A → allowed
User A → Tenant B → denied

User B → Tenant B → allowed
User B → Tenant A → denied
```

---

# 14.5 API key tests

```text
valid API key
invalid API key
missing API key
revoked API key
wrong project
```

---

# 14.6 Worker tests

```text
successful job
failed job
retry
permanent failure
```

---

# 14.7 Analytics tests

Test:

```text
event counts
unique users
date ranges
time zones
empty datasets
anonymous events
```

---

# Checkpoint 14

* [ ] Unit tests pass
* [ ] Integration tests pass
* [ ] Auth tests pass
* [ ] Tenant isolation tests pass
* [ ] API key tests pass
* [ ] Worker tests pass
* [ ] Analytics tests pass

---

# PHASE 15 — Deployment

## Goal

Deploy the actual application.

---

# 15.1 Production architecture

```text
                  Internet
                     │
                     ▼
              ┌──────────────┐
              │   Frontend   │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │     API      │
              └──────┬───────┘
                     │
             ┌───────┴────────┐
             │                │
             ▼                ▼
        PostgreSQL          Redis
        / Supabase            │
                              ▼
                           Worker
```

---

# 15.2 Production Supabase

Your hosted Supabase project already provides the production database layer:

```text
Supabase
   ├── PostgreSQL
   ├── Auth
   ├── Data API
   └── RLS
```

The deployed Node API connects to the hosted project using production environment variables.

---

# 15.3 Environment separation

You should have:

```text
development
staging
production
```

At minimum:

```text
local API
production API
```

The database may remain your hosted Supabase project while you develop, but be deliberate about whether you are working with development or production data.

For a portfolio application, a separate development Supabase project can eventually be useful.

---

# 15.4 Production environment variables

Never hard-code:

```text
database URL
API keys
secret keys
Redis credentials
```

Use environment configuration.

Example:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DATABASE_URL=
REDIS_URL=
```

Only include variables that the deployed application actually requires.

---

# 15.5 Database changes

Because you are not using the Supabase CLI, schema changes should be handled deliberately.

Before changing production:

```text
Write SQL
    ↓
Review SQL
    ↓
Test against the database
    ↓
Apply through Supabase SQL Editor
    ↓
Verify schema
    ↓
Commit the SQL/schema change to Git
```

For a portfolio project, keep a record of important schema changes in the repository, even though the database itself is managed through the Supabase Dashboard.

A possible structure later:

```text
database/
├── schema/
│   ├── 001_initial_schema.sql
│   ├── 002_add_segments.sql
│   └── 003_add_usage_records.sql
└── README.md
```

These files are **your project's SQL history**, not Supabase CLI migrations.

---

# 15.6 Production checklist

* [ ] HTTPS
* [ ] Environment variables configured
* [ ] Hosted Supabase project configured
* [ ] Database schema verified
* [ ] RLS policies verified
* [ ] CORS configured
* [ ] Rate limiting enabled
* [ ] Logs available
* [ ] Worker deployed
* [ ] Redis configured
* [ ] Health check available
* [ ] Error handling configured

---

# Checkpoint 15

The application should be accessible from the internet and able to:

```text
Login
 ↓
Select tenant
 ↓
Select project
 ↓
View analytics
```

And the ingestion API should accept:

```text
POST /v1/events
```

using a project API key.

---

# PHASE 16 — Portfolio Polish

## Goal

Turn the project into something another engineer can understand.

---

# 16.1 README

Your README should explain:

```text
What EventLens is
Why it exists
Architecture
Tech stack
Multi-tenancy model
Database design
Authentication
Authorization
Event ingestion
Background processing
Analytics
Testing
Deployment
```

---

# 16.2 Architecture diagram

Include:

```text
Frontend
   ↓
API
   ↓
Supabase PostgreSQL

API
 ↓
Redis
 ↓
Worker
```

---

# 16.3 Multi-tenancy explanation

This should be one of the strongest sections of your README.

Explain:

```text
Users
 ↓
Tenant membership
 ↓
Tenant
 ↓
Project
 ↓
Events
```

Then explain:

```text
Application authorization
+
PostgreSQL RLS
```

---

# 16.4 Include a security section

Document:

* Authentication
* Authorization
* RLS
* API keys
* Rate limiting
* Tenant isolation
* Input validation

---

# 16.5 Include architecture decisions

For example:

### Why PostgreSQL?

Because the system needs relational data, complex analytics queries, JSON properties, and strong transactional guarantees.

### Why Supabase?

Because it provides hosted PostgreSQL, authentication, the Data API, and PostgreSQL security features without requiring us to manage the database infrastructure ourselves.

### Why Redis/BullMQ?

Because event processing and exports can happen asynchronously without making HTTP requests wait for expensive work.

### Why RLS?

Because tenant isolation should not depend exclusively on application-level checks.

---

# 16.6 Add screenshots

Show:

```text
Login
Dashboard
Project page
Event explorer
Analytics
Segment builder
```

---

# 16.7 Add a demo

The portfolio version should have:

```text
Demo account
```

or a simple seeded environment.

Never expose real customer data.

---

# 16.8 Git history

Avoid:

```text
final
final2
final-final
please-work
actual-final
```

Prefer meaningful commits:

```text
feat: add tenant creation
feat: add project management
feat: enforce tenant authorization
feat: add event ingestion
feat: add event processing worker
feat: add analytics aggregation
test: add cross-tenant isolation tests
```

---

# Final Project Structure

By the end, the project might look approximately like:

```text
eventlens/
│
├── apps/
│   │
│   ├── api/
│   │   └── src/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── lib/
│   │       ├── app.ts
│   │       └── server.ts
│   │
│   ├── worker/
│   │   └── src/
│   │       ├── jobs/
│   │       ├── processors/
│   │       └── worker.ts
│   │
│   └── web/
│       └── src/
│
├── database/
│   ├── schema/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_segments.sql
│   │   └── ...
│   └── README.md
│
├── packages/
│   ├── types/
│   └── config/
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

**Do not create this entire structure at the beginning.**

Grow into it.

---

# Final Database Model

Eventually:

```text
auth.users
     │
     ▼
tenant_members
     │
     ▼
tenants
     │
     ├───────────────┐
     ▼               ▼
projects          segments
     │
     ├───────────────┐
     ▼               ▼
events          usage_records
     │
     ▼
aggregates
```

Additional tables may eventually include:

```text
api_keys
exports
cohorts
retention_records
```

Only create a table when the application actually needs it.

---

# The Complete Feature Checklist

## Foundation

* [ ] Node.js
* [ ] TypeScript
* [ ] Express
* [ ] Git
* [ ] Environment configuration
* [ ] Hosted Supabase project
* [ ] Supabase Data API connection
* [ ] PostgreSQL database
* [ ] SQL schema tracked in Git

## Authentication

* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Auth middleware
* [ ] User identity

## Multi-tenancy

* [ ] Tenants
* [ ] Tenant membership
* [ ] Roles
* [ ] Projects
* [ ] Tenant authorization
* [ ] RLS
* [ ] Cross-tenant tests

## Event ingestion

* [ ] API keys
* [ ] Event endpoint
* [ ] Input validation
* [ ] Event storage
* [ ] Error handling

## Processing

* [ ] Redis
* [ ] BullMQ
* [ ] Queue
* [ ] Worker
* [ ] Retries
* [ ] Failed jobs

## Analytics

* [ ] Event counts
* [ ] Event breakdown
* [ ] Active users
* [ ] Unique users
* [ ] Time-series data
* [ ] Date filtering

## Advanced analytics

* [ ] Retention
* [ ] Cohorts
* [ ] Segmentation
* [ ] Saved segments

## Data management

* [ ] CSV export
* [ ] Background exports
* [ ] Usage tracking
* [ ] Rate limiting
* [ ] Retention policies

## Quality

* [ ] Unit tests
* [ ] Integration tests
* [ ] E2E tests
* [ ] Security tests
* [ ] Tenant isolation tests

## Deployment

* [ ] Production API
* [ ] Hosted Supabase database
* [ ] Redis
* [ ] Worker
* [ ] Frontend
* [ ] HTTPS
* [ ] Environment configuration
* [ ] Database schema history

## Portfolio

* [ ] README
* [ ] Architecture diagram
* [ ] Screenshots
* [ ] Demo
* [ ] API documentation
* [ ] Architecture decisions
* [ ] Security explanation

---

# The Most Important Checkpoints

If the entire project starts feeling huge, reduce it to these milestones:

## Milestone 1

```text
Express API works
```

---

## Milestone 2

```text
Hosted Supabase database exists

tenants
tenant_members
projects
events
```

---

## Milestone 3

```text
User can authenticate
```

---

## Milestone 4

```text
User A cannot access Tenant B
```

**This is the core multi-tenancy milestone.**

---

## Milestone 5

```text
Project API key
       ↓
Event ingestion
       ↓
Database
```

---

## Milestone 6

```text
Event
 ↓
Queue
 ↓
Worker
 ↓
Analytics
```

---

## Milestone 7

```text
Dashboard
 ↓
Analytics
```

---

## Milestone 8

```text
Retention
Cohorts
Segmentation
Exports
```

---

## Milestone 9

```text
Tests
Security
Deployment
```

---

# What "Done" Looks Like

The finished EventLens system should demonstrate that you understand:

### Authentication

> Authentication answers **who the user is**.

### Authorization

> Authorization answers **what the user can access**.

### Multi-tenancy

> Multi-tenancy means multiple independent organizations can use the same application while their resources remain isolated.

### Database relationships

```text
User
 ↓
Tenant Membership
 ↓
Tenant
 ↓
Project
 ↓
Event
```

### Supabase

> Supabase provides the hosted PostgreSQL database, authentication, Data API, and PostgreSQL security features used by the application.

### RLS

> PostgreSQL can enforce row-level access rules independently of your application logic.

### API keys

> A project API key identifies which application/project is sending telemetry.

### Queues

> Queues separate accepting work from processing work.

### Workers

> Workers process asynchronous jobs independently of HTTP requests.

### Aggregation

> Aggregations transform large amounts of raw event data into data that is faster and cheaper to query.

### Testing

> Security boundaries, especially tenant isolation, need explicit tests.

---

# Rules for This Project

## Rule 1 — Don't build ahead

If you're on Phase 3, don't start Phase 7 because analytics sounds more fun.

---

## Rule 2 — Don't abstract prematurely

If you have two similar functions, you don't automatically need:

```text
BaseService
AbstractRepository
GenericFactory
ServiceManager
```

Wait until the duplication is real.

---

## Rule 3 — Don't add infrastructure for imaginary scale

You don't need:

```text
Kubernetes
Kafka
microservices
event sourcing
CQRS
```

for the MVP.

This is a portfolio project, not Google Analytics.

---

## Rule 4 — Security before polish

A beautiful dashboard with broken tenant isolation is a failed multi-tenant application.

Prioritize:

```text
Correctness
   ↓
Security
   ↓
Tests
   ↓
Performance
   ↓
UI polish
```

---

## Rule 5 — Commit working milestones

After each checkpoint:

```bash
git status
git add .
git commit -m "meaningful message"
```

---

# When You Get Stuck

Use this sequence:

```text
1. What exactly is failing?

2. What did I expect to happen?

3. What actually happened?

4. Is the problem:
   ├── syntax?
   ├── types?
   ├── configuration?
   ├── database?
   ├── authentication?
   ├── authorization?
   └── application logic?

5. Can I reproduce it with the smallest possible example?

6. What is the simplest fix?
```

Do not immediately rewrite the architecture.

---

# The Golden Rule

Whenever you're unsure what to build next:

> **Finish the smallest thing that proves the current concept works.**

For example:

Don't build the entire authorization system at once.

First prove:

```text
User A
 ↓
Tenant A
 ↓
Allowed
```

Then prove:

```text
User A
 ↓
Tenant B
 ↓
Denied
```

Then add the RLS enforcement.

Then test it.

Then move on.

That is how this project stays manageable.

---

# EventLens Build Order

```text
                    ┌──────────────────────┐
                    │      PHASE 0         │
                    │    Setup / API       │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 1         │
                    │ Hosted Supabase DB   │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 2         │
                    │  Authentication      │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 3         │
                    │ Tenants & Projects   │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 4         │
                    │ Multi-Tenant Auth    │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 5         │
                    │ Event Ingestion      │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 6         │
                    │ Redis + BullMQ       │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 7         │
                    │ Analytics            │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 8         │
                    │ Dashboard            │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │    PHASE 9–13        │
                    │ Advanced Features    │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │    PHASE 14–15       │
                    │ Tests + Deployment   │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │      PHASE 16        │
                    │ Portfolio Polish     │
                    └──────────────────────┘
```

---

# Current Starting Point

When you're ready to actually begin, start at:

```text
PHASE 0
   ↓
0.1 Create repository
   ↓
0.2 Install dependencies
   ↓
0.3 Folder structure
   ↓
0.4 Configure TypeScript
   ↓
0.5 Start Express API
   ↓
/health works
```

Then move to:

```text
PHASE 1
   ↓
Connect to hosted Supabase
   ↓
Create database schema in Supabase SQL Editor
   ↓
Enable RLS
   ↓
Configure Data API credentials
   ↓
Test API → Supabase connection
```

**Do not jump to Phase 2 until `/health/database` works.**

And once Phase 1 is complete, **do not jump straight to Redis or analytics**.

The next conceptual hurdle is:

```text
Authentication
       ↓
Tenant membership
       ↓
Authorization
       ↓
RLS
       ↓
Cross-tenant isolation
```

Once that works, the rest of the application has a much clearer foundation.
