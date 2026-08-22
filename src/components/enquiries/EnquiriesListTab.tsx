'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
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
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Flame,
  Gem
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { openProposalPdfWindow } from '@/lib/pdf/generateProposalPdf';

interface EnquiriesListTabProps {
  enquiries: Enquiry[];
  onAddEnquiry: (newEnquiry: Omit<Enquiry, 'id' | 'created_at'>) => void;
  onImportEnquiries: (imported: Omit<Enquiry, 'id' | 'created_at'>[]) => void;
  onUpdateStatus: (id: string, status: EnquiryStatus) => void;
  onUpdateEnquiry?: (updated: Enquiry) => void;
  onDeleteEnquiry: (id: string) => void;
  onDeleteBatchEnquiries?: (ids: string[]) => void;
  onClearAllEnquiries?: () => void;
}

export default function EnquiriesListTab({
  enquiries,
  onAddEnquiry,
  onImportEnquiries,
  onUpdateStatus,
  onUpdateEnquiry,
  onDeleteEnquiry,
  onDeleteBatchEnquiries,
  onClearAllEnquiries,
}: EnquiriesListTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: () => {},
  });

  // AWS Lambda Runner state
  const [activeLambdaTask, setActiveLambdaTask] = useState<string | null>(null);
  const [lambdaResult, setLambdaResult] = useState<any>(null);

  // Add Form State
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

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    event_name: '',
    event_type: 'wedding',
    event_date: new Date().toISOString().slice(0, 10),
    venue: '',
    budget: '',
    source: 'Instagram' as EnquirySource,
    status: 'New' as EnquiryStatus,
    notes: '',
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

  // Checkbox Selection & Batch Delete
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEnquiries.length && filteredEnquiries.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnquiries.map((e) => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Enquiries',
      message: `Are you sure you want to delete ${selectedIds.length} selected enquiry item(s)? This action cannot be undone.`,
      confirmText: `Delete (${selectedIds.length})`,
      onConfirm: () => {
        if (onDeleteBatchEnquiries) {
          onDeleteBatchEnquiries(selectedIds);
        } else {
          selectedIds.forEach((id) => onDeleteEnquiry(id));
        }
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete All Enquiries',
      message: 'Are you sure you want to delete all enquiries from the list? This action will permanently remove all leads.',
      confirmText: 'Delete All',
      onConfirm: () => {
        if (onClearAllEnquiries) {
          onClearAllEnquiries();
        } else {
          enquiries.forEach((e) => onDeleteEnquiry(e.id));
        }
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedSource('all');
    setSelectedIds([]);
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

  // Open Edit Modal
  const handleOpenEdit = (enq: Enquiry) => {
    setEditingEnquiry(enq);
    const statusVal = enq.status ? (enq.status.toLowerCase() as EnquiryStatus) : 'new';
    setEditFormData({
      name: enq.name || '',
      contact: enq.contact || enq.phone || '',
      email: enq.email || '',
      phone: enq.phone || enq.contact || '',
      event_name: enq.event_name || '',
      event_type: enq.event_type || 'wedding',
      event_date: enq.event_date || enq.received_on || new Date().toISOString().slice(0, 10),
      venue: enq.venue || '',
      budget: enq.estimated_budget ? String(enq.estimated_budget) : (enq.budget || '200000'),
      source: (enq.source as EnquirySource) || 'Instagram',
      status: statusVal,
      notes: enq.notes || enq.event_details || '',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry || !editFormData.name) return;

    const rawBudget = editFormData.budget.replace(/[^0-9]/g, '');
    const numericBudget = rawBudget ? Number(rawBudget) : (editingEnquiry.estimated_budget || 200000);

    const updated: Enquiry = {
      ...editingEnquiry,
      name: editFormData.name,
      contact: editFormData.contact || editFormData.phone || editingEnquiry.contact,
      email: editFormData.email,
      phone: editFormData.phone || editFormData.contact,
      event_name: editFormData.event_name || `${editFormData.name}'s Event`,
      event_type: editFormData.event_type,
      event_date: editFormData.event_date,
      venue: editFormData.venue,
      budget: editFormData.budget,
      estimated_budget: numericBudget,
      source: editFormData.source,
      status: editFormData.status,
      notes: editFormData.notes,
      event_details: editFormData.notes,
    };

    if (onUpdateEnquiry) {
      onUpdateEnquiry(updated);
    }
    setIsEditModalOpen(false);
    setEditingEnquiry(null);
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

  // Lambda execution & PDF Proposal Generation
  const handleRunPdfLambda = async (enquiry: Enquiry) => {
    setActiveLambdaTask(`pdf-${enquiry.id}`);
    setLambdaResult(null);

    // Automatically generate and open the official studio PDF proposal window
    openProposalPdfWindow(enquiry);

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
      enquiry,
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

  // 1-Click WhatsApp Quick Quote & Proposal Dispatcher
  const handleSendWhatsAppQuote = (enquiry: Enquiry) => {
    const rawPhone = (enquiry.phone || enquiry.contact || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const proposalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/proposal/${enquiry.id}`
      : `https://pixeva.app/proposal/${enquiry.id}`;

    const formattedBudget = formatCurrency(enquiry.estimated_budget || 200000);
    const message = `Hi ${enquiry.name}! 👋 Thank you for reaching out to Pixeva Studio for your ${enquiry.event_name || 'upcoming shoot'}.\n\n✨ We have prepared your custom photography & cinematography package proposal (${formattedBudget}).\n\n📱 View your interactive live proposal, 4K video teaser & contract here:\n${proposalUrl}\n\nFeel free to message us back here if you'd like to customize any deliverable!`;

    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Lambda / PDF Toast Banner */}
      {lambdaResult && (
        <div className="p-4 rounded-2xl pixeva-card bg-[#12121a]/95 border border-[#00d4ff]/40 flex items-start justify-between animate-fadeIn shadow-2xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lambdaResult.type === 'pdf' ? 'PDF Proposal Generated & Opened' : `AWS Lambda Execution [${lambdaResult.type.toUpperCase()}]`}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] font-mono">
                  {lambdaResult.data?.executionTimeMs || 45}ms
                </span>
              </div>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Client: <span className="font-semibold text-white">{lambdaResult.name}</span> — Official Photography & Cinematography proposal created.
              </p>
              {lambdaResult.enquiry && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openProposalPdfWindow(lambdaResult.enquiry)}
                    className="btn-pixeva-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View / Print Proposal PDF</span>
                  </button>
                </div>
              )}
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

      {/* Control Bar: Search, Filters & Action Buttons - Strictly One Single Line */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-0.5">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Search Box */}
          <div className="relative w-48 sm:w-56 lg:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
            <input
              type="text"
              placeholder="Search name, contact, event…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]/60 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0a0b0] hover:text-white"
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
              className="bg-[#12121a] border border-white/10 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer appearance-none"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="booked">Booked</option>
              <option value="unqualified">Unqualified</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#12121a] border border-white/10 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer appearance-none"
            >
              <option value="all">All Sources</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Inbound API">Inbound API</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedSource !== 'all') && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 rounded-xl bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 transition-all shrink-0 flex items-center justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-all animate-fadeIn whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          {enquiries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all whitespace-nowrap"
              title="Delete all enquiries from list"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all whitespace-nowrap"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredEnquiries.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Showing Counter & Table Header Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-[#a0a0b0]">
        <div className="font-semibold flex items-center space-x-2">
          <span>
            Showing <span className="text-white font-bold">{filteredEnquiries.length}</span> of{' '}
            <span className="text-white font-bold">{enquiries.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-[#00d4ff] font-bold">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>
        <div className="text-[11px]">Actions Available</div>
      </div>

      {/* Data Table */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-x-auto shadow-card w-full">
        <table className="w-full text-left text-xs text-[#a0a0b0] min-w-[950px]">
          <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredEnquiries.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                  title="Select all"
                />
              </th>
              <th className="w-[25%] min-w-[200px] px-3 py-3">Name & Contact</th>
              <th className="w-[22%] min-w-[170px] px-3 py-3">Event & Date</th>
              <th className="w-[12%] min-w-[100px] px-3 py-3">Source</th>
              <th className="w-[12%] min-w-[100px] px-3 py-3">Est. Budget</th>
              <th className="w-[16%] min-w-[130px] px-3 py-3">Status</th>
              <th className="w-[13%] min-w-[120px] px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
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
                const isSelected = selectedIds.includes(enq.id);

                return (
                  <tr
                    key={enq.id}
                    onClick={() => handleOpenEdit(enq)}
                    className={`hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-[#00d4ff]/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(enq.id)}
                        className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    {/* Name & Contact */}
                    <td className="px-3 py-3 w-[27%]">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                          <span className="font-extrabold text-white text-xs truncate group-hover:text-[#00d4ff] transition-colors" title={enq.name}>
                            {enq.name}
                          </span>
                          {(enq.estimated_budget || 0) >= 200000 ? (
                            <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                              <Gem className="w-2.5 h-2.5 text-amber-400 mr-1" />
                              <span>VIP</span>
                            </span>
                          ) : (enq.estimated_budget || 0) >= 100000 || enq.status === 'proposal' ? (
                            <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs">
                              <Flame className="w-2.5 h-2.5 text-rose-400 mr-1" />
                              <span>Hot Lead</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[10px] font-mono space-y-0.5">
                          <div className="flex items-center space-x-1 text-[#00d4ff] font-semibold truncate">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{enq.email}</span>
                          </div>
                          {enq.phone && (
                            <div className="flex items-center space-x-1 text-slate-800 dark:text-slate-200 font-extrabold truncate">
                              <Phone className="w-3 h-3 shrink-0 text-[#8b5cf6]" />
                              <span className="truncate">{enq.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Event & Date */}
                    <td className="px-3 py-3 w-[23%]">
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-white text-xs truncate" title={enq.event_name}>
                          {enq.event_name}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] truncate">
                          <span className="capitalize px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-bold text-white shrink-0">
                            {enq.event_type}
                          </span>
                          {enq.event_date && (
                            <span className="flex items-center space-x-1 font-mono text-[#00d4ff] font-bold truncate">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span className="truncate">{enq.event_date}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3 w-[12%]">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#161622] border border-white/10 text-[10px] text-[#a0a0b0] font-semibold truncate max-w-full">
                        {enq.source}
                      </span>
                    </td>

                    {/* Est. Budget */}
                    <td className="px-3 py-3 w-[12%]">
                      <span className="font-mono font-extrabold text-[#00d4ff] text-xs truncate block">
                        {formatCurrency(enq.estimated_budget || 0)}
                      </span>
                    </td>

                    {/* Status Selector */}
                    <td className="px-3 py-3 w-[15%]" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={enq.status}
                        onChange={(e) => onUpdateStatus(enq.id, e.target.value as EnquiryStatus)}
                        className={`border text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer w-full transition-all truncate ${
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
                        <option value="new" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">New</option>
                        <option value="contacted" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">Contacted</option>
                        <option value="qualified" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">Qualified</option>
                        <option value="proposal" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">Proposal</option>
                        <option value="booked" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">Booked</option>
                        <option value="unqualified" className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">Unqualified</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 w-[15%] text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {/* 1-Click WhatsApp Quick Quote & Proposal */}
                        <button
                          onClick={() => handleSendWhatsAppQuote(enq)}
                          title="Send 1-Click WhatsApp Quote & Proposal Link"
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs transition-all shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* View Live Client Proposal */}
                        <Link
                          href={`/proposal/${enq.id}`}
                          target="_blank"
                          title="Open Live Interactive Client Proposal"
                          className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 text-xs transition-all shadow-xs inline-flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* PDF Proposal */}
                        <button
                          onClick={() => handleRunPdfLambda(enq)}
                          disabled={Boolean(activeLambdaTask)}
                          title="Generate PDF Proposal"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-xs transition-all disabled:opacity-50"
                        >
                          {isPdfRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        </button>

                        {/* Email Campaign */}
                        <button
                          onClick={() => handleRunEmailLambda(enq)}
                          disabled={Boolean(activeLambdaTask)}
                          title="Send Email Campaign"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-white/10 hover:border-[#8b5cf6]/40 text-xs transition-all disabled:opacity-50"
                        >
                          {isEmailRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Delete Enquiry',
                              message: `Are you sure you want to delete the enquiry for "${enq.name}"? This action cannot be undone.`,
                              confirmText: 'Delete',
                              onConfirm: () => {
                                onDeleteEnquiry(enq.id);
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          title="Delete Enquiry"
                          className="p-1.5 rounded-lg bg-[#12121a] hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.received_on}
                      onChange={(e) => setFormData({ ...formData, received_on: e.target.value })}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff] [color-scheme:dark]"
                    />
                    <Calendar className="w-4 h-4 text-[#00d4ff] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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

      {/* Edit Enquiry Modal */}
      {isEditModalOpen && editingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#12121a] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Edit Lead Details</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-500/30 uppercase">
                    {editFormData.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update client contact, event scope, budget, and sales pipeline stage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEnquiry(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Strip inside Edit Modal */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] mr-1">Quick Actions:</span>
              
              <button
                type="button"
                onClick={() => handleSendWhatsAppQuote(editingEnquiry)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Quote</span>
              </button>

              <Link
                href={`/proposal/${editingEnquiry.id}`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30 flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Proposal</span>
              </Link>

              <button
                type="button"
                onClick={() => handleRunPdfLambda(editingEnquiry)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30 flex items-center space-x-1.5 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Proposal</span>
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Contact / Phone Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || editFormData.contact}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value, contact: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 2: Email & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Venue / Shoot Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.venue}
                    onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                    placeholder="e.g. Taj Lake Palace, Udaipur"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 3: Event Name & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Event Title / Description
                  </label>
                  <input
                    type="text"
                    value={editFormData.event_name}
                    onChange={(e) => setEditFormData({ ...editFormData, event_name: e.target.value })}
                    placeholder="e.g. Wedding & Sangeet"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={editFormData.event_type}
                    onChange={(e) => setEditFormData({ ...editFormData, event_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="wedding">Wedding Shoot</option>
                    <option value="pre-wedding">Pre-Wedding / Engagement</option>
                    <option value="reception">Reception / Gala</option>
                    <option value="corporate">Corporate Shoot</option>
                    <option value="commercial">Fashion / Commercial</option>
                    <option value="birthday">Birthday / Private Party</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Event Date & Estimated Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.event_date}
                    onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Estimated Budget (₹ / $)
                  </label>
                  <input
                    type="text"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                    placeholder="e.g. 200000"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Row 5: Source & Pipeline Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value as EnquirySource })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Referral">Referral</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Inbound API">Inbound API</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Sales Status Pipeline
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as EnquiryStatus })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 cursor-pointer font-bold"
                  >
                    <option value="new">New (Fresh Lead)</option>
                    <option value="contacted">Contacted (WhatsApp/Call)</option>
                    <option value="qualified">Qualified (Date & Budget Match)</option>
                    <option value="proposal">Proposal (Quote Sent)</option>
                    <option value="booked">Booked (Deposit Paid)</option>
                    <option value="unqualified">Unqualified</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Notes */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Client Requirements / Production Notes
                </label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Special client requests, drone permits, extra coverage hours, etc."
                  className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (editingEnquiry) {
                      const idToDelete = editingEnquiry.id;
                      setIsEditModalOpen(false);
                      setEditingEnquiry(null);
                      setConfirmModal({
                        isOpen: true,
                        title: 'Delete Enquiry',
                        message: `Are you sure you want to delete the enquiry for "${editFormData.name}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        onConfirm: () => {
                          onDeleteEnquiry(idToDelete);
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center space-x-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Enquiry</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEnquiry(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pixeva-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Delete'}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
