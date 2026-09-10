'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Enquiry, EnquiryStatus, EnquirySource } from '@/lib/supabase/types';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { useCurrency } from '@/context/CurrencyContext';
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
  Gem,
  AlertCircle,
  User,
  UserPlus,
  MapPin,
  Users,
  FileSpreadsheet
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
  const { formatCurrency, currency } = useCurrency();
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
    itemName?: string;
    itemType?: string;
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

  // Add Form State & Validations
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Close Modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
        if (isEditModalOpen) setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isImportModalOpen, isEditModalOpen]);

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
      itemName: `${selectedIds.length} Selected Enquiries`,
      itemType: 'Batch Leads',
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
      message: 'Are you sure you want to delete all enquiries? This action cannot be undone.',
      confirmText: 'Delete All',
      itemName: `${enquiries.length} Total Enquiries`,
      itemType: 'All Leads',
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

  // Validation helper
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Client name is required';
        if (trimmed.length < 2) return 'Name must be at least 2 characters';
        if (!/[a-zA-Z]/.test(trimmed)) return 'Name must contain letters';
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Email address is required';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) return 'Enter a valid email address (e.g. client@example.com)';
        return '';
      }
      case 'contact': {
        const trimmed = value.trim();
        if (!trimmed) return 'Phone number is required';
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          return 'Enter a valid phone number (7-15 digits, e.g. +91 98765 43210)';
        }
        return '';
      }
      case 'received_on': {
        if (!value) return 'Event date is required';
        return '';
      }
      case 'budget': {
        if (value.trim()) {
          const raw = value.replace(/[^0-9]/g, '');
          if (!raw || Number(raw) <= 0) return 'Budget must be a positive amount';
        }
        return '';
      }
      case 'guests': {
        if (value.trim()) {
          const raw = value.replace(/[^0-9]/g, '');
          if (!raw || Number(raw) <= 0) return 'Guest count must be a positive number';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const validateAll = (data: typeof formData) => {
    const errors: Record<string, string> = {};
    const nameErr = validateField('name', data.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateField('email', data.email);
    if (emailErr) errors.email = emailErr;

    const contactErr = validateField('contact', data.contact);
    if (contactErr) errors.contact = contactErr;

    const dateErr = validateField('received_on', data.received_on);
    if (dateErr) errors.received_on = dateErr;

    const budgetErr = validateField('budget', data.budget);
    if (budgetErr) errors.budget = budgetErr;

    const guestsErr = validateField('guests', data.guests);
    if (guestsErr) errors.guests = guestsErr;

    return errors;
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formTouched[field]) {
      const err = validateField(field, value);
      setFormErrors((prev) => {
        const updated = { ...prev };
        if (err) updated[field] = err;
        else delete updated[field];
        return updated;
      });
    }
  };

  const handleFieldBlur = (field: string) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, (formData as any)[field] || '');
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const handleOpenAddModal = () => {
    setFormErrors({});
    setFormTouched({});
    setIsAddModalOpen(true);
  };

  // Add Submit with strict validation
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark required fields as touched
    setFormTouched({
      name: true,
      email: true,
      contact: true,
      received_on: true,
      budget: true,
      guests: true,
    });

    const errors = validateAll(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      const el = document.getElementById(`enquiry-input-${firstKey}`);
      if (el) el.focus();
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const rawBudget = formData.budget.replace(/[^0-9]/g, '');
      const numericBudget = rawBudget ? Number(rawBudget) : 200000;

      const emailVal = formData.email.trim();
      const phoneVal = formData.contact.trim();
      const eventNameVal = formData.venue.trim()
        ? `${formData.name.trim()}'s Event @ ${formData.venue.trim()}`
        : `${formData.name.trim()}'s Event`;

      await onAddEnquiry({
        name: formData.name.trim(),
        contact: phoneVal,
        email: emailVal,
        phone: phoneVal,
        event_name: eventNameVal,
        event_type: 'wedding',
        event_date: formData.received_on,
        received_on: formData.received_on,
        venue: formData.venue.trim(),
        budget: formData.budget.trim() || '2,00,000',
        guests: formData.guests.trim(),
        estimated_budget: numericBudget,
        source: formData.source,
        status: formData.status,
        notes: formData.event_details.trim(),
        event_details: formData.event_details.trim(),
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
      setFormErrors({});
      setFormTouched({});
      setIsAddModalOpen(false);
    } finally {
      setIsSubmittingAdd(false);
    }
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

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Event Name',
      'Event Type',
      'Date',
      'Budget',
      'Venue',
      'Guests',
      'Source'
    ];

    const sampleRows = [
      [
        '"Sophia Reynolds"',
        '"sophia.reynolds@example.com"',
        '"+1 (555) 234-5678"',
        '"Reynolds Luxury Wedding"',
        '"wedding"',
        '"2026-11-20"',
        '450000',
        '"The Plaza Hotel, New York"',
        '"350"',
        '"Instagram"'
      ],
      [
        '"Liam & Emma Chen"',
        '"liam.chen@techsummit.io"',
        '"+1 (555) 987-6543"',
        '"Tech Leaders Gala 2026"',
        '"corporate"',
        '"2026-10-15"',
        '280000',
        '"Metropolitan Convention Center"',
        '"500"',
        '"Website"'
      ],
      [
        '"Aarav & Diya Patel"',
        '"aarav.patel@gmail.com"',
        '"+91 98765 43210"',
        '"Patel & Sharma Royal Sangeet"',
        '"wedding"',
        '"2026-12-05"',
        '550000',
        '"Umaid Bhawan Palace, Jodhpur"',
        '"400"',
        '"Referral"'
      ]
    ];

    const csvContent = [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Pixeva_Enquiry_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process CSV Upload
  const handleProcessCsv = () => {
    if (!csvFile) return;
    setIsParsingCsv(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const parsed: Omit<Enquiry, 'id' | 'created_at'>[] = [];

      if (lines.length === 0) {
        setIsParsingCsv(false);
        return;
      }

      // Detect header columns
      const headerParts = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
      const hasHeader = headerParts.some((h) => h.includes('name') || h.includes('email') || h.includes('phone'));

      const getColIndex = (keywords: string[], fallbackIdx: number) => {
        if (!hasHeader) return fallbackIdx;
        const idx = headerParts.findIndex((h) => keywords.some((k) => h.includes(k)));
        return idx !== -1 ? idx : fallbackIdx;
      };

      const nameIdx = getColIndex(['name', 'client'], 0);
      const emailIdx = getColIndex(['email', 'mail'], 1);
      const phoneIdx = getColIndex(['phone', 'contact', 'mobile', 'whatsapp'], 2);
      const eventNameIdx = getColIndex(['event name', 'event_name', 'event title', 'title'], 3);
      const eventTypeIdx = getColIndex(['event type', 'event_type', 'type'], 4);
      const dateIdx = getColIndex(['date', 'received', 'event date'], 5);
      const budgetIdx = getColIndex(['budget', 'amount', 'value', 'price'], 6);
      const venueIdx = getColIndex(['venue', 'location', 'place'], 7);
      const guestsIdx = getColIndex(['guest', 'people', 'pax'], 8);
      const sourceIdx = getColIndex(['source', 'channel'], 9);

      const startIndex = hasHeader ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const rawLine = lines[i];
        const parts: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let c = 0; c < rawLine.length; c++) {
          const char = rawLine[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        parts.push(cur.trim());

        const name = (parts[nameIdx] || '').replace(/^"|"$/g, '').trim();
        const email = (parts[emailIdx] || '').replace(/^"|"$/g, '').trim();

        if (name || email) {
          const phone = (parts[phoneIdx] || '').replace(/^"|"$/g, '').trim();
          const venue = (parts[venueIdx] || '').replace(/^"|"$/g, '').trim();
          const budgetRaw = (parts[budgetIdx] || '').replace(/[^0-9]/g, '');
          const eventName = (parts[eventNameIdx] || '').replace(/^"|"$/g, '').trim() || (name ? `${name}'s Event` : 'Event Enquiry');
          const eventType = (parts[eventTypeIdx] || 'wedding').replace(/^"|"$/g, '').trim();
          const eventDate = (parts[dateIdx] || '').replace(/^"|"$/g, '').trim() || new Date().toISOString().slice(0, 10);
          const guests = (parts[guestsIdx] || '').replace(/^"|"$/g, '').trim();
          const source = (parts[sourceIdx] || 'Imported').replace(/^"|"$/g, '').trim() as EnquirySource;

          parsed.push({
            name: name || 'Imported Client',
            contact: phone || email,
            email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
            phone: phone,
            event_name: venue ? `${eventName} @ ${venue}` : eventName,
            event_type: eventType,
            event_date: eventDate,
            received_on: eventDate,
            venue: venue,
            budget: budgetRaw ? Number(budgetRaw).toLocaleString('en-IN') : '2,00,000',
            guests: guests,
            estimated_budget: budgetRaw ? Number(budgetRaw) : 200000,
            source: source || 'Website',
            status: 'New',
            notes: 'Imported via CSV template batch upload',
            event_details: venue ? `Venue: ${venue}. Guests: ${guests || 'N/A'}` : '',
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
    <div className="space-y-4 animate-fadeIn">
      {/* Lambda / PDF Toast Banner */}
      {lambdaResult && (
        <div className="p-3.5 rounded-xl pixeva-card bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/10 flex items-start justify-between animate-fadeIn shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/30">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  {lambdaResult.type === 'pdf' ? 'PDF Proposal Generated & Opened' : `AWS Lambda Execution [${lambdaResult.type.toUpperCase()}]`}
                </h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                  {lambdaResult.data?.executionTimeMs || 45}ms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Client: <span className="font-semibold text-slate-900 dark:text-white">{lambdaResult.name}</span> — Official Photography & Cinematography proposal created.
              </p>
              {lambdaResult.enquiry && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openProposalPdfWindow(lambdaResult.enquiry)}
                    className="btn-pixeva-primary px-3 py-1 text-xs flex items-center space-x-1.5"
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
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters & Action Buttons */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-0.5">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Search Box */}
          <div className="relative w-48 sm:w-56 lg:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, contact, event…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
              className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-white/10 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="booked">Booked</option>
              <option value="unqualified">Unqualified</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-white/10 text-xs font-medium rounded-lg pl-3 pr-7 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">All Sources</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Inbound API">Inbound API</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedSource !== 'all') && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all shrink-0 flex items-center justify-center cursor-pointer"
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
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all animate-fadeIn whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          {enquiries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200 transition-all whitespace-nowrap cursor-pointer"
              title="Delete all enquiries from list"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Enquiry</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-pixeva-secondary flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredEnquiries.length === 0}
            className="btn-pixeva-secondary flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Showing Counter & Table Header Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="font-medium flex items-center space-x-2">
          <span>
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredEnquiries.length}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-bold">{enquiries.length}</span>
          </span>
          {selectedIds.length > 0 && (
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400">Actions Available</div>
      </div>

      {/* Data Table */}
      <div className="pixeva-card rounded-xl border border-slate-200/80 dark:border-white/10 overflow-x-auto shadow-subtle w-full">
        <table className="w-full text-left text-xs min-w-[950px]">
          <thead className="bg-slate-50/90 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/10 text-[10px]">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredEnquiries.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
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
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">No enquiries match your filters.</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try tweaking your search term or clearing active status and source filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="btn-pixeva-secondary text-xs px-3 py-1.5 space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Clear Filters</span>
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
                    className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(enq.id)}
                        className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    {/* Name & Contact */}
                    <td className="px-3 py-3 w-[27%]">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={enq.name}>
                            {enq.name}
                          </span>
                          {(enq.estimated_budget || 0) >= 200000 ? (
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/40">
                              <Gem className="w-2.5 h-2.5 mr-0.5" />
                              <span>VIP</span>
                            </span>
                          ) : (enq.estimated_budget || 0) >= 100000 || enq.status === 'proposal' ? (
                            <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/40">
                              <Flame className="w-2.5 h-2.5 mr-0.5" />
                              <span>Hot Lead</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                          <div className="flex items-center space-x-1 truncate">
                            <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="truncate">{enq.email}</span>
                          </div>
                          {enq.phone && (
                            <div className="flex items-center space-x-1 truncate text-slate-600 dark:text-slate-300 font-medium">
                              <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{enq.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Event & Date */}
                    <td className="px-3 py-3 w-[23%]">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs truncate" title={enq.event_name}>
                          {enq.event_name}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] truncate text-slate-500 dark:text-slate-400">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 font-medium text-slate-700 dark:text-slate-300 shrink-0">
                            {enq.event_type}
                          </span>
                          {enq.event_date && (
                            <span className="flex items-center space-x-1 font-mono truncate">
                              <Calendar className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{enq.event_date}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-3 py-3 w-[12%]">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-full">
                        {enq.source}
                      </span>
                    </td>

                    {/* Est. Budget */}
                    <td className="px-3 py-3 w-[12%]">
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                        {formatCurrency(enq.estimated_budget || 0)}
                      </span>
                    </td>

                    {/* Status Selector */}
                    <td className="px-3 py-3 w-[15%]" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={enq.status}
                        onChange={(e) => onUpdateStatus(enq.id, e.target.value as EnquiryStatus)}
                        className={`border text-[11px] font-medium rounded-md px-2 py-1 focus:outline-none cursor-pointer w-full transition-all truncate ${
                          enq.status === 'new'
                            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            : enq.status === 'contacted'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30'
                            : enq.status === 'qualified'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                            : enq.status === 'proposal'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30'
                            : enq.status === 'booked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                        }`}
                      >
                        <option value="new" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">New</option>
                        <option value="contacted" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Contacted</option>
                        <option value="qualified" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Qualified</option>
                        <option value="proposal" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Proposal</option>
                        <option value="booked" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Booked</option>
                        <option value="unqualified" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Unqualified</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 w-[15%] text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {/* 1-Click WhatsApp Quick Quote */}
                        <button
                          onClick={() => handleSendWhatsAppQuote(enq)}
                          title="Send 1-Click WhatsApp Quote & Proposal Link"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* View Live Client Proposal */}
                        <Link
                          href={`/proposal/${enq.id}`}
                          target="_blank"
                          title="Open Live Interactive Client Proposal"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors inline-flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* AWS Lambda Microservice Trigger */}
                        <button
                          onClick={() => handleRunPdfLambda(enq)}
                          disabled={isPdfRunning}
                          title="Trigger AWS Lambda PDF Generator Microservice"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <FileText className={`w-3.5 h-3.5 ${isPdfRunning ? 'animate-spin text-blue-600' : ''}`} />
                        </button>

                        {/* AWS Lambda Batch Email Trigger */}
                        <button
                          onClick={() => handleRunEmailLambda(enq)}
                          disabled={Boolean(activeLambdaTask)}
                          title="Send Email Campaign"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
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
                              confirmText: 'Delete Lead',
                              itemName: enq.name,
                              itemType: `${enq.event_type || 'Event'} Enquiry`,
                              onConfirm: () => {
                                onDeleteEnquiry(enq.id);
                                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          title="Delete Enquiry"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl bg-white dark:bg-[#0c1222] text-slate-900 dark:text-white border border-slate-200/90 dark:border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden relative animate-scaleUp max-h-[92vh] flex flex-col">
            {/* Top Ambient Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/15 dark:bg-blue-600/20 blur-3xl pointer-events-none rounded-full" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                      Add New Enquiry
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Cloud Pipeline
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Register incoming lead with live validation & cloud sync
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close dialog (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              id="add-enquiry-form"
              onSubmit={handleAddSubmit}
              noValidate
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Scrollable Fields */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs custom-scrollbar">
                {/* Section 1: Client Contact */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                    <User className="w-3.5 h-3.5" />
                    <span>Client Contact Information</span>
                  </div>

                  {/* Name Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="enquiry-input-name"
                        className="font-semibold text-slate-700 dark:text-slate-200 text-xs"
                      >
                        Client Full Name <span className="text-rose-500">*</span>
                      </label>
                      {formTouched.name && !formErrors.name && formData.name.trim() && (
                        <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="enquiry-input-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => handleFieldBlur('name')}
                        placeholder="e.g. Samantha Reynolds"
                        className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                          formTouched.name && formErrors.name
                            ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                            : formTouched.name && !formErrors.name && formData.name.trim()
                            ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                            : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                        } rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2`}
                      />
                      {formTouched.name && formErrors.name && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {formTouched.name && formErrors.name && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{formErrors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Grid: Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="enquiry-input-email"
                          className="font-semibold text-slate-700 dark:text-slate-200 text-xs"
                        >
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        {formTouched.email && !formErrors.email && formData.email.trim() && (
                          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="enquiry-input-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onBlur={() => handleFieldBlur('email')}
                          placeholder="client@domain.com"
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                            formTouched.email && formErrors.email
                              ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                              : formTouched.email && !formErrors.email && formData.email.trim()
                              ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                          } rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2`}
                        />
                        {formTouched.email && formErrors.email && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {formTouched.email && formErrors.email && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone / Contact Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="enquiry-input-contact"
                          className="font-semibold text-slate-700 dark:text-slate-200 text-xs"
                        >
                          Phone / WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        {formTouched.contact && !formErrors.contact && formData.contact.trim() && (
                          <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="enquiry-input-contact"
                          type="tel"
                          value={formData.contact}
                          onChange={(e) => handleFieldChange('contact', e.target.value)}
                          onBlur={() => handleFieldBlur('contact')}
                          placeholder="+91 98765 43210"
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                            formTouched.contact && formErrors.contact
                              ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                              : formTouched.contact && !formErrors.contact && formData.contact.trim()
                              ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
                              : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                          } rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2`}
                        />
                        {formTouched.contact && formErrors.contact && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {formTouched.contact && formErrors.contact && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.contact}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Event & Financial Scope */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event & Shoot Specifications</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Event Date */}
                    <div>
                      <label
                        htmlFor="enquiry-input-received_on"
                        className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5"
                      >
                        Shoot / Event Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          id="enquiry-input-received_on"
                          type="date"
                          value={formData.received_on}
                          onChange={(e) => handleFieldChange('received_on', e.target.value)}
                          onBlur={() => handleFieldBlur('received_on')}
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                            formTouched.received_on && formErrors.received_on
                              ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                              : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                          } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2`}
                        />
                      </div>
                      {formTouched.received_on && formErrors.received_on && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.received_on}</span>
                        </p>
                      )}
                    </div>

                    {/* Venue */}
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                        Venue / Shoot Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={formData.venue}
                          onChange={(e) => handleFieldChange('venue', e.target.value)}
                          placeholder="e.g. Taj Lake Palace, Udaipur"
                          className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Budget */}
                    <div>
                      <label
                        htmlFor="enquiry-input-budget"
                        className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5"
                      >
                        Estimated Budget
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                          id="enquiry-input-budget"
                          type="text"
                          value={formData.budget}
                          onChange={(e) => handleFieldChange('budget', e.target.value)}
                          onBlur={() => handleFieldBlur('budget')}
                          placeholder="e.g. 2,50,000 or $3,500"
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                            formTouched.budget && formErrors.budget
                              ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                              : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                          } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2`}
                        />
                      </div>
                      {formTouched.budget && formErrors.budget && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.budget}</span>
                        </p>
                      )}
                    </div>

                    {/* Guests */}
                    <div>
                      <label
                        htmlFor="enquiry-input-guests"
                        className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5"
                      >
                        Expected Guest Count
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          id="enquiry-input-guests"
                          type="text"
                          value={formData.guests}
                          onChange={(e) => handleFieldChange('guests', e.target.value)}
                          onBlur={() => handleFieldBlur('guests')}
                          placeholder="e.g. 250"
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${
                            formTouched.guests && formErrors.guests
                              ? 'border-rose-500/80 bg-rose-50/10 focus:ring-rose-500/20 focus:border-rose-500'
                              : 'border-slate-200/80 dark:border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
                          } rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2`}
                        />
                      </div>
                      {formTouched.guests && formErrors.guests && (
                        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500 mt-1.5 animate-fadeIn">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.guests}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Pipeline & Notes */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Pipeline Routing & Scope</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Source */}
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                        Lead Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => handleFieldChange('source', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <option value="Instagram">📸 Instagram</option>
                        <option value="Website">🌐 Website</option>
                        <option value="Landing Page">🚀 Landing Page</option>
                        <option value="Referral">🤝 Referral / Word of Mouth</option>
                        <option value="Google">🔍 Google Search</option>
                        <option value="WhatsApp">💬 WhatsApp Direct</option>
                        <option value="Facebook">📘 Facebook</option>
                        <option value="Other">✨ Other</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                        Initial Pipeline Stage
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <option value="New">✨ New Lead</option>
                        <option value="Follow Up">⏳ Follow Up</option>
                        <option value="Meeting Fixed">📅 Meeting Fixed</option>
                        <option value="Proposal Sent">📄 Proposal Sent</option>
                        <option value="Booked">🎉 Booked</option>
                        <option value="Closed/Lost">❌ Closed / Lost</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                      Event Scope & Client Notes
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={formData.event_details}
                        onChange={(e) => handleFieldChange('event_details', e.target.value)}
                        placeholder="Special requirements, package requests, shoot timing, ceremony notes…"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-[#0c1222]/95 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>Validated & scoped for AWS API Gateway & Supabase</span>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmittingAdd}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdd}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingAdd ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsImportModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1222] text-slate-900 dark:text-white border border-slate-200/90 dark:border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden relative animate-scaleUp">
            {/* Top Ambient Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/15 blur-3xl pointer-events-none rounded-full" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                      Import CSV Enquiries
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Batch Pipeline
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload multiple client leads via standardized spreadsheet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close dialog (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Download CSV Template Callout Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 dark:from-blue-950/40 dark:via-[#0f172a] dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-500/30 shadow-xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Need the standard CSV format?
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Download our template with pre-filled sample rows
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-download-csv-template"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-blue-200 dark:border-blue-500/40 shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  title="Download ready-to-use CSV template"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Drag & Drop File Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed ${
                  csvFile
                    ? 'border-blue-500/60 bg-blue-50/30 dark:bg-blue-950/20'
                    : 'border-slate-200/90 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-white/[0.02]'
                } rounded-2xl p-6 text-center cursor-pointer transition-all`}
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
                  <div className="space-y-2 text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="w-9 h-9 mx-auto" />
                    <p className="font-bold text-sm">Successfully Imported {importedCount} Enquiries!</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Leads are saved and synced to your cloud database.</p>
                  </div>
                ) : csvFile ? (
                  <div className="space-y-2 text-slate-900 dark:text-white animate-scaleUp">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{csvFile.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{(csvFile.size / 1024).toFixed(1)} KB • Ready to parse</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCsvFile(null);
                      }}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer inline-block"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Click or drag & drop CSV file here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports standard CSV files (.csv) up to 10 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Columns Guide */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Recognized Template Columns:
                </p>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {['Name *', 'Email *', 'Phone', 'Event Name', 'Event Type', 'Date', 'Budget', 'Venue', 'Guests', 'Source'].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono border border-slate-200/80 dark:border-white/5"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span>Cloud auto-sync enabled</span>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setCsvFile(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!csvFile || isParsingCsv}
                    onClick={handleProcessCsv}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isParsingCsv ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing CSV...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Import Enquiries</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enquiry Modal */}
      {isEditModalOpen && editingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 pb-3.5">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Lead Details</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 uppercase">
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Strip inside Edit Modal */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px] mr-1">Quick Actions:</span>
              
              <button
                type="button"
                onClick={() => handleSendWhatsAppQuote(editingEnquiry)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 font-medium border border-emerald-200/60 flex items-center space-x-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Quote</span>
              </button>

              <Link
                href={`/proposal/${editingEnquiry.id}`}
                target="_blank"
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 font-medium border border-blue-200/60 flex items-center space-x-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Proposal</span>
              </Link>

              <button
                type="button"
                onClick={() => handleRunPdfLambda(editingEnquiry)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white font-medium border border-slate-200 flex items-center space-x-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Proposal</span>
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Contact / Phone Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || editFormData.contact}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value, contact: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Email & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Venue / Shoot Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.venue}
                    onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                    placeholder="e.g. Taj Lake Palace, Udaipur"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Event Name & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Event Title / Description
                  </label>
                  <input
                    type="text"
                    value={editFormData.event_name}
                    onChange={(e) => setEditFormData({ ...editFormData, event_name: e.target.value })}
                    placeholder="e.g. Wedding & Sangeet"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Event Type
                  </label>
                  <select
                    value={editFormData.event_type}
                    onChange={(e) => setEditFormData({ ...editFormData, event_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.event_date}
                    onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Estimated Budget ({currency.symbol.trim()})
                  </label>
                  <input
                    type="text"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                    placeholder="e.g. 200000"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 5: Source & Pipeline Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Lead Source
                  </label>
                  <select
                    value={editFormData.source}
                    onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value as EnquirySource })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Sales Status Pipeline
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as EnquiryStatus })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
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
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Client Requirements / Production Notes
                </label>
                <textarea
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Special client requests, drone permits, extra coverage hours, etc."
                  className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
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
                        confirmText: 'Delete Lead',
                        itemName: editFormData.name,
                        itemType: 'Client Enquiry',
                        onConfirm: () => {
                          onDeleteEnquiry(idToDelete);
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Enquiry</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingEnquiry(null);
                    }}
                    className="btn-pixeva-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pixeva-primary"
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
        itemName={confirmModal.itemName}
        itemType={confirmModal.itemType}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
