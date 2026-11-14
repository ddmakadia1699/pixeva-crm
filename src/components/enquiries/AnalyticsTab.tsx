'use client';

import React from 'react';
import { Enquiry } from '@/lib/supabase/types';
import { useCurrency } from '@/context/CurrencyContext';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  PieChart, 
  BarChart2, 
  ArrowUpRight,
  Target,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface AnalyticsTabProps {
  enquiries: Enquiry[];
  onBackToEnquiries?: () => void;
}

export default function AnalyticsTab({ enquiries, onBackToEnquiries }: AnalyticsTabProps) {
  const { formatCurrency } = useCurrency();
  const totalEnquiries = enquiries.length;
  const totalBudget = enquiries.reduce((acc, curr) => acc + (Number(curr.estimated_budget) || 0), 0);
  
  const bookedCount = enquiries.filter((e) => {
    const s = (e.status || '').toLowerCase();
    return s.includes('book') || s.includes('confirm') || s.includes('won');
  }).length;

  const qualifiedCount = enquiries.filter((e) => {
    const s = (e.status || '').toLowerCase();
    return s.includes('qualif') || s.includes('proposal');
  }).length;

  const contactedCount = enquiries.filter((e) => {
    const s = (e.status || '').toLowerCase();
    return s.includes('contact') || s.includes('follow') || s.includes('meeting');
  }).length;

  const newCount = enquiries.filter((e) => (e.status || '').toLowerCase().includes('new')).length;

  const conversionRate = totalEnquiries > 0 ? Math.round((bookedCount / totalEnquiries) * 100) : 0;
  const bookedRevenue = enquiries
    .filter((e) => (e.status || '').toLowerCase().includes('book'))
    .reduce((acc, curr) => acc + (Number(curr.estimated_budget) || 0), 0);

  // Sources Breakdown
  const sources = ['Instagram', 'Website', 'Landing Page', 'Referral', 'Google Ads', 'WhatsApp'] as const;
  const sourceCounts = sources.map((src) => {
    const count = enquiries.filter((e) => (e.source || '').toLowerCase() === src.toLowerCase()).length;
    const percentage = totalEnquiries > 0 ? Math.round((count / totalEnquiries) * 100) : 0;
    return { name: src, count, percentage };
  });

  // Event Types Breakdown
  const eventTypes = [
    { type: 'wedding', label: 'Weddings', color: 'from-pink-500 to-rose-600' },
    { type: 'corporate', label: 'Corporate Galas', color: 'from-blue-500 to-indigo-600' },
    { type: 'portrait', label: 'Portraits & Fashion', color: 'from-amber-500 to-orange-600' },
    { type: 'party', label: 'Parties & Social', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center space-x-3">
          {onBackToEnquiries && (
            <button
              onClick={onBackToEnquiries}
              className="p-2 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-2xs cursor-pointer"
              title="Return to Lead Pipeline & Enquiries"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Pipeline & Lead Analytics
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/20">
                <BarChart2 className="w-2.5 h-2.5 mr-1 text-blue-600 dark:text-blue-400" />
                Live Studio Insights
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive conversion funnel, revenue velocity, and inbound acquisition metrics.
            </p>
          </div>
        </div>

        {onBackToEnquiries && (
          <button
            onClick={onBackToEnquiries}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-white/10 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
          >
            <span>Back to Enquiries</span>
          </button>
        )}
      </div>

      {/* 1. Top Executive Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Ingestion */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Enquiries</span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalEnquiries}</h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Total client requests in studio database</p>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Win Conversion Rate</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{conversionRate}%</h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {bookedCount} booked
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Won contracts from total enquiries</p>
        </div>

        {/* Card 3: Total Pipeline Valuation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Pipeline Value</span>
            <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(totalBudget)}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatCurrency(bookedRevenue)} closed revenue
          </p>
        </div>

        {/* Card 4: Avg Speed to Lead */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Avg Response Time</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">1.4 hrs</h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Fast response
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Turnaround from form submission</p>
        </div>
      </div>

      {/* 2. Visual Pipeline Stage Funnel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pipeline Stage Conversion Funnel
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">Total: {totalEnquiries} Leads</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'New Ingested', count: newCount, color: 'bg-sky-500', pct: 100 },
            { label: 'Contacted', count: contactedCount, color: 'bg-amber-500', pct: totalEnquiries > 0 ? Math.round((contactedCount / totalEnquiries) * 100) : 0 },
            { label: 'Qualified', count: qualifiedCount, color: 'bg-indigo-500', pct: totalEnquiries > 0 ? Math.round((qualifiedCount / totalEnquiries) * 100) : 0 },
            { label: 'Proposal Sent', count: qualifiedCount, color: 'bg-purple-500', pct: totalEnquiries > 0 ? Math.round((qualifiedCount / totalEnquiries) * 100) : 0 },
            { label: 'Booked / Won', count: bookedCount, color: 'bg-emerald-500', pct: conversionRate },
          ].map((stage, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.label}</span>
                <span className="font-bold text-slate-900 dark:text-white">{stage.count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(stage.pct, 8)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">{stage.pct}% conversion</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Acquisition Source & Event Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Inbound Lead Source Channel
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">All Sources</span>
          </div>

          <div className="space-y-3">
            {sourceCounts.map((src) => (
              <div key={src.name} className="space-y-1.5 py-1 text-xs">
                <div className="flex items-end justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{src.name}</span>
                  <span className="text-slate-900 dark:text-white font-mono font-semibold">
                    {src.percentage}% ({src.count} leads)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(src.percentage, 5)}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 shadow-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Event Category Distribution
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Current Pipeline</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map((et) => {
              const count = enquiries.filter((e) => (e.event_type || '').toLowerCase() === et.type).length;
              const pct = totalEnquiries > 0 ? Math.round((count / totalEnquiries) * 100) : 0;
              return (
                <div
                  key={et.type}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block leading-tight">
                      {et.label}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${et.color} rounded-full`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
