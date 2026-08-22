'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Project, ProjectStatus, ContractStatus } from '@/lib/supabase/types';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Search,
  Plus,
  FileUp,
  Download,
  Calendar,
  Briefcase,
  User,
  CheckCircle2,
  FileSignature,
  Edit,
  Trash2,
  X,
  FileText,
  Loader2,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Layers,
  MoreVertical,
  Globe,
  Archive,
  Copy,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  Table as TableIcon,
  MessageSquare,
  ExternalLink,
  Clock,
  Camera,
  Film,
  Award,
  ShieldCheck,
  ArrowRight,
  Flame
} from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Bride & Groom (Demo)',
    type: 'Wedding',
    client: 'Priya & Rohan Sharma',
    first_event: '20 Nov 2026',
    status: 'Active',
    completeness: 'In Progress (85%)',
    contract: 'Accepted',
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Vance Corporate Annual Gala',
    type: 'Corporate',
    client: 'Eleanor Vance',
    first_event: '15 Nov 2026',
    status: 'Active',
    completeness: 'In Progress (85%)',
    contract: 'Accepted',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'proj-3',
    name: 'BioTech Global Summit 2026',
    type: 'Corporate',
    client: 'Dr. Alistair Thorne',
    first_event: '20 Oct 2026',
    status: 'Active',
    completeness: 'In Progress (60%)',
    contract: 'Accepted',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'proj-4',
    name: 'Heritage Museum Gala & Auction',
    type: 'Private Event',
    client: 'Marcus Brody',
    first_event: '18 Dec 2026',
    status: 'Archived',
    completeness: 'Complete',
    contract: 'Accepted',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// Project Cover Photos by Type
const PROJECT_COVERS: Record<string, string> = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  Corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'Private Event': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  Commercial: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
};

// 5-Stage Production Milestones
const PRODUCTION_STAGES = [
  { id: 1, label: 'Contract Signed', short: 'Contract' },
  { id: 2, label: 'Crew Assigned', short: 'Crew' },
  { id: 3, label: 'Shoot Completed', short: 'Shoot' },
  { id: 4, label: 'Post-Production', short: 'Post-Prod' },
  { id: 5, label: 'Gallery Delivered', short: 'Delivered' },
];

function getStageFromCompleteness(completeness: string): number {
  if (completeness.includes('Complete') || completeness.includes('100%')) return 5;
  if (completeness.includes('85%') || completeness.includes('80%')) return 4;
  if (completeness.includes('60%') || completeness.includes('50%')) return 3;
  if (completeness.includes('30%') || completeness.includes('25%')) return 2;
  return 1;
}

function getPercentageFromStage(stage: number): number {
  switch (stage) {
    case 1: return 20;
    case 2: return 40;
    case 3: return 60;
    case 4: return 85;
    case 5: return 100;
    default: return 20;
  }
}

