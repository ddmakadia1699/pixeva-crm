'use client';

import React from 'react';
import { Enquiry } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  PieChart, 
  BarChart2, 
  Sparkles,
  ArrowUpRight,
  Target
} from 'lucide-react';

interface AnalyticsTabProps {
  enquiries: Enquiry[];
}

export default function AnalyticsTab({ enquiries }: AnalyticsTabProps) {
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
    { type: 'wedding', label: 'Weddings', color: 'from-[#00d4ff] to-[#3b82f6]' },
    { type: 'corporate', label: 'Corporate Galas', color: 'from-[#8b5cf6] to-[#ec4899]' },
    { type: 'portrait', label: 'Portraits & Fashion', color: 'from-[#10b981] to-[#059669]' },
    { type: 'party', label: 'Parties & Social', color: 'from-[#f59e0b] to-[#d97706]' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#a0a0b0]">Total Enquiries</span>
            <div className="p-2 rounded-xl bg-[#00d4ff]/15 text-[#00d4ff]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-white">{totalEnquiries}</h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-[#a0a0b0]">Active leads ingested into studio pipeline</p>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#a0a0b0]">Conversion Rate</span>
            <div className="p-2 rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-white">{conversionRate}%</h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +5.2%
            </span>
          </div>
          <p className="text-[11px] text-[#a0a0b0]">Qualified & booked shoot contracts</p>
        </div>

        {/* Card 3: Est. Pipeline Value */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#a0a0b0]">Pipeline Value</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-white">{formatCurrency(totalBudget)}</h3>
          </div>
          <p className="text-[11px] text-[#a0a0b0]">Sum of all active inquiry budgets</p>
        </div>

        {/* Card 4: Avg Response Time */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#a0a0b0]">Avg Response Time</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-black text-white">1.4 hrs</h3>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              -25m faster
            </span>
          </div>
          <p className="text-[11px] text-[#a0a0b0]">First contact speed after submission</p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Chart */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Enquiries by Source</h3>
            </div>
            <span className="text-[11px] text-[#a0a0b0]">All Time</span>
          </div>

          <div className="space-y-3">
            {sourceCounts.map((src) => (
              <div key={src.name} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">{src.name}</span>
                  <span className="text-[#00d4ff] font-mono">{src.percentage}% ({src.count} leads)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#0a0a0f] overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${Math.max(src.percentage, 15)}%` }}
                    className="h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-[#8b5cf6]" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Event Category Distribution</h3>
            </div>
            <span className="text-[11px] text-[#a0a0b0]">Current Quarter</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map((et) => {
              const count = enquiries.filter((e) => e.event_type === et.type).length || 2;
              return (
                <div key={et.type} className="p-4 rounded-xl bg-[#0a0a0f] border border-white/10 space-y-1">
                  <span className="text-xs font-semibold text-[#a0a0b0] block">{et.label}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-white">{count}</span>
                    <span className="text-[10px] font-bold text-[#00d4ff]">
                      {Math.round((count / totalEnquiries) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${et.color}`} style={{ width: `${(count / totalEnquiries) * 100}%` }} />
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
