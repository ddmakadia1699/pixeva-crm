'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Calendar, 
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
  ExternalLink
} from 'lucide-react';

import { apiClient } from '@/lib/api/apiClient';
import { useCurrency } from '@/context/CurrencyContext';

interface RecentLead {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  budget: number;
  status: 'new' | 'proposal' | 'booked' | 'qualified';
}

interface UpcomingShoot {
  id: string;
  title: string;
  date: string;
  daysAway: string;
  location: string;
  crewCount: number;
  gearStatus: string;
  stage: string;
  category: string;
}

const UPCOMING_SHOOTS: UpcomingShoot[] = [];

const RECENT_LEADS: RecentLead[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enquiriesNew: 3,
    enquiriesFollowUp: 4,
    enquiriesBooked: 2,
    totalEnquiries: 9,
    activeProjectsCount: 3,
    totalRevenueAmount: 980000,
    receivedRevenueAmount: 560000,
    pendingRevenueAmount: 420000,
    postProdInProgress: 2,
    postProdReview: 1,
    postProdReady: 4,
    clientRequestsPending: 2,
  });

  useEffect(() => {
    async function syncCloudMetrics() {
      try {
        const metrics = await apiClient.dashboard.getMetrics();
        if (metrics) {
          const parseAmount = (val: any, fallback: number) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
              const cleaned = Number(val.replace(/[^0-9.-]+/g, ''));
              if (!isNaN(cleaned) && cleaned > 0) return cleaned;
            }
            return fallback;
          };

          setStats((prev) => ({
            ...prev,
            ...metrics,
            totalRevenueAmount: parseAmount(metrics.totalRevenueAmount ?? metrics.totalRevenue, prev.totalRevenueAmount),
            receivedRevenueAmount: parseAmount(metrics.receivedRevenueAmount ?? metrics.receivedRevenue, prev.receivedRevenueAmount),
            pendingRevenueAmount: parseAmount(metrics.pendingRevenueAmount ?? metrics.pendingRevenue, prev.pendingRevenueAmount),
          }));
        }
      } catch (err) {
        console.warn('Could not sync cloud metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    syncCloudMetrics();
  }, []);

  const collectionPercent = stats.totalRevenueAmount > 0 
    ? Math.min(100, Math.round((stats.receivedRevenueAmount / stats.totalRevenueAmount) * 100))
    : 57;

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto">
      {/* 1. Header: Greeting, Live Status & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Studio Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-700 dark:text-slate-300 font-semibold">Dhruvi</strong>. Real-time pipeline, upcoming productions, and financial health.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/enquiries"
            className="btn-pixeva-secondary flex items-center space-x-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>New Lead</span>
          </Link>
          <Link
            href="/projects"
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Shoot</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 High-Impact KPI Stat Cards (All Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Card 1: Total Booked Volume -> /finances */}
        <Link 
          href="/finances"
          className="group block pixeva-card pixeva-card-hover p-5 space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:border-emerald-300 dark:hover:border-emerald-700/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
              Total Booked Volume
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {formatCurrency(stats.totalRevenueAmount)}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{formatCurrency(stats.receivedRevenueAmount)} collected</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{collectionPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${collectionPercent}%` }} 
              />
            </div>
          </div>
        </Link>

        {/* Card 2: Enquiries Pipeline -> /enquiries */}
        <Link 
          href="/enquiries"
          className="group block pixeva-card pixeva-card-hover p-5 space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-700/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
              Enquiries Pipeline
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-500/20">
              {stats.enquiriesNew} New Leads
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {stats.totalEnquiries}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Deals</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-700 dark:text-slate-300 font-semibold">{stats.enquiriesFollowUp}</strong> in proposal</span>
            <span>•</span>
            <span><strong className="text-slate-700 dark:text-slate-300 font-semibold">{stats.enquiriesBooked}</strong> confirmed</span>
          </div>
        </Link>

        {/* Card 3: Active Productions -> /projects */}
        <Link 
          href="/projects"
          className="group block pixeva-card pixeva-card-hover p-5 space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:border-amber-300 dark:hover:border-amber-700/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">
              Active Productions
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500" />
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20">
              8 Crew Deployed
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {stats.activeProjectsCount}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming Shoots</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span>Next: <strong className="text-slate-700 dark:text-slate-300 font-semibold truncate">Vance Gala</strong></span>
            <span className="text-amber-600 dark:text-amber-400 font-medium shrink-0">In 6 Days</span>
          </div>
        </Link>

        {/* Card 4: Post-Production SLA -> /post-production */}
        <Link 
          href="/post-production"
          className="group block pixeva-card pixeva-card-hover p-5 space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-700/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
              Post-Production SLA
              <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-500" />
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
              {stats.postProdReady} Ready
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              85%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">On Schedule</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-700 dark:text-slate-300 font-semibold">{stats.postProdInProgress}</strong> in suite</span>
            <span>•</span>
            <span><strong className="text-slate-700 dark:text-slate-300 font-semibold">{stats.postProdReview}</strong> in review</span>
          </div>
        </Link>
      </div>

      {/* 3. Main Dashboard Body: Asymmetric 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN (8 Columns): Shoot Timeline & High-Priority Pipeline Table */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION A: Upcoming Production Schedule Timeline */}
          <div className="pixeva-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <Link 
                href="/projects"
                className="group flex items-center space-x-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Upcoming Productions & Shoots
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live schedule, crew deployments, and venue preparation.
                  </p>
                </div>
              </Link>

              <Link
                href="/projects"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>View All Shoots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Production List Items (All Clickable Cards) */}
            <div className="space-y-3">
              {UPCOMING_SHOOTS.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No upcoming shoots scheduled.
                </div>
              ) : (
                UPCOMING_SHOOTS.map((shoot) => (
                  <Link
                    key={shoot.id}
                    href="/projects"
                    className="group p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer block"
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      {/* Date Block */}
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 leading-none">
                          {shoot.date.split(' ')[1]}
                        </span>
                        <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {shoot.date.split(' ')[0]}
                        </span>
                      </div>

                      {/* Shoot Details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {shoot.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 font-semibold shrink-0">
                            {shoot.daysAway}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{shoot.location}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{shoot.crewCount} Specialists</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {shoot.gearStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage Badge & Action */}
                    <div className="flex items-center space-x-3 sm:self-auto self-end">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {shoot.stage}
                      </span>
                      <span
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* SECTION B: High-Priority Pipeline & Leads Table */}
          <div className="pixeva-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <Link 
                href="/enquiries"
                className="group flex items-center space-x-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    High-Priority Leads & Pipeline
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Latest client enquiries, event dates, and budget estimates.
                  </p>
                </div>
              </Link>

              <Link
                href="/enquiries"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Manage All Leads ({stats.totalEnquiries})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Clean Leads Table (Clickable Rows) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Event Type</th>
                    <th className="pb-2.5 font-semibold">Event Date</th>
                    <th className="pb-2.5 font-semibold">Budget</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {RECENT_LEADS.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No recent leads found.
                      </td>
                    </tr>
                  ) : (
                    RECENT_LEADS.map((lead) => {
                      const statusConfig = {
                        new: { label: 'New Lead', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20' },
                        proposal: { label: 'Proposal Sent', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20' },
                        booked: { label: 'Booked', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' },
                        qualified: { label: 'Qualified', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20' }
                      }[lead.status];

                      return (
                        <tr 
                          key={lead.id} 
                          onClick={() => router.push('/enquiries')}
                          className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                        >
                          <td className="py-3 pr-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[11px] shrink-0 border border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-colors">
                                {lead.name.charAt(0)}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-slate-900 dark:text-white block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {lead.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono truncate block">
                                  {lead.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-slate-600 dark:text-slate-300 font-medium">
                            {lead.eventType}
                          </td>
                          <td className="py-3 pr-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {lead.eventDate}
                          </td>
                          <td className="py-3 pr-3 font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(lead.budget)}
                          </td>
                          <td className="py-3 pr-3">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusConfig.bg}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline inline-flex items-center space-x-1"
                            >
                              <span>View</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (4 Columns): Financial Settlement, Post-Prod, Team Readiness */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* WIDGET 1: Financial Ledger & Settlement Progress */}
          <div className="pixeva-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Link href="/finances" className="group flex items-center space-x-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Financial Settlement
                </h3>
              </Link>
              <Link 
                href="/finances" 
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Clickable Stat Sub-Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link 
                href="/finances"
                className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer block shadow-2xs hover:shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block transition-colors">
                  Collected
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block truncate">
                  {formatCurrency(stats.receivedRevenueAmount)}
                </span>
              </Link>
              <Link 
                href="/finances"
                className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer block shadow-2xs hover:shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 block transition-colors">
                  Receivable
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5 block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {formatCurrency(stats.pendingRevenueAmount)}
                </span>
              </Link>
            </div>

            {/* Settlement Progress (Clickable) */}
            <Link href="/finances" className="group block space-y-1.5 pt-1 cursor-pointer">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Settlement Ratio</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{collectionPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${collectionPercent}%` }} 
                />
              </div>
            </Link>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Total Volume: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(stats.totalRevenueAmount)}</strong>
              </span>
              <Link href="/finances" className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-[11px] flex items-center gap-0.5">
                <span>Invoices</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* WIDGET 2: Post-Production Suite */}
          <div className="pixeva-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Link href="/post-production" className="group flex items-center space-x-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Post-Production Suite
                </h3>
              </Link>
              <Link 
                href="/post-production" 
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Queue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Status Counts (Clickable Sub-Cards) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <Link 
                href="/post-production"
                className="group p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer block"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">In Edit</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{stats.postProdInProgress}</span>
              </Link>
              <Link 
                href="/post-production"
                className="group p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer block"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Review</span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{stats.postProdReview}</span>
              </Link>
              <Link 
                href="/post-production"
                className="group p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer block"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Ready</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.postProdReady}</span>
              </Link>
            </div>

            {/* Deliverable Progress Highlight (Clickable Card) */}
            <Link 
              href="/post-production"
              className="group block p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Vance Gala 4K Teaser
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">85% Color Grading</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 dark:bg-purple-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Lead Colorist: Marcus Rao • Delivery: Nov 20</p>
            </Link>
          </div>

          {/* WIDGET 3: Studio Crew & Resource Readiness */}
          <div className="pixeva-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Link href="/crew-scheduling" className="group flex items-center space-x-2 cursor-pointer">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Crew & Studio Readiness
                </h3>
              </Link>
              <Link 
                href="/team" 
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Team</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Clickable Resource Status Blocks */}
            <div className="space-y-2 text-xs">
              <Link 
                href="/crew-scheduling"
                className="group flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Cinematographers:</span>
                <span className="font-bold text-slate-900 dark:text-white">4 Available Today</span>
              </Link>
              <Link 
                href="/crew-scheduling"
                className="group flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Drone Pilots:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">2 Ready & Certified</span>
              </Link>
              <Link 
                href="/team"
                className="group flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Average Client SLA:</span>
                <span className="font-bold text-slate-900 dark:text-white">45 Min Response</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link 
                href="/crew-scheduling" 
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 group"
              >
                <span>Open Full Crew Scheduling Calendar</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

