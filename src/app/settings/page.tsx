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
  Server
} from 'lucide-react';
import IntegrationsStatus from '@/components/system/IntegrationsStatus';

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

interface StudioPackage {
  id: string;
  name: string;
  price: number;
  deliverablesCount: number;
  tag: string;
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

const INITIAL_PACKAGES: StudioPackage[] = [
  { id: '1', name: 'Royal Grand Wedding Package', price: 250000, deliverablesCount: 6, tag: 'Most Popular' },
  { id: '2', name: 'Cinematic Wedding & Reception', price: 180000, deliverablesCount: 5, tag: 'Bestseller' },
  { id: '3', name: 'Engagement & Pre-Wedding Special', price: 85000, deliverablesCount: 4, tag: 'Standard' },
  { id: '4', name: 'Corporate & Large Scale Event Coverage', price: 120000, deliverablesCount: 3, tag: 'Enterprise' }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'services' | 'packages' | 'payments' | 'contract' | 'documents' | 'team' | 'domain' | 'system'
  >('services');

  // Services State
  const [crewRoles, setCrewRoles] = useState<CrewRoleItem[]>(INITIAL_CREW_ROLES);
  const [otherServices, setOtherServices] = useState<OtherServiceItem[]>(INITIAL_OTHER_SERVICES);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(INITIAL_DELIVERABLES);

  // New Item Forms State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleRate, setNewRoleRate] = useState('');
  
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  const [newDeliverableName, setNewDeliverableName] = useState('');
  const [newDeliverableDays, setNewDeliverableDays] = useState('14');
  const [newDeliverableFormat, setNewDeliverableFormat] = useState('4K MP4');

  // Contract State
  const [contractTerms, setContractTerms] = useState(
    `STUDIO PHOTOGRAPHY & VIDEOGRAPHY SERVICES AGREEMENT

1. SCOPE OF WORK: Pixeva Studio agrees to provide photography, cinematography, and post-production deliverables as outlined in the accepted client project schedule.
2. PAYMENT SPLIT: 20% Booking Advance (Non-refundable), 60% Payable on or before the first event date, 20% Balance payable upon final delivery of raw/edited assets.
3. COPYRIGHT & PORTFOLIO RIGHTS: The studio retains copyright of all images and videos and reserves the right to publish selected works for portfolio presentation.
4. OVERTIME & CREW CHARGES: Any shoot extending beyond 10 hours per day will incur additional crew overtime charges of ₹1,500/hour per team member.`
  );

  // Payments State
  const [advancePercent, setAdvancePercent] = useState('20');
  const [eventPercent, setEventPercent] = useState('60');
  const [deliveryPercent, setDeliveryPercent] = useState('20');
  const [upiId, setUpiId] = useState('pixeva.studio@upi');
  const [bankAccount, setBankAccount] = useState('Pixeva Studio Pvt Ltd - A/C 9876543210 - HDFC0001234');

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
      {/* TAB 2: PACKAGES */}
      {/* ========================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Studio Service Packages</h2>
                <p className="text-xs text-[#a0a0b0]">
                  Pre-configured package tiers for rapid client quoting and project creation.
                </p>
              </div>
              <button className="btn-pixeva-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Create Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_PACKAGES.map((pkg) => (
                <div key={pkg.id} className="p-4 rounded-xl bg-[#161622] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-cyan text-[10px] font-bold px-2 py-0.5 rounded">
                      {pkg.tag}
                    </span>
                    <span className="font-mono font-extrabold text-sm text-emerald-400">
                      ₹{pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-[#a0a0b0]">Includes {pkg.deliverablesCount} core deliverables & full crew coverage.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENTS */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Payment Schedule & Split Rules</h2>
              <p className="text-xs text-[#a0a0b0]">
                Configure default installment percentages and studio bank details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">1. Booking Advance %</label>
                <input
                  type="text"
                  value={advancePercent}
                  onChange={(e) => setAdvancePercent(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">2. On Event Date %</label>
                <input
                  type="text"
                  value={eventPercent}
                  onChange={(e) => setEventPercent(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white">3. Final Delivery %</label>
                <input
                  type="text"
                  value={deliveryPercent}
                  onChange={(e) => setDeliveryPercent(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Studio UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Bank Account & IFSC Details</label>
                <textarea
                  rows={3}
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONTRACT */}
      {/* ========================================================= */}
      {activeTab === 'contract' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-4">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Master Contract Agreement Template</h2>
              <p className="text-xs text-[#a0a0b0]">
                Template terms automatically populated in generated client e-signatures.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white">Contract Body Terms & Conditions</label>
              <textarea
                rows={12}
                value={contractTerms}
                onChange={(e) => setContractTerms(e.target.value)}
                className="w-full bg-[#161622] border border-white/15 rounded-xl p-4 text-xs font-mono text-white/90 leading-relaxed focus:outline-none focus:border-[#00d4ff]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DOCUMENTS LIBRARY */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Studio Documents & Asset Library</h2>
                <p className="text-xs text-[#a0a0b0]">
                  Store rate cards, terms & conditions PDFs, and studio logos.
                </p>
              </div>
              <button className="btn-pixeva-primary px-4 py-2 text-xs font-bold flex items-center space-x-1.5">
                <UploadCloud className="w-4 h-4" />
                <span>Upload Asset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#161622] border border-white/10 space-y-2">
                <FileText className="w-6 h-6 text-[#00d4ff]" />
                <h4 className="text-xs font-bold text-white">Studio Brochure 2026.pdf</h4>
                <p className="text-[10px] text-[#a0a0b0]">2.4 MB • Updated 2 days ago</p>
              </div>
              <div className="p-4 rounded-xl bg-[#161622] border border-white/10 space-y-2">
                <FileText className="w-6 h-6 text-purple-400" />
                <h4 className="text-xs font-bold text-white">Standard Price List.pdf</h4>
                <p className="text-[10px] text-[#a0a0b0]">1.1 MB • Updated 1 week ago</p>
              </div>
              <div className="p-4 rounded-xl bg-[#161622] border border-white/10 space-y-2">
                <Image className="w-6 h-6 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Pixeva HighRes Logo.png</h4>
                <p className="text-[10px] text-[#a0a0b0]">450 KB • Branding Asset</p>
              </div>
            </div>
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
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Custom Domain Configuration</h2>
              <p className="text-xs text-[#a0a0b0]">
                Connect your studio's custom URL to brand your client gallery and portals.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Your Custom Studio Domain</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                  <span className="badge-emerald text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SSL Active</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <p className="font-bold text-white">DNS CNAME Record Setup</p>
                <p className="text-[#a0a0b0]">Add the following CNAME record in your domain provider (GoDaddy, Namecheap, Cloudflare):</p>
                <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-[#00d4ff] flex justify-between">
                  <span>CNAME @ → cname.pixeva.co</span>
                  <span className="text-emerald-400">DNS Verified</span>
                </div>
              </div>
            </div>
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
