'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import {
  Search,
  FileUp,
  Download,
  Calendar,
  Briefcase,
  User,
  CheckCircle2,
  ListFilter,
  Plus,
  Trash2,
  X,
  FileText,
  Loader2,
  ChevronDown,
  RefreshCw,
  Image as ImageIcon,
  Film,
  Sliders,
  ExternalLink,
  UserPlus
} from 'lucide-react';

export type DeliverableStatus = 'Not Started' | 'In Progress' | 'For Review' | 'Done';

export interface Deliverable {
  id: string;
  project_name: string;
  project_type: string;
  shoot_date: string;
  specs_title: string;
  specs_subtitle: string;
  assigned_to: string | null;
  status: DeliverableStatus;
  gallery: string | null;
  client_access: string;
  created_at: string;
}

const INITIAL_DELIVERABLES: Deliverable[] = [
  {
    id: 'del-1',
    project_name: 'Bride & Groom (Demo)',
    project_type: 'Wedding',
    shoot_date: 'Shoot: 31 Dec 2026',
    specs_title: 'Traditional Photos',
    specs_subtitle: 'Unlimited • Unedited',
    assigned_to: null,
    status: 'Not Started',
    gallery: null,
    client_access: '—',
    created_at: new Date().toISOString(),
  },
  {
    id: 'del-2',
    project_name: 'Bride & Groom (Demo)',
    project_type: 'Wedding',
    shoot_date: 'Shoot: 31 Dec 2026',
    specs_title: 'Candid Photos',
    specs_subtitle: '150 • Edited',
    assigned_to: null,
    status: 'Not Started',
    gallery: null,
    client_access: '—',
    created_at: new Date(Date.now() - 1000).toISOString(),
  },
  {
    id: 'del-3',
    project_name: 'Bride & Groom (Demo)',
    project_type: 'Wedding',
    shoot_date: 'Shoot: 31 Dec 2026',
    specs_title: 'Highlight Video',
    specs_subtitle: '4 mins',
    assigned_to: null,
    status: 'Not Started',
    gallery: null,
    client_access: '—',
    created_at: new Date(Date.now() - 2000).toISOString(),
  },
  {
    id: 'del-4',
    project_name: 'Bride & Groom (Demo)',
    project_type: 'Wedding',
    shoot_date: 'Shoot: 31 Dec 2026',
    specs_title: 'Documentation Video',
    specs_subtitle: 'No Limit',
    assigned_to: null,
    status: 'Not Started',
    gallery: null,
    client_access: '—',
    created_at: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: 'del-5',
    project_name: 'Bride & Groom (Demo)',
    project_type: 'Wedding',
    shoot_date: 'Shoot: 31 Dec 2026',
    specs_title: 'Reel',
    specs_subtitle: '30 seconds',
    assigned_to: null,
    status: 'Not Started',
    gallery: null,
    client_access: '—',
    created_at: new Date(Date.now() - 4000).toISOString(),
  },
];

