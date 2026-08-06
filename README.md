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

Sample handlers are included under `lambda/functions/`:
- `pdf-generator/index.js`: PDF quote and invoice generation.
- `batch-email/index.js`: Bulk lead email campaign dispatcher.

To deploy to AWS Lambda:
1. Zip the handler code or deploy via Serverless Framework / AWS Console.
2. Grant `AWS_ACCESS_KEY_ID` permissions for `lambda:InvokeFunction`.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com/new) and click **Import Repository**.
3. Add environment variables in Vercel settings.
4. Click **Deploy**!
