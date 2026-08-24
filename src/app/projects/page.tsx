'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project, ProjectStatus, ContractStatus } from '@/lib/supabase/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Search,
  Plus,
  Download,
  Calendar,
  Briefcase,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Video,
  Film,
  Award,
  ShieldCheck,
  MapPin,
  Users,
  CreditCard,
  Table as TableIcon,
  LayoutGrid,
  Columns3,
  MessageSquare,
  ExternalLink,
  Edit,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  DollarSign,
  Compass,
  Check
} from 'lucide-react';

export interface AssignedCrewMember {
  id: string;
  name: string;
  role: 'Lead Photographer' | 'Cinematographer' | 'Drone Pilot' | 'Lead Editor';
  initials: string;
  phone: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  completed: boolean;
}

export interface ExtendedProject extends Project {
  venue?: string;
  call_time?: string;
  total_amount?: number;
  paid_amount?: number;
  payment_status?: 'Paid' | 'Partial' | 'Pending';
  assigned_crew?: AssignedCrewMember[];
  deliverables?: ProjectDeliverable[];
}

const INITIAL_PROJECTS: ExtendedProject[] = [
  {
    id: 'proj-1',
    name: "Priya & Rohan's Royal Destination Wedding",
    type: 'Wedding',
    client: 'Priya & Rohan Sharma',
    first_event: '20 Nov 2026',
    venue: 'Taj Lake Palace, Udaipur',
    call_time: '07:30 AM',
    status: 'Active',
    completeness: 'In Progress (85%)',
    contract: 'Accepted',
    total_amount: 3500,
    paid_amount: 3000,
    payment_status: 'Partial',
    assigned_crew: [
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '918904832762' },
      { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '918904832762' },
      { id: 'c3', name: 'Vikram Patel', role: 'Drone Pilot', initials: 'VP', phone: '918904832762' },
    ],
    deliverables: [
      { id: 'd1', title: '4K Cinematic Master Film (25 Mins)', completed: true },
      { id: 'd2', title: 'Instagram 60-Sec Highlight Teaser', completed: true },
      { id: 'd3', title: 'Canvera Hardcover Album (40 Sheets)', completed: false },
      { id: 'd4', title: 'Full Color-Graded Hi-Res Photo Gallery', completed: true },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Vance Corporate Annual Keynote & Gala',
    type: 'Corporate',
    client: 'Eleanor Vance',
    first_event: '15 Nov 2026',
    venue: 'Grand Hyatt Convention Center',
    call_time: '08:00 AM',
    status: 'Active',
    completeness: 'In Progress (85%)',
    contract: 'Accepted',
    total_amount: 2800,
    paid_amount: 2800,
    payment_status: 'Paid',
    assigned_crew: [
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '918904832762' },
      { id: 'c4', name: 'Sneha Joshi', role: 'Lead Editor', initials: 'SJ', phone: '918904832762' },
    ],
    deliverables: [
      { id: 'd1', title: 'Keynote Speaker 4K Live Stream Recording', completed: true },
      { id: 'd2', title: 'Executive Headshots (50 Staff)', completed: true },
      { id: 'd3', title: 'Same-Day Press Highlight Reel', completed: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'proj-3',
    name: 'BioTech Global Healthcare Summit 2026',
    type: 'Corporate',
    client: 'Dr. Alistair Thorne',
    first_event: '20 Oct 2026',
    venue: 'Marina Expo Center, Hall 4',
    call_time: '09:00 AM',
    status: 'Active',
    completeness: 'In Progress (60%)',
    contract: 'Accepted',
    total_amount: 4200,
    paid_amount: 2100,
    payment_status: 'Partial',
    assigned_crew: [
      { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '918904832762' },
      { id: 'c3', name: 'Vikram Patel', role: 'Drone Pilot', initials: 'VP', phone: '918904832762' },
    ],
    deliverables: [
      { id: 'd1', title: 'Product Launch 4K Multi-Cam Coverage', completed: true },
      { id: 'd2', title: 'Panel Discussions Audio & Video Master', completed: false },
      { id: 'd3', title: 'Social Media Promo Clips (x5)', completed: false },
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'proj-4',
    name: 'Heritage Museum Charity Gala & Auction',
    type: 'Private Event',
    client: 'Marcus Brody',
    first_event: '18 Dec 2026',
    venue: 'Royal Heritage Hall',
    call_time: '06:00 PM',
    status: 'Archived',
    completeness: 'Complete',
    contract: 'Accepted',
    total_amount: 1950,
    paid_amount: 1950,
    payment_status: 'Paid',
    assigned_crew: [
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '918904832762' },
    ],
    deliverables: [
      { id: 'd1', title: 'Auction Gala Photo Documentation', completed: true },
      { id: 'd2', title: 'Donor Appreciation Digital Lookbook', completed: true },
    ],
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

const PROJECT_COVERS: Record<string, string> = {
  Wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  Corporate: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'Private Event': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  Commercial: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
};

const PRODUCTION_STAGES = [
  { id: 1, label: 'Contract Signed', short: 'Contract', percent: 20, badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' },
  { id: 2, label: 'Crew Scheduled', short: 'Crew Locked', percent: 40, badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
  { id: 3, label: 'Shoot Completed', short: 'Shoot Done', percent: 60, badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
  { id: 4, label: 'Post-Production / Editing', short: 'Post-Prod (85%)', percent: 85, badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' },
  { id: 5, label: 'Gallery Delivered', short: 'Delivered (100%)', percent: 100, badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
];

function getStageFromCompleteness(completeness: string): number {
  if (completeness.includes('Complete') || completeness.includes('100%')) return 5;
  if (completeness.includes('85%') || completeness.includes('80%')) return 4;
  if (completeness.includes('60%') || completeness.includes('50%')) return 3;
  if (completeness.includes('30%') || completeness.includes('25%')) return 2;
  return 1;
}

function getCountdownText(eventDateStr: string): { text: string; isImminent: boolean; isPast: boolean } {
  try {
    const target = new Date(eventDateStr);
    if (isNaN(target.getTime())) return { text: eventDateStr, isImminent: false, isPast: false };

    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Shoot Completed', isImminent: false, isPast: true };
    if (diffDays === 0) return { text: 'Today', isImminent: true, isPast: false };
    if (diffDays === 1) return { text: 'Tomorrow', isImminent: true, isPast: false };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, isImminent: true, isPast: false };
    return { text: `In ${diffDays} days`, isImminent: false, isPast: false };
  } catch {
    return { text: eventDateStr, isImminent: false, isPast: false };
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ExtendedProject[]>(INITIAL_PROJECTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');

  // Drawer Panel for Shoot Details
  const [selectedDrawerProject, setSelectedDrawerProject] = useState<ExtendedProject | null>(null);

  // Load from localStorage
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

  const updateProjects = (updater: ExtendedProject[] | ((prev: ExtendedProject[]) => ExtendedProject[])) => {
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

  // State Filters
  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_earliest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ExtendedProject | null>(null);

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    client: '',
    first_event: '',
    venue: '',
    call_time: '08:00 AM',
    total_amount: 2500,
    paid_amount: 1250,
    status: 'Active' as ProjectStatus,
    stage: 1,
    contract: 'Accepted' as ContractStatus,
  });

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      if (activeTab === 'Active') return p.status === 'Active';
      return p.status === 'Archived';
    })
    .filter((p) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.venue && p.venue.toLowerCase().includes(q)) ||
        p.first_event.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date_earliest') {
        return new Date(a.first_event).getTime() - new Date(b.first_event).getTime();
      }
      if (sortBy === 'date_latest') {
        return new Date(b.first_event).getTime() - new Date(a.first_event).getTime();
      }
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  // Multi-Select
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Quick Stage Update
  const handleSetStage = (project: ExtendedProject, newStageId: number, e?: React.MouseEvent | React.ChangeEvent<HTMLSelectElement>) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    const stageObj = PRODUCTION_STAGES.find((s) => s.id === newStageId) || PRODUCTION_STAGES[0];
    const completenessText = newStageId === 5 ? 'Complete' : `In Progress (${stageObj.percent}%)`;

    updateProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, completeness: completenessText } : p))
    );

    if (selectedDrawerProject && selectedDrawerProject.id === project.id) {
      setSelectedDrawerProject((prev) => (prev ? { ...prev, completeness: completenessText } : null));
    }
  };

  // Toggle Deliverable Checkbox
  const handleToggleDeliverable = (projectId: string, deliverableId: string) => {
    updateProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const currentDelivs = p.deliverables || [];
        const updated = currentDelivs.map((d) =>
          d.id === deliverableId ? { ...d, completed: !d.completed } : d
        );
        return { ...p, deliverables: updated };
      })
    );

    if (selectedDrawerProject && selectedDrawerProject.id === projectId) {
      setSelectedDrawerProject((prev) => {
        if (!prev) return null;
        const currentDelivs = prev.deliverables || [];
        const updated = currentDelivs.map((d) =>
          d.id === deliverableId ? { ...d, completed: !d.completed } : d
        );
        return { ...prev, deliverables: updated };
      });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (project: ExtendedProject) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      client: project.client,
      first_event: project.first_event,
      venue: project.venue || '',
      call_time: project.call_time || '08:00 AM',
      total_amount: project.total_amount || 2500,
      paid_amount: project.paid_amount || 1250,
      status: project.status,
      stage: getStageFromCompleteness(project.completeness),
      contract: project.contract,
    });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const stageObj = PRODUCTION_STAGES.find((s) => s.id === formData.stage) || PRODUCTION_STAGES[0];
    const completenessText = formData.stage === 5 ? 'Complete' : `In Progress (${stageObj.percent}%)`;
    const payStatus: 'Paid' | 'Partial' | 'Pending' =
      formData.paid_amount >= formData.total_amount
        ? 'Paid'
        : formData.paid_amount > 0
        ? 'Partial'
        : 'Pending';

    updateProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              name: formData.name,
              type: formData.type,
              client: formData.client,
              first_event: formData.first_event,
              venue: formData.venue,
              call_time: formData.call_time,
              total_amount: formData.total_amount,
              paid_amount: formData.paid_amount,
              payment_status: payStatus,
              status: formData.status,
              completeness: completenessText,
              contract: formData.contract,
            }
          : p
      )
    );
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  // Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) {
      alert('Please fill in Project Name and Client Name');
      return;
    }

    const stageObj = PRODUCTION_STAGES.find((s) => s.id === formData.stage) || PRODUCTION_STAGES[0];
    const completenessText = formData.stage === 5 ? 'Complete' : `In Progress (${stageObj.percent}%)`;
    const payStatus: 'Paid' | 'Partial' | 'Pending' =
      formData.paid_amount >= formData.total_amount
        ? 'Paid'
        : formData.paid_amount > 0
        ? 'Partial'
        : 'Pending';

    const newProject: ExtendedProject = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      client: formData.client,
      first_event: formData.first_event || new Date().toISOString().slice(0, 10),
      venue: formData.venue || 'Main Event Ballroom',
      call_time: formData.call_time || '08:00 AM',
      total_amount: formData.total_amount || 2500,
      paid_amount: formData.paid_amount || 1250,
      payment_status: payStatus,
      status: formData.status,
      completeness: completenessText,
      contract: formData.contract,
      assigned_crew: [
        { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '918904832762' },
        { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '918904832762' },
      ],
      deliverables: [
        { id: 'd1', title: 'Master 4K Cinematic Video Cut', completed: false },
        { id: 'd2', title: 'High-Resolution Edited Photo Album', completed: false },
      ],
      created_at: new Date().toISOString(),
    };

    updateProjects((prev) => [newProject, ...prev]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      type: 'Wedding',
      client: '',
      first_event: '',
      venue: '',
      call_time: '08:00 AM',
      total_amount: 2500,
      paid_amount: 1250,
      status: 'Active',
      stage: 1,
      contract: 'Accepted',
    });
  };

  // Delete Single Project
  const handleDeleteSingle = (project: ExtendedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `Delete "${project.name}"?`,
      message: 'This will remove the shoot project file and its timeline from your active workspace.',
      confirmText: 'Delete Project',
      isDestructive: true,
      onConfirm: () => {
        updateProjects((prev) => prev.filter((p) => p.id !== project.id));
        setSelectedIds((prev) => prev.filter((id) => id !== project.id));
        if (selectedDrawerProject?.id === project.id) setSelectedDrawerProject(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Delete Selected Projects
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Projects?`,
      message: 'This action will permanently delete all selected production shoot files.',
      confirmText: `Delete ${selectedIds.length} Projects`,
      isDestructive: true,
      onConfirm: () => {
        const idSet = new Set(selectedIds);
        updateProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
        setSelectedIds([]);
        setSelectedDrawerProject(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // WhatsApp Shoot Call Sheet
  const handleSendWhatsAppBriefing = (project: ExtendedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const stage = PRODUCTION_STAGES[getStageFromCompleteness(project.completeness) - 1].label;
    const msg = `*Pixeva Studio Shoot Call-Sheet & Briefing*\n\n📌 *Project:* ${project.name}\n👤 *Client:* ${project.client}\n📅 *Event Date:* ${project.first_event}\n📍 *Venue:* ${project.venue || 'Main Location'}\n⏰ *Call Time:* ${project.call_time || '08:00 AM'}\n🎯 *Production Milestone:* ${stage}\n📋 *Contract Status:* Signed & Confirmed\n\n*Crew Protocol:* Please arrive 45 mins early with formatted dual SD cards and backup batteries.`;
    window.open(`https://wa.me/918904832762?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredProjects.length === 0) return;
    const headers = ['ID', 'Project Name', 'Type', 'Client', 'Event Date', 'Venue', 'Status', 'Completeness', 'Contract', 'Payment Status'];
    const rows = filteredProjects.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.type}"`,
      `"${p.client}"`,
      `"${p.first_event}"`,
      `"${p.venue || ''}"`,
      p.status,
      `"${p.completeness}"`,
      p.contract,
      p.payment_status || 'Paid',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pixeva_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const activeShootsCount = projects.filter((p) => p.status === 'Active').length;
  const inPostProdCount = projects.filter((p) => p.completeness.includes('85%') || p.completeness.includes('60%')).length;
  const contractsCount = projects.filter((p) => p.contract === 'Accepted').length;
  const deliveredCount = projects.filter((p) => p.completeness === 'Complete' || p.completeness.includes('100%')).length;

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
              {projects.length} Total Shoots
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage confirmed shoots, 5-stage production pipelines, crew schedules, and deliverable handoffs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white dark:bg-[#12121a] hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-sky-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Shoot Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards KPI Strip (Zero Emojis - Crisp Lucide Icons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Shoots</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{activeShootsCount}</p>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Active Production Schedule</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Post-Production</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{inPostProdCount}</p>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center space-x-1">
            <Video className="w-3 h-3 shrink-0" />
            <span>Color Grading & Master Cut</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signed Contracts</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{contractsCount}</p>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Retainers & Agreements Locked</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delivered Galleries</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{deliveredCount}</p>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Archived in Studio Cloud</span>
          </div>
        </div>
      </div>

      {/* Filter & 3-Way View Switcher Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Active/Archived Tabs & Search Box */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('Active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'Active'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active Shoots ({projects.filter((p) => p.status === 'Active').length})
            </button>
            <button
              onClick={() => setActiveTab('Archived')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'Archived'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Archived ({projects.filter((p) => p.status === 'Archived').length})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shoot, client, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Right: Sort & 3-Way View Switcher (Table | Cards | Kanban) */}
        <div className="flex items-center space-x-2.5 justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="date_earliest" className="bg-white dark:bg-[#12121a]">Shoot Date (Earliest first)</option>
            <option value="date_latest" className="bg-white dark:bg-[#12121a]">Shoot Date (Latest first)</option>
            <option value="date_added" className="bg-white dark:bg-[#12121a]">Date Added</option>
          </select>

          {/* 3-Way View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban Pipeline Board"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TABLE VIEW (EXECUTIVE & CLEAN)                                         */}
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
                  <th className="px-4 py-3.5">Project / Shoot</th>
                  <th className="px-3 py-3.5">Client & Venue</th>
                  <th className="px-3 py-3.5">Event Date</th>
                  <th className="px-4 py-3.5">Production Milestone</th>
                  <th className="px-3 py-3.5">Assigned Crew</th>
                  <th className="px-3 py-3.5">Payment</th>
                  <th className="px-4 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-500">
                      No shoot projects found. Click "+ New Shoot Project" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const currentStage = getStageFromCompleteness(project.completeness);
                    const stageObj = PRODUCTION_STAGES[currentStage - 1] || PRODUCTION_STAGES[0];
                    const countdown = getCountdownText(project.first_event);
                    const isSelected = selectedIds.includes(project.id);
                    const crewList = project.assigned_crew || [];

                    return (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedDrawerProject(project)}
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

                        {/* Project Name & Type Icon Pill */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1 min-w-[220px]">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0">
                                {project.type === 'Wedding' ? (
                                  <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                                ) : project.type === 'Corporate' ? (
                                  <Briefcase className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                                ) : (
                                  <Camera className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                                )}
                                <span>{project.type}</span>
                              </span>
                              <span className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                                {project.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Client & Venue */}
                        <td className="px-3 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {project.client}
                            </span>
                            {project.venue && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate max-w-[160px]">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{project.venue}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Event Date & Countdown */}
                        <td className="px-3 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {project.first_event}
                            </span>
                            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 block">
                              {countdown.text}
                            </span>
                          </div>
                        </td>

                        {/* 5-Step Milestone Dropdown */}
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={currentStage}
                            onChange={(e) => handleSetStage(project, Number(e.target.value), e)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border border-transparent hover:border-slate-300 dark:hover:border-white/20 focus:outline-none cursor-pointer ${stageObj.badgeClass}`}
                          >
                            {PRODUCTION_STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-white dark:bg-[#12121a] text-slate-900 dark:text-white">
                                Stage {s.id}/5: {s.label} ({s.percent}%)
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Assigned Crew Avatars (No Emojis) */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center -space-x-1.5">
                            {crewList.map((c, i) => (
                              <div
                                key={c.id || i}
                                title={`${c.role}: ${c.name}`}
                                className="w-6 h-6 rounded-full bg-slate-800 border-2 border-white dark:border-[#0e1424] text-[9px] font-black text-white flex items-center justify-center shadow-2xs"
                              >
                                {c.initials}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment Balance Status Pill */}
                        <td className="px-3 py-3.5">
                          {project.payment_status === 'Paid' ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Paid in Full</span>
                            </span>
                          ) : project.payment_status === 'Partial' ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              <span>Retainer Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" />
                              <span>Invoice Due</span>
                            </span>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                              title="Send WhatsApp Call-Sheet to Crew"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/proposal/${project.id}`}
                              target="_blank"
                              title="Open Client Portal"
                              className="p-1.5 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 hover:bg-sky-100 border border-sky-200 dark:border-sky-500/20 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(project)}
                              title="Edit Shoot Details"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSingle(project, e)}
                              title="Delete Shoot"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
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
      {/* 2. VISUAL CARDS VIEW                                                      */}
      {/* ========================================================================= */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const currentStage = getStageFromCompleteness(project.completeness);
            const stageObj = PRODUCTION_STAGES[currentStage - 1] || PRODUCTION_STAGES[0];
            const countdown = getCountdownText(project.first_event);
            const coverImage = PROJECT_COVERS[project.type] || PROJECT_COVERS['Wedding'];
            const isSelected = selectedIds.includes(project.id);
            const crewList = project.assigned_crew || [];

            return (
              <div
                key={project.id}
                onClick={() => setSelectedDrawerProject(project)}
                className={`rounded-3xl bg-white dark:bg-[#0e1424] border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-white/10 hover:border-sky-400/50'
                }`}
              >
                {/* Cover Image Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-sky-500 text-white shadow-xs">
                      {project.type === 'Wedding' ? (
                        <Sparkles className="w-3 h-3 shrink-0" />
                      ) : project.type === 'Corporate' ? (
                        <Briefcase className="w-3 h-3 shrink-0" />
                      ) : (
                        <Camera className="w-3 h-3 shrink-0" />
                      )}
                      <span>{project.type}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {countdown.text}
                    </span>
                  </div>

                  {/* Shoot Title on Banner */}
                  <div className="absolute bottom-3 inset-x-3 z-10">
                    <h3 className="font-extrabold text-white text-base leading-tight truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      Client: {project.client}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Shoot Date & Venue */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>{project.first_event}</span>
                    </div>
                    {project.venue && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{project.venue}</span>
                      </span>
                    )}
                  </div>

                  {/* Progress Milestone Slider */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                        Stage {currentStage}/5: {stageObj.label}
                      </span>
                      <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400 text-xs">
                        {stageObj.percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${stageObj.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Crew Avatars & Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center -space-x-1.5">
                      {crewList.map((c, i) => (
                        <div
                          key={c.id || i}
                          title={`${c.role}: ${c.name}`}
                          className="w-6 h-6 rounded-full bg-slate-800 border-2 border-white dark:border-[#0e1424] text-[9px] font-black text-white flex items-center justify-center shadow-2xs"
                        >
                          {c.initials}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                        title="Send WhatsApp Call-Sheet"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/proposal/${project.id}`}
                        target="_blank"
                        title="Open Proposal"
                        className="p-2 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 hover:bg-sky-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(project, e)}
                        title="Delete"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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

      {/* ========================================================================= */}
      {/* 3. KANBAN PIPELINE BOARD VIEW                                             */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {PRODUCTION_STAGES.map((stage) => {
            const stageShoots = filteredProjects.filter(
              (p) => getStageFromCompleteness(p.completeness) === stage.id
            );

            return (
              <div
                key={stage.id}
                className="bg-slate-100/75 dark:bg-[#0e1424]/80 p-3.5 rounded-3xl border border-slate-200/80 dark:border-white/10 flex flex-col space-y-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5 px-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                      {stage.short}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {stageShoots.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1">
                  {stageShoots.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center text-[11px] text-slate-400">
                      No shoots in this stage
                    </div>
                  ) : (
                    stageShoots.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedDrawerProject(project)}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#161b2e] border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                            {project.type}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {project.first_event}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                          {project.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {project.client}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">{project.venue || 'Venue TBA'}</span>
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SLIDE-OVER SHOOT DETAIL DRAWER                                         */}
      {/* ========================================================================= */}
      {selectedDrawerProject && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#101524] border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                      {selectedDrawerProject.type}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Shoot Overview
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDrawerProject(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Shoot Title & Client */}
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    {selectedDrawerProject.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Client: <span className="text-slate-900 dark:text-white font-bold">{selectedDrawerProject.client}</span>
                  </p>
                </div>

                {/* Key Details Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shoot Date</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500" />
                      <span>{selectedDrawerProject.first_event}</span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call Time</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedDrawerProject.call_time || '08:00 AM'}</span>
                    </p>
                  </div>
                </div>

                {/* Venue Location */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Venue / Destination</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{selectedDrawerProject.venue || 'Main Location TBA'}</span>
                  </p>
                </div>

                {/* Assigned Production Crew */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Assigned Production Crew
                  </span>
                  <div className="space-y-2">
                    {(selectedDrawerProject.assigned_crew || []).map((crew) => (
                      <div
                        key={crew.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                            {crew.initials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{crew.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{crew.role}</p>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/${crew.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Deliverables Checklist
                  </span>
                  <div className="space-y-2">
                    {(selectedDrawerProject.deliverables || []).map((deliv) => (
                      <div
                        key={deliv.id}
                        onClick={() => handleToggleDeliverable(selectedDrawerProject.id, deliv.id)}
                        className={`p-3 rounded-xl border flex items-center space-x-3 transition-colors cursor-pointer ${
                          deliv.completed
                            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                            deliv.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-white/20 bg-white dark:bg-transparent'
                          }`}
                        >
                          {deliv.completed && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`text-xs font-medium ${deliv.completed ? 'line-through text-slate-500' : ''}`}>
                          {deliv.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                <button
                  onClick={(e) => handleSendWhatsAppBriefing(selectedDrawerProject, e)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Call-Sheet Briefing to Crew</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/proposal/${selectedDrawerProject.id}`}
                    target="_blank"
                    className="py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Client Portal</span>
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(selectedDrawerProject)}
                    className="py-2.5 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 hover:bg-sky-100 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Shoot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT PROJECT MODAL                                               */}
      {/* ========================================================================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isEditModalOpen ? 'Edit Shoot Project' : 'Create New Shoot Project'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleSaveEdit : handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Project / Shoot Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya & Rohan's Royal Destination Wedding"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Venue / Destination
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Taj Lake Palace"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Call Time
                  </label>
                  <input
                    type="text"
                    value={formData.call_time}
                    onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
                    placeholder="08:00 AM"
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={formData.first_event}
                    onChange={(e) => setFormData({ ...formData, first_event: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Production Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
                  >
                    {PRODUCTION_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        Stage {s.id}: {s.label} ({s.percent}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2.5 text-xs font-extrabold shadow-lg shadow-sky-500/25"
                >
                  {isEditModalOpen ? 'Save Changes' : 'Create Shoot Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
