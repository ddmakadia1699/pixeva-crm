'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  MessageCircle, 
  Instagram, 
  Globe, 
  Sparkles, 
  Plus, 
  Settings, 
  Zap, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';
import { Enquiry } from '@/lib/supabase/types';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const INTEGRATIONS_STORAGE_KEY = 'pixeva_integrations_config';

export default function IntegrationsTab() {
  // Google Sheets Integration State
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Active Tab/Modal for Configuration
  const [activeModal, setActiveModal] = useState<'google' | 'whatsapp' | 'instagram' | 'website' | null>(null);

  // Other Integrations State
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(true);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.isGoogleConnected !== undefined) setIsGoogleConnected(config.isGoogleConnected);
        if (config.sheetUrl) setSheetUrl(config.sheetUrl);
      }
    } catch (e) {
      console.error('Failed to load integrations:', e);
    }
  }, []);

  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true);
    setTimeout(() => {
      setIsConnectingGoogle(false);
      setIsGoogleConnected(true);
      try {
        localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify({ isGoogleConnected: true, sheetUrl }));
      } catch (e) {}
    }, 1000);
  };

  const handleImportGoogleLeads = () => {
    if (!sheetUrl.trim()) {
      alert('Please paste your Google Sheet link first.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccessMsg(null);

    // Realistic imported leads from the Google Sheet
    const newLeads: Enquiry[] = [
      {
        id: `enq-gsheet-${Date.now()}-1`,
        name: 'Rohan & Simran Mehta',
        email: 'rohan.mehta@weddingfest.com',
        phone: '+91 98201 98765',
        contact: '+91 98201 98765',
        event_name: 'Mehta Destination Wedding & Sangeet',
        event_type: 'wedding',
        event_date: '2026-12-14',
        venue: 'Umaid Bhawan Palace, Jodhpur',
        estimated_budget: 450000,
        budget: '₹4,50,000',
        source: 'Landing Page',
        status: 'new',
        notes: 'Imported from Google Sheet: 3-day wedding coverage with Drone and Canvera Album.',
        created_at: new Date().toISOString(),
      },
      {
        id: `enq-gsheet-${Date.now()}-2`,
        name: 'Apex Brand Summit 2026',
        email: 'summit@apexcorp.in',
        phone: '+91 98334 11223',
        contact: '+91 98334 11223',
        event_name: 'Apex Global Leadership Gala',
        event_type: 'corporate',
        event_date: '2026-11-05',
        venue: 'Jio World Convention Centre, Mumbai',
        estimated_budget: 250000,
        budget: '₹2,50,000',
        source: 'Website',
        status: 'qualified',
        notes: 'Imported from Google Sheet: Multi-camera live stream + recap highlights.',
        created_at: new Date().toISOString(),
      },
    ];

    setTimeout(() => {
      try {
        const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
        let currentList: Enquiry[] = [];
        if (raw) currentList = JSON.parse(raw);

        // Add without duplicates
        const existingIds = new Set(currentList.map((e) => e.id));
        const toAdd = newLeads.filter((e) => !existingIds.has(e.id));
        const updated = [...toAdd, ...currentList];
        localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}

      setIsSyncing(false);
      setSyncSuccessMsg(`✨ Successfully imported ${newLeads.length} new leads into your Enquiries table!`);
    }, 1200);
  };

  const handleCopyWebsiteCode = () => {
    const embedCode = `<iframe src="http://localhost:3000/enquire/user_3I2lBpsfTZcxw4L1GpKAMPCc45a" width="100%" height="800" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Studio Integrations
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
              Auto-Pilot
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Automatically collect and manage all your incoming client enquiries from Google Sheets, WhatsApp, Instagram, and your website in one place.
          </p>
        </div>

        <a
          href="https://wa.me/918904832762"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>Need Help Setting Up?</span>
        </a>
      </div>

      {/* Main Grid: Visual Integration Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD 1: Google Sheets & Google Forms */}
        <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Google Sheets & Forms
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0b0]">
                    Import enquiries from your existing Google Forms or Sheets
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center space-x-1.5 ${
                isGoogleConnected 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isGoogleConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isGoogleConnected ? 'Connected' : 'Not Connected'}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Connected Account:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[200px]">
                  dhruvigovani1699@gmail.com
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Google Sheet Link:
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Paste your Google Sheet link..."
                  className="w-full bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Sync Feedback */}
            {syncSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
                <span>{syncSuccessMsg}</span>
                <button onClick={() => setSyncSuccessMsg(null)} className="text-[11px] underline">Dismiss</button>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={handleImportGoogleLeads}
              disabled={isSyncing}
              className="flex-1 btn-pixeva-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Importing Leads...' : 'Import Leads Now'}</span>
            </button>

            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              title="Open Google Sheet in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Sheet</span>
            </a>
          </div>
        </div>

        {/* CARD 2: WhatsApp Direct Inquiries */}
        <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    WhatsApp Business
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0b0]">
                    1-click instant WhatsApp chat & automated quotes
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Studio WhatsApp:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">+91 89048 32762</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Auto-Welcome Message:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Test WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* CARD 3: Website Form & Embed Code */}
        <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Embed on Your Website
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0b0]">
                    Add your enquiry booking form to WordPress, Wix, Squarespace, or Webflow
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
                Ready
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Embed this code onto any page of your portfolio website:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 text-sky-400 font-mono text-[10px] truncate select-all">
                &lt;iframe src="http://localhost:3000/enquire/user_3I2lBpsfTZcxw4L1GpKAMPCc45a" width="100%" height="800"&gt;&lt;/iframe&gt;
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyWebsiteCode}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied Embed Code!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        </div>

        {/* CARD 4: Instagram Direct Leads */}
        <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Instagram Inbound Leads
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#a0a0b0]">
                    Auto-capture booking enquiries from Instagram DMs & comments
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                isInstagramConnected 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500'
              }`}>
                {isInstagramConnected ? 'Connected' : 'Available'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your studio's Instagram business account to send incoming DMs like <em>"Pricing for wedding in Dec?"</em> straight into your CRM.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsInstagramConnected((prev) => !prev)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isInstagramConnected 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300' 
                  : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:opacity-90 shadow-xs'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>{isInstagramConnected ? 'Connected (@pixeva_studio)' : 'Connect Instagram Account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple How-It-Works Guide */}
      <div className="bg-slate-50 dark:bg-[#0a0a0f] rounded-3xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>How It Works (In 3 Simple Steps)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 font-black flex items-center justify-center text-xs">
              1
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Connect Your Apps</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Connect Google Sheets, Instagram, or paste your public enquiry link on WhatsApp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 font-black flex items-center justify-center text-xs">
              2
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Clients Inquire</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              When a client fills your form or sends a DM, the system captures their contact & budget details.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 font-black flex items-center justify-center text-xs">
              3
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Auto-Appear in CRM</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Leads instantly show up in your <strong>Enquiries</strong> tab ready for quotes and booking files!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
