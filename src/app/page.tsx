'use client';

import React, { useState } from 'react';
import StatCards from '@/components/dashboard/StatCards';
import LeadTable from '@/components/leads/LeadTable';
import KanbanBoard from '@/components/deals/KanbanBoard';
import { MOCK_LEADS, MOCK_DEALS } from '@/lib/supabase/client';
import { Lead, LeadStatus, Deal, DealStage } from '@/lib/supabase/types';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);

  // Derived metrics
  const totalPipeline = deals.reduce((sum, d) => sum + d.amount, 0);
  const closedWonAmount = deals
    .filter((d) => d.stage === 'closed_won')
    .reduce((sum, d) => sum + d.amount, 0);

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

  const handleMoveDealStage = (dealId: string, targetStage: DealStage) => {
    setDeals(
      deals.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 pixeva-card bg-gradient-to-r from-[#12121a] via-[#161622] to-[#0a0a0f] border border-white/15 overflow-hidden shadow-pixevaCard">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-[#00d4ff]/25 via-[#3b82f6]/20 to-[#8b5cf6]/25 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-cyan text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Pixeva Tri-Cloud CRM Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Welcome to <span className="text-pixeva-gradient">Pixeva Dashboard</span>
            </h1>
            <p className="text-xs md:text-sm text-[#a0a0b0] leading-relaxed">
              Full-stack AI & CRM platform hosted on <strong className="text-[#00d4ff]">Vercel Edge</strong>, connected to <strong className="text-[#8b5cf6]">Supabase PostgreSQL</strong>, and accelerated by <strong className="text-[#3b82f6]">AWS Lambda</strong> serverless background workers.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/deals"
              className="btn-pixeva-primary flex items-center space-x-2 text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition-all"
            >
              <span>Explore Sales Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <StatCards
        totalPipeline={totalPipeline}
        totalLeads={leads.length}
        closedWonAmount={closedWonAmount}
        lambdaInvocations={142}
      />

      {/* Main Grid: Leads Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Lead Manager</h2>
            <p className="text-xs text-[#a0a0b0]">Filter, update lead stages, or run on-demand AWS Lambda background tasks.</p>
          </div>
          <Link href="/leads" className="text-xs font-bold text-[#00d4ff] hover:underline flex items-center space-x-1">
            <span>Manage All Contacts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <LeadTable
          leads={leads}
          onAddLead={handleAddLead}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* Sales Pipeline Kanban Preview */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Deals & Sales Pipeline</h2>
            <p className="text-xs text-[#a0a0b0]">Advance deals across stages with automated subtotal metrics.</p>
          </div>
          <Link href="/deals" className="text-xs font-bold text-[#00d4ff] hover:underline flex items-center space-x-1">
            <span>Full Kanban View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <KanbanBoard deals={deals} onMoveStage={handleMoveDealStage} />
      </div>
    </div>
  );
}
