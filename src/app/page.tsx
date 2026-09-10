'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Calendar, 
  Inbox, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

import { apiClient } from '@/lib/api/apiClient';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enquiriesNew: 3,
    enquiriesFollowUp: 4,
    enquiriesBooked: 2,
    totalEnquiries: 9,
    activeProjectsCount: 3,
    totalRevenue: '₹9,80,000',
    receivedRevenue: '₹5,60,000',
    pendingRevenue: '₹4,20,000',
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
          setStats((prev) => ({
            ...prev,
            ...metrics,
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Studio Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Studio Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Studio Node
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline analytics, upcoming productions, financial ledger, and post-production suite.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href="/enquiries"
            className="btn-pixeva-secondary space-x-1.5"
          >
            <Inbox className="w-3.5 h-3.5 text-slate-400" />
            <span>Leads ({stats.totalEnquiries})</span>
          </Link>
          <Link
            href="/projects"
            className="btn-pixeva-primary space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Shoots ({stats.activeProjectsCount})</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="pixeva-card p-4.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Total Booked Volume</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-500/20">
                <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
              {stats.totalRevenue}
            </div>
          </div>
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.receivedRevenue}</span> collected • <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.pendingRevenue}</span> pending
          </div>
        </div>

        {/* Metric 2 */}
        <div className="pixeva-card p-4.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Enquiries Pipeline</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-500/20">
                {stats.enquiriesNew} New
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
              {stats.totalEnquiries} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Leads</span>
            </div>
          </div>
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.enquiriesFollowUp}</span> in proposal • <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.enquiriesBooked}</span> confirmed
          </div>
        </div>

        {/* Metric 3 */}
        <div className="pixeva-card p-4.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Active Productions</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-white/10">
                8 Crew Deployed
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
              {stats.activeProjectsCount} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Shoots</span>
            </div>
          </div>
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Next: <span className="font-semibold text-slate-700 dark:text-slate-300">Vance Gala</span> (15 Nov)
          </div>
        </div>

        {/* Metric 4 */}
        <div className="pixeva-card p-4.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Post-Production SLA</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-500/20">
                4 Ready
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-1">
              85% <span className="text-sm font-medium text-slate-500 dark:text-slate-400">On Schedule</span>
            </div>
          </div>
          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300">2</span> in suite • <span className="font-semibold text-slate-700 dark:text-slate-300">1</span> in review
          </div>
        </div>
      </div>

      {/* Main 6-Matrix Studio Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {/* Card 1: Enquiries Pipeline */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enquiries Pipeline
              </h2>
              <Link 
                href="/enquiries" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>Pipeline ({stats.totalEnquiries})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">New</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.enquiriesNew}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Proposals</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.enquiriesFollowUp}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Booked</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.enquiriesBooked}</p>
              </div>
            </div>

            {/* Visual Funnel Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>Conversion Rate</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">33.3%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-slate-300 dark:bg-slate-700 h-full" style={{ width: '33%' }} title="New" />
                <div className="bg-blue-400 dark:bg-blue-500 h-full" style={{ width: '44%' }} title="Proposals" />
                <div className="bg-blue-600 dark:bg-blue-400 h-full" style={{ width: '23%' }} title="Booked" />
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cloud API Connected</span>
            </span>
            <Link href="/enquiries" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Manage Leads →
            </Link>
          </div>
        </div>

        {/* Card 2: Active Shoots & Next Production */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Shoots & Calendar
              </h2>
              <Link 
                href="/projects" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>All Shoots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Next Production Block */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Next Production</span>
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">
                  In 6 Days
                </span>
              </div>
              <h3 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                Vance Corporate Annual Gala
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>15 Nov 2026</span>
                <span>•</span>
                <span className="truncate">Udaipur Lake Palace</span>
              </p>
            </div>

            {/* Shoot Readiness Status */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-medium block">Crew Allocated</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">8 Specialists</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-medium block">Gear Checklist</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">100% Prepared</span>
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{stats.activeProjectsCount} Active Productions</span>
            <Link href="/crew-scheduling" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              View Schedule →
            </Link>
          </div>
        </div>

        {/* Card 3: Financial Health & Ledger */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Financial Ledger
              </h2>
              <Link 
                href="/finances" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Collected</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{stats.receivedRevenue}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Receivable</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{stats.pendingRevenue}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span>Settlement Progress</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">57.1%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-500 h-full rounded-full" style={{ width: '57.1%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Volume: {stats.totalRevenue}</span>
            <Link href="/finances" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              View Invoices →
            </Link>
          </div>
        </div>

        {/* Card 4: Post-Production Queue */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Post-Production Queue
              </h2>
              <Link 
                href="/post-production" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">In Edit</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.postProdInProgress}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Review</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.postProdReview}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ready</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.postProdReady}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-xs">
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                4K Color Grading: 85% complete
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Vance Gala Teaser • Editor: Marcus Rao
              </p>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">7 Deliverables in Studio</span>
            <Link href="/post-production" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Open Queue →
            </Link>
          </div>
        </div>

        {/* Card 5: Crew Roster & Gear */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Crew Roster & Availability
              </h2>
              <Link 
                href="/crew-scheduling" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Cinematographers:</span>
                <span className="font-bold text-slate-900 dark:text-white">4 Available Today</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Drone Pilots:</span>
                <span className="font-bold text-slate-900 dark:text-white">2 Ready (Certified)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-xs flex items-center justify-between">
              <span className="text-slate-500 font-medium">Next Available Crew:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Alex R., Rohan V.</span>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">14 Active Team Members</span>
            <Link href="/team" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Manage Rates →
            </Link>
          </div>
        </div>

        {/* Card 6: Client Requests & SLA */}
        <div className="pixeva-card pixeva-card-hover p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Client Feedback & Edits
              </h2>
              <Link 
                href="/client-requests" 
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-0.5"
              >
                <span>Requests ({stats.clientRequestsPending})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Revision Tickets:</span>
                <span className="font-bold text-slate-900 dark:text-white">2 In Review</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Average Response:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">45 Minutes</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-xs flex items-center justify-between">
              <span className="text-slate-500 font-medium">SLA Resolution Rate:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">98.5% On Time</span>
            </div>
          </div>

          <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Priority SLA Active</span>
            <Link href="/client-requests" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Review Edits →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
