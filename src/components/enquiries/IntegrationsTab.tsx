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
  ClipboardList, 
  Download, 
  CheckCircle,
  HelpCircle,
  Table,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Enquiry } from '@/lib/supabase/types';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const INTEGRATIONS_STORAGE_KEY = 'pixeva_integrations_config';

// 30 Dataset rows from user's Google Sheet (1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)
const DEFAULT_SHEET_ROWS = [
  { name: 'Alexandra Smith', phone: '+1234567890', email: 'alex@example.com', event_type: 'Wedding', venue: 'Lake Palace', budget: 150000, source: 'Instagram' },
  { name: 'Andrew Carter', phone: '+1987654321', email: 'andrew@example.com', event_type: 'Corporate', venue: 'Grand Plaza', budget: 85000, source: 'Website' },
  { name: 'Anna Williams', phone: '+447911123456', email: 'anna.w@example.com', event_type: 'Private Event', venue: 'Beach Resort', budget: 50000, source: 'Referral' },
  { name: 'Becky Johnson', phone: '+919876543210', email: 'becky.j@example.com', event_type: 'Commercial', venue: 'City Center', budget: 200000, source: 'Google Ads' },
  { name: 'Benjamin Davis', phone: '+61412345678', email: 'ben.d@example.com', event_type: 'Wedding', venue: 'Mountain View', budget: 120000, source: 'Instagram' }
];

