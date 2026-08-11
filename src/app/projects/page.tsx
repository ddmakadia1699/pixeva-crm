'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Project, ProjectStatus, ContractStatus } from '@/lib/supabase/types';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
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
  Layers
} from 'lucide-react';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Bride & Groom (Demo)',
    type: 'Wedding',
    client: 'Bride & Groom (Demo)',
    first_event: '30 Dec 2026',
    status: 'Active',
    completeness: 'Complete',
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
    contract: 'Pending',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Wedding',
    client: '',
    first_event: '',
    status: 'Active' as ProjectStatus,
    completeness: 'Complete',
    contract: 'Accepted' as ContractStatus,
  });

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesTab = activeTab === 'Active' ? p.status === 'Active' : p.status === 'Archived';
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'event_date') return a.first_event.localeCompare(b.first_event);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProjects.length && filteredProjects.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProjects.map((p) => p.id));
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
    if (window.confirm(`Delete ${selectedIds.length} selected projects?`)) {
      setProjects(projects.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      client: formData.client,
      first_event: formData.first_event || '30 Dec 2026',
      status: formData.status,
      completeness: formData.completeness,
      contract: formData.contract,
      created_at: new Date().toISOString(),
    };

    setProjects([newProj, ...projects]);
    setFormData({
      name: '',
      type: 'Wedding',
      client: '',
      first_event: '',
      status: 'Active',
      completeness: 'Complete',
      contract: 'Accepted',
    });
    setIsAddModalOpen(false);
  };

  // Edit Trigger
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
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

  // Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setProjects(
      projects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              name: formData.name,
              type: formData.type,
              client: formData.client,
              first_event: formData.first_event,
              status: formData.status,
              completeness: formData.completeness,
              contract: formData.contract,
            }
          : p
      )
    );

    setIsEditModalOpen(false);
    setEditingProject(null);
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

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
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
        setProjects([...parsed, ...projects]);
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
            Projects
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Manage shoots, schedules, deliverables and payments
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
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredProjects.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-[#12121a] p-1 rounded-xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('Active')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'Active'
                ? 'bg-[#00d4ff] text-black shadow-md'
                : 'text-[#a0a0b0] hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('Archived')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'Archived'
                ? 'bg-[#00d4ff] text-black shadow-md'
                : 'text-[#a0a0b0] hover:text-white'
            }`}
          >
            Archived
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects…"
              className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#12121a] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-8 appearance-none"
            >
              <option value="date_added">By Date Added</option>
              <option value="name">By Name</option>
              <option value="event_date">By First Event Date</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Showing Counter */}
      <div className="flex items-center justify-between px-1 text-xs text-[#a0a0b0]">
        <div className="font-semibold">
          Showing <span className="text-white font-bold">{filteredProjects.length}</span> of{' '}
          <span className="text-white font-bold">{projects.length}</span> projects
        </div>
      </div>

      {/* Projects Table */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#a0a0b0]">
            <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-semibold border-b border-white/10 text-[10px]">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredProjects.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5">Project</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Client</th>
                <th className="px-5 py-3.5">First Event</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Completeness</th>
                <th className="px-5 py-3.5">Contract</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#a0a0b0]">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">No projects found.</p>
                      <p className="text-xs text-[#a0a0b0]">
                        Try searching with a different term or switch between Active and Archived tabs.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/5 transition-colors group ${
                        isSelected ? 'bg-[#00d4ff]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Project Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#00d4ff] flex items-center justify-center font-bold text-white text-xs shadow-md">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{p.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 font-semibold text-white">
                        {p.type}
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <span className="text-white font-medium flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-[#00d4ff]" />
                          <span>{p.client}</span>
                        </span>
                      </td>

                      {/* First Event */}
                      <td className="px-5 py-4 font-mono text-white/90">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#8b5cf6]" />
                          <span>{p.first_event}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            p.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-white/10 text-white/60 border-white/20'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Completeness */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 text-xs font-bold flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{p.completeness}</span>
                        </span>
                      </td>

                      {/* Contract */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 w-fit ${
                            p.contract === 'Accepted'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          <FileSignature className="w-3 h-3" />
                          <span>{p.contract}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#12121a] hover:bg-[#00d4ff]/20 text-white hover:text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSingle(p.id)}
                          title="Delete Project"
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

      {/* New Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-lg">New Project</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-white block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bride & Groom (Demo)"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. Wedding"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Client *</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client name"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">First Event Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.first_event}
                      onChange={(e) => setFormData({ ...formData, first_event: e.target.value })}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff] [color-scheme:dark]"
                    />
                    <Calendar className="w-4 h-4 text-[#00d4ff] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Active" className="bg-[#12121a]">Active</option>
                    <option value="Archived" className="bg-[#12121a]">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Completeness</label>
                  <input
                    type="text"
                    value={formData.completeness}
                    onChange={(e) => setFormData({ ...formData, completeness: e.target.value })}
                    placeholder="e.g. Complete or 80%"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Contract Status</label>
                  <select
                    value={formData.contract}
                    onChange={(e) => setFormData({ ...formData, contract: e.target.value as ContractStatus })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Accepted" className="bg-[#12121a]">Accepted</option>
                    <option value="Pending" className="bg-[#12121a]">Pending</option>
                    <option value="Draft" className="bg-[#12121a]">Draft</option>
                  </select>
                </div>
              </div>

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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-lg">Edit Project</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-white block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Client</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">First Event Date</label>
                  <input
                    type="text"
                    value={formData.first_event}
                    onChange={(e) => setFormData({ ...formData, first_event: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Active" className="bg-[#12121a]">Active</option>
                    <option value="Archived" className="bg-[#12121a]">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-white block mb-1">Completeness</label>
                  <input
                    type="text"
                    value={formData.completeness}
                    onChange={(e) => setFormData({ ...formData, completeness: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="font-medium text-white block mb-1">Contract Status</label>
                  <select
                    value={formData.contract}
                    onChange={(e) => setFormData({ ...formData, contract: e.target.value as ContractStatus })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Accepted" className="bg-[#12121a]">Accepted</option>
                    <option value="Pending" className="bg-[#12121a]">Pending</option>
                    <option value="Draft" className="bg-[#12121a]">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Save Changes
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
                <h3 className="font-extrabold text-white text-base">Import CSV Projects</h3>
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
                Upload a CSV file containing columns for <strong className="text-white">Project Name, Type, Client, First Event Date</strong>.
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
                    <p className="font-bold text-sm">Successfully Imported {importedCount} Projects!</p>
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
                  <span>Import Projects</span>
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
