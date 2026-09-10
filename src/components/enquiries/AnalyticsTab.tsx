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
  Target
} from 'lucide-react';

interface AnalyticsTabProps {
  enquiries: Enquiry[];
}

export default function AnalyticsTab({ enquiries }: AnalyticsTabProps) {
  const { formatCurrency } = useCurrency();
  const totalEnquiries = enquiries.length || 5;
  const totalBudget = enquiries.reduce((acc, curr) => acc + (curr.estimated_budget || 0), 0);
  const bookedCount = enquiries.filter((e) => e.status === 'booked' || e.status === 'qualified').length;
  const conversionRate = Math.round((bookedCount / totalEnquiries) * 100);

  // Sources Breakdown
  const sources = ['Landing Page', 'Instagram', 'Website', 'Referral', 'Google Ads'] as const;
  const sourceCounts = sources.map((src) => {
    const count = enquiries.filter((e) => e.source === src).length;
    const percentage = Math.round((count / totalEnquiries) * 100) || 20;
    return { name: src, count, percentage };
  });

  // Event Types Breakdown
  const eventTypes = [
    { type: 'wedding', label: 'Weddings' },
    { type: 'corporate', label: 'Corporate Galas' },
    { type: 'portrait', label: 'Portraits & Fashion' },
    { type: 'party', label: 'Parties & Social' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className="pixeva-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Enquiries</span>
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalEnquiries}</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Active leads ingested into studio pipeline</p>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="pixeva-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Conversion Rate</span>
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{conversionRate}%</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +5.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Qualified & booked shoot contracts</p>
        </div>

        {/* Card 3: Est. Pipeline Value */}
        <div className="pixeva-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Pipeline Value</span>
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</h3>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Sum of all active inquiry budgets</p>
        </div>

        {/* Card 4: Avg Response Time */}
        <div className="pixeva-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Avg Response Time</span>
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">1.4 hrs</h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
              -25m faster
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">First contact speed after submission</p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Distribution Chart */}
        <div className="pixeva-card p-4.5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Enquiries by Source</h3>
            </div>
            <span className="text-[11px] text-slate-400">All Time</span>
          </div>

          <div className="space-y-3">
            {sourceCounts.map((src) => (
              <div key={src.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{src.name}</span>
                  <span className="text-slate-900 dark:text-white font-mono font-semibold">{src.percentage}% ({src.count} leads)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(src.percentage, 10)}%` }}
                    className="h-full bg-slate-800 dark:bg-slate-300 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div className="pixeva-card p-4.5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Event Category Distribution</h3>
            </div>
            <span className="text-[11px] text-slate-400">Current Quarter</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map((et) => {
              const count = enquiries.filter((e) => e.event_type === et.type).length || 2;
              const pct = Math.round((count / totalEnquiries) * 100);
              return (
                <div key={et.type} className="p-3 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 space-y-1">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{et.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{count}</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-white/10 mt-2 overflow-hidden">
                    <div className="h-full bg-slate-700 dark:bg-slate-300 rounded-full" style={{ width: `${pct}%` }} />
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
