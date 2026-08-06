import { createClient } from '@supabase/supabase-js';
import { Lead, Deal } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Mock Data for visual demonstration before Supabase keys are connected
export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah@acme.com',
    phone: '+1 (555) 234-5678',
    company: 'Acme Corp',
    status: 'qualified',
    estimated_value: 45000,
    source: 'Website',
    notes: 'Interested in enterprise seat licensing and API integrations.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus@nexus.io',
    phone: '+1 (555) 876-5432',
    company: 'Nexus Tech',
    status: 'proposal',
    estimated_value: 82000,
    source: 'LinkedIn',
    notes: 'Requesting custom AWS Lambda microservice integrations.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'lead-3',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena@cyberdyne.net',
    phone: '+1 (555) 345-6789',
    company: 'Cyberdyne Systems',
    status: 'new',
    estimated_value: 120000,
    source: 'Inbound API',
    notes: 'Requires high-throughput batch campaign engine.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'lead-4',
    first_name: 'David',
    last_name: 'Kim',
    email: 'david@solaris.org',
    phone: '+1 (555) 987-6543',
    company: 'Solaris Energy',
    status: 'contacted',
    estimated_value: 28000,
    source: 'Referral',
    notes: 'Scheduled discovery call for next Tuesday.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Enterprise CRM License',
    company_name: 'Acme Corp',
    amount: 45000,
    stage: 'qualification',
    probability: 40,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-2',
    title: 'Cloud Infrastructure Sync',
    company_name: 'Nexus Tech',
    amount: 82000,
    stage: 'proposal',
    probability: 75,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-3',
    title: 'Custom AI Automation',
    company_name: 'Cyberdyne Systems',
    amount: 120000,
    stage: 'prospecting',
    probability: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-4',
    title: 'Solar Grid Analytics',
    company_name: 'Solaris Energy',
    amount: 28000,
    stage: 'negotiation',
    probability: 90,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-5',
    title: 'Global Logistics Suite',
    company_name: 'Titan Logistics',
    amount: 150000,
    stage: 'closed_won',
    probability: 100,
    created_at: new Date().toISOString(),
  },
];
