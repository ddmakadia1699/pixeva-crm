'use client';

import React, { useState, useRef, useEffect } from 'react';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import {
  Search,
  Download,
  FileUp,
  Plus,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Receipt,
  FileText,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';

export interface ProjectFinanceItem {
  id: string;
  project_name: string;
  client: string;
  event_date: string;
  received: number;
  balance_due: number;
  team_payouts: number;
  expenses: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  project_name: string;
  type: 'Payment Received' | 'Team Payout' | 'Expense';
  category: string;
  amount: number;
  date: string;
  payment_mode?: string;
  note?: string;
}

const INITIAL_PROJECT_FINANCES: ProjectFinanceItem[] = [
  {
    id: 'fin-proj-1',
    project_name: 'Bride & Groom (Demo)',
    client: 'Bride & Groom (Demo)',
    event_date: '30 Dec 2026',
    received: 10000,
    balance_due: 108000,
    team_payouts: 10000,
    expenses: 1000,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    project_name: 'Bride & Groom (Demo)',
    type: 'Payment Received',
    category: 'Advance Booking Fee',
    amount: 10000,
    date: '2026-08-10',
    payment_mode: 'UPI',
    note: 'Initial deposit received via UPI',
  },
  {
    id: 'tx-2',
    project_name: 'Bride & Groom (Demo)',
    type: 'Expense',
    category: 'Equipment Rental',
    amount: 1000,
    date: '2026-08-11',
    payment_mode: 'Bank Transfer',
    note: 'Memory card & battery rental deposit',
  },
  {
    id: 'tx-3',
    project_name: 'Bride & Groom (Demo)',
    type: 'Team Payout',
    category: 'Lead Photographer Advance',
    amount: 10000,
    date: '2026-08-11',
    payment_mode: 'Bank Transfer',
    note: 'Advance payout committed for shoot day',
  },
];

const FINANCES_STORAGE_KEY = 'pixeva_finances';
const TRANSACTIONS_STORAGE_KEY = 'pixeva_transactions';

export default function FinancesPage() {
  const [projectFinances, setProjectFinances] = useState<ProjectFinanceItem[]>(INITIAL_PROJECT_FINANCES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFin = localStorage.getItem(FINANCES_STORAGE_KEY);
      if (savedFin) {
        const parsed = JSON.parse(savedFin);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjectFinances(parsed);
        } else {
          localStorage.setItem(FINANCES_STORAGE_KEY, JSON.stringify(INITIAL_PROJECT_FINANCES));
        }
      } else {
        localStorage.setItem(FINANCES_STORAGE_KEY, JSON.stringify(INITIAL_PROJECT_FINANCES));
      }

      const savedTx = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (savedTx) {
        const parsedTx = JSON.parse(savedTx);
        if (Array.isArray(parsedTx) && parsedTx.length > 0) {
          setTransactions(parsedTx);
        } else {
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
        }
      } else {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      }
    } catch (e) {
      console.error('Error reading finances from localStorage:', e);
    }
  }, []);

  const updateFinances = (updater: ProjectFinanceItem[] | ((prev: ProjectFinanceItem[]) => ProjectFinanceItem[])) => {
    setProjectFinances((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(FINANCES_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save finances to localStorage:', e);
        }
      }
      return next;
    });
  };

  const updateTransactions = (updater: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    setTransactions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save transactions to localStorage:', e);
        }
      }
      return next;
    });
  };
  const [activeTab, setActiveTab] = useState<'Project Finances' | 'Company Expenses' | 'All Transactions'>('Project Finances');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('fin-proj-1');

  // All Transactions Tab Filters
  const [txSearchTerm, setTxSearchTerm] = useState('');
  const [txDateRange, setTxDateRange] = useState('This Month');
  const [txTypeFilter, setTxTypeFilter] = useState('All Types');
  const [txCategoryFilter, setTxCategoryFilter] = useState('All Categories');
  const [txPaymentModeFilter, setTxPaymentModeFilter] = useState('All Payment Modes');

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State - Add Expense
  const [expenseForm, setExpenseForm] = useState({
    project_name: 'Bride & Groom (Demo)',
    category: 'Equipment Rental',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  });

  // Form State - Record Payment
  const [paymentForm, setPaymentForm] = useState({
    project_name: 'Bride & Groom (Demo)',
    category: 'Client Milestone Payment',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  });

  // CSV Drag State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KPI Financial Totals
  const totalReceived = projectFinances.reduce((acc, p) => acc + p.received, 0);
  const totalBalanceDue = projectFinances.reduce((acc, p) => acc + p.balance_due, 0);
  const totalTeamPayouts = projectFinances.reduce((acc, p) => acc + p.team_payouts, 0);
  const totalExpenses = projectFinances.reduce((acc, p) => acc + p.expenses, 0);
  const netProfit = totalReceived - (totalTeamPayouts + totalExpenses);

  // Filter Logic
  const filteredProjects = projectFinances.filter((p) => {
    const query = searchTerm.toLowerCase();
    return p.project_name.toLowerCase().includes(query) || p.client.toLowerCase().includes(query);
  });

  const filteredTransactions = transactions.filter((t) => {
    const query = searchTerm.toLowerCase();
    return (
      t.project_name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.note && t.note.toLowerCase().includes(query))
    );
  });

  // Add Expense Submit
  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      project_name: expenseForm.project_name,
      type: 'Expense',
      category: expenseForm.category,
      amount: amt,
      date: expenseForm.date,
      note: expenseForm.note || undefined,
    };

    setTransactions([newTx, ...transactions]);

    updateTransactions([newTx, ...transactions]);

    // Update project finances
    updateFinances(
      projectFinances.map((p) =>
        p.project_name === expenseForm.project_name
          ? { ...p, expenses: p.expenses + amt }
          : p
      )
    );

    setExpenseForm({
      project_name: 'Bride & Groom (Demo)',
      category: 'Equipment Rental',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
    });
    setIsAddExpenseOpen(false);
  };

  // Record Payment Submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      project_name: paymentForm.project_name,
      type: 'Payment Received',
      category: paymentForm.category,
      amount: amt,
      date: paymentForm.date,
      note: paymentForm.note || undefined,
    };

    updateTransactions([newTx, ...transactions]);

    // Update project finances
    updateFinances(
      projectFinances.map((p) =>
        p.project_name === paymentForm.project_name
          ? {
              ...p,
              received: p.received + amt,
              balance_due: Math.max(0, p.balance_due - amt),
            }
          : p
      )
    );

    setPaymentForm({
      project_name: 'Bride & Groom (Demo)',
      category: 'Client Milestone Payment',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      note: '',
    });
    setIsRecordPaymentOpen(false);
  };

  // CSV Import
  const handleProcessCsv = () => {
    if (!csvFile) return;
    setIsParsingCsv(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const parsed: Transaction[] = [];
      const startIndex = lines[0].toLowerCase().includes('project') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts.length >= 3) {
          parsed.push({
            id: `tx-csv-${Date.now()}-${i}`,
            project_name: parts[0] || 'Bride & Groom (Demo)',
            type: (parts[1] as any) || 'Expense',
            category: parts[2] || 'Studio Expense',
            amount: parseFloat(parts[3]) || 1000,
            date: new Date().toISOString().slice(0, 10),
            note: parts[4] || undefined,
          });
        }
      }

      setTimeout(() => {
        setTransactions([...parsed, ...transactions]);
        setIsParsingCsv(false);
        setImportedCount(parsed.length);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setCsvFile(null);
          setImportedCount(null);
        }, 1200);
      }, 500);
    };
    reader.readAsText(csvFile);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Project', 'Type', 'Category', 'Amount (INR)', 'Date', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.project_name}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.date}"`,
      `"${t.note || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_Finances_Export_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Finances
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Revenue, team payouts, and expenses across every project
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <FileUp className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#00d4ff]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Totals Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-emerald-400 mb-1">₹{totalReceived.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Received</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-white mb-1">₹{totalBalanceDue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Balance Due</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-[#8b5cf6] mb-1">₹{totalTeamPayouts.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Team Payouts</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
          <p className="text-2xl font-extrabold text-rose-400 mb-1">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Expenses</p>
        </div>

        <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80 col-span-2 md:col-span-1">
          <p className={`text-2xl font-extrabold mb-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#a0a0b0] font-semibold">Net Profit</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#12121a]/90 p-4 rounded-2xl border border-white/10">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-[#0a0a0f] p-1 rounded-xl border border-white/10">
          {(['Project Finances', 'Company Expenses', 'All Transactions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#00d4ff] text-black shadow-md shadow-[#00d4ff]/20'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Export CSV */}
        <div className="flex items-center space-x-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects…"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <button
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-white border border-white/10 transition-all shrink-0 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'Project Finances' && (
        <div className="space-y-4">
          {filteredProjects.map((p) => {
            const pNet = p.received - (p.team_payouts + p.expenses);

            return (
              <div
                key={p.id}
                className="pixeva-card rounded-2xl border border-white/10 bg-[#12121a]/90 p-5 space-y-4 shadow-card hover:border-[#00d4ff]/30 transition-all"
              >
                {/* Card Top */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-extrabold text-white text-base tracking-tight">{p.project_name}</h3>
                    <p className="text-xs text-[#a0a0b0] mt-0.5">{p.client} • Shoot: {p.event_date}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsRecordPaymentOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-emerald-400 border border-white/10 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                    <button
                      onClick={() => setIsAddExpenseOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-rose-400 border border-white/10 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Add Expense</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                    <p className="text-[11px] text-[#a0a0b0] font-semibold mb-1">Received</p>
                    <p className="text-lg font-bold text-emerald-400">₹{p.received.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                    <p className="text-[11px] text-[#a0a0b0] font-semibold mb-1">Balance</p>
                    <p className="text-lg font-bold text-white">₹{p.balance_due.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="p-3 bg-[#0a0a0f] rounded-xl border border-white/10">
                    <p className="text-[11px] text-[#a0a0b0] font-semibold mb-1">Net</p>
                    <p className={`text-lg font-bold ${pNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{pNet.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Project Line Item Transactions */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-white mb-2">Project Activity Log</p>
                  <div className="divide-y divide-white/5 bg-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden">
                    {transactions
                      .filter((t) => t.project_name === p.project_name)
                      .map((t) => (
                        <div key={t.id} className="p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`p-1.5 rounded-lg text-xs font-bold ${
                                t.type === 'Payment Received'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : t.type === 'Team Payout'
                                  ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {t.type === 'Payment Received' ? (
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <p className="font-bold text-white">{t.category}</p>
                              {t.note && <p className="text-[11px] text-[#a0a0b0]">{t.note}</p>}
                            </div>
                          </div>

                          <div className="text-right font-mono font-bold">
                            <p className={t.type === 'Payment Received' ? 'text-emerald-400' : 'text-rose-400'}>
                              {t.type === 'Payment Received' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-[#a0a0b0] font-normal">{t.date}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'Company Expenses' && (
        <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">Studio & Equipment Expenses</h3>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="btn-pixeva-primary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="divide-y divide-white/5 text-xs text-[#a0a0b0]">
            {transactions
              .filter((t) => t.type === 'Expense')
              .map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{t.category}</p>
                    <p className="text-[11px] text-[#a0a0b0]">Project: {t.project_name} {t.note ? `• ${t.note}` : ''}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-rose-400">-₹{t.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#a0a0b0]">{t.date}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'All Transactions' && (
        <div className="space-y-4 animate-fadeIn">
          {/* All Transactions Filter Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#12121a]/90 p-4 rounded-2xl border border-white/10">
            {/* Search transactions input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#a0a0b0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txSearchTerm}
                onChange={(e) => setTxSearchTerm(e.target.value)}
                placeholder="Search transactions…"
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Range */}
              <div className="relative">
                <select
                  value={txDateRange}
                  onChange={(e) => setTxDateRange(e.target.value)}
                  className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
                >
                  <option value="This Month">This Month</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Quarter">This Quarter</option>
                  <option value="This Year">This Year</option>
                  <option value="All Time">All Time</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* All Types */}
              <div className="relative">
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
                >
                  <option value="All Types">All Types</option>
                  <option value="Income">Income</option>
                  <option value="Payouts">Payouts</option>
                  <option value="Expenses">Expenses</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* All Categories */}
              <div className="relative">
                <select
                  value={txCategoryFilter}
                  onChange={(e) => setTxCategoryFilter(e.target.value)}
                  className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Advance Booking Fee">Advance Booking Fee</option>
                  <option value="Milestone Payment">Milestone Payment</option>
                  <option value="Equipment Rental">Equipment Rental</option>
                  <option value="Team Payout">Team Payout</option>
                  <option value="Studio Rent">Studio Rent</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* All Payment Modes */}
              <div className="relative">
                <select
                  value={txPaymentModeFilter}
                  onChange={(e) => setTxPaymentModeFilter(e.target.value)}
                  className="bg-[#0a0a0f] border border-white/10 text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer pr-7 appearance-none"
                >
                  <option value="All Payment Modes">All Payment Modes</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#a0a0b0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                disabled={transactions.length === 0}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Sub-Summary Period Cards */}
          {(() => {
            const filteredTxList = transactions.filter((t) => {
              const query = txSearchTerm.toLowerCase();
              const matchesSearch =
                !txSearchTerm ||
                t.project_name.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query) ||
                (t.note && t.note.toLowerCase().includes(query));

              const matchesType =
                txTypeFilter === 'All Types' ||
                (txTypeFilter === 'Income' && t.type === 'Payment Received') ||
                (txTypeFilter === 'Payouts' && t.type === 'Team Payout') ||
                (txTypeFilter === 'Expenses' && t.type === 'Expense');

              const matchesCategory =
                txCategoryFilter === 'All Categories' ||
                t.category.toLowerCase().includes(txCategoryFilter.toLowerCase());

              const matchesPaymentMode =
                txPaymentModeFilter === 'All Payment Modes' ||
                (t.payment_mode && t.payment_mode.toLowerCase() === txPaymentModeFilter.toLowerCase());

              // Date range filtering
              let matchesDate = true;
              if (txDateRange === 'This Month') {
                const nowMonth = new Date().toISOString().slice(0, 7);
                matchesDate = t.date.startsWith(nowMonth);
              }

              return matchesSearch && matchesType && matchesCategory && matchesPaymentMode && matchesDate;
            });

            const incomeSum = filteredTxList
              .filter((t) => t.type === 'Payment Received')
              .reduce((acc, t) => acc + t.amount, 0);

            const payoutsAndExpensesSum = filteredTxList
              .filter((t) => t.type === 'Team Payout' || t.type === 'Expense')
              .reduce((acc, t) => acc + t.amount, 0);

            const periodNet = incomeSum - payoutsAndExpensesSum;

            return (
              <div className="space-y-4">
                {/* Period Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
                    <p className="text-xl font-extrabold text-emerald-400 mb-0.5">₹{incomeSum.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#a0a0b0] font-semibold">Income</p>
                  </div>

                  <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
                    <p className="text-xl font-extrabold text-rose-400 mb-0.5">₹{payoutsAndExpensesSum.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-[#a0a0b0] font-semibold">Payouts + Expenses</p>
                  </div>

                  <div className="pixeva-card rounded-2xl p-4 border border-white/10 bg-[#12121a]/80">
                    <p className={`text-xl font-extrabold mb-0.5 ${periodNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{periodNet.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-[#a0a0b0] font-semibold">Net</p>
                  </div>
                </div>

                {/* Empty State or Table */}
                {filteredTxList.length === 0 ? (
                  <div className="pixeva-card rounded-2xl border border-white/10 p-12 text-center space-y-3 shadow-card">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#a0a0b0]">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">No transactions in this period</h3>
                    <p className="text-xs text-[#a0a0b0]">
                      Try widening the date range or clearing filters.
                    </p>
                  </div>
                ) : (
                  <div className="pixeva-card rounded-2xl border border-white/10 overflow-x-auto shadow-card w-full">
                    <table className="w-full text-left text-xs text-[#a0a0b0] min-w-[900px]">
                      <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
                        <tr>
                          <th className="w-[18%] min-w-[120px] px-3.5 py-3">Type</th>
                          <th className="w-[22%] min-w-[160px] px-3.5 py-3">Project</th>
                          <th className="w-[18%] min-w-[130px] px-3.5 py-3">Category</th>
                          <th className="w-[14%] min-w-[110px] px-3.5 py-3">Payment Mode</th>
                          <th className="w-[12%] min-w-[100px] px-3.5 py-3">Amount</th>
                          <th className="w-[10%] min-w-[90px] px-3.5 py-3">Date</th>
                          <th className="w-[6%] min-w-[80px] px-3.5 py-3 text-right">Note</th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredTxList.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                                    t.type === 'Payment Received'
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : t.type === 'Team Payout'
                                      ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/40'
                                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                  }`}
                                >
                                  {t.type === 'Payment Received' ? (
                                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : t.type === 'Team Payout' ? (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
                                  ) : (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  )}
                                  <span>{t.type}</span>
                                </span>
                              </td>
                              <td className="px-5 py-4 font-bold text-white whitespace-nowrap">{t.project_name}</td>
                              <td className="px-5 py-4 whitespace-nowrap">{t.category}</td>
                              <td className="px-5 py-4 font-mono text-white whitespace-nowrap">{t.payment_mode || '—'}</td>
                              <td className={`px-5 py-4 font-mono font-bold whitespace-nowrap ${t.type === 'Payment Received' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.type === 'Payment Received' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="px-5 py-4 font-mono text-white/70 whitespace-nowrap">{t.date}</td>
                              <td className="px-5 py-4 text-[#a0a0b0] whitespace-nowrap">{t.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Add Expense</h3>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Project Name *</label>
                <select
                  value={expenseForm.project_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, project_name: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Bride & Groom (Demo)" className="bg-[#12121a]">Bride & Groom (Demo)</option>
                  <option value="Vance Corporate Annual Gala" className="bg-[#12121a]">Vance Corporate Annual Gala</option>
                  <option value="BioTech Global Summit 2026" className="bg-[#12121a]">BioTech Global Summit 2026</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Equipment Rental" className="bg-[#12121a]">Equipment Rental</option>
                  <option value="Travel & Stay" className="bg-[#12121a]">Travel & Stay</option>
                  <option value="Studio Space Rent" className="bg-[#12121a]">Studio Space Rent</option>
                  <option value="Vendor Fee" className="bg-[#12121a]">Vendor Fee</option>
                  <option value="Software / AI License" className="bg-[#12121a]">Software / AI License</option>
                  <option value="Other Expense" className="bg-[#12121a]">Other Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="1000"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  placeholder="e.g. Memory card rental receipt"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Record Client Payment</h3>
              <button
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-white block mb-1">Project Name *</label>
                <select
                  value={paymentForm.project_name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, project_name: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Bride & Groom (Demo)" className="bg-[#12121a]">Bride & Groom (Demo)</option>
                  <option value="Vance Corporate Annual Gala" className="bg-[#12121a]">Vance Corporate Annual Gala</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="10000"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Date</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00d4ff] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Payment Notes / Tx ID</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  placeholder="e.g. Bank Transfer Ref #987654"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-[#8b5cf6]" />
                <h3 className="font-extrabold text-white text-base">Import CSV Transactions</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#a0a0b0]">
                Upload a CSV file containing columns for <strong className="text-white">Project Name, Type (Payment Received/Expense), Category, Amount</strong>.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#00d4ff] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#0a0a0f]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCsvFile(e.target.files[0]);
                    }
                  }}
                />

                {importedCount !== null ? (
                  <div className="space-y-2 text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="w-8 h-8 mx-auto" />
                    <p className="font-bold text-sm">Successfully Imported {importedCount} Transactions!</p>
                  </div>
                ) : csvFile ? (
                  <div className="space-y-1 text-white">
                    <FileText className="w-8 h-8 text-[#00d4ff] mx-auto" />
                    <p className="font-bold text-xs">{csvFile.name}</p>
                    <p className="text-[10px] text-[#a0a0b0]">{(csvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileUp className="w-8 h-8 text-[#a0a0b0] mx-auto" />
                    <p className="text-xs font-semibold text-white">Click or drag CSV file to upload</p>
                    <p className="text-[10px] text-[#a0a0b0]">Supports standard exported CSV formats</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!csvFile || isParsingCsv}
                  onClick={handleProcessCsv}
                  className="btn-pixeva-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 disabled:opacity-50"
                >
                  {isParsingCsv && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Import Transactions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
