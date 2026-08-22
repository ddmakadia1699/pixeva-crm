'use client';

import React, { useState } from 'react';
import {
  Settings2,
  Users,
  Briefcase,
  CreditCard,
  FileSignature,
  FolderArchive,
  Globe,
  Save,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  LifeBuoy,
  Layers,
  Sparkles,
  Check,
  RefreshCw,
  Camera,
  Video,
  Film,
  Radio,
  Image,
  Sliders,
  DollarSign,
  Clock,
  ShieldCheck,
  UploadCloud,
  FileText,
  Key,
  Server,
  X,
  MessageCircle,
  Upload
} from 'lucide-react';
import IntegrationsStatus from '@/components/system/IntegrationsStatus';

interface StudioDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

interface CrewRoleItem {
  id: string;
  name: string;
  defaultRate: number;
  active: boolean;
}

interface OtherServiceItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface DeliverableItem {
  id: string;
  name: string;
  estimatedDays: number;
  format: string;
  active: boolean;
}

interface StudioPackageItem {
  id: string;
  name: string;
  deliverables: { id: string; name: string }[];
  otherServices: string[];
}

const INITIAL_CREW_ROLES: CrewRoleItem[] = [
  { id: '1', name: 'Traditional Photographer', defaultRate: 8000, active: true },
  { id: '2', name: 'Traditional Videographer', defaultRate: 10000, active: true },
  { id: '3', name: 'Candid Photographer', defaultRate: 15000, active: true },
  { id: '4', name: 'Cinematic Cinematographer', defaultRate: 18000, active: true },
  { id: '5', name: 'Drone Operator', defaultRate: 12000, active: true },
  { id: '6', name: 'Assistant / Lightman', defaultRate: 3000, active: true },
  { id: '7', name: 'Sound Engineer', defaultRate: 6000, active: true },
  { id: '8', name: 'Same-day Editor', defaultRate: 14000, active: true }
];

const INITIAL_OTHER_SERVICES: OtherServiceItem[] = [
  { id: '1', name: 'Photo Booth Setup with Instant Prints', price: 25000, active: true },
  { id: '2', name: 'LED Screen Display (8x12 ft)', price: 35000, active: true },
  { id: '3', name: 'Live YouTube / Web Streaming', price: 20000, active: true },
  { id: '4', name: 'Pre-Wedding Teaser Video', price: 30000, active: true },
  { id: '5', name: 'Crane / Jib Camera Setup', price: 18000, active: true },
  { id: '6', name: 'Spotting Light Setup', price: 8000, active: true },
  { id: '7', name: 'Canvera Flush Mount Photo Album Printing', price: 15000, active: true }
];

const INITIAL_DELIVERABLES: DeliverableItem[] = [
  { id: '1', name: 'Traditional Video Full HD (Extended Cut)', estimatedDays: 45, format: 'Full HD MP4', active: true },
  { id: '2', name: 'Cinematic Teaser (3-5 Minutes 4K)', estimatedDays: 21, format: '4K MP4 Video', active: true },
  { id: '3', name: 'Cinematic Feature Film (20-30 Minutes 4K)', estimatedDays: 45, format: '4K Master Cut', active: true },
  { id: '4', name: 'All Edited High-Res Photos (Google Drive / Hard Drive)', estimatedDays: 14, format: 'High-Res JPEG', active: true },
  { id: '5', name: 'Raw Unedited Video & Photo Dump', estimatedDays: 7, format: 'RAW Files', active: true },
  { id: '6', name: 'Premium Canvera Photo Album (40 Pages)', estimatedDays: 30, format: 'Flush Mount Hardcover', active: true },
  { id: '7', name: 'Instagram Reels / Shorts (60 Seconds Vertical)', estimatedDays: 10, format: 'Vertical 9:16 Video', active: true }
];

const ALL_OTHER_SERVICES_PRESETS = [
  'LED Screen',
  'Live Streaming',
  '360 Video',
  'Film Camera',
  'Drone Setup',
  'Photo Booth',
  'Crane Setup',
  'Spotting Light',
  'Canvera Album',
];

