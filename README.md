# 🚀 Pixeva CRM — Tri-Cloud Enterprise CRM
### Powered by Vercel Edge + Supabase PostgreSQL + AWS Lambda Serverless Workers

**Pixeva CRM** is a modern, high-performance Customer Relationship Management (CRM) platform built for maximum speed, security, and scalability.

---

## 🏗️ Architecture Overview

```
                      ┌───────────────────────────┐
                      │    Client Browser / UI    │
                      └──────┬─────────────┬──────┘
          static + SSR pages │             │ API calls with the user's login token
        (no backend secrets) │             │ (Authorization: Bearer <Supabase JWT>)
                             ▼             ▼
        ┌───────────────────────┐   ┌──────────────────────────────────────────┐
        │ Vercel (Next.js)      │   │ AWS API Gateway (HTTP API)               │
        │ - UI + login (Auth)   │   │ - CORS allow-list, route throttling      │
        │ - NO AWS credentials  │   └───────────────────┬──────────────────────┘
        └──────────┬────────────┘                       ▼
                   │ login            ┌──────────────────────────────────────────┐
                   ▼                  │ AWS Lambda (Python 3.14)                 │
        ┌───────────────────────┐     │ 1. verify JWT (Supabase public JWKS)     │
        │ Supabase              │◀────│ 2. per-user / per-IP rate limit          │
        │ - Auth, PostgreSQL    │     │    (DynamoDB counters, TTL)              │
        │ - data scoped by      │     │ 3. query with account_id = token `sub`   │
        │   account_id          │     └──────────────────────────────────────────┘
        └───────────────────────┘
```

### Security & abuse protection

| Layer | Control |
|---|---|
| Browser / Vercel | Holds only public values. No AWS keys and no Supabase secret key; there is no route that can invoke AWS. |
| API Gateway | CORS allow-list (`AllowedOrigins`), default throttle, tighter caps on `POST /pdf-generator`, `POST /batch-email` and the public `POST /enquiries`. |
| Lambda: identity | Every route verifies the Supabase JWT. The tenant is the token's `sub`, never a client-supplied id. The only anonymous path is creating an enquiry through the public form. |
| Lambda: fairness | Per-identity budgets (`lambda/src/common/ratelimit.py`): reads 240/min and writes 60/min per user, workers 10/min and 100/h per user, public form 5/min and 30/h per IP plus 60/h per studio. Over budget returns `429` with `Retry-After`. |
| Lambda: input | Request bodies are capped at 256 KB; public-form fields are length-limited; clients cannot change `account_id` on update. |
| Secrets | The Supabase secret key lives only in the Lambda stack (a `NoEcho` SAM parameter). Lambdas get least-privilege IAM (`dynamodb:UpdateItem` on one table). |

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

Fill in the public values (the frontend needs no AWS credentials):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_AWS_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
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
  --parameter-overrides SupabaseServiceRoleKey=<your-supabase-secret-key> \
  "AllowedOrigins=https://pixeva-crm.vercel.app,http://localhost:3000"
```
`AllowedOrigins` restricts which websites' browsers may call the API (CORS). The stack also creates a
DynamoDB table for rate-limit counters (pay-per-request, items expire automatically).
Native dependencies are built for Linux automatically, or add `--use-container` if you have Docker.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com/new) and click **Import Repository**.
3. Add environment variables in Vercel settings.
4. Click **Deploy**!
