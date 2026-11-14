'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Calendar, 
  CalendarDays,
  Inbox, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Film, 
  ArrowUpRight, 
  DollarSign, 
  Sparkles, 
  Plus, 
  CreditCard, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Bot,
  MessageSquare,
  HardDrive,
  QrCode,
  ShieldCheck,
  Zap,
  Server,
  Database,
  Globe,
  Search,
  Download,
  Camera,
  Flame,
  Check,
  FileText,
  Workflow,
  Sun,
  Moon,
  Lock,
  Star,
  Award
} from 'lucide-react';

import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

// ==========================================
// PIXEVA CRM COMPLETE 12 CORE MODULES
// ==========================================
interface FeatureModule {
  id: string;
  title: string;
  tagline: string;
  category: 'sales' | 'production' | 'delivery' | 'enterprise';
  icon: React.ElementType;
  accentColor: {
    bg: string;
    text: string;
    border: string;
    glow: string;
    badge: string;
  };
  route: string;
  statusBadge: string;
  capabilities: string[];
  metrics: { label: string; value: string };
  actionLabel: string;
  highlight?: boolean;
}

const PIXEVA_FEATURES: FeatureModule[] = [
  {
    id: 'enquiries',
    title: 'Enquiries & Lead Engine',
    tagline: 'Branded public intake landing pages, instant qualification & multi-currency pipeline.',
    category: 'sales',
    icon: Inbox,
    accentColor: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30 hover:border-blue-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]',
      badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200/60 dark:border-blue-500/20',
    },
    route: '/enquiries',
    statusBadge: 'Live Microservice',
    capabilities: [
      'Customizable public landing booking forms (/enquire/[id])',
      'Automated lead qualification & multi-tier budget ranges',
      'Visual Kanban deal pipeline (New, Proposal, Booked, Lost)',
      'Instant WhatsApp / SMS & Email alerts upon submission',
    ],
    metrics: { label: 'Active Pipeline', value: '18 Deals' },
    actionLabel: 'Explore Pipeline',
    highlight: true,
  },
  {
    id: 'proposals-contracts',
    title: 'Proposals & E-Sign Contracts',
    tagline: 'Dynamic digital proposals, instant PDF rendering & legally binding e-signatures.',
    category: 'sales',
    icon: FileText,
    accentColor: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/30 hover:border-indigo-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(99,102,241,0.18)]',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-500/20',
    },
    route: '/contracts',
    statusBadge: 'E-Sign Ready',
    capabilities: [
      'Interactive online proposals with selectable addon packages',
      'Digital in-browser signature pad with timestamp audit logs',
      'Auto-generated print-ready PDF contracts & receipts',
      'Configurable milestone payment schedules (50/50, 40/40/20)',
    ],
    metrics: { label: 'Signed Ratio', value: '94% Win Rate' },
    actionLabel: 'View Contracts',
  },
  {
    id: 'projects',
    title: 'Production & Shoots Management',
    tagline: 'End-to-end production timeline, call sheets, venue GPS logistics & gear lists.',
    category: 'production',
    icon: Video,
    accentColor: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30 hover:border-amber-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.18)]',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20',
    },
    route: '/projects',
    statusBadge: 'Production Live',
    capabilities: [
      'Multi-day run-sheets & hourly call time timelines',
      'Venue GPS location mapping with parking & permit notes',
      'Production equipment checklists & lens package checklists',
      'Client contact directory with direct phone dialing links',
    ],
    metrics: { label: 'Upcoming Shoots', value: '6 Scheduled' },
    actionLabel: 'View Productions',
    highlight: true,
  },
  {
    id: 'crew-scheduling',
    title: 'Crew Scheduling & Roster',
    tagline: 'Conflict-free specialist allocation, DoP call sheets & double-booking prevention.',
    category: 'production',
    icon: CalendarDays,
    accentColor: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30 hover:border-emerald-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.18)]',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/20',
    },
    route: '/crew-scheduling',
    statusBadge: 'Smart Roster',
    capabilities: [
      'Drag-and-drop crew allocation for DoPs, Drone Pilots & Editors',
      'Real-time conflict detection & availability heatmaps',
      'One-click automated SMS call sheet dispatch to crew',
      'Daily & hourly freelancer rate calculation integration',
    ],
    metrics: { label: 'Roster Ready', value: '14 Specialists' },
    actionLabel: 'Open Crew Calendar',
  },
  {
    id: 'finances',
    title: 'Multi-Currency Finances & Ledger',
    tagline: 'Real-time multi-currency engine (AUD, USD, EUR, INR), deposits & team payouts.',
    category: 'sales',
    icon: DollarSign,
    accentColor: {
      bg: 'bg-green-500/10 dark:bg-green-500/15',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/30 hover:border-green-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(34,197,94,0.18)]',
      badge: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 border-green-200/60 dark:border-green-500/20',
    },
    route: '/finances',
    statusBadge: 'Multi-Currency',
    capabilities: [
      'Global multi-currency conversion (USD, AUD, EUR, GBP, INR, AED)',
      'Automated deposit tracking & outstanding balance ledgers',
      'Crew payout balance management & operational expense logs',
      'Financial performance charts with collection ratio KPIs',
    ],
    metrics: { label: 'Collection Rate', value: '92% Settle' },
    actionLabel: 'Launch Ledger',
    highlight: true,
  },
  {
    id: 'post-production',
    title: 'Post-Production & Color Suite',
    tagline: 'Video editing stages, SLA turnaround timers, grading & client feedback rounds.',
    category: 'delivery',
    icon: Film,
    accentColor: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30 hover:border-purple-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(168,85,247,0.18)]',
      badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border-purple-200/60 dark:border-purple-500/20',
    },
    route: '/post-production',
    statusBadge: '4K Workflow',
    capabilities: [
      'Step-by-step editing stages (Rough Cut → Color → Sound → Master)',
      'Strict client turnaround SLA countdowns & warning flags',
      'Lead editor assignment and review milestone sign-offs',
      'Direct link to cloud video review & delivery portals',
    ],
    metrics: { label: 'In Edit Suite', value: '4 Projects' },
    actionLabel: 'Post Pipeline',
  },
  {
    id: 'client-requests',
    title: 'Client Portals & Creative Requests',
    tagline: 'Revision ticketing, music track selections, shot lists & feedback loops.',
    category: 'delivery',
    icon: MessageSquare,
    accentColor: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/30 hover:border-cyan-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(6,182,212,0.18)]',
      badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-500/20',
    },
    route: '/client-requests',
    statusBadge: 'Live Portal',
    capabilities: [
      'Centralized client revision ticketing & change requests',
      'Music / soundtrack preference submissions with audio links',
      'Special family portrait & shot list request checklists',
      'Client approval timestamps with status tracking',
    ],
    metrics: { label: 'Open Requests', value: '3 Pending' },
    actionLabel: 'Review Requests',
  },
  {
    id: 'galleries',
    title: 'AI Event Galleries & QR Table Cards',
    tagline: 'AI selfie face recognition photo delivery & print-ready QR Table Tent cards.',
    category: 'delivery',
    icon: QrCode,
    accentColor: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30 hover:border-rose-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(244,63,94,0.18)]',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200/60 dark:border-rose-500/20',
    },
    route: '/galleries',
    statusBadge: 'AI Selfie Search',
    capabilities: [
      'AI facial recognition selfie search for wedding & gala guests',
      'Print-ready QR Code Table Tent Card PDF generator for event tables',
      'High-resolution client proofing with download watermarking',
      'Guest photo engagement analytics & favorite heart counts',
    ],
    metrics: { label: 'Live Galleries', value: '12 Active' },
    actionLabel: 'Open Galleries',
    highlight: true,
  },
  {
    id: 'pixeva-ai',
    title: 'Pixeva AI Studio & Automation',
    tagline: 'Intelligent Gemini brief parser, automated client outreach & crew matchmaking.',
    category: 'enterprise',
    icon: Bot,
    accentColor: {
      bg: 'bg-teal-500/10 dark:bg-teal-500/15',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-500/30 hover:border-teal-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(20,184,166,0.18)]',
      badge: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300 border-teal-200/60 dark:border-teal-500/20',
    },
    route: '/pixeva-ai',
    statusBadge: 'Gemini AI Powered',
    capabilities: [
      'Natural language brief parser: turns raw email into structured shoot data',
      'AI automated client proposal copywriter & quote generator',
      'Automated SMS & email notification triggers for production milestones',
      'Intelligent crew skill matching based on past project reviews',
    ],
    metrics: { label: 'Time Saved', value: '18h / Week' },
    actionLabel: 'Launch AI Studio',
    highlight: true,
  },
  {
    id: 'data-vault',
    title: 'Data Vault & Footage Ingestion',
    tagline: 'Multi-SSD location tracking, memory card logging & dual-backup verification.',
    category: 'production',
    icon: HardDrive,
    accentColor: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-400/30 hover:border-slate-400',
      glow: 'group-hover:shadow-[0_0_24px_rgba(100,116,139,0.18)]',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/60 dark:border-slate-700',
    },
    route: '/data',
    statusBadge: 'Redundant Backup',
    capabilities: [
      'Physical SSD & NAS drive location logging (SSD 1, Vault, Cloud)',
      'Memory card dumping & dual-backup verification records',
      'Event date, shooter role & footage storage index',
      'Instant CSV import/export for production asset audits',
    ],
    metrics: { label: 'Ingested Vault', value: '48 TB Indexed' },
    actionLabel: 'Manage Data Vault',
  },
  {
    id: 'team',
    title: 'Specialist Team Directory',
    tagline: 'Roster of in-house artists & freelancers, day rates, skill tags & privacy controls.',
    category: 'production',
    icon: Users,
    accentColor: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/30 hover:border-sky-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(14,165,233,0.18)]',
      badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 border-sky-200/60 dark:border-sky-500/20',
    },
    route: '/team',
    statusBadge: 'Crew Network',
    capabilities: [
      'In-house vs. Freelancer category filtering & day rate tracking',
      'Client portal privacy toggles (control phone/email visibility)',
      'Direct one-click phone dialing and WhatsApp communication',
      'Specialist roles: Cinematographer, Aerial Pilot, Sound Engineer, Editor',
    ],
    metrics: { label: 'Active Roster', value: '26 Verified' },
    actionLabel: 'Open Directory',
  },
  {
    id: 'lambda-tasks',
    title: 'Cloud Lambda & SAM Architecture',
    tagline: 'AWS SAM serverless microservices, Supabase PostgreSQL & EventBridge jobs.',
    category: 'enterprise',
    icon: Server,
    accentColor: {
      bg: 'bg-violet-500/10 dark:bg-violet-500/15',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/30 hover:border-violet-500',
      glow: 'group-hover:shadow-[0_0_24px_rgba(139,92,246,0.18)]',
      badge: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-200/60 dark:border-violet-500/20',
    },
    route: '/lambda-tasks',
    statusBadge: 'AWS Serverless',
    capabilities: [
      'Dedicated microservices: enquiries, bookings, contracts & studio-data',
      'Multi-tenant account scoping (x-account-id) with Supabase RLS',
      'Automated background EventBridge cron jobs & email schedulers',
      'Zero cold-start high throughput API Gateway latency monitoring',
    ],
    metrics: { label: 'API Uptime', value: '99.98% Healthy' },
    actionLabel: 'Inspect Microservices',
  },
];

