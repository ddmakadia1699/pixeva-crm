'use client';

import React, { useState, useRef } from 'react';
import { Enquiry, EnquiryStatus, EnquirySource } from '@/lib/supabase/types';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Plus,
  FileUp,
  Download,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Tag,
  Cpu,
  X,
  Loader2,
  FileText,
  Trash2,
  Sparkles,
  ChevronDown,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface EnquiriesListTabProps {
  enquiries: Enquiry[];
  onAddEnquiry: (newEnquiry: Omit<Enquiry, 'id' | 'created_at'>) => void;
  onImportEnquiries: (imported: Omit<Enquiry, 'id' | 'created_at'>[]) => void;
  onUpdateStatus: (id: string, status: EnquiryStatus) => void;
  onDeleteEnquiry: (id: string) => void;
}

export default function EnquiriesListTab({
  enquiries,
  onAddEnquiry,
  onImportEnquiries,
  onUpdateStatus,
  onDeleteEnquiry,
}: EnquiriesListTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // AWS Lambda Runner state
  const [activeLambdaTask, setActiveLambdaTask] = useState<string | null>(null);
  const [lambdaResult, setLambdaResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    received_on: new Date().toISOString().slice(0, 10),
    venue: '',
    budget: '',
    guests: '',
    source: 'Instagram' as EnquirySource,
    status: 'New' as EnquiryStatus,
    event_details: '',
  });

  // CSV Drag State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredEnquiries = enquiries.filter((enq) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      enq.name.toLowerCase().includes(query) ||
      (enq.contact && enq.contact.toLowerCase().includes(query)) ||
      enq.email.toLowerCase().includes(query) ||
      (enq.event_name && enq.event_name.toLowerCase().includes(query)) ||
      (enq.venue && enq.venue.toLowerCase().includes(query)) ||
      (enq.phone && enq.phone.toLowerCase().includes(query));

    const matchesStatus = selectedStatus === 'all' || enq.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || enq.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedSource('all');
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;

    const rawBudget = formData.budget.replace(/[^0-9]/g, '');
    const numericBudget = rawBudget ? Number(rawBudget) : 200000;

    const emailVal = formData.email || (formData.contact.includes('@') ? formData.contact : `${formData.name.toLowerCase().replace(/\s+/g, '.')}@client.com`);
    const phoneVal = formData.contact.includes('@') ? '' : formData.contact;
    const eventNameVal = formData.venue ? `${formData.name}'s Event @ ${formData.venue}` : `${formData.name}'s Event`;

    onAddEnquiry({
      name: formData.name,
      contact: formData.contact,
      email: emailVal,
      phone: phoneVal,
      event_name: eventNameVal,
      event_type: 'wedding',
      event_date: formData.received_on,
      received_on: formData.received_on,
      venue: formData.venue,
      budget: formData.budget || '2,00,000',
      guests: formData.guests,
      estimated_budget: numericBudget,
      source: formData.source,
      status: formData.status,
      notes: formData.event_details,
      event_details: formData.event_details,
    });

    setFormData({
      name: '',
      contact: '',
      email: '',
      received_on: new Date().toISOString().slice(0, 10),
      venue: '',
      budget: '',
      guests: '',
      source: 'Instagram',
      status: 'New',
      event_details: '',
    });

    setIsAddModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredEnquiries.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Event Name', 'Event Type', 'Event Date', 'Budget', 'Source', 'Status', 'Created At'];
    const rows = filteredEnquiries.map((e) => [
      e.id,
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${e.event_name}"`,
      e.event_type,
      e.event_date || '',
      e.estimated_budget,
      `"${e.source}"`,
      e.status,
      e.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_Enquiries_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV Upload
  const handleProcessCsv = () => {
    if (!csvFile) return;
    setIsParsingCsv(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsed: Omit<Enquiry, 'id' | 'created_at'>[] = [];

      // Skip header if header line contains name/email
      const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3) {
          parsed.push({
            name: parts[0] || 'Imported Lead',
            email: parts[1] || 'lead@example.com',
            phone: parts[2] || '',
            event_name: parts[3] || 'Event Inquiry',
            event_type: (parts[4] as any) || 'wedding',
            event_date: parts[5] || '',
            estimated_budget: Number(parts[6]) || 12000,
            source: 'Landing Page',
            status: 'new',
            notes: 'Imported via CSV batch upload',
          });
        }
      }

      setTimeout(() => {
        onImportEnquiries(parsed);
        setIsParsingCsv(false);
        setImportedCount(parsed.length);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setCsvFile(null);
          setImportedCount(null);
        }, 1200);
      }, 500);
    };
    reader.readAsText(csvFile);
  };

  // Lambda execution
  const handleRunPdfLambda = async (enquiry: Enquiry) => {
    setActiveLambdaTask(`pdf-${enquiry.id}`);
    setLambdaResult(null);

    const res = await invokeLambdaFunction('pdf-generator-service', {
      dealId: enquiry.id,
      clientName: enquiry.name,
      company: enquiry.event_name,
      amount: enquiry.estimated_budget,
    });

    setActiveLambdaTask(null);
    setLambdaResult({
      type: 'pdf',
      name: enquiry.name,
      data: res,
    });
  };

  const handleRunEmailLambda = async (enquiry: Enquiry) => {
    setActiveLambdaTask(`email-${enquiry.id}`);
    setLambdaResult(null);

    const res = await invokeLambdaFunction('batch-email-service', {
      campaignName: 'Pixeva Instant Enquiry Nurture',
      recipients: [enquiry.email],
    });

    setActiveLambdaTask(null);
    setLambdaResult({
      type: 'email',
      name: enquiry.name,
      data: res,
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Lambda Toast Banner */}
      {lambdaResult && (
        <div className="p-4 rounded-2xl pixeva-card bg-[#12121a]/95 border border-[#00d4ff]/40 flex items-start justify-between animate-fadeIn shadow-2xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  AWS Lambda Execution [{lambdaResult.type.toUpperCase()}]
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-mono">
                  {lambdaResult.data.executionTimeMs}ms
                </span>
              </div>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Client: <span className="font-semibold text-white">{lambdaResult.name}</span> — {lambdaResult.data.payload.message}
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

      {/* Control Bar: Search, Filters & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              placeholder="Search name, contact, event…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]/60 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0b0] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#12121a] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-8 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="booked">Booked</option>
              <option value="unqualified">Unqualified</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#12121a] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-8 appearance-none"
            >
              <option value="all">All Sources</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Inbound API">Inbound API</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedSource !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#00d4ff] hover:underline flex items-center space-x-1 px-2 py-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredEnquiries.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Showing Counter & Table Header Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[#a0a0b0]">
        <div className="font-semibold">
          Showing <span className="text-white font-bold">{filteredEnquiries.length}</span> of{' '}
          <span className="text-white font-bold">{enquiries.length}</span>
        </div>
        <div className="text-[11px]">Actions Available</div>
      </div>

      {/* Data Table */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#a0a0b0]">
            <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-semibold border-b border-white/10 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Name & Contact</th>
                <th className="px-5 py-3.5">Event & Date</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Est. Budget</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#a0a0b0]">
                        <Search className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">No enquiries match your filters.</p>
                      <p className="text-xs text-[#a0a0b0]">
                        Try tweaking your search term or clearing active status and source filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] font-bold text-xs border border-[#00d4ff]/40 inline-flex items-center space-x-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const isPdfRunning = activeLambdaTask === `pdf-${enq.id}`;
                  const isEmailRunning = activeLambdaTask === `email-${enq.id}`;

                  return (
                    <tr key={enq.id} className="hover:bg-white/5 transition-colors group">
                      {/* Name & Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-xs shadow-md">
                            {enq.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                              <span>{enq.name}</span>
                            </div>
                            <div className="text-[11px] text-[#a0a0b0] font-mono flex items-center space-x-2 mt-0.5">
                              <span className="flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-[#a0a0b0]" />
                                <span>{enq.email}</span>
                              </span>
                              {enq.phone && (
                                <span className="flex items-center space-x-1 text-white/60">
                                  <Phone className="w-3 h-3 text-[#a0a0b0]" />
                                  <span>{enq.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event & Date */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs">{enq.event_name}</div>
                          <div className="flex items-center space-x-2 text-[10px] text-[#a0a0b0]">
                            <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10 font-semibold text-white">
                              {enq.event_type}
                            </span>
                            {enq.event_date && (
                              <span className="flex items-center space-x-1 font-mono text-white/70">
                                <Calendar className="w-3 h-3 text-[#00d4ff]" />
                                <span>{enq.event_date}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#161622] border border-white/10 text-[11px] text-[#a0a0b0] font-medium">
                          {enq.source}
                        </span>
                      </td>

                      {/* Est. Budget */}
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-[#00d4ff] text-xs">
                          {formatCurrency(enq.estimated_budget || 0)}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="px-5 py-4">
                        <select
                          value={enq.status}
                          onChange={(e) => onUpdateStatus(enq.id, e.target.value as EnquiryStatus)}
                          className={`border text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                            enq.status === 'new'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              : enq.status === 'contacted'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                              : enq.status === 'qualified'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : enq.status === 'proposal'
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                              : enq.status === 'booked'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          <option value="new" className="bg-[#12121a] text-white">New</option>
                          <option value="contacted" className="bg-[#12121a] text-white">Contacted</option>
                          <option value="qualified" className="bg-[#12121a] text-white">Qualified</option>
                          <option value="proposal" className="bg-[#12121a] text-white">Proposal</option>
                          <option value="booked" className="bg-[#12121a] text-white">Booked</option>
                          <option value="unqualified" className="bg-[#12121a] text-white">Unqualified</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleRunPdfLambda(enq)}
                          disabled={Boolean(activeLambdaTask)}
                          title="Generate PDF Proposal"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-xs transition-all disabled:opacity-50 inline-flex items-center"
                        >
                          {isPdfRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleRunEmailLambda(enq)}
                          disabled={Boolean(activeLambdaTask)}
                          title="Send Email Campaign"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-white/10 hover:border-[#8b5cf6]/40 text-xs transition-all disabled:opacity-50 inline-flex items-center"
                        >
                          {isEmailRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => onDeleteEnquiry(enq.id)}
                          title="Delete Enquiry"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs transition-all inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-lg">Add Enquiry</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name * & Contact * */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">
                    Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Client name"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">
                    Contact <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Phone or email"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Row 2: Email & Received On */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Received On</label>
                  <input
                    type="date"
                    value={formData.received_on}
                    onChange={(e) => setFormData({ ...formData, received_on: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Row 3: Venue & Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Venue"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 2,00,000"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              {/* Row 4: Guests & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Guests</label>
                  <input
                    type="text"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    placeholder="Guest count"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Instagram" className="bg-[#12121a]">Instagram</option>
                    <option value="Website" className="bg-[#12121a]">Website</option>
                    <option value="Landing Page" className="bg-[#12121a]">Landing Page</option>
                    <option value="Referral" className="bg-[#12121a]">Referral</option>
                    <option value="Google" className="bg-[#12121a]">Google</option>
                    <option value="WhatsApp" className="bg-[#12121a]">WhatsApp</option>
                    <option value="Facebook" className="bg-[#12121a]">Facebook</option>
                    <option value="Other" className="bg-[#12121a]">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Status */}
              <div>
                <label className="font-medium text-white block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="New" className="bg-[#12121a]">New</option>
                  <option value="Follow Up" className="bg-[#12121a]">Follow Up</option>
                  <option value="Meeting Fixed" className="bg-[#12121a]">Meeting Fixed</option>
                  <option value="Proposal Sent" className="bg-[#12121a]">Proposal Sent</option>
                  <option value="Booked" className="bg-[#12121a]">Booked</option>
                  <option value="Closed/Lost" className="bg-[#12121a]">Closed/Lost</option>
                </select>
              </div>

              {/* Row 6: Event Details */}
              <div>
                <label className="font-medium text-white block mb-1">Event Details</label>
                <textarea
                  rows={3}
                  value={formData.event_details}
                  onChange={(e) => setFormData({ ...formData, event_details: e.target.value })}
                  placeholder="Event type, date, notes…"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Add Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-[#8b5cf6]" />
                <h3 className="font-extrabold text-white text-base">Import CSV Enquiries</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#a0a0b0]">
                Upload a CSV file containing columns for <strong className="text-white">Name, Email, Phone, Event Name, Event Type, Date, Budget</strong>.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#00d4ff] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#0a0a0f]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCsvFile(e.target.files[0]);
                    }
                  }}
                />

                {importedCount !== null ? (
                  <div className="space-y-2 text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="w-8 h-8 mx-auto" />
                    <p className="font-bold text-sm">Successfully Imported {importedCount} Enquiries!</p>
                  </div>
                ) : csvFile ? (
                  <div className="space-y-1 text-white">
                    <FileText className="w-8 h-8 text-[#00d4ff] mx-auto" />
                    <p className="font-bold text-xs">{csvFile.name}</p>
                    <p className="text-[10px] text-[#a0a0b0]">{(csvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp className="w-8 h-8 text-[#a0a0b0] mx-auto" />
                    <p className="text-xs font-semibold text-white">Click or drag CSV file to upload</p>
                    <p className="text-[10px] text-[#a0a0b0]">Supports standard exported CSV formats</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!csvFile || isParsingCsv}
                  onClick={handleProcessCsv}
                  className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 disabled:opacity-50"
                >
                  {isParsingCsv && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Import Enquiries</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
