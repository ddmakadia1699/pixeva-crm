'use client';

import React, { useState, useRef } from 'react';
import {
  Search,
  Download,
  FileUp,
  Plus,
  Trash2,
  X,
  HardDrive,
  CheckCircle2,
  Edit2,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { ShotDataEntry, RoleType } from '@/lib/supabase/types';

const INITIAL_DATA_ENTRIES: ShotDataEntry[] = [
  // Event 1: Reception (30 Dec 2026)
  {
    id: 'data-1',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Candid Photographers',
    role_type: 'Candid',
    storage_location: 'SSD 1',
    remark: '2 cards',
    is_recorded: true,
  },
  {
    id: 'data-2',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Traditional Photographers',
    role_type: 'Traditional',
    storage_location: 'SSD 1',
    remark: '1 card',
    is_recorded: true,
  },
  {
    id: 'data-3',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Cinematographers',
    role_type: 'Cinema',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-4',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Videographer',
    role_type: 'Video',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-5',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Drone',
    role_type: 'Drone',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-6',
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: 'Audio / Other',
    role_type: 'Audio',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },

  // Event 2: Wedding (31 Dec 2026)
  {
    id: 'data-7',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Candid Photographers #1',
    role_type: 'Candid',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-8',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Candid Photographers #2',
    role_type: 'Candid',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-9',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Traditional Photographers',
    role_type: 'Traditional',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-10',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Cinematographers #1',
    role_type: 'Cinema',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-11',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Cinematographers #2',
    role_type: 'Cinema',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-12',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Videographer',
    role_type: 'Video',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-13',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Drone',
    role_type: 'Drone',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
  {
    id: 'data-14',
    event_name: 'Wedding',
    event_date: '31 Dec 2026',
    crew_member: 'Audio / Other',
    role_type: 'Audio',
    storage_location: 'SSD 1',
    remark: '—',
    is_recorded: true,
  },
];

const STORAGE_OPTIONS = ['SSD 1', 'SSD 2', 'SSD 3', 'NAS Vault', 'Cloud Server', 'Card Box A', 'Card Box B'];

export default function DataPage() {
  const [entries, setEntries] = useState<ShotDataEntry[]>(INITIAL_DATA_ENTRIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStorage, setEditStorage] = useState('');
  const [editRemark, setEditRemark] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State - New Entry
  const [formData, setFormData] = useState({
    event_name: 'Reception',
    event_date: '30 Dec 2026',
    crew_member: '',
    role_type: 'Candid' as RoleType,
    storage_location: 'SSD 1',
    remark: '',
  });

  // CSV File Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter Entries by Search
  const filteredEntries = entries.filter((e) => {
    const query = searchTerm.toLowerCase();
    return (
      e.event_name.toLowerCase().includes(query) ||
      e.crew_member.toLowerCase().includes(query) ||
      e.storage_location.toLowerCase().includes(query) ||
      (e.remark && e.remark.toLowerCase().includes(query))
    );
  });

  // Group Filtered Entries by Event Name
  const groupedEvents = filteredEntries.reduce((acc, entry) => {
    const key = `${entry.event_name}___${entry.event_date}`;
    if (!acc[key]) {
      acc[key] = {
        event_name: entry.event_name,
        event_date: entry.event_date,
        items: [],
      };
    }
    acc[key].items.push(entry);
    return acc;
  }, {} as Record<string, { event_name: string; event_date: string; items: ShotDataEntry[] }>);

  // Recorded Statistics
  const recordedCount = entries.filter((e) => e.is_recorded).length;
  const totalCount = entries.length;

  // Inline Editing Storage & Remark
  const handleStartEditing = (entry: ShotDataEntry) => {
    setEditingId(entry.id);
    setEditStorage(entry.storage_location);
    setEditRemark(entry.remark || '');
  };

  const handleSaveEdit = (id: string) => {
    setEntries(
      entries.map((item) =>
        item.id === id
          ? { ...item, storage_location: editStorage, remark: editRemark }
          : item
      )
    );
    setEditingId(null);
  };

  // Delete Single Entry
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // Add New Entry Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crew_member.trim()) return;

    const newEntry: ShotDataEntry = {
      id: `data-${Date.now()}`,
      event_name: formData.event_name,
      event_date: formData.event_date,
      crew_member: formData.crew_member.trim(),
      role_type: formData.role_type,
      storage_location: formData.storage_location,
      remark: formData.remark.trim() || '—',
      is_recorded: true,
      created_at: new Date().toISOString(),
    };

    setEntries([...entries, newEntry]);
    setFormData({
      event_name: 'Reception',
      event_date: '30 Dec 2026',
      crew_member: '',
      role_type: 'Candid',
      storage_location: 'SSD 1',
      remark: '',
    });
    setIsAddModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (entries.length === 0) return;
    const headers = ['Event Name', 'Event Date', 'Crew Member', 'Role Type', 'Storage Location', 'Remark', 'Status'];
    const rows = entries.map((e) => [
      `"${e.event_name}"`,
      `"${e.event_date}"`,
      `"${e.crew_member}"`,
      e.role_type,
      `"${e.storage_location}"`,
      `"${e.remark || ''}"`,
      e.is_recorded ? 'Recorded' : 'Pending',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_ShotData_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Handler
  const handleProcessCsv = () => {
    if (!csvFile) return;
    setIsParsingCsv(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsed: ShotDataEntry[] = [];
      const startIndex = lines[0].toLowerCase().includes('event') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3) {
          parsed.push({
            id: `data-csv-${Date.now()}-${i}`,
            event_name: parts[0] || 'Reception',
            event_date: parts[1] || '30 Dec 2026',
            crew_member: parts[2] || 'Camera Operator',
            role_type: 'Candid',
            storage_location: parts[4] || 'SSD 1',
            remark: parts[5] || '—',
            is_recorded: true,
            created_at: new Date().toISOString(),
          });
        }
      }

      setTimeout(() => {
        setEntries([...parsed, ...entries]);
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

  // Role Initial Badge Helper
  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'Candid':
        return { initial: 'C', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
      case 'Traditional':
        return { initial: 'T', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'Cinema':
        return { initial: 'C', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' };
      case 'Video':
        return { initial: 'V', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'Drone':
        return { initial: 'D', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'Audio':
      case 'Other':
      default:
        return { initial: 'A', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center space-x-3">
            <span>Data</span>
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Track where shot data for each crew member is stored across all events
          </p>
        </div>

        {/* Counter Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {recordedCount}/{totalCount} recorded
            </span>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={entries.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#00d4ff]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Toolbar - Search input */}
      <div className="bg-[#12121a]/90 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project…"
            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
          />
        </div>

        <div className="text-xs text-[#a0a0b0]">
          Showing <span className="text-white font-bold">{filteredEntries.length}</span> entries across{' '}
          <span className="text-white font-bold">{Object.keys(groupedEvents).length}</span> events
        </div>
      </div>

      {/* Grouped Events Data Tables */}
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="pixeva-card rounded-2xl border border-white/10 p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-4xl">
            💾
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-white tracking-tight">No data records found</h3>
            <p className="text-xs text-[#a0a0b0]">
              Try searching with another project name or add a new record.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-lg shadow-[#00d4ff]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedEvents).map((group) => (
            <div
              key={`${group.event_name}-${group.event_date}`}
              className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card w-full space-y-0"
            >
              {/* Event Header Banner */}
              <div className="bg-[#0a0a0f] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-base font-extrabold text-white tracking-tight">
                    {group.event_name}
                  </h2>
                  <span className="text-xs font-medium text-[#a0a0b0] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#00d4ff]" />
                    <span>{group.event_date}</span>
                  </span>
                </div>

                <div className="text-xs text-[#a0a0b0] font-semibold">
                  {group.items.length} crew members
                </div>
              </div>

              {/* Event Crew Table */}
              <table className="w-full text-left text-xs text-[#a0a0b0] table-fixed">
                <thead className="bg-[#12121a] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="w-[45%] px-5 py-3">Crew Member</th>
                    <th className="w-[30%] px-5 py-3">Storage Location</th>
                    <th className="w-[15%] px-5 py-3">Remark</th>
                    <th className="w-[10%] px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {group.items.map((item) => {
                    const badge = getRoleBadge(item.role_type);
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        {/* Crew Member Column */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 ${badge.color}`}
                            >
                              {badge.initial}
                            </span>
                            <span className="font-semibold text-white text-xs truncate">
                              {item.crew_member}
                            </span>
                          </div>
                        </td>

                        {/* Storage Location Column */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <select
                              value={editStorage}
                              onChange={(e) => setEditStorage(e.target.value)}
                              className="bg-[#0a0a0f] border border-[#00d4ff] text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none w-full max-w-[180px]"
                            >
                              {STORAGE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-[#0a0a0f]">
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs font-bold">
                              <HardDrive className="w-3 h-3 text-[#00d4ff]" />
                              <span>{item.storage_location}</span>
                            </span>
                          )}
                        </td>

                        {/* Remark Column */}
                        <td className="px-5 py-3.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editRemark}
                              onChange={(e) => setEditRemark(e.target.value)}
                              placeholder="e.g. 2 cards"
                              className="bg-[#0a0a0f] border border-[#00d4ff] text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none w-full max-w-[140px]"
                            />
                          ) : (
                            <span className="text-[#a0a0b0] font-medium text-xs">
                              {item.remark || '—'}
                            </span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                title="Save changes"
                                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditing(item)}
                                title="Edit storage or remark"
                                className="p-1.5 rounded-lg bg-[#12121a] hover:bg-white/10 text-[#a0a0b0] hover:text-white border border-white/10 text-xs transition-all opacity-80 group-hover:opacity-100"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(item.id)}
                              title="Delete record"
                              className="p-1.5 rounded-lg bg-[#12121a] hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Add New Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Add Shot Data Record</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#a0a0b0] font-semibold mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="e.g. Reception"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[#a0a0b0] font-semibold mb-1">Event Date</label>
                <input
                  type="text"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  placeholder="e.g. 30 Dec 2026"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="block text-[#a0a0b0] font-semibold mb-1">Crew Member</label>
                <input
                  type="text"
                  required
                  value={formData.crew_member}
                  onChange={(e) => setFormData({ ...formData, crew_member: e.target.value })}
                  placeholder="e.g. Candid Photographers #1"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a0a0b0] font-semibold mb-1">Role Type</label>
                  <select
                    value={formData.role_type}
                    onChange={(e) => setFormData({ ...formData, role_type: e.target.value as RoleType })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Candid">Candid</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Cinema">Cinema</option>
                    <option value="Video">Video</option>
                    <option value="Drone">Drone</option>
                    <option value="Audio">Audio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a0a0b0] font-semibold mb-1">Storage Location</label>
                  <select
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    {STORAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0a0a0f]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#a0a0b0] font-semibold mb-1">Remark (Optional)</label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="e.g. 2 cards"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/5 text-[#a0a0b0] hover:text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Import Shot Data CSV</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#00d4ff] rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-[#0a0a0f]"
            >
              <FileUp className="w-8 h-8 text-[#00d4ff] mx-auto" />
              <p className="text-xs font-bold text-white">
                {csvFile ? csvFile.name : 'Click to upload or drag & drop CSV'}
              </p>
              <p className="text-[11px] text-[#a0a0b0]">Supports columns: Event, Date, Crew Member, Role, Storage, Remark</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
            </div>

            {importedCount !== null && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold text-center">
                ✓ Successfully imported {importedCount} records!
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/5 text-[#a0a0b0] hover:text-white font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!csvFile || isParsingCsv}
                onClick={handleProcessCsv}
                className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isParsingCsv ? 'Parsing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
