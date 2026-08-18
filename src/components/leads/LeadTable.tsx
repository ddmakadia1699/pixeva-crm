'use client';

import React, { useState } from 'react';
import { Lead, LeadStatus } from '@/lib/supabase/types';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  FileText, 
  Mail, 
  Sparkles, 
  Building2, 
  X,
  Cpu,
  Loader2
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onAddLead: (newLead: Omit<Lead, 'id' | 'created_at'>) => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
}

export default function LeadTable({ leads, onAddLead, onUpdateStatus }: LeadTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLambdaTask, setActiveLambdaTask] = useState<string | null>(null);
  const [lambdaResult, setLambdaResult] = useState<any>(null);

  // New Lead Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    phone: '',
    status: 'new' as LeadStatus,
    estimated_value: 25000,
    source: 'Website',
  });

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.email || !formData.company) return;
    
    onAddLead({
      ...formData,
      estimated_value: Number(formData.estimated_value),
    });

    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      phone: '',
      status: 'new',
      estimated_value: 25000,
      source: 'Website',
    });

    setIsModalOpen(false);
  };

  // AWS Lambda Trigger Handler
  const handleRunPdfLambda = async (lead: Lead) => {
    setActiveLambdaTask(`pdf-${lead.id}`);
    setLambdaResult(null);

    const res = await invokeLambdaFunction('pdf-generator-service', {
      dealId: lead.id,
      clientName: `${lead.first_name} ${lead.last_name}`,
      company: lead.company,
      amount: lead.estimated_value,
    });

    setActiveLambdaTask(null);
    setLambdaResult({
      type: 'pdf',
      leadName: `${lead.first_name} ${lead.last_name}`,
      data: res,
    });
  };

  const handleRunEmailLambda = async (lead: Lead) => {
    setActiveLambdaTask(`email-${lead.id}`);
    setLambdaResult(null);

    const res = await invokeLambdaFunction('batch-email-service', {
      campaignName: 'Pixeva Instant Lead Nurture',
      recipients: [lead.email],
    });

    setActiveLambdaTask(null);
    setLambdaResult({
      type: 'email',
      leadName: `${lead.first_name} ${lead.last_name}`,
      data: res,
    });
  };

  return (
    <div className="space-y-4">
      {/* Lambda Task Output Toast / Banner */}
      {lambdaResult && (
        <div className="p-4 rounded-2xl pixeva-card bg-[#12121a]/95 border border-[#00d4ff]/40 flex items-start justify-between animate-fadeIn shadow-2xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  AWS Lambda Response [{lambdaResult.type.toUpperCase()}]
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-mono">
                  {lambdaResult.data.executionTimeMs}ms
                </span>
              </div>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Target: <span className="font-semibold text-white">{lambdaResult.leadName}</span> — {lambdaResult.data.payload.message}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setLambdaResult(null)}
            className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]/60"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'new', 'contacted', 'qualified', 'proposal'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-sm'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl shadow-md ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card w-full">
        <table className="w-full text-left text-xs text-[#a0a0b0] table-fixed">
          <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
            <tr>
              <th className="w-[30%] px-3 py-3">Lead / Contact</th>
              <th className="w-[22%] px-3 py-3">Company</th>
              <th className="w-[14%] px-3 py-3">Source</th>
              <th className="w-[14%] px-3 py-3">Est. Value</th>
              <th className="w-[12%] px-3 py-3">Status</th>
              <th className="w-[8%] px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#a0a0b0]">
                  No leads found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isPdfRunning = activeLambdaTask === `pdf-${lead.id}`;
                const isEmailRunning = activeLambdaTask === `email-${lead.id}`;

                return (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                    {/* Name & Contact */}
                    <td className="px-3 py-3 w-[30%]">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center font-extrabold text-white text-[11px] shadow-md shrink-0">
                          {lead.first_name[0]}{lead.last_name[0]}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="font-extrabold text-white text-xs truncate">
                            {lead.first_name} {lead.last_name}
                          </div>
                          <div className="text-[10px] font-mono space-y-0.5">
                            <div className="text-[#00d4ff] font-semibold truncate">
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="text-slate-800 dark:text-slate-200 font-extrabold truncate">
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-3 py-3 w-[22%]">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#a0a0b0] shrink-0" />
                        <span className="font-bold text-white text-xs truncate">{lead.company}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3 w-[14%]">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#161622] border border-white/10 text-[10px] text-[#a0a0b0] font-semibold truncate max-w-full">
                        {lead.source}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="px-3 py-3 w-[14%]">
                      <span className="font-mono font-extrabold text-[#00d4ff] text-xs truncate block" suppressHydrationWarning>
                        {formatCurrency(lead.estimated_value)}
                      </span>
                    </td>

                    {/* Status Selector */}
                    <td className="px-3 py-3 w-[12%]">
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className="bg-white dark:bg-[#12121a] border border-white/10 text-[11px] font-bold rounded-lg px-2 py-1 text-slate-900 dark:text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer w-full truncate"
                      >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="proposal">Proposal</option>
                          <option value="unqualified">Unqualified</option>
                        </select>
                      </td>

                      {/* AWS Lambda Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleRunPdfLambda(lead)}
                          disabled={Boolean(activeLambdaTask)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-[11px] font-semibold transition-all disabled:opacity-50"
                        >
                          {isPdfRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          <span>Generate PDF</span>
                        </button>

                        <button
                          onClick={() => handleRunEmailLambda(lead)}
                          disabled={Boolean(activeLambdaTask)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-white/10 hover:border-[#8b5cf6]/40 text-[11px] font-semibold transition-all disabled:opacity-50"
                        >
                          {isEmailRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          <span>Send Campaign</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-bold text-white text-base">Add New Lead</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Elena"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Vance"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="elena@company.com"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Pixeva Events"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: Number(e.target.value) })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Website">Website</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Inbound API">Inbound API</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