// Interactive Client Lifecycle Workflow Steps
const LIFECYCLE_STEPS = [
  {
    step: '01',
    title: 'Capture & Qualify',
    subtitle: 'Branded Intake Form',
    desc: 'Prospective clients submit event details through your custom-styled public booking form with multi-currency budget selection.',
    icon: Inbox,
    route: '/enquiries',
  },
  {
    step: '02',
    title: 'Interactive Proposal',
    subtitle: 'Dynamic Packages & Pricing',
    desc: 'Generate a rich online proposal where clients can pick addons, review coverage deliverables, and view multi-currency totals.',
    icon: Sparkles,
    route: '/contracts',
  },
  {
    step: '03',
    title: 'E-Sign & Deposit',
    subtitle: 'Digital Contract & Receipt',
    desc: 'Clients sign legally binding agreements on mobile or desktop; automated 50% deposit receipts are issued instantly.',
    icon: FileText,
    route: '/contracts',
  },
  {
    step: '04',
    title: 'Crew & Production',
    subtitle: 'Call Sheets & Shoot Run-Sheet',
    desc: 'DoPs, drone pilots, and audio crew are scheduled without conflicts. Mobile call sheets and equipment checklists are dispatched.',
    icon: Video,
    route: '/crew-scheduling',
  },
  {
    step: '05',
    title: 'Post-Production Suite',
    subtitle: 'Color, Sound & Revisions',
    desc: 'Editors receive footage logged to SSD vaults. Revisions are tracked with SLA timers and client feedback tickets.',
    icon: Film,
    route: '/post-production',
  },
  {
    step: '06',
    title: 'AI Delivery & Settle',
    subtitle: 'QR Tent Cards & Settlement',
    desc: 'Guests search event photos via AI selfie recognition; table tent QR cards drive engagement; remaining balance is collected.',
    icon: QrCode,
    route: '/galleries',
  },
];

