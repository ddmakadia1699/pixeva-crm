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
  IndianRupee,
  Euro,
  PoundSterling,
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
  FileSpreadsheet,
  Camera,
  Globe,
  Compass,
  Clock,
  Share2,
  Check,
  Copy,
  TrendingUp,
  Edit3,
  SlidersHorizontal,
  MoreHorizontal,
  Inbox,
  BarChart2
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { openProposalPdfWindow } from '@/lib/pdf/generateProposalPdf';

// Professional Options with Lucide Icons (Zero Emojis)
const LEAD_SOURCE_OPTIONS: { value: EnquirySource; label: string; icon: React.ElementType; iconColor: string }[] = [
  { value: 'Instagram', label: 'Instagram', icon: Camera, iconColor: 'text-pink-500' },
  { value: 'Website', label: 'Website', icon: Globe, iconColor: 'text-blue-500' },
  { value: 'Landing Page', label: 'Landing Page', icon: Compass, iconColor: 'text-indigo-500' },
  { value: 'Referral', label: 'Referral / Word of Mouth', icon: Users, iconColor: 'text-emerald-500' },
  { value: 'Google', label: 'Google Search', icon: Search, iconColor: 'text-amber-500' },
  { value: 'Google Ads', label: 'Google Ads', icon: Search, iconColor: 'text-amber-600' },
  { value: 'WhatsApp', label: 'WhatsApp Direct', icon: MessageSquare, iconColor: 'text-emerald-600' },
  { value: 'Facebook', label: 'Facebook', icon: Share2, iconColor: 'text-blue-600' },
  { value: 'Inbound API', label: 'Inbound API', icon: Cpu, iconColor: 'text-violet-500' },
  { value: 'Other', label: 'Other', icon: Tag, iconColor: 'text-slate-400' },
];