export default function PostProductionPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(INITIAL_DELIVERABLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('date_added');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [assigningItem, setAssigningItem] = useState<Deliverable | null>(null);
  const [galleryItem, setGalleryItem] = useState<Deliverable | null>(null);
  const [isStatusListOpen, setIsStatusListOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Modal Inputs
  const [memberInput, setMemberInput] = useState('Dhruvi Patel');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryPassword, setGalleryPassword] = useState('');
  const [galleryDate, setGalleryDate] = useState('');

  // CSV Drag State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics
  const totalCount = deliverables.length;
  const inProgressCount = deliverables.filter((d) => d.status === 'In Progress').length;
  const reviewCount = deliverables.filter((d) => d.status === 'For Review').length;
  const doneCount = deliverables.filter((d) => d.status === 'Done').length;

  // Filter & Sort Logic
  const filteredDeliverables = deliverables
    .filter((d) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        d.project_name.toLowerCase().includes(query) ||
        d.specs_title.toLowerCase().includes(query) ||
        d.specs_subtitle.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesMember =
        memberFilter === 'all' ||
        (memberFilter === 'unassigned' && !d.assigned_to) ||
        d.assigned_to === memberFilter;

      const matchesProject = projectFilter === 'all' || d.project_name === projectFilter;
      const matchesType = typeFilter === 'all' || d.specs_title.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMember && matchesProject && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'project') return a.project_name.localeCompare(b.project_name);
      if (sortBy === 'shoot_date') return a.shoot_date.localeCompare(b.shoot_date);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredDeliverables.length && filteredDeliverables.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDeliverables.map((d) => d.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected deliverables?`)) {
      setDeliverables(deliverables.filter((d) => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (id: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== id));
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  // Status Change
  const handleUpdateStatus = (id: string, newStatus: DeliverableStatus) => {
    setDeliverables(deliverables.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
  };

  // Assign Member Submit
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem) return;

    setDeliverables(
      deliverables.map((d) =>
        d.id === assigningItem.id ? { ...d, assigned_to: memberInput } : d
      )
    );
    setAssigningItem(null);
  };

  // Add Gallery Triggers
  const handleOpenGalleryModal = (item: Deliverable) => {
    setGalleryItem(item);
    setGalleryUrl(item.gallery || '');
    setGalleryPassword('');
    setGalleryDate(new Date().toISOString().slice(0, 10));
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryItem || !galleryUrl) return;

    setDeliverables(
      deliverables.map((d) =>
        d.id === galleryItem.id
          ? {
              ...d,
              gallery: galleryUrl,
              client_access: galleryPassword ? 'Protected Link' : 'Active Link',
            }
          : d
      )
    );
    setGalleryItem(null);
    setGalleryUrl('');
    setGalleryPassword('');
    setGalleryDate('');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredDeliverables.length === 0) return;
    const headers = ['ID', 'Project', 'Type', 'Shoot Info', 'Deliverable Title', 'Specs', 'Assigned To', 'Status', 'Gallery URL'];
    const rows = filteredDeliverables.map((d) => [
      d.id,
      `"${d.project_name}"`,
      `"${d.project_type}"`,
      `"${d.shoot_date}"`,
      `"${d.specs_title}"`,
      `"${d.specs_subtitle}"`,
      `"${d.assigned_to || 'Unassigned'}"`,
      d.status,
      `"${d.gallery || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_PostProduction_Export_${new Date().toISOString().slice(0, 10)}.csv`);
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
      const parsed: Deliverable[] = [];
      const startIndex = lines[0].toLowerCase().includes('project') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 2) {
          parsed.push({
            id: `del-csv-${Date.now()}-${i}`,
            project_name: parts[0] || 'Bride & Groom (Demo)',
            project_type: parts[1] || 'Wedding',
            shoot_date: parts[2] || 'Shoot: 31 Dec 2026',
            specs_title: parts[3] || 'Edited Deliverable',
            specs_subtitle: parts[4] || 'High-Res Package',
            assigned_to: null,
            status: 'Not Started',
            gallery: null,
            client_access: '—',
            created_at: new Date().toISOString(),
          });
        }
      }

      setTimeout(() => {
        setDeliverables([...parsed, ...deliverables]);
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
            Post Production
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            All deliverables across active projects
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-all animate-fadeIn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsStatusListOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <ListFilter className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Status List</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredDeliverables.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-white mb-1">{totalCount}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Total Deliverables</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-[#00d4ff] mb-1">{inProgressCount}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">In Progress</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-amber-400 mb-1">{reviewCount}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">For Review</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-emerald-400 mb-1">{doneCount}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Done</p>
        </div>
      </div>

      {/* Search & Multi-Dropdown Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#12121a]/90 p-4 rounded-2xl border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project or deliverable…"
            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="For Review">For Review</option>
              <option value="Done">Done</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Member Filter */}
          <div className="relative">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Members</option>
              <option value="unassigned">Unassigned</option>
              <option value="Dhruvi Patel">Dhruvi Patel</option>
              <option value="Rohan Verma">Rohan Verma</option>
              <option value="Alex Rivers">Alex Rivers</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Projects</option>
              <option value="Bride & Groom (Demo)">Bride & Groom (Demo)</option>
              <option value="Vance Corporate Annual Gala">Vance Corporate Annual Gala</option>
              <option value="BioTech Global Summit 2026">BioTech Global Summit 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="photos">Photos</option>
              <option value="video">Video</option>
              <option value="reel">Reel</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="date_added">By Date Added</option>
              <option value="project">By Project</option>
              <option value="shoot_date">By Shoot Date</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Deliverables Data Table */}
            <tbody className="divide-y divide-white/5">
              {filteredDeliverables.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#a0a0b0]">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">No deliverables found.</p>
                      <p className="text-xs text-[#a0a0b0]">
                        Try resetting your search query or dropdown filter selections.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliverables.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/5 transition-colors group ${
                        isSelected ? 'bg-[#00d4ff]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-bold text-white text-sm">{item.project_name}</div>
                          <div className="text-[11px] text-[#a0a0b0] mt-0.5">{item.project_type}</div>
                        </div>
                      </td>

                      {/* Type / Shoot Info */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white">
                          <Calendar className="w-3 h-3 text-[#00d4ff]" />
                          <span>{item.shoot_date}</span>
                        </span>
                      </td>

                      {/* Specs */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-bold text-white text-xs">{item.specs_title}</div>
                          <div className="text-[11px] text-[#a0a0b0] mt-0.5">{item.specs_subtitle}</div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-4">
                        {item.assigned_to ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">
                            <User className="w-3 h-3" />
                            <span>{item.assigned_to}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setAssigningItem(item)}
                            className="px-3 py-1 rounded-lg bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as DeliverableStatus)}
                          className={`border text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                            item.status === 'Not Started'
                              ? 'bg-white/5 text-[#a0a0b0] border-white/10'
                              : item.status === 'In Progress'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              : item.status === 'For Review'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          <option value="Not Started" className="bg-[#12121a] text-white">Not Started</option>
                          <option value="In Progress" className="bg-[#12121a] text-white">In Progress</option>
                          <option value="For Review" className="bg-[#12121a] text-white">For Review</option>
                          <option value="Done" className="bg-[#12121a] text-white">Done</option>
                        </select>
                      </td>

                      {/* Gallery */}
                      <td className="px-5 py-4">
                        {item.gallery ? (
                          <a
                            href={item.gallery}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#00d4ff] hover:underline flex items-center space-x-1 font-semibold"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>View Gallery</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => handleOpenGalleryModal(item)}
                            className="text-xs text-[#00d4ff] hover:underline font-semibold flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add gallery</span>
                          </button>
                        )}
                      </td>

                      {/* Client Access */}
                      <td className="px-5 py-4 font-mono text-white/60 text-xs">
                        {item.client_access}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeleteSingle(item.id)}
                          title="Delete Deliverable"
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

      {/* Assign Member Modal */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Assign Team Member</h3>
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Deliverable</label>
                <input
                  type="text"
                  readOnly
                  value={`${assigningItem.specs_title} (${assigningItem.project_name})`}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-[#a0a0b0]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Select Member</label>
                <select
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Dhruvi Patel" className="bg-[#12121a]">Dhruvi Patel</option>
                  <option value="Rohan Verma" className="bg-[#12121a]">Rohan Verma</option>
                  <option value="Alex Rivers" className="bg-[#12121a]">Alex Rivers</option>
                  <option value="Unassigned" className="bg-[#12121a]">Unassigned</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssigningItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Assign Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gallery Modal */}
      {galleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Add Gallery</h3>
              <button
                type="button"
                onClick={() => setGalleryItem(null)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-3.5 text-xs">
              {/* Field 1: Gallery Link */}
              <div>
                <input
                  type="text"
                  required
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  placeholder="Gallery link…"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              {/* Field 2: Password (optional) */}
              <div>
                <input
                  type="password"
                  value={galleryPassword}
                  onChange={(e) => setGalleryPassword(e.target.value)}
                  placeholder="Password (optional)"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              {/* Field 3: Date Picker */}
              <div>
                <div className="relative">
                  <input
                    type="date"
                    value={galleryDate}
                    onChange={(e) => setGalleryDate(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff] [color-scheme:dark]"
                  />
                  <Calendar className="w-4 h-4 text-[#00d4ff] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setGalleryItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status List Modal */}
      {isStatusListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Status Breakdown List</h3>
              <button
                type="button"
                onClick={() => setIsStatusListOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                <span className="text-[#a0a0b0]">Not Started</span>
                <span className="font-bold text-white">{deliverables.filter((d) => d.status === 'Not Started').length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                <span className="text-[#00d4ff]">In Progress</span>
                <span className="font-bold text-[#00d4ff]">{inProgressCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                <span className="text-amber-400">For Review</span>
                <span className="font-bold text-amber-400">{reviewCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                <span className="text-emerald-400">Done</span>
                <span className="font-bold text-emerald-400">{doneCount}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStatusListOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20"
              >
                Close
              </button>
            </div>
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
                <h3 className="font-extrabold text-white text-base">Import CSV Deliverables</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#a0a0b0]">
                Upload a CSV file containing columns for <strong className="text-white">Project Name, Type, Shoot Info, Deliverable Title, Specs</strong>.
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
                    <p className="font-bold text-sm">Successfully Imported {importedCount} Deliverables!</p>
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
                  <span>Import Deliverables</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
