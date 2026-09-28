'use client';

import React, { useState, useEffect } from 'react';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Search,
  Download,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  UserPlus,
  Info,
  Edit,
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

const TEAM_STORAGE_KEY = 'pixeva_team_members';

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Alex Rivers',
    role: 'Master Cinematographer',
    type: 'In House',
    phone: '+91 98234 56789',
    is_phone_visible: true,
    email: 'alex.rivers@pixevastudio.com',
    day_rate: '₹25,000',
    created_at: new Date().toISOString(),
  },
  {
    id: 'team-2',
    name: 'Elena Rostova',
    role: 'Lead Candid Photographer',
    type: 'In House',
    phone: '+91 98765 43210',
    is_phone_visible: true,
    email: 'elena@pixevastudio.com',
    day_rate: '₹22,000',
    created_at: new Date().toISOString(),
  },
  {
    id: 'team-3',
    name: 'Marcus Brody',
    role: 'FPV & Aerial Drone Pilot',
    type: 'Freelancer',
    phone: '+91 98450 11223',
    is_phone_visible: false,
    email: 'marcus.drone@freelance.io',
    day_rate: '₹18,000',
    created_at: new Date().toISOString(),
  },
];

export default function TeamPage() {
  const { symbol } = useCurrency();
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEAM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        } else {
          
        }
      } else {
        
      }
    } catch (e) {
      console.error('Error reading team members from localStorage:', e);
    }
  }, []);

  const updateMembers = (updater: TeamMember[] | ((prev: TeamMember[]) => TeamMember[])) => {
    setMembers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save team members to localStorage:', e);
        }
      }
      return next;
    });
  };
  const [activeTab, setActiveTab] = useState<'Roster' | 'Freelancer Priority'>('Roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // ESC key to close all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setEditingMember(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Filter Logic
  const filteredMembers = members.filter((m) => {
    if (activeTab === 'Freelancer Priority' && m.type !== 'Freelancer') return false;

    const query = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.phone.includes(query)
    );
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Selected Team Members',
      message: `Are you sure you want to delete ${selectedIds.length} selected team member(s)? This action permanently removes them and their linked shoot schedules.`,
      confirmText: `Delete (${selectedIds.length})`,
      itemName: `${selectedIds.length} Team Members`,
      itemType: 'Batch Studio Crew',
      onConfirm: () => {
        updateMembers(members.filter((m) => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteSingle = (id: string) => {
    const member = members.find((m) => m.id === id);
    const name = member ? `"${member.name}"` : 'this team member';
    setConfirmModal({
      isOpen: true,
      title: 'Delete Team Member',
      message: `Are you sure you want to delete ${name}? All linked assignments, access credentials, and contact data will be purged.`,
      confirmText: 'Delete Member',
      itemName: member?.name || 'Team Member',
      itemType: member?.role || 'Studio Staff',
      onConfirm: () => {
        updateMembers(members.filter((m) => m.id !== id));
        setSelectedIds(selectedIds.filter((i) => i !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Visibility Toggle
  const handleTogglePhoneVisibility = (id: string) => {
    updateMembers(
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
    updateMembers([...nonFreelancers, ...updatedFreelancers]);
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

    updateMembers([newMember, ...members]);
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

    updateMembers(
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Team
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your studio’s crew, roles and freelancer bench
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
            onClick={handleExportCsv}
            disabled={filteredMembers.length === 0}
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
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Roster & Freelancer Tabs + Counter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pixeva-card p-3 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-100/90 dark:bg-white/5 p-1 rounded-lg border border-slate-200/80 dark:border-white/10">
            <button
              onClick={() => {
                setActiveTab('Roster');
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'Roster'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              Roster
            </button>

            <button
              onClick={() => {
                setActiveTab('Freelancer Priority');
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'Freelancer Priority'
                  ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              Freelancer Priority
            </button>
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline-block">
            {totalCount} {totalCount === 1 ? 'member' : 'members'} in your studio
          </span>
        </div>

        {/* Search Input */}
        <div className="flex flex-1 sm:max-w-xs items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members…"
              className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Info Callout Banners */}
      {activeTab === 'Roster' && isBannerVisible && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Click the <strong className="text-slate-900 dark:text-white">eye icon</strong> next to a member’s contact number to control whether clients can see it on their Client Portal — open means visible, crossed-out means hidden.
            </p>
          </div>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'Freelancer Priority' && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-fadeIn">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Drag to set the order freelancers get called when a project needs a booking — <strong className="text-slate-900 dark:text-white">#1 is asked first</strong>. If they’re unavailable, the next priority is asked next.
          </p>
        </div>
      )}

      {/* Main Content Views */}
      {activeTab === 'Roster' ? (
        filteredMembers.length === 0 ? (
          <div className="pixeva-card rounded-xl p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No team members yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add your first team member to get started.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-pixeva-primary inline-flex items-center space-x-1.5 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        ) : (
          <div className="pixeva-card rounded-xl overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 text-[10px]">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="w-[30%] px-4 py-3">Member Name</th>
                  <th className="w-[20%] px-4 py-3">Role</th>
                  <th className="w-[15%] px-4 py-3">Type</th>
                  <th className="w-[20%] px-4 py-3">Contact Number</th>
                  <th className="w-[15%] px-4 py-3">Day Rate</th>
                  <th className="w-[12%] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((m) => {
                  const isSelected = selectedIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-slate-50 dark:bg-slate-800/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(m.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Name & Email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-xs">{m.name}</div>
                            {m.email && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          {m.role}
                        </span>
                      </td>

                      {/* Member Type */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m.type}
                        </span>
                      </td>

                      {/* Contact Number & Visibility Toggle */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-slate-600 dark:text-slate-300 text-xs">{m.phone || '—'}</span>
                          <button
                            type="button"
                            onClick={() => handleTogglePhoneVisibility(m.id)}
                            title={m.is_phone_visible ? 'Visible on Client Portal' : 'Hidden on Client Portal'}
                            className={`p-1 rounded-md transition-colors ${
                              m.is_phone_visible
                                ? 'text-slate-600 hover:text-slate-900'
                                : 'text-slate-300 hover:text-slate-500'
                            }`}
                          >
                            {m.is_phone_visible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Day Rate */}
                      <td className="px-4 py-3.5 font-mono text-slate-900 dark:text-white text-xs font-semibold">
                        {m.day_rate ? `${m.day_rate}/day` : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all inline-flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3 text-slate-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSingle(m.id)}
                          title="Delete Member"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center"
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
        )
      ) : (
        /* Freelancer Priority Tab View */
        (() => {
          const freelancers = members.filter((m) => m.type === 'Freelancer');

          if (freelancers.length === 0) {
            return (
              <div className="pixeva-card rounded-xl p-12 text-center space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No freelancers yet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add a team member and mark them as a freelancer in the Roster tab to rank them here.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-2.5">
              {freelancers.map((f, idx) => (
                <div
                  key={f.id}
                  className="pixeva-card rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-900 dark:text-white text-xs shrink-0">
                      #{idx + 1}
                    </div>

                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab shrink-0" />

                    {/* Info */}
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs">{f.name}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{f.role}</span>
                        <span>•</span>
                        <span className="font-mono">{f.phone || 'No phone'}</span>
                        {f.day_rate && (
                          <>
                            <span>•</span>
                            <span className="text-slate-900 dark:text-white font-medium">{f.day_rate}/day</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reorder & Action Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveFreelancerPriority(idx, idx - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all"
                      title="Move Priority Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={idx === freelancers.length - 1}
                      onClick={() => handleMoveFreelancerPriority(idx, idx + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all"
                      title="Move Priority Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setEditingMember(f)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all inline-flex items-center space-x-1 ml-1"
                    >
                      <Edit className="w-3 h-3 text-slate-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Team Member</h3>
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
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dhruvi Patel"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Lead Photographer">Lead Photographer</option>
                    <option value="Candid Photographer">Candid Photographer</option>
                    <option value="Cinematographer">Cinematographer</option>
                    <option value="Drone Operator">Drone Operator</option>
                    <option value="Video Editor">Video Editor</option>
                    <option value="Photo Editor">Photo Editor</option>
                    <option value="Assistant">Assistant</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MemberType })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="In House">In House</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dhruvi@studio.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Day Rate ({symbol})</label>
                <input
                  type="text"
                  value={formData.day_rate}
                  onChange={(e) => setFormData({ ...formData, day_rate: e.target.value })}
                  placeholder="e.g. 15,000"
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Team Member</h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Role</label>
                  <input
                    type="text"
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Type</label>
                  <select
                    value={editingMember.type}
                    onChange={(e) => setEditingMember({ ...editingMember, type: e.target.value as MemberType })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="In House">In House</option>
                    <option value="Freelancer">Freelancer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">Day Rate</label>
                <input
                  type="text"
                  value={editingMember.day_rate || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, day_rate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="btn-pixeva-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary"
                >
                  Save Changes
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
