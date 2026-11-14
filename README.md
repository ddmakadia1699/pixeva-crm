# 🚀 Pixeva CRM — Tri-Cloud Enterprise CRM
### Powered by Vercel Edge + Supabase PostgreSQL + AWS Lambda Serverless Workers

**Pixeva CRM** is a modern, high-performance Customer Relationship Management (CRM) platform built for maximum speed, security, and scalability.

---

## 🏗️ Architecture Overview

```
                      ┌───────────────────────────┐
                      │    Client Browser / UI    │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │    Vercel (Next.js App Router)     │
                 │  - Edge Next.js Rendering          │
                 │  - Server Actions & SSR Engine     │
                 └──────────┬───────────────┬──────────┘
                            │               │
      Supabase JS & Cookie  │               │ AWS SDK @aws-sdk/client-lambda
           Queries & Auth   │               │ Serverless Triggers
                            ▼               ▼
             ┌────────────────────┐   ┌─────────────────────────┐
             │   Supabase Cloud   │   │   AWS Lambda Workers    │
             │ - PostgreSQL DB    │   │ - PDF Invoice Generator │
             │ - Supabase Auth    │   │ - Batch Campaign Mailer │
             │ - Row Level Sec.   │   │ - Data Import / Sync    │
             └────────────────────┘   └─────────────────────────┘
```

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your API keys (optional for local demo mode):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Database Setup

1. Log into [Supabase Console](https://supabase.com/dashboard).
2. Create a new project or select an existing one.
3. Open **SQL Editor**.
4. Paste the contents of `supabase/schema.sql` and click **Run**.
5. Copy your **Project URL** and **anon Key** into `.env.local` and Vercel project environment variables.

---

## ⚡ AWS Lambda Functions Setup

The backend is **Python 3.14** on AWS Lambda behind an API Gateway HTTP API (AWS SAM, see `template.yaml`).

```
lambda/
  src/                     # packaged and deployed (CodeUri)
    common/                # auth.py (Supabase JWT check), db.py (PostgREST client), http.py
    handlers/              # enquiries_service, bookings_service, contracts_service,
                           # studio_data_service, pdf_generator, batch_email
    requirements.txt
  tests/test_handlers.py   # auth + handler tests (no network or real login needed)
  local_dev.py             # local HTTP server for development
```

Every route requires a Supabase login token (`Authorization: Bearer ...`); the tenant is taken from the
verified token. The only exception is the public enquiry form (`POST /enquiries` without a token).

**Run locally** (needs Python 3.14):
```bash
python -m venv lambda/.venv
lambda/.venv/Scripts/python -m pip install -r lambda/src/requirements.txt
lambda/.venv/Scripts/python lambda/local_dev.py      # http://localhost:5001
lambda/.venv/Scripts/python -m unittest discover -s lambda/tests -v
```

**Deploy** (needs the SAM CLI; the Supabase secret key is passed as a parameter, never committed):
```bash
sam build
sam deploy --stack-name pixeva-crm --resolve-s3 --region us-east-1 --capabilities CAPABILITY_IAM \
  --parameter-overrides SupabaseServiceRoleKey=<your-supabase-secret-key>
```
Native dependencies are built for Linux automatically, or add `--use-container` if you have Docker.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com/new) and click **Import Repository**.
3. Add environment variables in Vercel settings.
4. Click **Deploy**!