const INITIAL_STUDIO_PACKAGES: StudioPackageItem[] = [
  {
    id: 'pkg-1',
    name: 'Royal Grand Wedding Package',
    deliverables: [
      { id: 'del-1', name: 'Traditional Video Full HD (Extended Cut)' },
      { id: 'del-2', name: 'Cinematic Teaser (3-5 Minutes 4K)' },
      { id: 'del-3', name: 'Cinematic Feature Film (20-30 Minutes 4K)' },
      { id: 'del-4', name: 'All Edited High-Res Photos' },
      { id: 'del-6', name: 'Premium Canvera Photo Album (40 Pages)' },
    ],
    otherServices: ['LED Screen', 'Live Streaming', 'Drone Setup'],
  },
  {
    id: 'pkg-2',
    name: 'Pre-Wedding & Engagement Special',
    deliverables: [
      { id: 'del-2', name: 'Cinematic Teaser (3-5 Minutes 4K)' },
      { id: 'del-4', name: 'All Edited High-Res Photos' },
      { id: 'del-7', name: 'Instagram Reels / Shorts (60 Seconds Vertical)' },
    ],
    otherServices: ['Photo Booth', 'Film Camera'],
  }
];

interface PaymentSplitItem {
  id: string;
  name: string;
  percent: number;
  timing: 'Before' | 'After' | 'Custom date';
  days: number;
  targetDescription: string;
}

const DEFAULT_PAYMENT_SPLITS: PaymentSplitItem[] = [
  {
    id: 'split-1',
    name: 'Booking Advance',
    percent: 20,
    timing: 'Before',
    days: 30,
    targetDescription: 'before first event day'
  },
  {
    id: 'split-2',
    name: 'On Event Day',
    percent: 60,
    timing: 'Before',
    days: 0,
    targetDescription: 'before first event day'
  },
  {
    id: 'split-3',
    name: 'Final Delivery',
    percent: 20,
    timing: 'After',
    days: 14,
    targetDescription: 'before first event day'
  }
];

const DEFAULT_PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'services' | 'packages' | 'payments' | 'contract' | 'documents' | 'team' | 'domain' | 'system'
  >('services');

  // Services State
  const [crewRoles, setCrewRoles] = useState<CrewRoleItem[]>(INITIAL_CREW_ROLES);
  const [otherServices, setOtherServices] = useState<OtherServiceItem[]>(INITIAL_OTHER_SERVICES);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(INITIAL_DELIVERABLES);
  const [packages, setPackages] = useState<StudioPackageItem[]>(INITIAL_STUDIO_PACKAGES);

  // Payments State
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplitItem[]>(DEFAULT_PAYMENT_SPLITS);
  const [paymentModes, setPaymentModes] = useState<string[]>(DEFAULT_PAYMENT_MODES);
  const [isEditingModes, setIsEditingModes] = useState(false);
  const [newModeInput, setNewModeInput] = useState('');

  // New deliverable popover per package
  const [addingDelivToPkg, setAddingDelivToPkg] = useState<string | null>(null);
  const [selectedDelivToAdd, setSelectedDelivToAdd] = useState<string>('');

  // New Item Forms State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleRate, setNewRoleRate] = useState('');
  
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [newDeliverableName, setNewDeliverableName] = useState('');
  const [newDeliverableDays, setNewDeliverableDays] = useState('14');
  const [newDeliverableFormat, setNewDeliverableFormat] = useState('4K MP4');

