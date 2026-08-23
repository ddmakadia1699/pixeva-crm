'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Layers, 
  DollarSign, 
  CheckCircle2,
  Users,
  Inbox,
  ArrowRight
} from 'lucide-react';

const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';

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
    clientRequestsPending: 2,
  });

  useEffect(() => {
    // 1. Read from persistent localStorage first
    try {
      const enqRaw = localStorage.getItem('pixeva_enquiries');
      if (enqRaw) {
        const parsed = JSON.parse(enqRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const n = parsed.filter((e) => e.status === 'new' || !e.status).length;
          const f = parsed.filter((e) => e.status === 'contacted' || e.status === 'qualified' || e.status === 'proposal').length;
          const b = parsed.filter((e) => e.status === 'booked').length;
          setStats((prev) => ({
            ...prev,
            enquiriesNew: n,
            enquiriesFollowUp: f,
            enquiriesBooked: b,
            totalEnquiries: parsed.length,
          }));
        }
      }

      const projRaw = localStorage.getItem('pixeva_projects');
      if (projRaw) {
        const pParsed = JSON.parse(projRaw);
        if (Array.isArray(pParsed)) {
          setStats((prev) => ({ ...prev, activeProjectsCount: pParsed.length }));
        }
      }
    } catch (e) {}

    // 2. Silent background sync with AWS Lambda API Gateway
    async function syncCloudMetrics() {
      try {
        const enquiriesRes = await fetch(`${AWS_API_GATEWAY}/enquiries`).catch(() => null);
        if (enquiriesRes && enquiriesRes.ok) {
          const result = await enquiriesRes.json();
          if (result.success && Array.isArray(result.data)) {
            const n = result.data.filter((e: any) => e.status === 'new' || !e.status).length;
            const f = result.data.filter((e: any) => e.status === 'contacted' || e.status === 'qualified').length;
            const b = result.data.filter((e: any) => e.status === 'booked').length;
            setStats((prev) => ({
              ...prev,
              enquiriesNew: n,
              enquiriesFollowUp: f,
              enquiriesBooked: b,
              totalEnquiries: result.data.length,
            }));
          }
        }
      } catch (err) {
        // Silent fallback
      } finally {
        setLoading(false);
      }
    }

    syncCloudMetrics();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Studio Executive Dashboard
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
              Live Studio
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#a0a0b0] mt-0.5">
            Real-time pipeline, upcoming shoots, revenue ledger, and post-production progress
          </p>
        </div>
        
        <div className="relative max-w-md w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 dark:text-[#a0a0b0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-white/10 rounded-xl text-xs placeholder-slate-400 dark:placeholder-[#a0a0b0] text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all shadow-xs"
            placeholder="Search leads, shoots, or invoices..."
          />
        </div>
      </div>

      {/* Main Grid with Silent Skeleton Shimmer Support */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 space-y-4">
              <div className="h-5 w-32 bg-slate-300 dark:bg-white/10 rounded-lg" />
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="h-12 bg-slate-300 dark:bg-white/10 rounded-xl" />
                <div className="h-12 bg-slate-300 dark:bg-white/10 rounded-xl" />
                <div className="h-12 bg-slate-300 dark:bg-white/10 rounded-xl" />
              </div>
              <div className="h-16 bg-slate-300 dark:bg-white/10 rounded-xl mt-6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Enquiries Pipeline */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500"></span>
                  Enquiries Pipeline
                </h2>
                <Link href="/enquiries" className="text-xs font-bold text-sky-600 dark:text-[#00d4ff] hover:underline flex items-center space-x-1">
                  <span>View Leads ({stats.totalEnquiries})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 mb-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">New Leads</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.enquiriesNew}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Proposals</p>
                  <p className="text-2xl font-black text-sky-600 dark:text-sky-400">{stats.enquiriesFollowUp}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Booked</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.enquiriesBooked}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud API Sync Active</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card 2: Active Projects & Shoots */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Active Projects
                </h2>
                <Link href="/projects" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1">
                  <span>View all</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 mb-5">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Active Shoots</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeProjectsCount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Crew Deployed</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">8</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Next Production Shoot</p>
              <div className="flex items-center space-x-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-white/5 border border-indigo-100 dark:border-white/5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                    Vance Corporate Annual Gala
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    <span>15 Nov 2026 • Udaipur</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Finances Ledger */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Financial Health
                </h2>
                <Link href="/finances" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1">
                  <span>Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Received</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.receivedRevenue}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-[#a0a0b0] mb-0.5">Pending Balance</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">{stats.pendingRevenue}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Total Booked Volume</span>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{stats.totalRevenue}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {/* Card 4: Post Production Queue */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Post Production Queue
                </h2>
                <Link href="/post-production" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1">
                  <span>View tasks</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 mb-4 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-[#a0a0b0] uppercase">In Edit</p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">2</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-[#a0a0b0] uppercase">Review</p>
                  <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">1</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-[#a0a0b0] uppercase">Ready</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">4</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ⚡ 4K Color Grading: 85% complete on Vance Gala Teaser
              </p>
            </div>
          </div>

          {/* Card 5: Crew Scheduling */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Crew Roster & Gear
                </h2>
                <Link href="/crew-scheduling" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1">
                  <span>Calendar</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Active Cinematographers:</span>
                  <span className="font-bold text-slate-900 dark:text-white">4 Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Licensed Drone Pilots:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">2 Ready</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10">
              <Link href="/team" className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline">
                Manage Crew & Day Rates →
              </Link>
            </div>
          </div>

          {/* Card 6: Client Requests */}
          <div className="bg-white dark:bg-[#12121a] rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500/30 transition-all shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Client Feedback & Edits
                </h2>
                <Link href="/client-requests" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1">
                  <span>Open ({stats.clientRequestsPending})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 space-y-2 mb-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Revision Requests:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">2 Pending Review</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Avg Response Time:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">45 Minutes</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10">
              <Link href="/client-requests" className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline">
                Review Client Song & Cut Requests →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
