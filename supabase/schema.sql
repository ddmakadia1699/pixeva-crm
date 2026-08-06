-- ===================================================
-- PIXEVA CRM & STUDIO SUITE SUPABASE SCHEMA
-- Execute this SQL script in the Supabase SQL Editor
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'growth',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'sales_rep',
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'unqualified')),
    estimated_value NUMERIC(12, 2) DEFAULT 0.00,
    source TEXT DEFAULT 'website',
    notes TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DEALS TABLE (Sales Pipeline Kanban)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0.00,
    stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER DEFAULT 20,
    expected_close_date DATE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SHOOT BOOKINGS & CALENDAR TABLE (NEW - Revepod)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT CHECK (event_type IN ('wedding', 'corporate', 'portrait', 'party', 'travel')),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0.00,
    deposit_paid NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
    photographer_name TEXT DEFAULT 'Admin Photographer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. INVOICES & PAYMENTS TABLE (NEW - Revepod)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CONTRACTS & DIGITAL SIGNATURES TABLE (NEW - Revepod)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    terms_summary TEXT NOT NULL,
    status TEXT DEFAULT 'pending_signature' CHECK (status IN ('signed', 'pending_signature', 'draft')),
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PIXEVA AI EVENT GALLERIES & QR TENT CARDS TABLE (NEW - Revepod)
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    photo_count INTEGER DEFAULT 0,
    guest_selfie_count INTEGER DEFAULT 0,
    qr_code_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'archived')),
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow public read/write on deals" ON public.deals FOR ALL USING (true);
CREATE POLICY "Allow public read/write on bookings" ON public.bookings FOR ALL USING (true);
CREATE POLICY "Allow public read/write on invoices" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow public read/write on contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow public read/write on galleries" ON public.galleries FOR ALL USING (true);
