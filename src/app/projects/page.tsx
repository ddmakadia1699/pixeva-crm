'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project, ProjectStatus, ContractStatus } from '@/lib/supabase/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { apiClient } from '@/lib/api/apiClient';
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
  client_phone?: string;
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
    client_phone: '919876543211',
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
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '919876543219' },
      { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '919876543219' },
      { id: 'c3', name: 'Vikram Patel', role: 'Drone Pilot', initials: 'VP', phone: '919876543219' },
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
    client_phone: '919876543212',
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
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '919876543219' },
      { id: 'c4', name: 'Sneha Joshi', role: 'Lead Editor', initials: 'SJ', phone: '919876543219' },
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
    client_phone: '919876543213',
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
      { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '919876543219' },
      { id: 'c3', name: 'Vikram Patel', role: 'Drone Pilot', initials: 'VP', phone: '919876543219' },
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
      { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '919876543219' },
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
  { id: 1, label: 'Contract Signed', short: 'Contract', percent: 20, badgeClass: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  { id: 2, label: 'Crew Scheduled', short: 'Crew Locked', percent: 40, badgeClass: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  { id: 3, label: 'Shoot Completed', short: 'Shoot Done', percent: 60, badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50' },
  { id: 4, label: 'Post-Production / Editing', short: 'Post-Prod (85%)', percent: 85, badgeClass: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300' },
  { id: 5, label: 'Gallery Delivered', short: 'Delivered (100%)', percent: 100, badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50' },
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
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');

  // Drawer Panel for Shoot Details
  

  // Load via AWS API Gateway with account scoping
  useEffect(() => {
    async function loadProjects() {
      try {
        const cloudData = await apiClient.projects.list();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          const mapped: ExtendedProject[] = cloudData.map((p: any) => ({
            id: p.id,
            name: p.title || p.name || 'Shoot Project',
            type: p.event_type === 'wedding' ? 'Wedding' : p.event_type === 'corporate' ? 'Corporate' : 'Commercial',
            client: p.client_name || p.client || 'Client',
            first_event: p.date ? p.date.split('T')[0] : (p.first_event || new Date().toISOString().split('T')[0]),
            venue: p.location || p.venue || 'Main Event Ballroom',
            call_time: p.call_time || '08:00 AM',
            total_amount: Number(p.price || p.total_amount) || 2500,
            paid_amount: Number(p.deposit_paid || p.paid_amount) || 1250,
            payment_status: p.payment_status || (p.deposit_paid >= p.price ? 'Paid' : 'Partial'),
            status: p.status || 'Active',
            completeness: p.completeness || 'In Progress (50%)',
            contract: p.contract_status || p.contract || 'Accepted',
            assigned_crew: p.assigned_crew || [],
            deliverables: p.deliverables || [],
            created_at: p.created_at || new Date().toISOString(),
          }));
          setProjects(mapped);
          try {
            localStorage.setItem('pixeva_projects', JSON.stringify(mapped));
          } catch { }
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn('API Gateway project sync notice, falling back to local cache:', err);
      }

      try {
        const saved = localStorage.getItem('pixeva_projects');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProjects(parsed);
          }
        } else {
          
        }
      } catch (e) {
        console.error('Error reading pixeva_projects from localStorage', e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadProjects();
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
    itemName?: string;
    itemType?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: true,
    onConfirm: () => { },
  });

  // Form State

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    client: '',
    client_phone_prefix: '+91',
    client_phone: '',
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

    if (editingProject && editingProject.id === project.id) {
      setEditingProject((prev) => (prev ? { ...prev, completeness: completenessText } : null));
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

    if (editingProject && editingProject.id === projectId) {
      setEditingProject((prev) => {
        if (!prev) return null;
        const currentDelivs = prev.deliverables || [];
        const updated = currentDelivs.map((d) =>
          d.id === deliverableId ? { ...d, completed: !d.completed } : d
        );
        return { ...prev, deliverables: updated };
      });
    }
  };


  // Open Add Modal
  const handleOpenAdd = () => {
    const prefix = typeof window !== 'undefined' ? (localStorage.getItem('pixeva_phone_prefix') || '+91') : '+91';
    setFormData({
      name: '',
      type: 'Wedding',
      client: '',
      client_phone_prefix: prefix,
      client_phone: '',
      first_event: new Date().toISOString().slice(0, 10),
      venue: '',
      call_time: '08:00 AM',
      total_amount: 2500,
      paid_amount: 1250,
      status: 'Active',
      stage: 1,
      contract: 'Accepted',
    });
    setEditingProject(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project: ExtendedProject) => {
    setEditingProject(project);
    let prefix = typeof window !== 'undefined' ? (localStorage.getItem('pixeva_phone_prefix') || '+91') : '+91';
    let phoneNum = project.client_phone || '';
    
    // Auto-detect if phone string starts with +
    if (phoneNum.startsWith('+')) {
      // Find where prefix ends (usually +XX or +XXX)
      const spaceIdx = phoneNum.indexOf(' ');
      if (spaceIdx !== -1) {
         prefix = phoneNum.slice(0, spaceIdx);
         phoneNum = phoneNum.slice(spaceIdx + 1);
      } else {
         // simple fallback: +91, +1, +44, +61, +65, +971
         const possiblePrefixes = ['+971', '+44', '+61', '+65', '+91', '+1'];
         for (const p of possiblePrefixes) {
           if (phoneNum.startsWith(p)) {
             prefix = p;
             phoneNum = phoneNum.slice(p.length);
             break;
           }
         }
      }
    }

    setFormData({
      name: project.name,
      type: project.type,
      client: project.client,
      client_phone_prefix: prefix,
      client_phone: phoneNum,
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
            client_phone: formData.client_phone ? `${formData.client_phone_prefix}${formData.client_phone}` : '',
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

    apiClient.projects.update(editingProject.id, {
      title: formData.name,
      event_type: formData.type,
      client_name: formData.client,
      location: formData.venue,
      price: formData.total_amount,
      deposit_paid: formData.paid_amount,
      status: formData.status,
    }).catch((err) => console.warn('Could not sync project update to cloud:', err));

    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
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

    const tempId = `proj-${Date.now()}`;
    const newProject: ExtendedProject = {
      id: tempId,
      name: formData.name,
      type: formData.type,
      client: formData.client,
      client_phone: formData.client_phone ? `${formData.client_phone_prefix}${formData.client_phone}` : '',
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
        { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '919876543219' },
        { id: 'c2', name: 'Rahul Verma', role: 'Cinematographer', initials: 'RV', phone: '919876543219' },
      ],
      deliverables: [
        { id: 'd1', title: 'Master 4K Cinematic Video Cut', completed: false },
        { id: 'd2', title: 'High-Resolution Edited Photo Album', completed: false },
      ],
      created_at: new Date().toISOString(),
    };

    updateProjects((prev) => [newProject, ...prev]);
    setIsAddModalOpen(false);

    try {
      const created = await apiClient.projects.create({
        title: formData.name,
        name: formData.name,
        event_type: formData.type,
        client_name: formData.client,
        date: formData.first_event || new Date().toISOString(),
        location: formData.venue,
        call_time: formData.call_time,
        price: formData.total_amount,
        deposit_paid: formData.paid_amount,
        status: formData.status,
      });

      if (created?.id) {
        updateProjects((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: created.id } : item))
        );
      }
    } catch (err) {
      console.warn('Could not sync created project to cloud:', err);
    }

    setFormData({
      name: '',
      type: 'Wedding',
      client: '',
      client_phone_prefix: '+91',
      client_phone: '',
      first_event: '',
      venue: '',
      call_time: '08:00 AM',
      total_amount: 2500,
      paid_amount: 1250,
      status: 'Active' as ProjectStatus,
      stage: 1,
      contract: 'Accepted' as ContractStatus,
    });
  };

  // Delete Single Project
  const handleDeleteSingle = (project: ExtendedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: `Delete "${project.name}"?`,
      message: 'This will permanently remove the shoot project file, crew assignments, and financial records from your active studio workspace and Supabase database.',
      confirmText: 'Delete Project',
      isDestructive: true,
      itemName: project.name,
      itemType: `${project.type} Shoot`,
      onConfirm: () => {
        updateProjects((prev) => prev.filter((p) => p.id !== project.id));
        setSelectedIds((prev) => prev.filter((id) => id !== project.id));
        if (editingProject?.id === project.id) setEditingProject(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        apiClient.projects.delete(project.id).catch((err) => console.warn('Cloud delete notice:', err));
      },
    });
  };

  // Delete Selected Projects
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Delete ${selectedIds.length} Projects?`,
      message: 'This action will permanently purge all selected production shoot files and timelines from cloud storage.',
      confirmText: `Delete ${selectedIds.length} Projects`,
      isDestructive: true,
      itemName: `${selectedIds.length} Selected Projects`,
      itemType: 'Batch Production Files',
      onConfirm: () => {
        const idSet = new Set(selectedIds);
        updateProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
        setSelectedIds([]);
        setEditingProject(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // WhatsApp Shoot Call Sheet
  const handleSendWhatsAppBriefing = (project: ExtendedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const stage = PRODUCTION_STAGES[getStageFromCompleteness(project.completeness) - 1].label;
    const msg = `*Pixeva Studio Shoot Call-Sheet & Briefing*\n\n📌 *Project:* ${project.name}\n👤 *Client:* ${project.client}\n📅 *Event Date:* ${project.first_event}\n📍 *Venue:* ${project.venue || 'Main Location'}\n⏰ *Call Time:* ${project.call_time || '08:00 AM'}\n🎯 *Production Milestone:* ${stage}\n📋 *Contract Status:* Signed & Confirmed\n\n*Crew Protocol:* Please arrive 45 mins early with formatted dual SD cards and backup batteries.`;
    
    // Use client phone or a generic placeholder if missing (so it doesn't use the hardcoded revepod number)
    const rawPhone = (project.client_phone || '9876543210').replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Projects & Production
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              {projects.length} Shoots
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage confirmed shoots, 5-stage production pipelines, crew schedules, and deliverable handoffs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="btn-pixeva-secondary space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-pixeva-primary space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Shoot Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pixeva-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Active Shoots</span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{activeShootsCount}</p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Active Production Schedule</span>
          </div>
        </div>

        <div className="pixeva-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>In Post-Production</span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{inPostProdCount}</p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
            <Video className="w-3 h-3 shrink-0" />
            <span>Color Grading & Master Cut</span>
          </div>
        </div>

        <div className="pixeva-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Signed Contracts</span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{contractsCount}</p>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Agreements Locked</span>
          </div>
        </div>

        <div className="pixeva-card p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Delivered Galleries</span>
            <div className="p-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{deliveredCount}</p>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Archived in Studio Cloud</span>
          </div>
        </div>
      </div>

      {/* Filter & 3-Way View Switcher Bar */}
      <div className="pixeva-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active/Archived Tabs & Search Box */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('Active')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${activeTab === 'Active'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              Active ({projects.filter((p) => p.status === 'Active').length})
            </button>
            <button
              onClick={() => setActiveTab('Archived')}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${activeTab === 'Archived'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              Archived ({projects.filter((p) => p.status === 'Archived').length})
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shoot, client, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-md bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Sort & 3-Way View Switcher (Table | Cards | Kanban) */}
        <div className="flex items-center space-x-2 justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="date_earliest">Shoot Date (Earliest)</option>
            <option value="date_latest">Shoot Date (Latest)</option>
            <option value="date_added">Date Added</option>
          </select>

          {/* 3-Way View Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs space-x-0.5">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${viewMode === 'table'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              title="Cards View"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${viewMode === 'cards'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              title="Pipeline View"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
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
        <div className="pixeva-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/75 dark:bg-[#111827] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProjects.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 dark:border-white/20 bg-transparent text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Project / Shoot</th>
                  <th className="px-3 py-3">Client & Venue</th>
                  <th className="px-3 py-3">Event Date</th>
                  <th className="px-4 py-3">Milestone</th>
                  <th className="px-3 py-3">Crew</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
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
                        onClick={() => handleOpenEdit(project)}
                        className={`hover:bg-slate-50/75 dark:hover:bg-white/5 transition-colors cursor-pointer group ${isSelected ? 'bg-slate-50/80 dark:bg-white/5' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(project.id, e as any)}
                            className="rounded border-slate-300 dark:border-white/20 bg-transparent text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Project Name & Type */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5 min-w-[200px]">
                            <div className="flex items-center space-x-1.5">
                              <span className="inline-flex items-center text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 shrink-0">
                                {project.type}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                                {project.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Client & Venue */}
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">
                              {project.client}
                            </span>
                            {project.client_phone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let p = project.client_phone || '';
                                  if (!p.startsWith('+')) {
                                    const prefix = localStorage.getItem('pixeva_phone_prefix') || '+91';
                                    p = `${prefix}${p}`;
                                  }
                                  window.open(`https://wa.me/${p.replace(/[^0-9]/g, '')}`, '_blank');
                                }}
                                className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center space-x-1 truncate max-w-[150px] transition-colors mt-0.5 text-left"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                                <span>+{project.client_phone}</span>
                              </button>
                            )}
                            {project.venue && (
                              <span className="text-[10px] text-slate-400 flex items-center space-x-1 truncate max-w-[150px] mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{project.venue}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Event Date & Countdown */}
                        <td className="px-3 py-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-900 dark:text-white block">
                              {project.first_event}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {countdown.text}
                            </span>
                          </div>
                        </td>

                        {/* 5-Step Milestone Dropdown */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={currentStage}
                            onChange={(e) => handleSetStage(project, Number(e.target.value), e)}
                            className={`text-[11px] font-medium px-2 py-1 rounded-md border border-slate-200/80 dark:border-white/10 focus:outline-none cursor-pointer ${stageObj.badgeClass}`}
                          >
                            {PRODUCTION_STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                                Stage {s.id}: {s.label} ({s.percent}%)
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Assigned Crew Avatars */}
                        <td className="px-3 py-3">
                          <div className="flex items-center -space-x-1">
                            {crewList.map((c, i) => (
                              <div
                                key={c.id || i}
                                title={`${c.role}: ${c.name}`}
                                className="w-5 h-5 rounded-full bg-slate-800 border border-white dark:border-[#0f172a] text-[8px] font-bold text-white flex items-center justify-center"
                              >
                                {c.initials}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment Balance Status Pill */}
                        <td className="px-3 py-3">
                          {project.payment_status === 'Paid' ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Paid in Full</span>
                            </span>
                          ) : project.payment_status === 'Partial' ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Retainer Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Due</span>
                            </span>
                          )}
                        </td>

                        {/* Quick Actions */}
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                              title="Send WhatsApp Call-Sheet"
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </button>

                            <Link
                              href={`/proposal/${project.id}`}
                              target="_blank"
                              title="Open Client Portal"
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(project)}
                              title="Edit Shoot Details"
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSingle(project, e)}
                              title="Delete Shoot"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                onClick={() => handleOpenEdit(project)}
                className={`pixeva-card pixeva-card-hover overflow-hidden flex flex-col justify-between cursor-pointer ${isSelected ? 'border-slate-800 dark:border-slate-200' : ''
                  }`}
              >
                {/* Cover Image Banner */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                  <img
                    src={coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Badges on Cover */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white">
                      {project.type}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white">
                      {countdown.text}
                    </span>
                  </div>

                  {/* Shoot Title on Banner */}
                  <div className="absolute bottom-2.5 inset-x-2.5 z-10">
                    <h3 className="font-bold text-white text-sm leading-tight truncate">
                      {project.name}
                    </h3>
                    <p className="text-[11px] text-slate-300 truncate">
                      Client: {project.client}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Shoot Date & Venue */}
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.first_event}</span>
                    </div>
                    {project.venue && (
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{project.venue}</span>
                      </span>
                    )}
                  </div>

                  {/* Progress Milestone */}
                  <div className="space-y-1 bg-slate-50/80 dark:bg-[#111827] p-2.5 rounded-lg border border-slate-200/60 dark:border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {stageObj.label}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white text-xs">
                        {stageObj.percent}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-300"
                        style={{ width: `${stageObj.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Crew Avatars & Action Buttons */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center -space-x-1">
                      {crewList.map((c, i) => (
                        <div
                          key={c.id || i}
                          title={`${c.role}: ${c.name}`}
                          className="w-5 h-5 rounded-full bg-slate-800 border border-white dark:border-[#0f172a] text-[8px] font-bold text-white flex items-center justify-center"
                        >
                          {c.initials}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                        title="Send WhatsApp Call-Sheet"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      <Link
                        href={`/proposal/${project.id}`}
                        target="_blank"
                        title="Open Proposal"
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(project, e)}
                        title="Delete"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {PRODUCTION_STAGES.map((stage) => {
            const stageShoots = filteredProjects.filter(
              (p) => getStageFromCompleteness(p.completeness) === stage.id
            );

            return (
              <div
                key={stage.id}
                className="bg-slate-100/70 dark:bg-[#111827]/60 p-3 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col space-y-2.5 min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2 px-1">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {stage.short}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {stageShoots.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2 flex-1">
                  {stageShoots.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-white/10 text-center text-[11px] text-slate-400">
                      No shoots in stage
                    </div>
                  ) : (
                    stageShoots.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleOpenEdit(project)}
                        className="p-3 rounded-lg bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {project.type}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {project.first_event}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:underline line-clamp-2 leading-snug">
                          {project.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {project.client}
                        </p>

                        <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 truncate max-w-[120px]">{project.venue || 'Venue TBA'}</span>
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleSendWhatsAppBriefing(project, e)}
                              className="p-1 rounded hover:bg-slate-100 text-emerald-600"
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
      {/* CREATE / EDIT PROJECT MODAL                                               */}
      {/* ========================================================================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg pixeva-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditModalOpen ? 'Edit Shoot Project' : 'Create New Shoot Project'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleSaveEdit : handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Project / Shoot Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya & Rohan's Royal Destination Wedding"
                  className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Private Event">Private Event</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Client Phone
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formData.client_phone_prefix || '+91'}
                      onChange={(e) => setFormData({ ...formData, client_phone_prefix: e.target.value })}
                      className="w-24 bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+65">+65 (SG)</option>
                    </select>
                    <input
                      type="text"
                      value={formData.client_phone || ''}
                      onChange={(e) => setFormData({ ...formData, client_phone: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="9876543210"
                      className="w-full min-w-0 bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Venue / Destination
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Taj Lake Palace"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={formData.first_event}
                    onChange={(e) => setFormData({ ...formData, first_event: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Call Time
                  </label>
                  <input
                    type="text"
                    value={formData.call_time}
                    onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
                    placeholder="08:00 AM"
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Production Stage
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  {PRODUCTION_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      Stage {s.id}: {s.label} ({s.percent}%)
                    </option>
                  ))}
                </select>
              </div>

              
              {isEditModalOpen && editingProject && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-4">
                  {/* Assigned Production Crew */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Assigned Production Crew
                    </span>
                    <div className="space-y-1.5">
                      {(editingProject.assigned_crew || []).map((crew) => (
                        <div
                          key={crew.id}
                          className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                              {crew.initials}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{crew.name}</p>
                              <p className="text-[10px] text-slate-400">{crew.role}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                               let p = crew.phone || '';
                               if (!p.startsWith('+')) {
                                 const prefix = localStorage.getItem('pixeva_phone_prefix') || '+91';
                                 p = `${prefix}${p}`;
                               }
                               window.open(`https://wa.me/${p.replace(/[^0-9]/g, '')}`, '_blank');
                            }}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Deliverables Checklist
                    </span>
                    <div className="space-y-1.5">
                      {(editingProject.deliverables || []).map((deliv) => (
                        <div
                          key={deliv.id}
                          onClick={() => handleToggleDeliverable(editingProject.id, deliv.id)}
                          className={`p-2.5 rounded-lg border flex items-center space-x-2.5 transition-colors cursor-pointer ${deliv.completed
                              ? 'bg-emerald-50/60 border-emerald-200/80 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-slate-900 dark:text-white'
                              : 'bg-slate-50/80 dark:bg-[#111827] border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${deliv.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-white/20 bg-white dark:bg-transparent'
                              }`}
                          >
                            {deliv.completed && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className={`text-xs font-medium ${deliv.completed ? 'line-through text-slate-400' : ''}`}>
                            {deliv.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleSendWhatsAppBriefing(editingProject, e)}
                      className="w-full btn-pixeva-primary space-x-2 justify-center py-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Call-Sheet</span>
                    </button>
                    <a
                      href={`/proposal/${editingProject.id}`}
                      target="_blank"
                      className="btn-pixeva-secondary space-x-1.5 justify-center py-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Client Portal</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="btn-pixeva-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-pixeva-primary"
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
        itemName={confirmModal.itemName}
        itemType={confirmModal.itemType}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
