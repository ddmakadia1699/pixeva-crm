'use client';

import React, { useState } from 'react';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import {
  Search,
  Download,
  Users,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  UserPlus,
  Info,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Edit,
  ShieldAlert,
  ChevronDown,
  GripVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export type MemberType = 'In House' | 'Freelancer';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  type: MemberType;
  phone: string;
  is_phone_visible: boolean; // Control whether clients can see it on Client Portal
  email: string;
  day_rate?: string;
  created_at: string;
}

const INITIAL_MEMBERS: TeamMember[] = [];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState<'Roster' | 'Freelancer Priority'>('Roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Lead Photographer',
    type: 'In House' as MemberType,
    phone: '',
    is_phone_visible: true,
    email: '',
    day_rate: '',
  });

  // Metrics
  const totalCount = members.length;
  const inHouseCount = members.filter((m) => m.type === 'In House').length;
  const freelancerCount = members.filter((m) => m.type === 'Freelancer').length;

  // Filter Logic
  const filteredMembers = members.filter((m) => {
    if (activeTab === 'Freelancer Priority' && m.type !== 'Freelancer') return false;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.phone.includes(query);

    const matchesType = typeFilter === 'all' || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
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
    if (window.confirm(`Delete ${selectedIds.length} selected team members?`)) {
      setMembers(members.filter((m) => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    }
  };

  const handleDeleteSingle = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  // Visibility Toggle
  const handleTogglePhoneVisibility = (id: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, is_phone_visible: !m.is_phone_visible } : m
      )
    );
  };

  // Move Freelancer Priority
  const handleMoveFreelancerPriority = (fromIndex: number, toIndex: number) => {
    const freelancers = members.filter((m) => m.type === 'Freelancer');
    if (toIndex < 0 || toIndex >= freelancers.length) return;

    const itemToMove = freelancers[fromIndex];
    const updatedFreelancers = [...freelancers];
    updatedFreelancers.splice(fromIndex, 1);
    updatedFreelancers.splice(toIndex, 0, itemToMove);

    const nonFreelancers = members.filter((m) => m.type !== 'Freelancer');
    setMembers([...nonFreelancers, ...updatedFreelancers]);
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      type: formData.type,
      phone: formData.phone,
      is_phone_visible: formData.is_phone_visible,
      email: formData.email,
      day_rate: formData.day_rate,
      created_at: new Date().toISOString(),
    };

    setMembers([newMember, ...members]);
    setFormData({
      name: '',
      role: 'Lead Photographer',
      type: 'In House',
      phone: '',
      is_phone_visible: true,
      email: '',
      day_rate: '',
    });
    setIsAddModalOpen(false);
  };

  // Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setMembers(
      members.map((m) => (m.id === editingMember.id ? editingMember : m))
    );
    setEditingMember(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredMembers.length === 0) return;
    const headers = ['ID', 'Name', 'Role', 'Type', 'Phone', 'Portal Visible', 'Email', 'Day Rate'];
    const rows = filteredMembers.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${m.role}"`,
      m.type,
      `"${m.phone}"`,
      m.is_phone_visible ? 'Yes' : 'No',
      `"${m.email}"`,
      `"${m.day_rate || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_TeamRoster_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Team
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Your studio’s crew, roles and freelancer bench
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
            onClick={handleExportCsv}
            disabled={filteredMembers.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#00d4ff]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Roster & Freelancer Tabs + Counter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#12121a]/90 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#0a0a0f] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setActiveTab('Roster');
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Roster'
                  ? 'bg-[#00d4ff] text-black shadow-md shadow-[#00d4ff]/20'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              Roster
            </button>

            <button
              onClick={() => {
                setActiveTab('Freelancer Priority');
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Freelancer Priority'
                  ? 'bg-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/20'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              Freelancer Priority
            </button>
          </div>

          <span className="text-xs font-bold text-[#a0a0b0] hidden md:inline-block">
            {totalCount} {totalCount === 1 ? 'member' : 'members'} in your studio
          </span>
        </div>

        {/* Search Input */}
        <div className="flex flex-1 sm:max-w-xs items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members…"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>
        </div>
      </div>

      {/* Info Callout Banners */}
      {activeTab === 'Roster' && isBannerVisible && (
        <div className="bg-[#12121a] border border-[#00d4ff]/30 rounded-2xl p-4 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-3 text-xs text-[#a0a0b0] leading-relaxed">
            <Info className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5" />
            <p>
              Click the <strong className="text-white">eye icon</strong> next to a member’s contact number to control whether clients can see it on their Client Portal — open means visible, crossed-out means hidden.
            </p>
          </div>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="text-[#a0a0b0] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'Freelancer Priority' && (
        <div className="bg-[#12121a] border border-[#8b5cf6]/30 rounded-2xl p-4 flex items-start space-x-3 text-xs text-[#a0a0b0] leading-relaxed animate-fadeIn">
          <Info className="w-5 h-5 text-[#8b5cf6] shrink-0 mt-0.5" />
          <p>
            Drag to set the order freelancers get called when a project needs a booking — <strong className="text-white">#1 is asked first</strong>. If they’re unavailable, the next priority is asked next.
          </p>
        </div>
      )}

      {/* Main Content Views */}
      {activeTab === 'Roster' ? (
        filteredMembers.length === 0 ? (
          <div className="pixeva-card rounded-2xl border border-white/10 p-12 text-center space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-4xl">
              👥
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-white tracking-tight">No team members yet</h3>
              <p className="text-xs text-[#a0a0b0]">
                Add your first team member to get started.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-lg shadow-[#00d4ff]/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        ) : (
          <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#a0a0b0]">
                <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-semibold border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3.5">Member Name</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Contact Number</th>
                    <th className="px-5 py-3.5">Day Rate</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.map((m) => {
                    const isSelected = selectedIds.includes(m.id);

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-white/5 transition-colors group ${
                          isSelected ? 'bg-[#00d4ff]/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="w-10 px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(m.id)}
                            className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Name & Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00d4ff]/20 to-[#8b5cf6]/20 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{m.name}</div>
                              {m.email && (
                                <div className="text-[11px] text-[#a0a0b0] mt-0.5">{m.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white">
                            {m.role}
                          </span>
                        </td>

                        {/* Member Type */}
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              m.type === 'In House'
                                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40'
                                : 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/40'
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>

                        {/* Contact Number & Visibility Toggle */}
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-white text-xs">{m.phone || '—'}</span>
                            <button
                              type="button"
                              onClick={() => handleTogglePhoneVisibility(m.id)}
                              title={m.is_phone_visible ? 'Visible on Client Portal' : 'Hidden on Client Portal'}
                              className={`p-1 rounded-lg transition-colors ${
                                m.is_phone_visible
                                  ? 'text-[#00d4ff] hover:bg-[#00d4ff]/10'
                                  : 'text-rose-400 hover:bg-rose-500/10'
                              }`}
                            >
                              {m.is_phone_visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Day Rate */}
                        <td className="px-5 py-4 font-mono text-white text-xs">
                          {m.day_rate ? `₹${m.day_rate}/day` : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="px-3 py-1.5 rounded-lg bg-[#12121a] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#00d4ff]" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteSingle(m.id)}
                            title="Delete Member"
                            className="p-1.5 rounded-lg bg-[#12121a] hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/40 text-xs transition-all inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Freelancer Priority Tab View */
        (() => {
          const freelancers = members.filter((m) => m.type === 'Freelancer');

          if (freelancers.length === 0) {
            return (
              <div className="pixeva-card rounded-2xl border border-white/10 p-12 text-center space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-4xl">
                  👥
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white tracking-tight">No freelancers yet</h3>
                  <p className="text-xs text-[#a0a0b0] leading-relaxed">
                    Add a team member and mark them as a freelancer in the Roster tab to rank them here.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {freelancers.map((f, idx) => (
                <div
                  key={f.id}
                  className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/90 flex items-center justify-between gap-4 hover:border-[#8b5cf6]/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6]/30 to-[#00d4ff]/20 border border-[#8b5cf6]/40 flex items-center justify-center font-extrabold text-white text-sm shrink-0">
                      #{idx + 1}
                    </div>

                    {/* Drag Icon */}
                    <GripVertical className="w-5 h-5 text-[#a0a0b0] cursor-grab shrink-0" />

                    {/* Info */}
                    <div>
                      <h4 className="font-bold text-white text-sm">{f.name}</h4>
                      <div className="flex items-center space-x-3 text-xs text-[#a0a0b0] mt-0.5">
                        <span className="text-white font-medium">{f.role}</span>
                        <span>•</span>
                        <span className="font-mono">{f.phone || 'No phone'}</span>
                        {f.day_rate && (
                          <>
                            <span>•</span>
                            <span className="text-[#00d4ff] font-semibold">₹{f.day_rate}/day</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reorder & Action Controls */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveFreelancerPriority(idx, idx - 1)}
                      className="p-2 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-white border border-white/10 disabled:opacity-30 transition-all"
                      title="Move Priority Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      disabled={idx === freelancers.length - 1}
                      onClick={() => handleMoveFreelancerPriority(idx, idx + 1)}
                      className="p-2 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-white border border-white/10 disabled:opacity-30 transition-all"
                      title="Move Priority Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setEditingMember(f)}
                      className="px-3 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#00d4ff]" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Add Team Member</h3>
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
                <label className="font-semibold text-white block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dhruvi Patel"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="Lead Photographer" className="bg-[#12121a]">Lead Photographer</option>
                    <option value="Candid Photographer" className="bg-[#12121a]">Candid Photographer</option>
                    <option value="Cinematographer" className="bg-[#12121a]">Cinematographer</option>
                    <option value="Drone Operator" className="bg-[#12121a]">Drone Operator</option>
                    <option value="Video Editor" className="bg-[#12121a]">Video Editor</option>
                    <option value="Photo Editor" className="bg-[#12121a]">Photo Editor</option>
                    <option value="Assistant" className="bg-[#12121a]">Assistant</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MemberType })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="In House" className="bg-[#12121a]">In House</option>
                    <option value="Freelancer" className="bg-[#12121a]">Freelancer</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-white block">Contact Number</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_phone_visible: !formData.is_phone_visible })}
                    className="text-[11px] text-[#00d4ff] hover:underline flex items-center space-x-1"
                  >
                    {formData.is_phone_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                    <span>{formData.is_phone_visible ? 'Portal Visible' : 'Portal Hidden'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dhruvi@studio.com"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Day Rate (₹)</label>
                <input
                  type="text"
                  value={formData.day_rate}
                  onChange={(e) => setFormData({ ...formData, day_rate: e.target.value })}
                  placeholder="e.g. 15,000"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
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
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Edit Team Member</h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Role</label>
                  <input
                    type="text"
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Type</label>
                  <select
                    value={editingMember.type}
                    onChange={(e) => setEditingMember({ ...editingMember, type: e.target.value as MemberType })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="In House" className="bg-[#12121a]">In House</option>
                    <option value="Freelancer" className="bg-[#12121a]">Freelancer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Email</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Day Rate (₹)</label>
                <input
                  type="text"
                  value={editingMember.day_rate || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, day_rate: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Changes
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
