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
} from 'lucide-react';
import { ShotDataEntry, RoleType } from '@/lib/supabase/types';

const INITIAL_DATA_ENTRIES: ShotDataEntry[] = []; // cleared mock data;

const STORAGE_OPTIONS = ['SSD 1', 'SSD 2', 'SSD 3', 'NAS Vault', 'Cloud Server', 'Card Box A', 'Card Box B'];

export default function DataPage() {
  const [entries, setEntries] = useState<ShotDataEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStorage, setEditStorage] = useState('');
  const [editRemark, setEditRemark] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // ESC key to close all modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsImportModalOpen(false);
        setEditingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Role Initial Badge Helper (soft muted colors)
  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'Candid':
        return { initial: 'C', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
      case 'Traditional':
        return { initial: 'T', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
      case 'Cinema':
        return { initial: 'C', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
      case 'Video':
        return { initial: 'V', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
      case 'Drone':
        return { initial: 'D', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
      case 'Audio':
      case 'Other':
      default:
        return { initial: 'A', color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Data
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track where shot data for each crew member is stored across all events
          </p>
        </div>

        {/* Counter Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {recordedCount}/{totalCount} recorded
            </span>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-pixeva-secondary flex items-center space-x-1.5"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={entries.length === 0}
            className="btn-pixeva-secondary flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Toolbar - Search input */}
      <div className="pixeva-card p-3 rounded-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search project or event…"
            className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="text-slate-900 dark:text-white font-semibold">{filteredEntries.length}</span> entries across{' '}
          <span className="text-slate-900 dark:text-white font-semibold">{Object.keys(groupedEvents).length}</span> events
        </div>
      </div>

      {/* Grouped Events Data Tables */}
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="pixeva-card rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No data records found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try searching with another project name or add a new record.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary inline-flex items-center space-x-1.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.values(groupedEvents).map((group) => (
            <div
              key={`${group.event_name}-${group.event_date}`}
              className="pixeva-card rounded-xl overflow-hidden w-full"
            >
              {/* Event Header Banner */}
              <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {group.event_name}
                  </h2>
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{group.event_date}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {group.items.length} crew members
                </div>
              </div>

              {/* Event Crew Table */}
              <table className="w-full text-left text-xs table-fixed">
                <thead className="bg-white dark:bg-slate-900/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <tr>
                    <th className="w-[45%] px-4 py-2.5">Crew Member</th>
                    <th className="w-[30%] px-4 py-2.5">Storage Location</th>
                    <th className="w-[15%] px-4 py-2.5">Remark</th>
                    <th className="w-[10%] px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.items.map((item) => {
                    const badge = getRoleBadge(item.role_type);
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                        {/* Crew Member Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`w-6 h-6 rounded-md border font-semibold text-[11px] flex items-center justify-center shrink-0 ${badge.color}`}
                            >
                              {badge.initial}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                              {item.crew_member}
                            </span>
                          </div>
                        </td>

                        {/* Storage Location Column */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={editStorage}
                              onChange={(e) => setEditStorage(e.target.value)}
                              className="bg-white dark:bg-slate-900 border border-slate-300 text-slate-900 dark:text-white text-xs font-semibold rounded-md px-2 py-1 focus:outline-none w-full max-w-[160px]"
                            >
                              {STORAGE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-medium">
                              <HardDrive className="w-3 h-3 text-slate-400" />
                              <span>{item.storage_location}</span>
                            </span>
                          )}
                        </td>

                        {/* Remark Column */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editRemark}
                              onChange={(e) => setEditRemark(e.target.value)}
                              placeholder="e.g. 2 cards"
                              className="bg-white dark:bg-slate-900 border border-slate-300 text-slate-900 dark:text-white text-xs rounded-md px-2 py-1 focus:outline-none w-full max-w-[130px]"
                            />
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                              {item.remark || '—'}
                            </span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                title="Save changes"
                                className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditing(item)}
                                title="Edit storage or remark"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(item.id)}
                              title="Delete record"
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Shot Data Record</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="e.g. Reception"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Event Date</label>
                <input
                  type="text"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  placeholder="e.g. 30 Dec 2026"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Crew Member</label>
                <input
                  type="text"
                  required
                  value={formData.crew_member}
                  onChange={(e) => setFormData({ ...formData, crew_member: e.target.value })}
                  placeholder="e.g. Candid Photographers #1"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Role Type</label>
                  <select
                    value={formData.role_type}
                    onChange={(e) => setFormData({ ...formData, role_type: e.target.value as RoleType })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
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
                  <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Storage Location</label>
                  <select
                    value={formData.storage_location}
                    onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {STORAGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Remark (Optional)</label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="e.g. 2 cards"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-pixeva-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Import Shot Data CSV</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-1 bg-slate-50/50 dark:bg-slate-900/50"
            >
              <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {csvFile ? csvFile.name : 'Click to upload or drag & drop CSV'}
              </p>
              <p className="text-[10px] text-slate-400">Supports columns: Event, Date, Crew Member, Role, Storage, Remark</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
            </div>

            {importedCount !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold text-center">
                ✓ Successfully imported {importedCount} records!
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="btn-pixeva-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!csvFile || isParsingCsv}
                onClick={handleProcessCsv}
                className="btn-pixeva-primary disabled:opacity-50"
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
