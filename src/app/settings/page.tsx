'use client';

import React, { useState } from 'react';
import {
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
  Clock,
  FileText,
  Server,
  X,
  MessageCircle,
  Upload,
  RefreshCw,
  Sliders,
  Check,
  Coins
} from 'lucide-react';
import IntegrationsStatus from '@/components/system/IntegrationsStatus';
import { useCurrency } from '@/context/CurrencyContext';

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
  const { currencies, currencyCode, currency, symbol, setCurrencyCode, formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<
    'services' | 'packages' | 'payments' | 'contract' | 'documents' | 'team' | 'domain' | 'system'
  >('services');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'payments' || tab === 'currency') {
        setActiveTab('payments');
      }
    }
  }, []);

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
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage studio services, packages, and contract templates
          </p>
        </div>

        {/* Save Button & Header Action */}
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-pixeva-primary flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center space-x-1 min-w-max bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
          {[
            { key: 'services', label: 'Services', icon: Sliders },
            { key: 'packages', label: 'Packages', icon: Briefcase },
            { key: 'payments', label: 'Payments & Currency', icon: CreditCard },
            { key: 'contract', label: 'Contract', icon: FileSignature },
            { key: 'documents', label: 'Documents Library', icon: FolderArchive },
            { key: 'team', label: 'Team Access', icon: Users },
            { key: 'domain', label: 'Custom Domain', icon: Globe },
            { key: 'system', label: 'System & Cloud', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SERVICES (Crew Roles, Other Services, Deliverables) */}
      {/* ========================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SECTION 1: CREW ROLES */}
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Crew Roles</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appear as columns in the project schedule table — drag to reorder
              </p>
            </div>

            {/* Crew Roles Drag & Drop List */}
            <div className="space-y-1.5">
              {crewRoles.map((role, idx) => (
                <div
                  key={role.id}
                  className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab shrink-0 opacity-40 group-hover:opacity-100" />
                    <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{role.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <span className="text-[10px]">Rate/Day:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(role.defaultRate)}</span>
                    </div>

                    <button
                      onClick={() => setCrewRoles(prev => prev.filter(r => r.id !== role.id))}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Crew Role Form */}
            <form onSubmit={handleAddCrewRole} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="New crew role title (e.g. Lead Editor)..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1 w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <input
                type="number"
                placeholder={`Day rate (${symbol})...`}
                value={newRoleRate}
                onChange={(e) => setNewRoleRate(e.target.value)}
                className="w-full sm:w-32 bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="btn-pixeva-primary flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Crew Role</span>
              </button>
            </form>
          </div>

          {/* SECTION 2: OTHER SERVICES */}
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Other Services</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Additional services shown in the project schedule
              </p>
            </div>

            {/* Other Services List */}
            <div className="space-y-1.5">
              {otherServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{service.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(service.price)}
                    </span>
                    <button
                      onClick={() => setOtherServices(prev => prev.filter(s => s.id !== service.id))}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Other Service Form */}
            <form onSubmit={handleAddOtherService} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="New service name (e.g. Crane Operator)..."
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <input
                type="number"
                placeholder={`Price (${symbol})...`}
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-full sm:w-32 bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="btn-pixeva-primary flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </form>
          </div>

          {/* SECTION 3: DELIVERABLES */}
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Deliverables</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Studio deliverables catalog — used to build packages and pre-fill projects
              </p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-1.5">
              {deliverables.map((deliv, idx) => (
                <div
                  key={deliv.id}
                  className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{deliv.name}</h4>
                      <p className="text-[10px] text-slate-400">Format: {deliv.format}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{deliv.estimatedDays} Days</span>
                    </span>
                    <button
                      onClick={() => setDeliverables(prev => prev.filter(d => d.id !== deliv.id))}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Deliverable Form */}
            <form onSubmit={handleAddDeliverable} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="New deliverable title (e.g. Drone Reel)..."
                value={newDeliverableName}
                onChange={(e) => setNewDeliverableName(e.target.value)}
                className="flex-1 w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <input
                type="number"
                placeholder="Turnaround days..."
                value={newDeliverableDays}
                onChange={(e) => setNewDeliverableDays(e.target.value)}
                className="w-full sm:w-28 bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="btn-pixeva-primary flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
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
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Group a set of deliverables and services into a named package to apply in one click.
          </p>

          {/* Package Cards List */}
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-5 rounded-xl pixeva-card space-y-4"
              >
                {/* Package Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 gap-3">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: val } : p));
                      }}
                      placeholder="Package Name..."
                      className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 w-full transition-colors"
                    />
                  </div>

                  {packages.length > 1 && (
                    <button
                      onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Deliverables Section */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deliverables</h3>

                  {pkg.deliverables.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">No deliverables added yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pkg.deliverables.map((deliv) => (
                        <div
                          key={deliv.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <span className="font-medium text-slate-900 dark:text-white">{deliv.name}</span>
                          <button
                            onClick={() => {
                              setPackages(prev => prev.map(p => {
                                if (p.id === pkg.id) {
                                  return { ...p, deliverables: p.deliverables.filter(d => d.id !== deliv.id) };
                                }
                                return p;
                              }));
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
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
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 animate-fadeIn">
                      <select
                        value={selectedDelivToAdd}
                        onChange={(e) => setSelectedDelivToAdd(e.target.value)}
                        className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">Select from catalog or type custom...</option>
                        {deliverables.map((d) => (
                          <option key={d.id} value={d.name}>{d.name} ({d.format})</option>
                        ))}
                      </select>

                      <div className="flex items-center space-x-1.5 shrink-0">
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
                          className="btn-pixeva-primary px-3 py-1.5 text-xs font-semibold"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingDelivToPkg(null);
                            setSelectedDelivToAdd('');
                          }}
                          className="btn-pixeva-secondary px-3 py-1.5 text-xs font-semibold"
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
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline flex items-center space-x-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Deliverable</span>
                    </button>
                  )}
                </div>

                {/* Other Services Included Section */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Other services included
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                            isIncluded
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/30 font-semibold shadow-2xs'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
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
          <div className="flex items-center space-x-2 pt-1">
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
              className="btn-pixeva-secondary flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Package</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAYMENTS & CURRENCY */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fadeIn">
          {/* SECTION 1: STUDIO CURRENCY & REGIONAL LOV */}
          <div className="p-5 rounded-xl pixeva-card space-y-4 border-2 border-blue-500/30 dark:border-blue-500/20 bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-[#111827] dark:via-[#111827] dark:to-blue-950/20 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>Studio Currency & LOV</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                        Dynamic CRM
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select your accounting currency. Automatically formats Dashboard volume, ledger, invoices, and proposals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 self-start sm:self-auto">
                <span className="text-base">{currency.flag}</span>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Currency</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currency.code} ({currency.symbol})
                  </div>
                </div>
              </div>
            </div>

            {/* Currency LOV Dropdown */}
            <div className="space-y-2">
              <label htmlFor="currency-lov-select" className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                Primary Currency Dropdown (LOV):
              </label>
              <div className="relative max-w-md">
                <select
                  id="currency-lov-select"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs cursor-pointer"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.symbol} {c.name} {c.code === 'INR' ? '(Rupees / Lakhs format)' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <span className="text-xs font-mono">▼</span>
                </div>
              </div>
            </div>

            {/* Quick Currency Tiles Grid */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                Quick Selection:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currencies.map((c) => {
                  const isSelected = c.code === currencyCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrencyCode(c.code)}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-500/15 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-xl shrink-0">{c.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                            {c.code} ({c.symbol.trim()})
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {c.code === 'INR' ? 'Indian Rupee (₹)' : c.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Live CRM Formatting Preview:
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All numbers in Dashboard, Finances, and Invoices automatically adapt to {currency.name}.
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Advance (20%)</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(200000)}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Total Volume</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(980000)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Payment Split */}
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payment Split</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default installments used to auto-generate project payment schedules
              </p>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {paymentSplits.map((split) => (
                <div
                  key={split.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 items-center text-xs"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={split.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, name: val } : s));
                      }}
                      placeholder="e.g. Booking Advance"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="relative">
                      <input
                        type="number"
                        value={split.percent}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, percent: val } : s));
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg pl-2.5 pr-6 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    <div className="flex items-center space-x-1.5">
                      <select
                        value={split.timing}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setPaymentSplits(prev => prev.map(s => s.id === split.id ? { ...s, timing: val } : s));
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
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
                            className="w-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-1.5 py-1.5 text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none"
                          />
                          <span className="text-slate-500 whitespace-nowrap">days</span>
                          <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate">before first event day</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    {paymentSplits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPaymentSplits(prev => prev.filter(s => s.id !== split.id))}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                className="btn-pixeva-secondary flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Split</span>
              </button>

              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Total:{' '}
                <span className={
                  paymentSplits.reduce((sum, s) => sum + s.percent, 0) === 100
                    ? 'text-emerald-600 font-mono font-bold'
                    : 'text-amber-600 font-mono font-bold'
                }>
                  {paymentSplits.reduce((sum, s) => sum + s.percent, 0)}%
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Payment Modes */}
          <div className="p-5 rounded-xl pixeva-card space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payment Modes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Options shown in the Payment Mode dropdown when recording a payment
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {paymentModes.map((mode, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5"
                >
                  <span>{mode}</span>
                  {isEditingModes && (
                    <button
                      type="button"
                      onClick={() => setPaymentModes(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditingModes && (
              <div className="flex items-center gap-2 pt-1 animate-fadeIn max-w-sm">
                <input
                  type="text"
                  placeholder="New payment mode..."
                  value={newModeInput}
                  onChange={(e) => setNewModeInput(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newModeInput.trim()) return;
                    setPaymentModes(prev => [...prev, newModeInput.trim()]);
                    setNewModeInput('');
                  }}
                  className="btn-pixeva-primary px-3 py-1 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsEditingModes(prev => !prev)}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
              >
                {isEditingModes ? 'Done Editing' : 'Edit Payment Modes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CONTRACT */}
      {/* ========================================================= */}
      {activeTab === 'contract' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-xl pixeva-card space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Standard Contract Template</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Included in the client portal when &quot;Standard Contract&quot; is enabled on a project.
              </p>
            </div>

            <textarea
              rows={14}
              value={contractTerms}
              onChange={(e) => setContractTerms(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400"
            />

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="btn-pixeva-primary"
              >
                Save Contract
              </button>

              <button
                type="button"
                onClick={() => setContractTerms(DEFAULT_CONTRACT_TERMS)}
                className="btn-pixeva-secondary"
              >
                Reset to default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DOCUMENTS LIBRARY */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Documents Library</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload files to share with clients via their portal (PDF, PNG, JPG), max 5MB
                </p>
              </div>

              <label className="btn-pixeva-primary flex items-center space-x-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
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
              <div className="py-10 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">No documents yet.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a PDF, PNG or JPG to share it with all your clients.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start space-x-2.5 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="truncate">
                        <h4 className="font-semibold text-slate-900 dark:text-white truncate">{doc.name}</h4>
                        <p className="text-[10px] text-slate-400">{doc.size} • {doc.uploadedAt}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Document"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: TEAM ACCESS */}
      {/* ========================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-xl pixeva-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Team Access & Roles</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage studio member accounts and access permissions.
                </p>
              </div>
              <button className="btn-pixeva-primary flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Member</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                    PA
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Pixeva Admin</h4>
                    <p className="text-[11px] text-slate-500">admin@pixeva.co</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Owner / Admin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: CUSTOM DOMAIN */}
      {/* ========================================================= */}
      {activeTab === 'domain' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-xl pixeva-card space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Custom Domain</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your client portal from your own domain (e.g. portal.yourstudio.com).
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => alert('Custom Domains are available on the Pixeva Max plan. Contact support to upgrade!')}
                className="btn-pixeva-primary"
              >
                Upgrade plan
              </button>
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
    </div>
  );
}