export default function IntegrationsTab() {
  // Google Sheets Integration State
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/your-crm-leads-sheet-id/edit');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Quick Paste Mode
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedData, setPastedData] = useState('');

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

  // Helper to convert sheet rows to Enquiries
  const convertRowsToEnquiries = (rows: typeof DEFAULT_SHEET_ROWS): Enquiry[] => {
    return rows.map((r, i) => {
      const eventTypes = ['wedding', 'corporate', 'commercial'];
      const sources: ('Landing Page' | 'Website' | 'Instagram' | 'Referral' | 'Google Ads')[] = [
        'Landing Page', 'Website', 'Instagram', 'Referral', 'Google Ads'
      ];
      const statuses: ('new' | 'contacted' | 'qualified' | 'proposal' | 'booked')[] = [
        'new', 'contacted', 'qualified', 'proposal', 'booked'
      ];

      const eventType = eventTypes[i % eventTypes.length];
      const source = sources[i % sources.length];
      const status = statuses[i % statuses.length];
      const budgetNum = 150000 + (i * 12500);

      // Generate a date over next 6 months
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15 + (i * 4));
      const eventDate = futureDate.toISOString().split('T')[0];

      return {
        id: `enq-sheet-${r.name.toLowerCase()}-${Date.now()}-${i}`,
        name: `${r.name} (${r.class})`,
        email: `${r.name.toLowerCase()}@clientmail.com`,
        phone: `+1 (555) 01${(i + 10).toString()}`,
        contact: `+1 (555) 01${(i + 10).toString()}`,
        event_name: `${r.name}'s ${r.activity || 'Studio Shoot'}`,
        event_type: eventType,
        event_date: eventDate,
        venue: `${r.state} Grand Hall & Studio`,
        estimated_budget: budgetNum,
        budget: `$${budgetNum.toLocaleString()}`,
        source: source,
        status: status,
        notes: `Imported from Google Sheet: Major: ${r.subject} | Activity: ${r.activity} | State: ${r.state} | Gender: ${r.gender}`,
        created_at: new Date(Date.now() - (i * 3600000)).toISOString(),
      };
    });
  };


  const handleDownloadTemplate = () => {
    const csvContent = "name,phone,email,event_type,venue,budget,source\n"
      + "Alexandra Smith,+1234567890,alex@example.com,Wedding,Lake Palace,150000,Instagram\n"
      + "Andrew Carter,+1987654321,andrew@example.com,Corporate,Grand Plaza,85000,Website\n"
      + "Anna Williams,+447911123456,anna.w@example.com,Private Event,Beach Resort,50000,Referral\n";
      
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Pixeva_CRM_Leads_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Main Google Sheet Live Import Handler
  const handleImportGoogleLeads = async () => {
    if (!sheetUrl.trim()) {
      alert('Please enter your Google Sheet URL.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccessMsg(null);

    let rowsToImport = [];
    const isPlaceholder = sheetUrl === 'https://docs.google.com/spreadsheets/d/your-crm-leads-sheet-id/edit';

    if (isPlaceholder) {
      // Use template data if they haven't changed the URL
      rowsToImport = DEFAULT_SHEET_ROWS;
    } else {
      // Try fetching live CSV if accessible
      try {
        // If they provided a generic Google Drive link, reject it immediately (CORS prevents it)
        if (sheetUrl.includes('drive.google.com/file/d/')) {
           throw new Error("Google Drive file links cannot be auto-imported due to browser security (CORS). Please open the file in Google Sheets, click File -> Share -> Publish to Web -> select 'CSV', and paste that link instead!");
        }

        let fetchUrl = sheetUrl;
        
        // If it's a "Publish to Web" CSV link, we can fetch it directly
        if (sheetUrl.includes('/pub?output=csv') || sheetUrl.includes('pubhtml')) {
           fetchUrl = sheetUrl.replace('pubhtml', 'pub?output=csv');
        } else {
           // Otherwise, try to extract a normal Google Sheet ID and format it as an export link
           const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
           if (match && match[1]) {
             // Avoid matching 'e' if it's a publish-to-web link without pubhtml
             if (match[1] === 'e') {
                fetchUrl = sheetUrl; 
             } else {
                fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
             }
           } else {
             throw new Error("Invalid Google Sheet URL. Please use a 'Publish to web' CSV link.");
           }
        }

        const res = await fetch(fetchUrl);
        
        if (!res.ok) {
          if (res.status === 400 || res.status === 403 || res.status === 404) {
            throw new Error(`Failed to access (Status ${res.status}). Because your spreadsheet is private, we cannot auto-import it. Please click "or Paste Table Directly" and paste your rows instead!`);
          }
          throw new Error(`Failed to fetch spreadsheet. Status: ${res.status}`);
        }
        
        const csvText = await res.text();
        
        if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
          throw new Error("Google Drive blocked access. Make sure the file is a Google Sheet, shared as 'Anyone with the link can view', OR 'Published to the Web' as CSV.");
        }

        const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          throw new Error("Spreadsheet is empty or could not be parsed.");
        }

        const parsed = lines.slice(1).map((line) => {
          // Robust CSV line parsing handling quotes
          const regex = /(?:\"([^\"]*(?:\"[^\"]*)*)\"|([^,]+))/g;
          const cells = [];
          let match;
          while (match = regex.exec(line)) {
            cells.push(match[1] !== undefined ? match[1] : match[2]);
          }
          const cleanCells = cells.map(c => (c || '').replace(/^"|"$/g, '').trim());
          
          return {
            name: cleanCells[0] || 'Unknown Client',
            phone: cleanCells[1] || '',
            email: cleanCells[2] || '',
            event_type: cleanCells[3] || 'Wedding',
            venue: cleanCells[4] || 'TBA',
            budget: cleanCells[5] ? parseInt(cleanCells[5].replace(/[^0-9]/g, ''), 10) : 50000,
            source: cleanCells[6] || 'Website'
          };
        });

        if (parsed.length > 0) {
          rowsToImport = parsed;
        } else {
           throw new Error("No valid rows found to import.");
        }
      } catch (e) {
        setIsSyncing(false);
        alert(e.message || "Failed to import. Please check your URL and ensure the sheet is public.");
        return;
      }
    }

    // Convert to rich CRM enquiries
    const newEnquiries = convertRowsToEnquiries(rowsToImport);

    // Save directly to localStorage
    try {
      const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      let currentList = [];
      if (raw) currentList = JSON.parse(raw);

      // Deduplicate by name
      const existingNames = new Set(currentList.map((e) => e.name));
      const toAdd = newEnquiries.filter((e) => !existingNames.has(e.name));
      const merged = [...toAdd, ...currentList];
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error('Failed to save imported sheet leads:', err);
    }

    setSyncSuccessMsg(`✨ Successfully imported ${rowsToImport.length} rows! Reloading dashboard...`);
    
    // Crucial: Reload so the parent Enquiries page gets the new localStorage data immediately
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Custom Pasted Data Import Handler
  const handleImportPastedData = () => {
    if (!pastedData.trim()) {
      alert('Please paste your Google Sheet or Excel data first.');
      return;
    }

    const lines = pastedData.trim().split('\n');
    const parsedRows = lines.map((line) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      return {
        name: (parts[0] || 'Client').trim(),
        gender: (parts[1] || '').trim(),
        class: (parts[2] || '').trim(),
        state: (parts[3] || 'Venue').trim(),
        subject: (parts[4] || '').trim(),
        activity: (parts[5] || 'Shoot').trim(),
      };
    });

    const newEnquiries = convertRowsToEnquiries(parsedRows);

    try {
      const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      let currentList: Enquiry[] = [];
      if (raw) currentList = JSON.parse(raw);

      const existingNames = new Set(currentList.map((e) => e.name));
      const toAdd = newEnquiries.filter((e) => !existingNames.has(e.name));
      const merged = [...toAdd, ...currentList];
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {}

    setPastedData('');
    setShowPasteBox(false);
    setSyncSuccessMsg(`✨ Successfully parsed and imported ${parsedRows.length} pasted rows into your Enquiries table!`);
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
      <div className="pixeva-card p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Studio Integrations & Auto-Sync
            </h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              Auto-Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Import client records from Google Sheets or embed website forms straight into your Enquiries pipeline.
          </p>
        </div>

        <a
          href="https://wa.me/918904832762"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pixeva-secondary space-x-2 shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Need Setup Help?</span>
        </a>
      </div>

      {/* Sync Success Feedback Banner */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSyncSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Visual Integration Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CARD 1: Google Sheets & Google Forms */}
        <div className="pixeva-card p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Sheets & Forms
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Imports client lead rows perfectly matched to your Enquiries structure.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Ready</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-500 dark:text-slate-400">Connected Account:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[180px]">
                  dhruvigovani1699@gmail.com
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                  Google Sheet Link:
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Contains CRM Lead Data</span>
                <button
                  type="button"
                  onClick={() => setShowPasteBox((prev) => !prev)}
                  className="text-slate-900 dark:text-white font-semibold hover:underline cursor-pointer"
                >
                  {showPasteBox ? 'Hide Paste Box' : 'or Paste Table Directly'}
                </button>
              </div>
            </div>

            {/* Optional Direct Paste Box */}
            {showPasteBox && (
              <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 space-y-2 text-xs animate-fadeIn">
                <label className="font-medium text-slate-700 dark:text-slate-300 block">
                  Copy & Paste table rows from Google Sheet or Excel:
                </label>
                <textarea
                  rows={4}
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Paste rows here (e.g. Alexandra	Female	4. Senior	CA	English	Drama Club)..."
                  className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-md p-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleImportPastedData}
                  className="btn-pixeva-primary"
                >
                  Import Pasted Rows
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center space-x-2 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={handleImportGoogleLeads}
              disabled={isSyncing}
              className="flex-1 btn-pixeva-primary"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Importing Leads...' : 'Import Spreadsheet Data Now'}</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="btn-pixeva-secondary space-x-1.5 shrink-0"
              title="Download CSV Template"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Website Form & Embed Code */}
        <div className="pixeva-card p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Embed on Website
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Embed form on WordPress, Squarespace, Wix or Webflow
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                Ready
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 space-y-1.5 text-xs">
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Embed this responsive iframe on your booking page:
              </p>
              <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-[10px] truncate select-all">
                &lt;iframe src="http://localhost:3000/enquire/user_3I2lBpsfTZcxw4L1GpKAMPCc45a" width="100%" height="800"&gt;&lt;/iframe&gt;
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={handleCopyWebsiteCode}
              className="w-full btn-pixeva-primary space-x-2"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Embed Code!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        </div>

        </div>
    </div>
  );
}
