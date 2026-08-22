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
  Table, 
  Layers, 
  Zap, 
  AlertCircle, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  Instagram, 
  Globe, 
  Plus, 
  Database,
  Lock,
  CheckCircle
} from 'lucide-react';
import { Enquiry } from '@/lib/supabase/types';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const INTEGRATIONS_STORAGE_KEY = 'pixeva_integrations_config';

interface SyncLog {
  id: string;
  timestamp: string;
  rowsCount: number;
  status: 'success' | 'failed';
  source: string;
}

export default function IntegrationsTab() {
  // Google Account Connection State
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [googleUser, setGoogleUser] = useState({
    name: 'Dhruvi Govani',
    email: 'dhruvigovani1699@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    scope: 'Google Sheets & Drive (Read-Only)',
  });

  // Sheet Configuration
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
  const [sheetName, setSheetName] = useState('Pixeva Studio 2026 Client Inbound Leads');
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('15');

  // Mapping Configuration
  const [columnMapping, setColumnMapping] = useState({
    name: 'Column A (Full Name)',
    phone: 'Column B (WhatsApp / Phone)',
    email: 'Column C (Email Address)',
    event: 'Column D (Event / Shoot Type)',
    date: 'Column E (Event Date)',
    budget: 'Column F (Estimated Budget)',
    source: 'Column G (Lead Source)',
  });

  // Live Sync Execution
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Sync Activity History
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: 'log-1',
      timestamp: 'Today at 17:42',
      rowsCount: 4,
      status: 'success',
      source: 'Google Sheets Auto-Sync',
    },
    {
      id: 'log-2',
      timestamp: 'Yesterday at 11:15',
      rowsCount: 2,
      status: 'success',
      source: 'Manual Import',
    },
  ]);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.isConnected !== undefined) setIsConnected(config.isConnected);
        if (config.sheetUrl) setSheetUrl(config.sheetUrl);
        if (config.autoSync !== undefined) setAutoSync(config.autoSync);
        if (config.syncLogs) setSyncLogs(config.syncLogs);
      }
    } catch (e) {
      console.error('Error loading integrations config:', e);
    }
  }, []);

  const saveConfig = (updated: any) => {
    try {
      localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving integrations config:', e);
    }
  };

  const handleConnectGoogle = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      saveConfig({ isConnected: true, sheetUrl, autoSync, syncLogs });
    }, 1200);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    saveConfig({ isConnected: false, sheetUrl, autoSync, syncLogs });
  };

  // Execute Live Import & Sync
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    // Mock realistic imported Google Sheet rows
    const importedRows: Enquiry[] = [
      {
        id: `enq-gsheet-${Date.now()}-1`,
        name: 'Aanya & Kabir Singhania',
        email: 'aanya.singhania@weddingmail.com',
        phone: '+91 98112 34567',
        contact: '+91 98112 34567',
        event_name: 'Singhania Destination Wedding & Sangeet',
        event_type: 'wedding',
        event_date: '2026-11-28',
        venue: 'The Leela Palace, Udaipur',
        estimated_budget: 350000,
        budget: '₹3,50,000',
        source: 'Landing Page',
        status: 'new',
        notes: 'Imported live from Google Sheets: Candid & 4K cinematic film requested.',
        created_at: new Date().toISOString(),
      },
      {
        id: `enq-gsheet-${Date.now()}-2`,
        name: 'TechCorp Global Leaders Summit',
        email: 'events@techcorp-asia.com',
        phone: '+91 98223 45678',
        contact: '+91 98223 45678',
        event_name: 'TechCorp 2026 Annual Keynote Gala',
        event_type: 'corporate',
        event_date: '2026-10-15',
        venue: 'Grand Hyatt, Mumbai',
        estimated_budget: 180000,
        budget: '₹1,80,000',
        source: 'Google Ads',
        status: 'qualified',
        notes: 'Imported live from Google Sheets: Multi-camera live-switch + recap reel.',
        created_at: new Date().toISOString(),
      },
    ];

    setTimeout(() => {
      // 1. Append into localStorage enquiries database
      try {
        const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
        let currentList: Enquiry[] = [];
        if (raw) {
          currentList = JSON.parse(raw);
        }

        // Merge without duplicates
        const currentIds = new Set(currentList.map((e) => e.id));
        const toAdd = importedRows.filter((e) => !currentIds.has(e.id));
        const merged = [...toAdd, ...currentList];
        localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to append imported enquiries:', err);
      }

      // 2. Add log entry
      const newLog: SyncLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        rowsCount: importedRows.length,
        status: 'success',
        source: 'Google Sheets Live Sync',
      };
      const updatedLogs = [newLog, ...syncLogs];
      setSyncLogs(updatedLogs);
      saveConfig({ isConnected, sheetUrl, autoSync, syncLogs: updatedLogs });

      setIsSyncing(false);
      setSyncSuccessMsg(`Successfully synced and imported ${importedRows.length} new leads directly into your Enquiries table!`);
    }, 1500);
  };

  const webhookUrl = 'https://pixeva.app/api/enquiries/webhook?token=pix_sec_993427_live';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* SECTION 1: Google Sheets Active Sync Hub */}
      <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Google Sheets Real-Time Sync
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#a0a0b0] mt-0.5">
                Automatically import new wedding & event enquiries directly from your Google Form responses or spreadsheets.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerSync}
              disabled={!isConnected || isSyncing}
              className="btn-pixeva-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Rows...' : 'Sync & Import Now'}</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-start justify-between animate-fadeIn">
            <div className="flex items-center space-x-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSyncSuccessMsg(null)}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: Connect Account */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Step 1
              </span>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Connected Google Workspace Account
              </h3>
            </div>
            <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>OAuth 2.0 Verified</span>
            </span>
          </div>

          {isConnected ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0">
                  DG
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {googleUser.name}
                    </p>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {googleUser.email} • {googleUser.scope}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-600 dark:text-[#a0a0b0]">
                Connect your Google account to grant read-only access to your client response spreadsheets.
              </p>
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isConnecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Connecting OAuth...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Connect Google Account</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: Sheet Target & Mapping */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Step 2
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Target Spreadsheet & Automated Column Mapping
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Google Sheet URL / Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-200/70 dark:bg-white/5 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Sheet</span>
                </a>
              </div>
            </div>

            {/* Column Mapping Grid */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
                Mapped Fields (Auto-Detected from Header Row)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {Object.entries(columnMapping).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 flex items-center justify-between"
                  >
                    <span className="text-slate-500 dark:text-[#a0a0b0] font-medium capitalize">
                      {key}:
                    </span>
                    <span className="font-mono text-slate-900 dark:text-sky-400 font-bold text-[11px]">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Sync Toggle */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Enable Background Auto-Sync
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0b0]">
                    Checks and imports newly added rows automatically
                  </p>
                </div>
              </label>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 dark:text-[#a0a0b0]">Frequency:</span>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="60">Every 1 hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sync History Logs */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Recent Synchronization Logs
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#0a0a0f]/50">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-3 sm:px-4 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-bold text-slate-900 dark:text-white">{log.source}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 dark:text-slate-400">{log.rowsCount} rows imported</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Universal Inbound Webhook & Zapier Integration */}
      <div className="bg-white dark:bg-[#12121a] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3.5 border-b border-slate-100 dark:border-white/10 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Inbound Webhook API (Zapier / Make / Webflow)
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
                REST API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#a0a0b0] mt-0.5">
              Send leads into your CRM instantly from any custom website form, Typeform, or landing page builder.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Your Secure Webhook Endpoint (POST JSON)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyWebhook}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWebhook ? 'Copied URL' : 'Copy Endpoint'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">Sample JSON Payload:</span>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto">
{`{
  "name": "Priya Sharma",
  "phone": "+91 98765 43210",
  "email": "priya@weddingmail.com",
  "event_type": "wedding",
  "event_date": "2026-11-20",
  "venue": "Taj Lake Palace, Udaipur",
  "estimated_budget": 200000,
  "source": "Website Form"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
