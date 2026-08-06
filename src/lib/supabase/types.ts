export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'unqualified';

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company: string;
  status: LeadStatus;
  estimated_value: number;
  source: string;
  notes?: string;
  created_at: string;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  company_name: string;
  amount: number;
  stage: DealStage;
  probability: number;
  expected_close_date?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'lambda_task';
  title: string;
  description: string;
  created_at: string;
}