const ADD_PIPELINE_STAGE_OPTIONS: { value: EnquiryStatus; label: string; icon: React.ElementType; iconColor: string }[] = [
  { value: 'New', label: 'New Lead', icon: Sparkles, iconColor: 'text-blue-500' },
  { value: 'Follow Up', label: 'Follow Up', icon: Clock, iconColor: 'text-amber-500' },
  { value: 'Meeting Fixed', label: 'Meeting Fixed', icon: Calendar, iconColor: 'text-indigo-500' },
  { value: 'Proposal Sent', label: 'Proposal Sent', icon: FileText, iconColor: 'text-purple-500' },
  { value: 'Booked', label: 'Booked', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  { value: 'Closed/Lost', label: 'Closed / Lost', icon: AlertCircle, iconColor: 'text-rose-500' },
];

const EDIT_PIPELINE_STAGE_OPTIONS: { value: EnquiryStatus; label: string; icon: React.ElementType; iconColor: string }[] = [
  { value: 'new', label: 'New (Fresh Lead)', icon: Sparkles, iconColor: 'text-blue-500' },
  { value: 'contacted', label: 'Contacted (WhatsApp/Call)', icon: Clock, iconColor: 'text-amber-500' },
  { value: 'qualified', label: 'Qualified (Date & Budget Match)', icon: CheckCircle2, iconColor: 'text-indigo-500' },
  { value: 'proposal', label: 'Proposal (Quote Sent)', icon: FileText, iconColor: 'text-purple-500' },
  { value: 'booked', label: 'Booked (Deposit Paid)', icon: CheckCircle2, iconColor: 'text-emerald-500' },
];

function getBudgetPlaceholder(currencyCode: string, symbol: string): string {
  switch (currencyCode) {
    case 'INR':
      return 'e.g. ₹2,50,000';
    case 'USD':
      return 'e.g. $3,500';
    case 'EUR':
      return 'e.g. €3,000';
    case 'GBP':
      return 'e.g. £2,500';
    case 'AED':
      return 'e.g. AED 12,000';
    case 'CAD':
      return 'e.g. CA$4,500';
    case 'AUD':
      return 'e.g. A$5,000';
    case 'SGD':
      return 'e.g. S$4,500';
    default:
      return `e.g. ${symbol.trim()}3,500`;
  }
}

function renderCurrencyIcon(code: string) {
  switch (code) {
    case 'INR':
      return <IndianRupee className="w-4 h-4" />;
    case 'EUR':
      return <Euro className="w-4 h-4" />;
    case 'GBP':
      return <PoundSterling className="w-4 h-4" />;
    case 'AED':
      return <span className="text-[10px] font-bold font-mono tracking-tight leading-none text-slate-400">AED</span>;
    default:
      return <DollarSign className="w-4 h-4" />;
  }
}

interface EnquiriesListTabProps {
  enquiries: Enquiry[];
  onAddEnquiry: (newEnquiry: Omit<Enquiry, 'id' | 'created_at'>) => void;
  onImportEnquiries: (imported: Omit<Enquiry, 'id' | 'created_at'>[]) => void;
  onUpdateStatus: (id: string, status: EnquiryStatus) => void;
  onUpdateEnquiry?: (updated: Enquiry) => void;
  onDeleteEnquiry: (id: string) => void;
  onDeleteBatchEnquiries?: (ids: string[]) => void;
  onClearAllEnquiries?: () => void;
  onOpenAnalytics?: () => void;
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
  onOpenAnalytics,
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

  // Custom Dropdown Open States & Refs
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [isEditSourceOpen, setIsEditSourceOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
  const addSourceDropdownRef = useRef<HTMLDivElement>(null);
  const addStatusDropdownRef = useRef<HTMLDivElement>(null);
  const editSourceDropdownRef = useRef<HTMLDivElement>(null);
  const editStatusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (addSourceDropdownRef.current && !addSourceDropdownRef.current.contains(target)) {
        setIsAddSourceOpen(false);
      }
      if (addStatusDropdownRef.current && !addStatusDropdownRef.current.contains(target)) {
        setIsAddStatusOpen(false);
      }
      if (editSourceDropdownRef.current && !editSourceDropdownRef.current.contains(target)) {
        setIsEditSourceOpen(false);
      }
      if (editStatusDropdownRef.current && !editStatusDropdownRef.current.contains(target)) {
        setIsEditStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Email Proposal Dispatcher Modal
  const [emailModal, setEmailModal] = useState<{
    isOpen: boolean;
    enquiry: Enquiry | null;
    recipient: string;
    subject: string;
    body: string;
    isSending: boolean;
    isSent: boolean;
    copied: boolean;
  }>({
    isOpen: false,
    enquiry: null,
    recipient: '',
    subject: '',
    body: '',
    isSending: false,
    isSent: false,
    copied: false,
  });

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
    onConfirm: () => { },
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
        setIsAddModalOpen(false);
        setIsImportModalOpen(false);
        setIsEditModalOpen(false);
        setIsAddSourceOpen(false);
        setIsAddStatusOpen(false);
        setIsEditSourceOpen(false);
        setIsEditStatusOpen(false);
        setEmailModal((prev) => ({ ...prev, isOpen: false }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pixeva_packages');
    if (saved) {
      setPackages(JSON.parse(saved));
    }
  }, []);

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
    selected_package_id: '',
  });

  // Helper to normalize status across legacy and new formats
  const normalizeStatus = (status?: string): string => {
    if (!status) return 'new';
    const s = status.toLowerCase().trim();
    if (s.includes('proposal')) return 'proposal';
    if (s.includes('contact') || s.includes('follow') || s.includes('meeting')) return 'contacted';
    if (s.includes('qualif') && !s.includes('unqualif')) return 'qualified';
    if (s.includes('book') || s.includes('confirm') || s.includes('won')) return 'booked';
    if (s.includes('unqualif') || s.includes('lost') || s.includes('closed')) return 'unqualified';
    if (s.includes('new')) return 'new';
    return s;
  };

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

    const matchesStatus =
      selectedStatus === 'all' ||
      normalizeStatus(enq.status) === normalizeStatus(selectedStatus);
    const matchesSource =
      selectedSource === 'all' ||
      enq.source?.toLowerCase().trim() === selectedSource.toLowerCase().trim();

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
      const numericBudget = rawBudget ? Number(rawBudget) : undefined;

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
        budget: formData.budget.trim(),
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
      budget: enq.budget?.trim() || (enq.estimated_budget ? String(enq.estimated_budget) : ''),
      source: (enq.source as EnquirySource) || 'Instagram',
      status: statusVal,
      notes: enq.notes || enq.event_details || '',
      selected_package_id: enq.selected_package_id || '',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry || !editFormData.name) return;

    const rawBudget = editFormData.budget.replace(/[^0-9]/g, '');
    const numericBudget = rawBudget ? Number(rawBudget) : undefined;

    const updated: Enquiry = {
      ...editingEnquiry,
      name: editFormData.name.trim(),
      contact: editFormData.contact?.trim() || editFormData.phone?.trim() || editingEnquiry.contact,
      email: editFormData.email.trim(),
      phone: editFormData.phone?.trim() || editFormData.contact?.trim(),
      event_name: editFormData.event_name.trim() || `${editFormData.name.trim()}'s Event`,
      event_type: editFormData.event_type,
      event_date: editFormData.event_date,
      venue: editFormData.venue.trim(),
      budget: editFormData.budget.trim(),
      estimated_budget: numericBudget,
      source: editFormData.source,
      status: editFormData.status,
      notes: editFormData.notes.trim(),
      event_details: editFormData.notes.trim(),
      selected_package_id: editFormData.selected_package_id,
    };

    if (numericBudget === undefined) {
      delete (updated as any).estimated_budget;
    }

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
            budget: budgetRaw ? Number(budgetRaw).toLocaleString('en-IN') : '',
            guests: guests,
            estimated_budget: budgetRaw ? Number(budgetRaw) : undefined,
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

  const handleOpenEmailModal = (enquiry: Enquiry) => {
    const proposalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/proposal/${enquiry.id}`
      : `https://pixeva.app/proposal/${enquiry.id}`;

    const formattedBudget = enquiry.estimated_budget && enquiry.estimated_budget > 0
      ? formatCurrency(enquiry.estimated_budget)
      : (enquiry.budget?.trim() || 'Custom Quote');
    const subject = `Pixeva Studio Proposal — ${enquiry.event_name || 'Photography & Cinematography'}`;
    const body = `Hi ${enquiry.name},\n\nThank you for reaching out to Pixeva Studio! We are thrilled about your upcoming event (${enquiry.event_name || 'shoot'}).\n\nWe have prepared your custom photography & cinematography package proposal (${formattedBudget}).\n\nView your interactive live proposal, 4K video lookbook, and contract here:\n${proposalUrl}\n\nPlease feel free to reply directly if you'd like to adjust any deliverables or customize your package.\n\nWarm regards,\nPixeva Studio Team\nhttps://pixeva.app`;

    setEmailModal({
      isOpen: true,
      enquiry,
      recipient: enquiry.email || '',
      subject,
      body,
      isSending: false,
      isSent: false,
      copied: false,
    });
  };

  const handleSendEmailViaLambda = async () => {
    if (!emailModal.enquiry) return;
    setEmailModal((prev) => ({ ...prev, isSending: true }));

    try {
      const res = await invokeLambdaFunction('batch-email-service', {
        campaignName: 'Pixeva Instant Enquiry Proposal Dispatch',
        recipients: [emailModal.recipient],
        subject: emailModal.subject,
        body: emailModal.body,
        dealId: emailModal.enquiry.id,
      });

      // Automatically move status to proposal
      onUpdateStatus(emailModal.enquiry.id, 'proposal');

      setEmailModal((prev) => ({ ...prev, isSending: false, isSent: true }));
    } catch (err) {
      console.error('Error dispatching email via lambda:', err);
      setEmailModal((prev) => ({ ...prev, isSending: false }));
    }
  };

  const handleOpenMailClient = () => {
    const mailto = `mailto:${encodeURIComponent(emailModal.recipient)}?subject=${encodeURIComponent(emailModal.subject)}&body=${encodeURIComponent(emailModal.body)}`;
    window.open(mailto, '_blank');
  };

  const handleCopyProposalLink = () => {
    if (!emailModal.enquiry) return;
    const proposalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/proposal/${emailModal.enquiry.id}`
      : `https://pixeva.app/proposal/${emailModal.enquiry.id}`;
    navigator.clipboard.writeText(proposalUrl);
    setEmailModal((prev) => ({ ...prev, copied: true }));
    setTimeout(() => setEmailModal((prev) => ({ ...prev, copied: false })), 2000);
  };

  // 1-Click WhatsApp Quick Quote & Proposal Dispatcher
  const handleSendWhatsAppQuote = (enquiry: Enquiry) => {
    const rawPhone = (enquiry.phone || enquiry.contact || '').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const proposalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/proposal/${enquiry.id}`
      : `https://pixeva.app/proposal/${enquiry.id}`;

    const formattedBudget = enquiry.estimated_budget && enquiry.estimated_budget > 0
      ? formatCurrency(enquiry.estimated_budget)
      : (enquiry.budget?.trim() || 'Custom Quote');
    const message = `Hi *${enquiry.name}*!\n\nThank you for reaching out to *Pixeva Studio* regarding your ${enquiry.event_name || 'upcoming event'}.\n\nWe have prepared your custom photography & cinematography package proposal (*${formattedBudget}*).\n\nYou can view your interactive proposal, video teaser, and contract details here:\n\n${proposalUrl}\n\nPlease feel free to reply to this message if you have any questions or if you would like to customize your package!`;

    let finalPhone = phone || '';
    if (finalPhone && !finalPhone.startsWith('+')) {
      const prefix = localStorage.getItem('pixeva_phone_prefix') || '+91';
      finalPhone = `${prefix}${finalPhone}`.replace(/[^0-9]/g, '');
    } else if (finalPhone) {
      finalPhone = finalPhone.replace(/[^0-9]/g, '');
    }

    const whatsappUrl = finalPhone
      ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  // Quick Pipeline KPI Metrics & Calculations
  const totalLeadsCount = enquiries.length;
  const newLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'new').length;
  const contactedLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'contacted').length;
  const qualifiedLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'qualified').length;
  const proposalLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'proposal').length;
  const bookedLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'booked').length;
  const unqualifiedLeadsCount = enquiries.filter((e) => normalizeStatus(e.status) === 'unqualified').length;
  const inProgressLeadsCount = contactedLeadsCount + qualifiedLeadsCount + proposalLeadsCount;

  const totalPipelineVal = enquiries.reduce((sum, e) => sum + (Number(e.estimated_budget) || 0), 0);
  const bookedRevenueVal = enquiries
    .filter((e) => normalizeStatus(e.status) === 'booked')
    .reduce((sum, e) => sum + (Number(e.estimated_budget) || 0), 0);

  const handleBatchUpdateStatus = (status: EnquiryStatus) => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onUpdateStatus(id, status));
    setSelectedIds([]);
  };

  const AVATAR_GRADIENTS = [
    'from-blue-600 to-indigo-600',
    'from-indigo-600 to-purple-600',
    'from-purple-600 to-pink-600',
    'from-pink-600 to-rose-600',
    'from-amber-600 to-orange-600',
    'from-emerald-600 to-teal-600',
    'from-teal-600 to-cyan-600',
  ];

  const getAvatarGradient = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  };

  const getStatusBadgeConfig = (status?: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'new':
        return {
          bg: 'bg-sky-50 dark:bg-sky-500/15',
          text: 'text-sky-700 dark:text-sky-300',
          border: 'border-sky-200 dark:border-sky-500/30',
          dot: 'bg-sky-500',
          label: 'New Lead',
        };
      case 'contacted':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/15',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'Contacted',
        };
      case 'qualified':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-500/15',
          text: 'text-indigo-700 dark:text-indigo-300',
          border: 'border-indigo-200 dark:border-indigo-500/30',
          dot: 'bg-indigo-500',
          label: 'Qualified',
        };
      case 'proposal':
        return {
          bg: 'bg-purple-50 dark:bg-purple-500/15',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-500/30',
          dot: 'bg-purple-500',
          label: 'Proposal Sent',
        };
      case 'booked':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'Booked',
        };
      case 'unqualified':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-500/30',
          dot: 'bg-rose-500',
          label: 'Lost / Closed',
        };
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. At-a-Glance Executive Pipeline KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Leads */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'all' ? 'all' : 'all')}
          className={`p-4 rounded-2xl bg-white dark:bg-[#111827] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'all'
              ? 'border-blue-400/80 ring-2 ring-blue-500/10'
              : 'border-slate-200/80 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-600/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enquiries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalLeadsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400 truncate">
              {formatCurrency(totalPipelineVal)} est.
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">All active & past incoming leads</p>
        </div>

        {/* Card 2: Fresh New Leads */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'new' ? 'all' : 'new')}
          className={`p-4 rounded-2xl bg-white dark:bg-[#111827] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'new'
              ? 'border-sky-400 ring-2 ring-sky-500/15'
              : 'border-slate-200/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-600/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New & Fresh</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
              {newLeadsCount}
            </span>
            {newLeadsCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                Action needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Awaiting first follow-up</p>
        </div>

        {/* Card 3: In Negotiation / Proposals Sent */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'proposal' ? 'all' : 'proposal')}
          className={`p-4 rounded-2xl bg-white dark:bg-[#111827] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'proposal'
              ? 'border-purple-400 ring-2 ring-purple-500/15'
              : 'border-slate-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Negotiation</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {inProgressLeadsCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400 truncate">
              {proposalLeadsCount} proposals sent
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Contacted & qualified prospects</p>
        </div>

        {/* Card 4: Confirmed & Booked */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'booked' ? 'all' : 'booked')}
          className={`p-4 rounded-2xl bg-white dark:bg-[#111827] border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            selectedStatus === 'booked'
              ? 'border-emerald-400 ring-2 ring-emerald-500/15'
              : 'border-slate-200/80 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-600/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Booked & Won</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {bookedLeadsCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {formatCurrency(bookedRevenueVal)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">Auto-transferred to Shoot Projects</p>
        </div>
      </div>

      {/* 2. Pipeline Stage Quick Pills Navigation */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pb-0.5">
        <div className="inline-flex items-center p-1 bg-slate-100/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl space-x-1 shrink-0 shadow-2xs">
          {[
            { id: 'all', label: 'All', count: totalLeadsCount },
            { id: 'new', label: 'New', count: newLeadsCount, dot: 'bg-sky-500' },
            { id: 'contacted', label: 'Contacted', count: contactedLeadsCount, dot: 'bg-amber-500' },
            { id: 'qualified', label: 'Qualified', count: qualifiedLeadsCount, dot: 'bg-indigo-500' },
            { id: 'proposal', label: 'Proposal Sent', count: proposalLeadsCount, dot: 'bg-purple-500' },
            { id: 'booked', label: 'Booked', count: bookedLeadsCount, dot: 'bg-emerald-500' },
            { id: 'unqualified', label: 'Closed / Lost', count: unqualifiedLeadsCount, dot: 'bg-rose-500' },
          ].map((stage) => {
            const isActive = selectedStatus === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStatus(stage.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 font-medium'
                }`}
              >
                {stage.dot && <span className={`w-2 h-2 rounded-full ${stage.dot}`} />}
                <span>{stage.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white'
                      : 'bg-slate-200/70 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  {stage.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter reset helper if non-default */}
        {(selectedStatus !== 'all' || selectedSource !== 'all' || searchTerm) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0 font-medium px-2 py-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 3. Streamlined Toolbar: Search, Source Filter & Primary Action CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 p-2.5 rounded-2xl shadow-xs">
        {/* Left Side: Search & Source Filter */}
        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, event, or venue…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-md"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Source Dropdown Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-50/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-xs font-medium rounded-xl pl-3 pr-8 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">All Sources</option>
              <option value="Instagram">Instagram</option>
              <option value="Website">Website</option>
              <option value="Landing Page">Landing Page</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="WhatsApp">WhatsApp Direct</option>
              <option value="Inbound API">Inbound API</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Primary CTA & Secondary Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer shadow-2xs"
            title="Import Leads from CSV"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredEnquiries.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
            title="Export filtered enquiries to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all cursor-pointer shadow-2xs"
              title="Open Complete Analytics Dashboard"
            >
              <BarChart2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Analytics</span>
            </button>
          )}

          {enquiries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all cursor-pointer"
              title="Delete all enquiries"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* 4. Multi-Select Floating Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200 animate-fadeIn shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{selectedIds.length} enquiries selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBatchUpdateStatus('booked')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Mark Booked
            </button>
            <button
              onClick={() => handleBatchUpdateStatus('contacted')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all cursor-pointer"
            >
              Mark Contacted
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* 5. Results Counter Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="font-medium flex items-center space-x-2">
          <span>
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredEnquiries.length}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-bold">{enquiries.length}</span> enquiries
          </span>
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              Filter: {selectedStatus}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">Click any row to view & edit details</div>
      </div>

      {/* 6. Elevated Leads Data Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 dark:border-white/10 text-[10px]">
              <tr>
                <th className="w-10 px-3.5 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredEnquiries.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="w-[28%] min-w-[210px] px-3 py-3.5 font-bold">Client & Contact</th>
                <th className="w-[22%] min-w-[180px] px-3 py-3.5 font-bold">Event & Date</th>
                <th className="w-[12%] min-w-[110px] px-3 py-3.5 font-bold">Lead Source</th>
                <th className="w-[12%] min-w-[100px] px-3 py-3.5 font-bold">Est. Budget</th>
                <th className="w-[14%] min-w-[130px] px-3 py-3.5 font-bold">Pipeline Stage</th>
                <th className="w-[12%] min-w-[120px] px-3 py-3.5 text-right font-bold pr-4">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {enquiries.length === 0 ? 'No enquiries logged yet' : 'No enquiries match your active filter'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {enquiries.length === 0
                          ? 'Capture leads using your public booking form, import a CSV roster, or add a lead manually.'
                          : 'Try modifying your search keywords or resetting the status and source filters.'}
                      </p>
                      {enquiries.length === 0 ? (
                        <div className="flex items-center justify-center space-x-2 pt-2">
                          <button
                            onClick={handleOpenAddModal}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
                          >
                            Add First Enquiry
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleResetFilters}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Clear All Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => {
                  const isPdfRunning = activeLambdaTask === `pdf-${enq.id}`;
                  const isSelected = selectedIds.includes(enq.id);
                  const avatarInitial = (enq.name || 'C').charAt(0).toUpperCase();
                  const avatarGradient = getAvatarGradient(enq.name || '');
                  const statusConfig = getStatusBadgeConfig(enq.status);

                  return (
                    <tr
                      key={enq.id}
                      onClick={() => handleOpenEdit(enq)}
                      className={`hover:bg-slate-50/90 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-3.5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(enq.id)}
                          className="rounded border-slate-300 dark:border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Lead & Contact */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center space-x-3">
                          {/* Avatar Circle with Initial */}
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                          >
                            {avatarInitial}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span
                              className="font-bold text-slate-900 dark:text-white text-xs truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                              title={enq.name}
                            >
                              {enq.name}
                            </span>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                              {enq.email && (
                                <div className="flex items-center space-x-1.5 truncate">
                                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{enq.email}</span>
                                </div>
                              )}
                              {enq.phone && (
                                <div className="flex items-center space-x-1.5 truncate text-slate-600 dark:text-slate-300 font-medium">
                                  <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{enq.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event Details */}
                      <td className="px-3 py-3.5">
                        <div className="space-y-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white text-xs truncate" title={enq.event_name}>
                            {enq.event_name || `${enq.name}'s Event`}
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap gap-y-1">
                            <span
                              className={`capitalize px-2 py-0.5 rounded-full font-semibold border ${
                                enq.event_type?.toLowerCase() === 'wedding'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/20'
                                  : enq.event_type?.toLowerCase() === 'corporate'
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/20'
                                  : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200/80 dark:border-white/10'
                              }`}
                            >
                              {enq.event_type || 'Event'}
                            </span>
                            {enq.event_date && (
                              <span className="flex items-center space-x-1 font-mono text-slate-600 dark:text-slate-300">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{enq.event_date}</span>
                              </span>
                            )}
                          </div>
                          {enq.venue && (
                            <div className="flex items-center space-x-1 text-[10px] text-slate-400 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{enq.venue}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Lead Source */}
                      <td className="px-3 py-3.5">
                        {(() => {
                          const srcConfig =
                            LEAD_SOURCE_OPTIONS.find((o) => o.value.toLowerCase() === (enq.source || '').toLowerCase()) ||
                            LEAD_SOURCE_OPTIONS[0];
                          const SourceIcon = srcConfig.icon;
                          return (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                              <SourceIcon className={`w-3 h-3 ${srcConfig.iconColor} shrink-0`} />
                              <span className="truncate">{enq.source || 'Website'}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Est. Budget */}
                      <td className="px-3 py-3.5">
                        {enq.estimated_budget && enq.estimated_budget > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block">
                              {formatCurrency(enq.estimated_budget)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">Estimated</span>
                          </div>
                        ) : enq.budget && enq.budget.trim() ? (
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">
                            {enq.budget}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-xs block font-medium">
                            —
                          </span>
                        )}
                      </td>

                      {/* Pipeline Stage / Status Selector */}
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={normalizeStatus(enq.status)}
                            onChange={(e) => onUpdateStatus(enq.id, e.target.value as EnquiryStatus)}
                            className={`w-full text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 border focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none transition-all ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <option value="new" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">New Lead</option>
                            <option value="contacted" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Contacted</option>
                            <option value="qualified" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Qualified</option>
                            <option value="proposal" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Proposal Sent</option>
                            <option value="booked" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Booked</option>
                            <option value="unqualified" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">Closed / Lost</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          {/* 1-Click WhatsApp Quick Quote */}
                          <button
                            onClick={() => handleSendWhatsAppQuote(enq)}
                            title="Send 1-Click WhatsApp Quote & Link"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* View Live Client Proposal */}
                          <Link
                            href={`/proposal/${enq.id}`}
                            target="_blank"
                            title="Open Client Proposal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors inline-flex items-center"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* AWS Lambda Microservice Trigger */}
                          <button
                            onClick={() => handleRunPdfLambda(enq)}
                            disabled={isPdfRunning}
                            title="Trigger AWS Lambda PDF Generator"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          >
                            <FileText className={`w-4 h-4 ${isPdfRunning ? 'animate-spin text-indigo-600' : ''}`} />
                          </button>

                          {/* Email Proposal Dispatcher */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEmailModal(enq);
                            }}
                            title="Dispatch Email Proposal"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(enq)}
                            title="Edit Lead Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
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
                            <Trash2 className="w-4 h-4" />
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                    Add New Enquiry
                  </h3>
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
                        className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.name && formErrors.name
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
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.email && formErrors.email
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
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.contact && formErrors.contact
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
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.received_on && formErrors.received_on
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
                        Estimated Budget ({currency.symbol.trim()})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          {renderCurrencyIcon(currency.code)}
                        </div>
                        <input
                          id="enquiry-input-budget"
                          type="text"
                          value={formData.budget}
                          onChange={(e) => handleFieldChange('budget', e.target.value)}
                          onBlur={() => handleFieldBlur('budget')}
                          placeholder={getBudgetPlaceholder(currency.code, currency.symbol)}
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.budget && formErrors.budget
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
                          className={`w-full bg-slate-50 dark:bg-[#111827] border ${formTouched.guests && formErrors.guests
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
                    {/* Source Dropdown */}
                    <div ref={addSourceDropdownRef} className="relative">
                      <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                        Lead Source
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddSourceOpen(!isAddSourceOpen);
                          setIsAddStatusOpen(false);
                        }}
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {(() => {
                            const current = LEAD_SOURCE_OPTIONS.find((o) => o.value === formData.source) || LEAD_SOURCE_OPTIONS[0];
                            const IconComponent = current.icon;
                            return (
                              <>
                                <IconComponent className={`w-4 h-4 ${current.iconColor} shrink-0`} />
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{current.label}</span>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isAddSourceOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isAddSourceOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-fadeIn">
                          {LEAD_SOURCE_OPTIONS.map((opt) => {
                            const IconComponent = opt.icon;
                            const isSelected = formData.source === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  handleFieldChange('source', opt.value);
                                  setIsAddSourceOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-blue-50/70 dark:bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <IconComponent className={`w-4 h-4 ${opt.iconColor} shrink-0`} />
                                  <span className="truncate">{opt.label}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div ref={addStatusDropdownRef} className="relative">
                      <label className="font-semibold text-slate-700 dark:text-slate-200 text-xs block mb-1.5">
                        Initial Pipeline Stage
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddStatusOpen(!isAddStatusOpen);
                          setIsAddSourceOpen(false);
                        }}
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {(() => {
                            const current = ADD_PIPELINE_STAGE_OPTIONS.find((o) => o.value === formData.status) || ADD_PIPELINE_STAGE_OPTIONS[0];
                            const IconComponent = current.icon;
                            return (
                              <>
                                <IconComponent className={`w-4 h-4 ${current.iconColor} shrink-0`} />
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{current.label}</span>
                              </>
                            );
                          })()}
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isAddStatusOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isAddStatusOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-fadeIn">
                          {ADD_PIPELINE_STAGE_OPTIONS.map((opt) => {
                            const IconComponent = opt.icon;
                            const isSelected = formData.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  handleFieldChange('status', opt.value);
                                  setIsAddStatusOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-blue-50/70 dark:bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <IconComponent className={`w-4 h-4 ${opt.iconColor} shrink-0`} />
                                  <span className="truncate">{opt.label}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-[#0c1222]/95 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">

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
                    Upload multiple client leads via standardized spreadsheet (CSV). For Apple Numbers, go to File ➞ Export To ➞ CSV.
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
                className={`border-2 border-dashed ${csvFile
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
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {renderCurrencyIcon(currency.code)}
                    </div>
                    <input
                      type="text"
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                      placeholder={getBudgetPlaceholder(currency.code, currency.symbol)}
                      className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4b: Apply Package */}
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Apply Package (Optional)
                  </label>
                  <select
                    value={editFormData.selected_package_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const pkg = packages.find(p => p.id === val);
                      setEditFormData({
                        ...editFormData,
                        selected_package_id: val,
                        budget: pkg && pkg.price ? String(pkg.price) : editFormData.budget,
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">-- Custom Quote / No Package Selected --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} {pkg.price ? `(${currency.symbol.trim()}${pkg.price.toLocaleString('en-IN')})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Selecting a package will automatically update the estimated budget.</p>
                </div>
              </div>

              {/* Row 5: Source & Pipeline Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div ref={editSourceDropdownRef} className="relative">
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Lead Source
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditSourceOpen(!isEditSourceOpen);
                      setIsEditStatusOpen(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white flex items-center justify-between focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {(() => {
                        const current = LEAD_SOURCE_OPTIONS.find((o) => o.value === editFormData.source) || LEAD_SOURCE_OPTIONS[0];
                        const IconComponent = current.icon;
                        return (
                          <>
                            <IconComponent className={`w-4 h-4 ${current.iconColor} shrink-0`} />
                            <span className="font-medium text-slate-900 dark:text-white truncate">{current.label}</span>
                          </>
                        );
                      })()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isEditSourceOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEditSourceOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-fadeIn">
                      {LEAD_SOURCE_OPTIONS.map((opt) => {
                        const IconComponent = opt.icon;
                        const isSelected = editFormData.source === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setEditFormData({ ...editFormData, source: opt.value as EnquirySource });
                              setIsEditSourceOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                              isSelected ? 'bg-blue-50/70 dark:bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <IconComponent className={`w-4 h-4 ${opt.iconColor} shrink-0`} />
                              <span className="truncate">{opt.label}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div ref={editStatusDropdownRef} className="relative">
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Sales Status Pipeline
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditStatusOpen(!isEditStatusOpen);
                      setIsEditSourceOpen(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white flex items-center justify-between focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {(() => {
                        const current = EDIT_PIPELINE_STAGE_OPTIONS.find((o) => o.value === editFormData.status) || EDIT_PIPELINE_STAGE_OPTIONS[0];
                        const IconComponent = current.icon;
                        return (
                          <>
                            <IconComponent className={`w-4 h-4 ${current.iconColor} shrink-0`} />
                            <span className="font-semibold text-slate-900 dark:text-white truncate">{current.label}</span>
                          </>
                        );
                      })()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isEditStatusOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEditStatusOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto custom-scrollbar animate-fadeIn">
                      {EDIT_PIPELINE_STAGE_OPTIONS.map((opt) => {
                        const IconComponent = opt.icon;
                        const isSelected = editFormData.status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setEditFormData({ ...editFormData, status: opt.value as EnquiryStatus });
                              setIsEditStatusOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                              isSelected ? 'bg-blue-50/70 dark:bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <IconComponent className={`w-4 h-4 ${opt.iconColor} shrink-0`} />
                              <span className="truncate">{opt.label}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
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

      {/* Email Proposal Dispatcher Modal */}
      {emailModal.isOpen && emailModal.enquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl animate-scaleUp">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Email Proposal Dispatcher
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send proposal to <strong className="text-slate-800 dark:text-slate-200">{emailModal.enquiry.name}</strong> with live portal & 4K teaser link.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Notification if Sent */}
            {emailModal.isSent && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Email Proposal Dispatched Successfully!</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    AWS Lambda batch email worker processed the message to <strong>{emailModal.recipient}</strong>. The deal status has been moved to <strong>Proposal</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailModal.recipient}
                  onChange={(e) => setEmailModal((prev) => ({ ...prev, recipient: e.target.value }))}
                  placeholder="client@example.com"
                  className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailModal.subject}
                  onChange={(e) => setEmailModal((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Email Message & Live Link
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyProposalLink}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1.5 cursor-pointer"
                  >
                    {emailModal.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Proposal Link</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={emailModal.body}
                  onChange={(e) => setEmailModal((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={handleOpenMailClient}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                title="Open in Gmail, Apple Mail or Outlook"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Email App / Gmail</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={emailModal.isSending || !emailModal.recipient}
                  onClick={handleSendEmailViaLambda}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {emailModal.isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching via AWS SES...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send via Cloud Worker</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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
