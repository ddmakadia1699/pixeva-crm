'use client';

import React, { useState } from 'react';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
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
  Sparkles,
  FileText
} from 'lucide-react';

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

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequestItem[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningItem, setAssigningItem] = useState<ClientRequestItem | null>(null);
  const [teamMemberInput, setTeamMemberInput] = useState('Dhruvi Patel');

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
    if (window.confirm(`Delete ${selectedIds.length} selected requests?`)) {
      setRequests(requests.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  // Status Handlers
  const handleMarkDone = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r))
    );
  };

  const handleReopen = (id: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: 'Pending' } : r))
    );
  };

  // Assign Submit
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningItem) return;

    setRequests(
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

    setRequests([newReq, ...requests]);
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
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
            Client Requests
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Revisions, feedback, and special asks from clients
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
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredRequests.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#12121a]/90 p-4 rounded-2xl border border-white/10">
        {/* Pending / Completed Tabs */}
        <div className="flex items-center space-x-1 bg-[#0a0a0f] p-1 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => {
              setActiveTab('Pending');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'Pending'
                ? 'bg-[#00d4ff] text-black shadow-md shadow-[#00d4ff]/20'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'Pending' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
            }`}>
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('Completed');
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'Completed'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'Completed' ? 'bg-black/20 text-black' : 'bg-white/10 text-white'
            }`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-1 sm:max-w-md items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests or projects…"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
            >
              <option value="all">All Categories</option>
              <option value="photos">Photos</option>
              <option value="video">Video</option>
              <option value="album">Album</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-x-auto shadow-card w-full">
        <table className="w-full text-left text-xs text-[#a0a0b0] min-w-[850px]">
          <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
            <tr>
              <th className="w-10 px-3 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredRequests.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="w-[28%] min-w-[180px] px-3.5 py-3">Project</th>
              <th className="w-[18%] min-w-[120px] px-3.5 py-3">Category</th>
              <th className="w-[24%] min-w-[150px] px-3.5 py-3">Assign Team</th>
              <th className="w-[15%] min-w-[110px] px-3.5 py-3">Status</th>
              <th className="w-[12%] min-w-[100px] px-3.5 py-3 text-right">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#a0a0b0]">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white">No {activeTab.toLowerCase()} requests.</p>
                      <p className="text-xs text-[#a0a0b0]">
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
                          <div className="font-bold text-white text-sm">{item.project}</div>
                          {item.details && (
                            <div className="text-[11px] text-[#a0a0b0] mt-0.5 max-w-md line-clamp-1">
                              {item.details}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">
                          {item.category}
                        </span>
                      </td>

                      {/* Assign Team */}
                      <td className="px-5 py-4">
                        {item.assign_team ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] text-xs font-bold">
                            <User className="w-3 h-3" />
                            <span>{item.assign_team}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setAssigningItem(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#a0a0b0] hover:text-[#00d4ff] border border-white/10 hover:border-[#00d4ff]/40 text-xs font-medium transition-all inline-flex items-center space-x-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Unassigned</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center space-x-1 ${
                            item.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Pending' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <span>{item.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        {item.status === 'Pending' ? (
                          <button
                            onClick={() => handleMarkDone(item.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition-all shadow-md shadow-emerald-500/20 inline-flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Done</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopen(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reopen</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteSingle(item.id)}
                          title="Delete Request"
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

      {/* Assign Team Modal */}
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
                <label className="font-semibold text-white block mb-1">Project</label>
                <input
                  type="text"
                  readOnly
                  value={`${assigningItem.project} (${assigningItem.category})`}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-[#a0a0b0]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Team Member</label>
                <select
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
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
                  Assign Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">New Client Request</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Project</label>
                <input
                  type="text"
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="e.g. Bride & Groom (Demo)"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Photos" className="bg-[#12121a]">Photos</option>
                  <option value="Video" className="bg-[#12121a]">Video</option>
                  <option value="Album" className="bg-[#12121a]">Album</option>
                  <option value="General" className="bg-[#12121a]">General</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Details & Feedback Notes</label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Specific revision requests or notes from client…"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
