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

export type EnquiryStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'proposal' 
  | 'booked' 
  | 'unqualified'
  | 'New'
  | 'Follow Up'
  | 'Meeting Fixed'
  | 'Proposal Sent'
  | 'Closed/Lost';

export type EnquirySource = 
  | 'Landing Page' 
  | 'Website' 
  | 'Instagram' 
  | 'Referral' 
  | 'Google Ads' 
  | 'Inbound API'
  | 'Google'
  | 'WhatsApp'
  | 'Facebook'
  | 'Other';

export interface Enquiry {
  id: string;
  name: string;
  contact?: string;
  email: string;
  phone?: string;
  event_name?: string;
  event_type?: 'wedding' | 'corporate' | 'portrait' | 'party' | 'travel' | string;
  event_date?: string;
  received_on?: string;
  venue?: string;
  budget?: string;
  guests?: string;
  estimated_budget?: number;
  source: EnquirySource;
  status: EnquiryStatus;
  notes?: string;
  event_details?: string;
  created_at: string;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export type ProjectStatus = 'Active' | 'Archived' | 'Completed' | 'On Hold';
export type ContractStatus = 'Accepted' | 'Pending' | 'Draft' | 'Declined';

export interface Project {
  id: string;
  name: string;
  type: string;
  client: string;
  first_event: string;
  status: ProjectStatus;
  completeness: string;
  contract: ContractStatus;
  remark?: string;
  created_at: string;
}

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

export type RoleType = 'Candid' | 'Traditional' | 'Cinema' | 'Video' | 'Drone' | 'Audio' | 'Other';

export interface ShotDataEntry {
  id: string;
  event_name: string;
  event_date: string;
  crew_member: string;
  role_type: RoleType;
  storage_location: string;
  remark?: string;
  is_recorded: boolean;
  created_at?: string;
}

export interface ScheduledEvent {
  id: string;
  project_name: string;
  event_title: string;
  date_time: string;
  date_formatted: string;
  time_formatted: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed';
  assigned_crew: string[];
  is_unassigned: boolean;
  notes?: string;
}

