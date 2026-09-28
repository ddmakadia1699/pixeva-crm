'use client';

import React, { useState, useEffect } from 'react';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  UserPlus,
  User,
  Plus,
  Trash2,
  X,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

const CLIENT_REQUESTS_STORAGE_KEY = 'pixeva_client_requests';

export type RequestStatus = 'Pending' | 'Completed';

export interface ClientRequestItem {
  id: string;
  project: string;
  category: string;
  details?: string;
  assign_team: string | null;
  status: RequestStatus;
  created_at: string;
}

const INITIAL_REQUESTS: ClientRequestItem[] = [
  {
    id: 'req-1',
    project: 'Bride & Groom (Demo)',
    category: 'Photos',
    details: 'Skin retouching & tone correction on 15 main stage wedding photos',
    assign_team: null,
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-2',
    project: 'Bride & Groom (Demo)',
    category: 'Photos',
    details: 'Black & White color grade for reception portrait album selections',
    assign_team: null,
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req-3',
    project: 'Bride & Groom (Demo)',
    category: 'Video',
    details: 'Include additional vows speech audio clip in 4-minute highlight reel',
    assign_team: null,
    status: 'Pending',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

import { apiClient } from '@/lib/api/apiClient';

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequestItem[]>(INITIAL_REQUESTS);

  // Load from API Gateway with account scoping
  useEffect(() => {
    async function loadClientRequests() {
      try {
        const cloudData = await apiClient.clientRequests.list();
        if (Array.isArray(cloudData) && cloudData.length > 0) {
          setRequests(cloudData);
          try {
            localStorage.setItem(CLIENT_REQUESTS_STORAGE_KEY, JSON.stringify(cloudData));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn('Notice loading client requests via API Gateway:', err);
      }

      try {
        const saved = localStorage.getItem(CLIENT_REQUESTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed);
          }
        }
      } catch (e) {}
    }

    loadClientRequests();
  }, []);

  const updateRequests = (updater: ClientRequestItem[] | ((prev: ClientRequestItem[]) => ClientRequestItem[])) => {
    setRequests((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CLIENT_REQUESTS_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save client requests to localStorage:', e);
        }
      }
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningItem, setAssigningItem] = useState<ClientRequestItem | null>(null);
  const [teamMemberInput, setTeamMemberInput] = useState('Dhruvi Patel');

  // ESC key to close all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setAssigningItem(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    project: 'Bride & Groom (Demo)',
    category: 'Photos',
    details: '',
  });

  // Counts
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

  // Filter Logic
  const filteredRequests = requests.filter((r) => {
    const matchesTab = r.status === activeTab;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      r.project.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query) ||
      (r.details && r.details.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'all' || r.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesTab && matchesSearch && matchesCategory;
  });

  // Selection Handlers
  // Confirm Modal
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

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length && filteredRequests.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id));
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
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Requests',
      message: `Are you sure you want to delete ${selectedIds.length} selected client post-production edit request(s)? This action permanently purges them.`,
      confirmText: `Delete (${selectedIds.length})`,
      itemName: `${selectedIds.length} Client Edit Requests`,
      itemType: 'Batch Requests',
      onConfirm: () => {
        setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteSingle = (id: string) => {
    const item = requests.find((r) => r.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Client Request',
      message: 'Are you sure you want to delete this client post-production request? This action cannot be undone.',
      confirmText: 'Delete Request',
      itemName: item?.details || item?.category || 'Client Request',
      itemType: `${item?.category || 'Post-Prod'} Edit Task`,
      onConfirm: () => {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Status Handlers
  const handleMarkDone = (id: string) => {
    updateRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r))
    );
  };

  const handleReopen = (id: string) => {
    updateRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Pending' } : r))
    );
  };

  // Assign Submit
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem) return;

    updateRequests(
      requests.map((r) =>
        r.id === assigningItem.id
          ? { ...r, assign_team: teamMemberInput === 'Unassigned' ? null : teamMemberInput }
          : r
      )
    );
    setAssigningItem(null);
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project || !formData.category) return;

    const newReq: ClientRequestItem = {
      id: `req-${Date.now()}`,
      project: formData.project,
      category: formData.category,
      details: formData.details || undefined,
      assign_team: null,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    updateRequests([newReq, ...requests]);
    setFormData({
      project: 'Bride & Groom (Demo)',
      category: 'Photos',
      details: '',
    });
    setIsAddModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRequests.length === 0) return;
    const headers = ['ID', 'Project', 'Category', 'Details', 'Assign Team', 'Status', 'Created At'];
    const rows = filteredRequests.map((r) => [
      r.id,
      `"${r.project}"`,
      `"${r.category}"`,
      `"${r.details || ''}"`,
      `"${r.assign_team || 'Unassigned'}"`,
      r.status,
      `"${r.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_ClientRequests_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Client Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Revisions, feedback, and special asks from clients
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all animate-fadeIn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredRequests.length === 0}
            className="btn-pixeva-secondary flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pixeva-card p-3 rounded-xl">
        {/* Pending / Completed Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800 self-start">
          <button
            onClick={() => {
              setActiveTab('Pending');
              setSelectedIds([]);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'Pending'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${activeTab === 'Pending' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Pending</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'Pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('Completed');
              setSelectedIds([]);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'Completed'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'Completed' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Completed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-1 sm:max-w-md items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests or projects…"
              className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs font-medium rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="photos">Photos</option>
              <option value="video">Video</option>
              <option value="album">Album</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="pixeva-card rounded-xl overflow-x-auto w-full">
        <table className="w-full text-left text-xs min-w-[850px]">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 text-[10px]">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredRequests.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="w-[28%] px-4 py-3">Project</th>
              <th className="w-[18%] px-4 py-3">Category</th>
              <th className="w-[24%] px-4 py-3">Assign Team</th>
              <th className="w-[15%] px-4 py-3">Status</th>
              <th className="w-[15%] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">No {activeTab.toLowerCase()} requests.</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeTab === 'Pending'
                        ? 'All client feedback and revision requests have been completed!'
                        : 'Completed client requests will appear here once marked done.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRequests.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-slate-50 dark:bg-slate-800/60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{item.project}</div>
                        {item.details && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md line-clamp-1">
                            {item.details}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Assign Team */}
                    <td className="px-4 py-3.5">
                      {item.assign_team ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.assign_team}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setAssigningItem(item)}
                          className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 text-xs font-medium transition-all inline-flex items-center space-x-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Unassigned</span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border inline-flex items-center space-x-1.5 ${
                          item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {item.status === 'Pending' ? (
                        <button
                          onClick={() => handleMarkDone(item.id)}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-all inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopen(item.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all inline-flex items-center space-x-1"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteSingle(item.id)}
                        title="Delete Request"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center"
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

      {/* Assign Team Modal */}
      {assigningItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Assign Team Member</h3>
              <button
                type="button"
                onClick={() => setAssigningItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Project</label>
                <input
                  type="text"
                  readOnly
                  value={`${assigningItem.project} (${assigningItem.category})`}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Team Member</label>
                <select
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Dhruvi Patel">Dhruvi Patel</option>
                  <option value="Rohan Verma">Rohan Verma</option>
                  <option value="Alex Rivers">Alex Rivers</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningItem(null)}
                  className="btn-pixeva-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary"
                >
                  Assign Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">New Client Request</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Project</label>
                <input
                  type="text"
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="e.g. Bride & Groom (Demo)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Photos">Photos</option>
                  <option value="Video">Video</option>
                  <option value="Album">Album</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Details & Feedback Notes</label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Specific revision requests or notes from client…"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
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
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
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

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
