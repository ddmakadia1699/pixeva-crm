'use client';

import React, { useState } from 'react';
import LeadTable from '@/components/leads/LeadTable';
import { MOCK_LEADS } from '@/lib/supabase/client';
import { Lead, LeadStatus } from '@/lib/supabase/types';
import { Users, Sparkles, Filter, Download } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const handleAddLead = (newLeadData: Omit<Lead, 'id' | 'created_at'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLeads([newLead, ...leads]);
  };

  const handleUpdateStatus = (id: string, newStatus: LeadStatus) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Lead Management & Contacts</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            View, search, filter, and execute serverless AWS tasks for your active CRM leads.
          </p>
        </div>
      </div>

      <LeadTable
        leads={leads}
        onAddLead={handleAddLead}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