const DEFAULT_CONTRACT_TERMS = `1. SERVICE AGREEMENT
This agreement is entered into between Pixeva Studio and the Client for photography and/or videography services as specified in the project scope.

2. PAYMENT TERMS
- Booking retainer is required to reserve the dates and is non-refundable.
- Full remaining balance is due prior to or on the final event date as agreed.

3. CANCELLATION & RESCHEDULING
If the event is cancelled or postponed, client must notify the studio in writing. Retainer fee will be applied to the rescheduled date subject to studio availability.

4. COPYRIGHT & USAGE
The studio retains copyright over all images and footage. Client is granted a personal, non-commercial reproduction license.

5. DELIVERABLES & TIMELINES
Edited photographs and cinematic videos will be delivered within the agreed delivery window following the event.`;

  // Contract State
  const [contractTerms, setContractTerms] = useState(DEFAULT_CONTRACT_TERMS);

  // Documents State
  const [documents, setDocuments] = useState<StudioDocument[]>([]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const newDoc: StudioDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'Document',
        uploadedAt: 'Just now'
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  // Custom Domain State
  const [customDomain, setCustomDomain] = useState('client.pixevastudio.com');

  // Save feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  // Add Crew Role
  const handleAddCrewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newItem: CrewRoleItem = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      defaultRate: parseFloat(newRoleRate) || 10000,
      active: true
    };
    setCrewRoles(prev => [...prev, newItem]);
    setNewRoleName('');
    setNewRoleRate('');
  };

  // Add Other Service
  const handleAddOtherService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const newItem: OtherServiceItem = {
      id: Date.now().toString(),
      name: newServiceName.trim(),
      price: parseFloat(newServicePrice) || 15000,
      active: true
    };
    setOtherServices(prev => [...prev, newItem]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  // Add Deliverable
  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliverableName.trim()) return;
    const newItem: DeliverableItem = {
      id: Date.now().toString(),
      name: newDeliverableName.trim(),
      estimatedDays: parseInt(newDeliverableDays) || 14,
      format: newDeliverableFormat,
      active: true
    };
    setDeliverables(prev => [...prev, newItem]);
    setNewDeliverableName('');
    setNewDeliverableDays('14');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Settings</h1>
              <p className="text-xs text-[#a0a0b0]">
                Manage studio services and contract template
              </p>
            </div>
          </div>
        </div>

        {/* Save Button & Header Action */}
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-pixeva-primary px-6 py-2.5 text-xs font-bold flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Services</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="overflow-x-auto border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2 min-w-max bg-[#12121a] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'services'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'contract'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Contract</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Documents Library</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'team'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Access</span>
          </button>

          <button
            onClick={() => setActiveTab('domain')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'domain'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Custom Domain</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'system'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>System & Cloud</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SERVICES (Crew Roles, Other Services, Deliverables) */}
      {/* ========================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-10 animate-fadeIn">
          {/* SECTION 1: CREW ROLES */}
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                <span>Crew Roles</span>
              </h2>
              <p className="text-xs text-[#a0a0b0]">
                Appear as columns in the project schedule table — drag to reorder
              </p>
            </div>

            {/* Crew Roles Drag & Drop List */}
            <div className="space-y-2">
              {crewRoles.map((role, idx) => (
                <div
                  key={role.id}
                  className="p-3.5 rounded-xl bg-[#161622] border border-white/10 hover:border-[#00d4ff]/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <GripVertical className="w-4 h-4 text-[#a0a0b0] cursor-grab shrink-0 opacity-40 group-hover:opacity-100" />
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-[#a0a0b0] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{role.name}</span>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="flex items-center space-x-1 text-xs text-[#a0a0b0]">
                      <span className="text-[10px]">Rate/Day:</span>
                      <span className="font-mono font-bold text-white">₹{role.defaultRate.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => setCrewRoles(prev => prev.filter(r => r.id !== role.id))}
                      className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Crew Role Form */}
            <form onSubmit={handleAddCrewRole} className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="New crew role title (e.g. Lead Editor)..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1 w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <input
                type="number"
                placeholder="Day rate (₹)..."
                value={newRoleRate}
                onChange={(e) => setNewRoleRate(e.target.value)}
                className="w-full sm:w-36 bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-[#00d4ff] hover:text-slate-950 font-bold text-xs text-white transition-all flex items-center justify-center space-x-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Crew Role</span>
              </button>
            </form>
          </div>

          {/* SECTION 2: OTHER SERVICES */}
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-[#00d4ff]" />
                <span>Other Services</span>
              </h2>
              <p className="text-xs text-[#a0a0b0]">
                Additional services shown in the project schedule
              </p>
            </div>

            {/* Other Services List */}
            <div className="space-y-2">
              {otherServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="p-3.5 rounded-xl bg-[#161622] border border-white/10 hover:border-[#00d4ff]/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-[#a0a0b0] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{service.name}</span>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      ₹{service.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => setOtherServices(prev => prev.filter(s => s.id !== service.id))}
                      className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Other Service Form */}
            <form onSubmit={handleAddOtherService} className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="New service name (e.g. Crane Operator)..."
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <input
                type="number"
                placeholder="Price (₹)..."
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-full sm:w-36 bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-[#00d4ff] hover:text-slate-950 font-bold text-xs text-white transition-all flex items-center justify-center space-x-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Other Service</span>
              </button>
            </form>
          </div>

          {/* SECTION 3: DELIVERABLES */}
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#00d4ff]" />
                <span>Deliverables</span>
              </h2>
              <p className="text-xs text-[#a0a0b0]">
                Your studio's list of deliverables — used to build packages and pre-fill new projects
              </p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-2">
              {deliverables.map((deliv, idx) => (
                <div
                  key={deliv.id}
                  className="p-3.5 rounded-xl bg-[#161622] border border-white/10 hover:border-[#00d4ff]/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-[#a0a0b0] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{deliv.name}</h4>
                      <p className="text-[10px] text-[#a0a0b0]">Format: {deliv.format}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-[11px] text-[#a0a0b0] font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#00d4ff]" />
                      <span>{deliv.estimatedDays} Days</span>
                    </span>
                    <button
                      onClick={() => setDeliverables(prev => prev.filter(d => d.id !== deliv.id))}
                      className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Remove Deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Deliverable Form */}
            <form onSubmit={handleAddDeliverable} className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="New deliverable title (e.g. Drone Reel)..."
                value={newDeliverableName}
                onChange={(e) => setNewDeliverableName(e.target.value)}
                className="flex-1 w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <input
                type="number"
                placeholder="Turnaround days..."
                value={newDeliverableDays}
                onChange={(e) => setNewDeliverableDays(e.target.value)}
                className="w-full sm:w-28 bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-[#00d4ff] hover:text-slate-950 font-bold text-xs text-white transition-all flex items-center justify-center space-x-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deliverable</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* TAB 2: PACKAGES */}
      {/* ========================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Subtitle */}
          <p className="text-xs text-[#a0a0b0] max-w-3xl leading-relaxed">
            Group a set of deliverables and other services into a named package — apply it in one click when building a project's Deliverables section instead of adding each item every time.
          </p>

          {/* Package Cards List */}
          <div className="space-y-5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-5 shadow-card"
              >
                {/* Package Header with editable name */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-3">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: val } : p));
                      }}
                      placeholder="Package Name..."
                      className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#00d4ff] focus:outline-none px-1 py-0.5 w-full transition-colors"
                    />
                  </div>

                  {packages.length > 1 && (
                    <button
                      onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}
                      className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Deliverables Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Deliverables</h3>

                  {pkg.deliverables.length === 0 ? (
                    <p className="text-xs text-[#a0a0b0] italic py-1">No deliverables added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {pkg.deliverables.map((deliv) => (
                        <div
                          key={deliv.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0f] border border-white/5 text-xs hover:border-white/15 transition-colors"
                        >
                          <span className="font-medium text-white">{deliv.name}</span>
                          <button
                            onClick={() => {
                              setPackages(prev => prev.map(p => {
                                if (p.id === pkg.id) {
                                  return { ...p, deliverables: p.deliverables.filter(d => d.id !== deliv.id) };
                                }
                                return p;
                              }));
                            }}
                            className="p-1 rounded-lg text-[#a0a0b0] hover:text-rose-400 hover:bg-white/5 transition-colors"
                            title="Remove Deliverable"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Deliverable Form / Button */}
                  {addingDelivToPkg === pkg.id ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 animate-fadeIn">
                      <select
                        value={selectedDelivToAdd}
                        onChange={(e) => setSelectedDelivToAdd(e.target.value)}
                        className="flex-1 w-full bg-[#0a0a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      >
                        <option value="">Select from studio deliverables or type custom below...</option>
                        {deliverables.map((d) => (
                          <option key={d.id} value={d.name}>{d.name} ({d.format})</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Or custom deliverable..."
                        value={selectedDelivToAdd}
                        onChange={(e) => setSelectedDelivToAdd(e.target.value)}
                        className="flex-1 w-full bg-[#0a0a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      />

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedDelivToAdd.trim()) return;
                            setPackages(prev => prev.map(p => {
                              if (p.id === pkg.id) {
                                return {
                                  ...p,
                                  deliverables: [...p.deliverables, { id: `del-${Date.now()}`, name: selectedDelivToAdd.trim() }]
                                };
                              }
                              return p;
                            }));
                            setAddingDelivToPkg(null);
                            setSelectedDelivToAdd('');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingDelivToPkg(null);
                            setSelectedDelivToAdd('');
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#a0a0b0] text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingDelivToPkg(pkg.id);
                        setSelectedDelivToAdd('');
                      }}
                      className="text-xs font-semibold text-[#00d4ff] hover:underline flex items-center space-x-1.5 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Deliverable</span>
                    </button>
                  )}
                </div>

                {/* Other Services Included Section */}
                <div className="space-y-2.5 pt-3 border-t border-white/10">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Other services included
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_OTHER_SERVICES_PRESETS.map((serviceName) => {
                      const isIncluded = pkg.otherServices.includes(serviceName);
                      return (
                        <button
                          key={serviceName}
                          type="button"
                          onClick={() => {
                            setPackages(prev => prev.map(p => {
                              if (p.id === pkg.id) {
                                const exists = p.otherServices.includes(serviceName);
                                return {
                                  ...p,
                                  otherServices: exists
                                    ? p.otherServices.filter(s => s !== serviceName)
                                    : [...p.otherServices, serviceName]
                                };
                              }
                              return p;
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            isIncluded
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                              : 'bg-[#0a0a0f] text-[#a0a0b0] border-white/5 hover:border-white/15 hover:text-white'
                          }`}
                        >
                          {serviceName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => {
                const newPkg: StudioPackageItem = {
                  id: `pkg-${Date.now()}`,
                  name: 'New Package',
                  deliverables: [],
                  otherServices: []
                };
                setPackages(prev => [...prev, newPkg]);
              }}
              className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Package</span>
            </button>

            <button
              onClick={handleSave}
              className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Packages</span>
            </button>

            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 animate-fadeIn">
                <Check className="w-4 h-4" />
                <span>Packages Saved!</span>
              </span>
            )}
          </div>

          {/* Footer Help & Feedback */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Help</span>
            </a>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENTS */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-8 animate-fadeIn">
          {/* SECTION 1: Payment Split */}
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-5 shadow-card">
            <div>
              <h2 className="text-base font-bold text-white">Payment Split</h2>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Default installments used to auto-generate a project's payment schedule
              </p>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-2 rounded-xl bg-[#0a0a0f] text-[11px] font-bold text-[#a0a0b0] uppercase tracking-wider">
              <div className="col-span-4">Split Name</div>
              <div className="col-span-2">% of Total</div>
              <div className="col-span-5">Payment Due</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {/* Table Rows */}
            <div className="space-y-3">
              {paymentSplits.map((split) => (
                <div
                  key={split.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-xl bg-[#0a0a0f] border border-white/5 items-center text-xs"
                >
                  {/* Split Name */}
                  <div className="sm:col-span-4">
                    <label className="sm:hidden text-[10px] text-[#a0a0b0] block mb-1">Split Name</label>
                    <input
                      type="text"
                      value={split.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, name: val } : s));
                      }}
                      placeholder="e.g. Booking Advance"
                      className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#00d4ff]"
                    />
                  </div>

                  {/* % of Total */}
                  <div className="sm:col-span-2">
                    <label className="sm:hidden text-[10px] text-[#a0a0b0] block mb-1">% of Total</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={split.percent}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, percent: val } : s));
                        }}
                        className="w-full bg-[#12121a] border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#00d4ff]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0a0b0] font-bold text-xs">%</span>
                    </div>
                  </div>

                  {/* Payment Due */}
                  <div className="sm:col-span-5">
                    <label className="sm:hidden text-[10px] text-[#a0a0b0] block mb-1">Payment Due</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={split.timing}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, timing: val } : s));
                        }}
                        className="bg-[#12121a] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                      >
                        <option value="Before">Before</option>
                        <option value="After">After</option>
                        <option value="Custom date">Custom date</option>
                      </select>

                      {split.timing !== 'Custom date' && (
                        <>
                          <input
                            type="number"
                            value={split.days}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, days: val } : s));
                            }}
                            className="w-14 bg-[#12121a] border border-white/10 rounded-xl px-2 py-2 text-xs font-mono text-center text-white focus:outline-none focus:border-[#00d4ff]"
                          />
                          <span className="text-[#a0a0b0] whitespace-nowrap">days</span>
                          <span className="text-white text-xs truncate">before first event day</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-1 flex justify-end">
                    {paymentSplits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPaymentSplits(prev => prev.filter(s => s.id !== split.id))}
                        className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-rose-400 hover:bg-white/5 transition-colors"
                        title="Remove Split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Split Actions & Total */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const newSplit: PaymentSplitItem = {
                    id: `split-${Date.now()}`,
                    name: 'Milestone Installment',
                    percent: 0,
                    timing: 'Before',
                    days: 7,
                    targetDescription: 'before first event day'
                  };
                  setPaymentSplits(prev => [...prev, newSplit]);
                }}
                className="flex items-center space-x-1.5 text-xs font-semibold text-[#00d4ff] hover:underline px-1 py-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Split</span>
              </button>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-white">
                  Total:{' '}
                  <span className={
                    paymentSplits.reduce((sum, s) => sum + s.percent, 0) === 100
                      ? 'text-emerald-400 font-mono'
                      : 'text-amber-400 font-mono'
                  }>
                    {paymentSplits.reduce((sum, s) => sum + s.percent, 0)}%
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleSave}
                  className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md"
                >
                  Save Payment Split
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Payment Modes */}
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-4 shadow-card">
            <div>
              <h2 className="text-base font-bold text-white">Payment Modes</h2>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                Options shown in the Payment Mode dropdown when recording a payment
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {paymentModes.map((mode, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-xs font-semibold text-white flex items-center space-x-2"
                >
                  <span>{mode}</span>
                  {isEditingModes && (
                    <button
                      type="button"
                      onClick={() => setPaymentModes(prev => prev.filter((_, i) => i !== idx))}
                      className="text-[#a0a0b0] hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditingModes && (
              <div className="flex items-center gap-2 pt-2 animate-fadeIn max-w-sm">
                <input
                  type="text"
                  placeholder="New payment mode (e.g. Razorpay)..."
                  value={newModeInput}
                  onChange={(e) => setNewModeInput(e.target.value)}
                  className="bg-[#0a0a0f] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff] flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newModeInput.trim()) return;
                    setPaymentModes(prev => [...prev, newModeInput.trim()]);
                    setNewModeInput('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsEditingModes(prev => !prev)}
                className="text-xs font-semibold text-[#00d4ff] hover:underline"
              >
                {isEditingModes ? 'Done Editing' : 'Edit Payment Modes'}
              </button>
            </div>
          </div>

          {/* Footer Help & Feedback */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Help</span>
            </a>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONTRACT */}
      {/* ========================================================= */}
      {activeTab === 'contract' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-4 shadow-card">
            <div>
              <h2 className="text-base font-bold text-white">Standard Contract Template</h2>
              <p className="text-xs text-[#a0a0b0] mt-0.5">
                This text will be included in the client portal when you enable &quot;Standard Contract&quot; on a project. You can edit it to match your studio&apos;s terms.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={16}
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 text-xs font-mono text-white/90 leading-relaxed focus:outline-none focus:border-[#00d4ff]"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
              >
                Save Contract
              </button>

              <button
                type="button"
                onClick={() => setContractTerms(DEFAULT_CONTRACT_TERMS)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all"
              >
                Reset to default
              </button>

              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>Contract Saved!</span>
                </span>
              )}
            </div>
          </div>

          {/* Footer Help & Feedback */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Help</span>
            </a>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DOCUMENTS LIBRARY */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Documents Library</h2>
                <p className="text-xs text-[#a0a0b0] mt-0.5">
                  Upload files to share with clients via their portal (PDF, PNG, JPG), max 5MB
                </p>
              </div>

              <label className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 shadow-md">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
                <input
                  type="file"
                  accept=".pdf, image/png, image/jpeg, image/jpg"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </label>
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-white">No documents yet.</p>
                <p className="text-xs text-[#a0a0b0]">
                  Upload a PDF, PNG or JPG to share it with all your clients.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl bg-[#0a0a0f] border border-white/5 hover:border-white/15 transition-all flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-600/20 text-[#00d4ff] shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-white truncate">{doc.name}</h4>
                        <p className="text-[11px] text-[#a0a0b0]">{doc.size} • {doc.uploadedAt}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                      className="p-1 rounded-lg text-[#a0a0b0] hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Delete Document"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Help & Feedback */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Help</span>
            </a>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: TEAM ACCESS */}
      {/* ========================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Team Access & Permission Roles</h2>
                <p className="text-xs text-[#a0a0b0]">
                  Manage studio member accounts and access permissions.
                </p>
              </div>
              <button className="btn-pixeva-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#161622] border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] flex items-center justify-center font-bold text-xs">
                    PA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Pixeva Admin</h4>
                    <p className="text-[10px] text-[#a0a0b0]">admin@pixeva.co</p>
                  </div>
                </div>
                <span className="badge-cyan text-[10px] font-bold px-2.5 py-0.5 rounded">Owner / Admin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: CUSTOM DOMAIN */}
      {/* ========================================================= */}
      {activeTab === 'domain' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6 shadow-card">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Custom Domain</h2>
              <p className="text-xs text-[#a0a0b0]">
                Share your client portal from your own domain (e.g. portal.yourstudio.com) instead of pixeva.app — available on the Max plan.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Custom Domains are available on the Pixeva Max plan. Contact support to upgrade!')}
                className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
              >
                Upgrade plan
              </button>
            </div>
          </div>

          {/* Footer Help & Feedback */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Help</span>
            </a>
            <span className="hover:text-white cursor-pointer">Feedback</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: SYSTEM & CLOUD */}
      {/* ========================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          <IntegrationsStatus />
        </div>
      )}

      {/* Bottom Support & Feedback Bar */}
      <div className="p-5 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <LifeBuoy className="w-5 h-5 text-[#00d4ff]" />
          <div>
            <p className="font-bold text-white">Need help configuring studio services or custom pricing?</p>
            <p className="text-[#a0a0b0]">Our studio support team is available to assist with your setup.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="mailto:support@pixeva.co"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
          >
            Get Help
          </a>
          <a
            href="mailto:feedback@pixeva.co"
            className="px-3 py-1.5 rounded-xl badge-cyan font-bold transition-all"
          >
            Feedback
          </a>
        </div>
      </div>
    </div>
  );
}