function getCountdownText(eventDateStr: string): { text: string; isImminent: boolean; isPast: boolean } {
  try {
    const target = new Date(eventDateStr);
    if (isNaN(target.getTime())) return { text: eventDateStr, isImminent: false, isPast: false };

    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Event Completed', isImminent: false, isPast: true };
    if (diffDays === 0) return { text: '🚨 Today!', isImminent: true, isPast: false };
    if (diffDays === 1) return { text: '⚡ Tomorrow', isImminent: true, isPast: false };
    if (diffDays <= 7) return { text: `⏳ In ${diffDays} days`, isImminent: true, isPast: false };
    return { text: `📅 In ${diffDays} days`, isImminent: false, isPast: false };
  } catch {
    return { text: eventDateStr, isImminent: false, isPast: false };
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pixeva_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      } else {
        localStorage.setItem('pixeva_projects', JSON.stringify(INITIAL_PROJECTS));
      }
    } catch (e) {
      console.error('Error reading pixeva_projects from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateProjects = (updater: Project[] | ((prev: Project[]) => Project[])) => {
    setProjects((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('pixeva_projects', JSON.stringify(next));
      } catch (e) {
        console.error('Error saving pixeva_projects to localStorage', e);
      }
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  // 3-Dots Menu & Portal Settings State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [portalProject, setPortalProject] = useState<Project | null>(null);
  const [portalPin, setPortalPin] = useState<string>('0000');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Archive Modal State
  const [archivingProject, setArchivingProject] = useState<Project | null>(null);
  const [archiveNotes, setArchiveNotes] = useState('');

  // Form State for Add Project
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    client: '',
    first_event: new Date().toISOString().slice(0, 10),
    status: 'Active' as ProjectStatus,
    completeness: 'In Progress (50%)',
    contract: 'Accepted' as ContractStatus,
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'Wedding',
    client: '',
    first_event: '',
    status: 'Active' as ProjectStatus,
    completeness: 'In Progress (85%)',
    contract: 'Accepted' as ContractStatus,
  });

  // CSV Drag State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesTab = p.status === activeTab;
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.first_event.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date_latest') {
        return new Date(b.first_event).getTime() - new Date(a.first_event).getTime();
      }
      if (sortBy === 'date_earliest') {
        return new Date(a.first_event).getTime() - new Date(b.first_event).getTime();
      }
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  // Quick WhatsApp Shoot Briefing Dispatcher
  const handleSendWhatsAppBriefing = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = encodeURIComponent(
      `Hi ${project.client}! 👋\n\n` +
      `Here is your official *Pixeva Studio Shoot Briefing*:\n` +
      `📸 *Project*: ${project.name}\n` +
      `📅 *Date*: ${project.first_event}\n` +
      `⚡ *Status*: ${project.completeness}\n` +
      `📋 *Contract*: ${project.contract}\n\n` +
      `Our master cinematography and photo crew is confirmed and ready. Access your client portal here: ${window.location.origin}/proposal/${project.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Toggle Project Milestone Step directly
  const handleStepMilestone = (project: Project, newStageId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newPercentage = getPercentageFromStage(newStageId);
    const newCompleteness = newPercentage === 100 ? 'Complete' : `In Progress (${newPercentage}%)`;

    updateProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, completeness: newCompleteness } : p))
    );
  };

  // Open Edit Modal
  const handleOpenEdit = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProject(project);
    setEditFormData({
      name: project.name,
      type: project.type,
      client: project.client,
      first_event: project.first_event,
      status: project.status,
      completeness: project.completeness,
      contract: project.contract,
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    updateProjects((prev) =>
      prev.map((p) => (p.id === editingProject.id ? { ...p, ...editFormData } : p))
    );

    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  // Add Project Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      client: formData.client,
      first_event: formData.first_event || 'TBD',
      status: formData.status,
      completeness: formData.completeness,
      contract: formData.contract,
      created_at: new Date().toISOString(),
    };

    updateProjects((prev) => [newProject, ...prev]);
    setFormData({
      name: '',
      type: 'Wedding',
      client: '',
      first_event: new Date().toISOString().slice(0, 10),
      status: 'Active',
      completeness: 'In Progress (50%)',
      contract: 'Accepted',
    });
    setIsAddModalOpen(false);
  };

  // Checkbox Selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length && filteredProjects.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteSingle = (project: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => {
        updateProjects((prev) => prev.filter((p) => p.id !== project.id));
        setSelectedIds((prev) => prev.filter((id) => id !== project.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Projects',
      message: `Are you sure you want to permanently delete ${selectedIds.length} project(s)?`,
      confirmText: 'Delete All Selected',
      onConfirm: () => {
        const idSet = new Set(selectedIds);
        updateProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredProjects.length === 0) return;
    const headers = ['ID', 'Project Name', 'Type', 'Client', 'First Event Date', 'Status', 'Completeness', 'Contract Status'];
    const rows = filteredProjects.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.type}"`,
      `"${p.client}"`,
      `"${p.first_event}"`,
      p.status,
      `"${p.completeness}"`,
      p.contract,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pixeva_Projects_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleProcessCsv = () => {
    if (!csvFile) return;
    setIsParsingCsv(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsed: Project[] = [];
      const startIndex = lines[0].toLowerCase().includes('project') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2) {
          parsed.push({
            id: `proj-csv-${Date.now()}-${i}`,
            name: parts[0] || 'Imported Shoot Project',
            type: parts[1] || 'Wedding',
            client: parts[2] || parts[0] || 'Client Name',
            first_event: parts[3] || '30 Dec 2026',
            status: 'Active',
            completeness: 'In Progress (50%)',
            contract: 'Accepted',
            created_at: new Date().toISOString(),
          });
        }
      }

      setTimeout(() => {
        updateProjects((prev) => [...parsed, ...prev]);
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

  // KPI Calculations
  const activeShootsCount = projects.filter((p) => p.status === 'Active').length;
  const acceptedContractsCount = projects.filter((p) => p.contract === 'Accepted').length;
  const inPostProdCount = projects.filter((p) => p.completeness.includes('Progress') || p.completeness.includes('85%') || p.completeness.includes('60%')).length;
  const completedCount = projects.filter((p) => p.completeness === 'Complete' || p.completeness.includes('100%')).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Projects & Production
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 uppercase tracking-wider">
              {projects.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track shoot schedules, production workflow milestones, crew allocations, and client deliveries.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all shadow-xs animate-fadeIn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-[#12121a] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all shadow-xs"
          >
            <FileUp className="w-3.5 h-3.5 text-sky-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-[#12121a] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-purple-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-sky-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Executive Metric KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Shoots</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{activeShootsCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
            <span>● Ready on production schedule</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Post-Production</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{inPostProdCount}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Culling & Color Grading</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contracts Locked</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{acceptedContractsCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Signed Retainers</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delivered Galleries</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{completedCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Cloud Assets Archival</p>
        </div>
      </div>

      {/* Filter & View Mode Controls Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Tab Pill & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active vs Archived Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('Active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'Active'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active ({projects.filter((p) => p.status === 'Active').length})
            </button>
            <button
              onClick={() => setActiveTab('Archived')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'Archived'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Archived ({projects.filter((p) => p.status === 'Archived').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shoots, clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Right: Sort & Dual View Switcher */}
        <div className="flex items-center space-x-2.5 justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="date_added" className="bg-white dark:bg-[#12121a]">Sort by Date Added</option>
            <option value="date_earliest" className="bg-white dark:bg-[#12121a]">Event Date (Earliest first)</option>
            <option value="date_latest" className="bg-white dark:bg-[#12121a]">Event Date (Latest first)</option>
          </select>

          {/* Dual View Toggle (Cards ↔ Table) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              title="3D Visual Cards View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Compact Table List View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUAL 3D CARDS / PIPELINE GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#0e1424] rounded-3xl border border-slate-200 dark:border-white/10 p-8 space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No projects match your filter</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try changing your search term or tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const currentStage = getStageFromCompleteness(project.completeness);
                const percentage = getPercentageFromStage(currentStage);
                const countdown = getCountdownText(project.first_event);
                const coverImage = PROJECT_COVERS[project.type] || PROJECT_COVERS['Wedding'];
                const isSelected = selectedIds.includes(project.id);

                return (
                  <div
                    key={project.id}
                    onClick={() => handleOpenEdit(project)}
                    className={`group rounded-3xl bg-white dark:bg-[#0e1424] border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-white/10 hover:border-sky-400/50'
                    }`}
                  >
                    {/* Card Top Cover Photo Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={coverImage}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                      {/* Top Floating Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => handleToggleSelect(project.id, e)}
                          className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-white/40 bg-transparent text-sky-500 focus:ring-0 cursor-pointer"
                          />
                        </div>

                        {/* Countdown Badge */}
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-xs ${
                            countdown.isImminent
                              ? 'bg-rose-500/80 text-white border-rose-400/40 animate-pulse'
                              : countdown.isPast
                              ? 'bg-emerald-500/80 text-white border-emerald-400/40'
                              : 'bg-black/60 text-white border-white/20'
                          }`}
                        >
                          {countdown.text}
                        </span>
                      </div>

                      {/* Bottom Banner Title */}
                      <div className="absolute bottom-3 inset-x-3 z-10 space-y-0.5">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-sky-500/80 text-white uppercase tracking-wider">
                          {project.type}
                        </span>
                        <h3 className="font-extrabold text-white text-base leading-tight truncate drop-shadow-sm" title={project.name}>
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-300 truncate font-medium">
                          👤 {project.client}
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      {/* Event Date & Contract Status */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          <span>{project.first_event}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          ✓ Contract {project.contract}
                        </span>
                      </div>

                      {/* 5-Stage Production Workflow Milestone Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                            Stage {currentStage}/5: {PRODUCTION_STAGES[currentStage - 1].label}
                          </span>
                          <span className="font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                            {percentage}%
                          </span>
                        </div>

                        {/* Progress Bar with 5 Step Segments */}
                        <div className="grid grid-cols-5 gap-1">
                          {PRODUCTION_STAGES.map((stage) => {
                            const isPassed = stage.id <= currentStage;
                            const isCurrent = stage.id === currentStage;
                            return (
                              <button
                                key={stage.id}
                                type="button"
                                onClick={(e) => handleStepMilestone(project, stage.id, e)}
                                title={`Set Stage: ${stage.label}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isPassed
                                    ? isCurrent
                                      ? 'bg-gradient-to-r from-sky-400 to-blue-600 shadow-sm'
                                      : 'bg-sky-500'
                                    : 'bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-medium px-0.5">
                          <span>Contract</span>
                          <span>Crew</span>
                          <span>Shoot</span>
                          <span>Post</span>
                          <span>Delivered</span>
                        </div>
                      </div>

                      {/* Assigned Crew Avatars */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center space-x-1.5">
                          <div className="flex -space-x-1.5">
                            <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0e1424]">
                              📸
                            </div>
                            <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0e1424]">
                              🎥
                            </div>
                            <div className="w-6 h-6 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0e1424]">
                              🛸
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Crew Locked</span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          {/* WhatsApp Shoot Briefing */}
                          <button
                            type="button"
                            onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                            title="Send WhatsApp Call-Sheet / Shoot Briefing"
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Client Portal Link */}
                          <Link
                            href={`/proposal/${project.id}`}
                            target="_blank"
                            title="Open Client Portal & Proposal"
                            className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(project, e)}
                            title="Delete Project"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 dark:text-slate-400 text-xs transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COMPACT TABLE LIST VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="rounded-3xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/75 dark:bg-white/5 font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  <th className="w-10 px-3 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProjects.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 dark:border-white/20 bg-transparent text-sky-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5">Project & Client</th>
                  <th className="px-3 py-3.5">Type</th>
                  <th className="px-3 py-3.5">Event Date</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Production Milestone</th>
                  <th className="px-3 py-3.5">Contract</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No projects match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const currentStage = getStageFromCompleteness(project.completeness);
                    const percentage = getPercentageFromStage(currentStage);
                    const countdown = getCountdownText(project.first_event);
                    const isSelected = selectedIds.includes(project.id);

                    return (
                      <tr
                        key={project.id}
                        onClick={() => handleOpenEdit(project)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-sky-500/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(project.id, e as any)}
                            className="rounded border-slate-300 dark:border-white/20 bg-transparent text-sky-500 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Project Name & Client */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 min-w-[180px]">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors block truncate">
                              {project.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              👤 {project.client}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                            {project.type}
                          </span>
                        </td>

                        {/* Event Date & Countdown */}
                        <td className="px-3 py-3.5">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{project.first_event}</span>
                            <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 block">{countdown.text}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              project.status === 'Active'
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-500'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>

                        {/* 5-Stage Production Milestone */}
                        <td className="px-4 py-3.5 min-w-[170px]" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                {PRODUCTION_STAGES[currentStage - 1].short} ({percentage}%)
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {PRODUCTION_STAGES.map((stage) => (
                                <button
                                  key={stage.id}
                                  type="button"
                                  onClick={(e) => handleStepMilestone(project, stage.id, e)}
                                  className={`h-1.5 rounded-full transition-all ${
                                    stage.id <= currentStage ? 'bg-sky-500' : 'bg-slate-200 dark:bg-white/10'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Contract */}
                        <td className="px-3 py-3.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {project.contract}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                              title="Send WhatsApp Call-Sheet"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/proposal/${project.id}`}
                              target="_blank"
                              title="Open Client Portal"
                              className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={(e) => handleOpenEdit(project, e)}
                              title="Edit Project"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteSingle(project, e)}
                              title="Delete Project"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-500/20 text-rose-500"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD PROJECT MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#12121a] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Create New Project Shoot</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding & Sangeet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya & Rohan"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Shoot Date</label>
                  <input
                    type="date"
                    value={formData.first_event}
                    onChange={(e) => setFormData({ ...formData, first_event: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contract Status</label>
                  <select
                    value={formData.contract}
                    onChange={(e) => setFormData({ ...formData, contract: e.target.value as ContractStatus })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Accepted">Accepted (Signed)</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROJECT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#12121a] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Shoot Project</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.client}
                    onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Project Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Shoot Date</label>
                  <input
                    type="text"
                    value={editFormData.first_event}
                    onChange={(e) => setEditFormData({ ...editFormData, first_event: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Production Stage</label>
                  <select
                    value={editFormData.completeness}
                    onChange={(e) => setEditFormData({ ...editFormData, completeness: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="In Progress (20%)">Stage 1: Contract Signed (20%)</option>
                    <option value="In Progress (40%)">Stage 2: Crew Assigned (40%)</option>
                    <option value="In Progress (60%)">Stage 3: Shoot Completed (60%)</option>
                    <option value="In Progress (85%)">Stage 4: Post-Production (85%)</option>
                    <option value="Complete">Stage 5: Gallery Delivered (100%)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = editingProject;
                    setIsEditModalOpen(false);
                    handleDeleteSingle(toDelete);
                  }}
                  className="px-3 py-2 text-rose-500 hover:text-rose-400 text-xs font-semibold"
                >
                  Delete Project
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-sky-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CSV IMPORT MODAL */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#12121a] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Import Projects via CSV</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-[#0a0a0f]"
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
                <div className="space-y-2 text-emerald-500 animate-fadeIn">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-bold text-sm">Successfully Imported {importedCount} Projects!</p>
                </div>
              ) : csvFile ? (
                <div className="space-y-1 text-slate-900 dark:text-white">
                  <FileText className="w-8 h-8 text-sky-500 mx-auto" />
                  <p className="font-bold text-xs">{csvFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Click or drag CSV file to upload</p>
                  <p className="text-[10px] text-slate-400">Supports standard project CSV formats</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
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
                <span>Import Projects</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Delete'}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