export default function PublicHomePage() {
  const router = useRouter();
  const { formatCurrency, currency, setCurrencyCode: setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sales' | 'production' | 'delivery' | 'enterprise'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0);

  // Filter feature modules
  const filteredFeatures = useMemo(() => {
    return PIXEVA_FEATURES.filter((f) => {
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchesQuery = 
        searchQuery.trim() === '' ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. PUBLIC TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#090d16]/90 border-b border-slate-200 dark:border-white/10 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Pixeva
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-mono">
                  STUDIO CRM
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Enterprise Media OS</p>
            </div>
          </Link>

          {/* Center Navigation Links (Hidden on small mobile) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Capabilities (12)
            </a>
            <a href="#workflow" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Workflow
            </a>
            <a href="#currencies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Currencies
            </a>
            <a href="#ai" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pixeva AI
            </a>
            <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold">
              <span>Studio Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* If logged in: Go to Dashboard. If not: Sign In & Get Started Free */}
            {user ? (
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 text-xs py-2 px-4 rounded-lg font-bold shadow-md hover:scale-[1.02] transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login?mode=signin"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>

                <Link
                  href="/login?mode=signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 text-xs py-2 px-4 rounded-lg font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH PROMINENT "GET STARTED FREE" CTA */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 dark:border-white/10">
        {/* Ambient Gradient Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tri-Cloud Architecture: Vercel Edge • Supabase PostgreSQL • AWS Lambda</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              The Operating System for Modern Media & Production Studios
            </h1>
            <p className="text-base sm:text-xl text-slate-700 dark:text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed">
              Unify client intake, interactive proposals with digital signatures, multi-currency invoicing, crew scheduling, 4K post-production tracking, and AI-powered guest selfie photo galleries.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Live Studio Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </Link>

            <Link
              href="/enquire/studio-demo"
              target="_blank"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Public Client Booking Form</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          {/* Proof Points & Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 14-day full feature trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Instant demo dashboard
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 99.98% Cloud uptime
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE 6-STEP CLIENT LIFECYCLE WORKFLOW */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-16 sm:py-24 border-b border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Workflow className="w-3.5 h-3.5" />
              End-to-End Media Production Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              How Pixeva CRM Automates Your Entire Studio
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              From first prospective client inquiry to 4K post-production delivery and AI selfie search galleries. Click through the 6 stages below:
            </p>
          </div>

          {/* Workflow Step Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeWorkflowIndex === idx;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveWorkflowIndex(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/15 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {step.step}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-blue-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                    {step.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {step.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Deep-Dive Showcase */}
          {(() => {
            const current = LIFECYCLE_STEPS[activeWorkflowIndex];
            const CurrentIcon = current.icon;
            return (
              <div className="p-8 rounded-3xl bg-slate-900 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-500/30">
                      STAGE {current.step}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {current.subtitle}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                    <CurrentIcon className="w-6 h-6 text-blue-400" />
                    {current.title}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {current.desc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <Link
                    href="/login?mode=signup"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Get Started with Stage {current.step}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setActiveWorkflowIndex((prev) => (prev + 1) % LIFECYCLE_STEPS.length)}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/15"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHOLE 12 CORE MODULES CAPABILITIES MATRIX */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Matrix Header & Search Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              12 Enterprise Modules Included
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Every Studio Tool. Under One Roof.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Explore the full suite of specialized modules designed exclusively for photography, cinema, and media production businesses.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by capability (e.g. contracts, crew, AI)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {[
            { id: 'all', label: 'All 12 Modules' },
            { id: 'sales', label: '💼 Client & Sales' },
            { id: 'production', label: '🎬 Production & Crew' },
            { id: 'delivery', label: '🎞️ Post & Galleries' },
            { id: 'enterprise', label: '⚡ AI & Serverless' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono ml-auto">
            Showing {filteredFeatures.length} of {PIXEVA_FEATURES.length} modules
          </span>
        </div>

        {/* Features 12-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className={`group pixeva-card pixeva-card-hover p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all relative overflow-hidden border ${module.accentColor.border} ${module.accentColor.glow} bg-white dark:bg-[#0f172a] shadow-sm`}
              >
                {module.highlight && (
                  <div className="absolute top-0 right-0">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest bg-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-bl-xl shadow-xs">
                      <Flame className="w-2.5 h-2.5" /> Core System
                    </span>
                  </div>
                )}

                {/* Card Top: Icon, Title & Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${module.accentColor.bg} ${module.accentColor.text} flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${module.accentColor.badge}`}>
                      {module.statusBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {module.tagline}
                    </p>
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    {module.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Metric & Action Link */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block font-mono">
                      {module.metrics.label}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {module.metrics.value}
                    </span>
                  </div>

                  <Link
                    href="/login?mode=signup"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-2.5 py-1.5 rounded-lg group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{module.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MULTI-CURRENCY GLOBAL FINANCIAL ENGINE */}
      {/* ========================================================================= */}
      <section id="currencies" className="py-16 sm:py-24 border-y border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              Global Financial Precision
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Multi-Currency Engine Built-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Deliver quotes, proposals, and invoices in your clients’ local currency with automatic real-time rate conversion.
            </p>
          </div>

          {/* Interactive Currency Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CURRENCIES.map((curr) => {
              const isSelected = currency.code === curr.code;
              return (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 hover:border-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{curr.flag}</div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {curr.code}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    {curr.symbol}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Currency Calculation Showcase */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="space-y-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Live Pricing Simulation in {currency.name} ({currency.code})
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Sample 3-Day Wedding Cinema: <strong className="text-slate-900 dark:text-white">{formatCurrency(120000)}</strong> • Deposit (50%): <strong className="text-slate-900 dark:text-white">{formatCurrency(60000)}</strong>
              </p>
            </div>

            <Link
              href="/login?mode=signup"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Start Billing in {currency.code} →
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PIXEVA AI & REVEPOD STUDIO SPOTLIGHT */}
      {/* ========================================================================= */}
      <section id="ai" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Bot className="w-4 h-4 text-indigo-400" />
                Gemini AI Studio Intelligence
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Supercharge Your Studio with Autonomous AI Workflows
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl font-normal">
                Paste raw client emails or brief notes. Pixeva AI automatically structures run-sheets, identifies venue locations, recommends the ideal crew based on past ratings, drafts custom proposal copy, and triggers milestone notifications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Brief-to-Runsheet Natural Language Extraction</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Smart Multi-Specialist Crew Matchmaking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated Milestone SMS & WhatsApp Triggers</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>One-Click Pitch & Proposal Copy Generation</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                href="/login?mode=signup"
                className="px-6 py-4 rounded-xl bg-white text-slate-950 font-extrabold text-xs hover:bg-slate-100 transition-all text-center shadow-lg hover:scale-[1.02]"
              >
                Get Started with Pixeva AI →
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-indigo-600/70 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/40 transition-all text-center"
              >
                Explore Live AI Studio Demo
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. HIGH-CONVERTING BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 border-t border-slate-200 dark:border-white/10 bg-slate-950 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl text-white mx-auto mb-2">
            <Camera className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to Transform Your Media & Photography Studio?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Join elite production houses, commercial directors, and wedding studios managing their entire business with Pixeva CRM.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-blue-500"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login?mode=signin"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Existing Studio</span>
            </Link>
          </div>

          <p className="text-xs text-slate-400 pt-2 font-medium">
            Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PUBLIC FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#070a10] py-12 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black">
                P
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Pixeva Studio CRM</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Enterprise Photography & Media Production System</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold">
              <Link href="/login?mode=signup" className="text-blue-600 dark:text-blue-400 hover:underline">Get Started Free</Link>
              <Link href="/login?mode=signin" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign In</Link>
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
              <Link href="/enquiries" className="hover:text-slate-900 dark:hover:text-white transition-colors">Enquiries</Link>
              <Link href="/projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">Shoots</Link>
              <Link href="/finances" className="hover:text-slate-900 dark:hover:text-white transition-colors">Finances</Link>
              <Link href="/galleries" className="hover:text-slate-900 dark:hover:text-white transition-colors">AI Galleries</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Pixeva Studio Operating System. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Tri-Cloud: Vercel Edge • Supabase PostgreSQL • AWS Lambda</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
