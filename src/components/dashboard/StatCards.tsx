'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Users, Award, Cpu, TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatCardsProps {
  totalPipeline: number;
  totalLeads: number;
  closedWonAmount: number;
  lambdaInvocations: number;
}

export default function StatCards({
  totalPipeline,
  totalLeads,
  closedWonAmount,
  lambdaInvocations,
}: StatCardsProps) {
  const STATS = [
    {
      title: 'Total Pipeline Value',
      value: formatCurrency(totalPipeline),
      change: '+14.8% vs last month',
      icon: DollarSign,
      iconBg: 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40',
      badge: 'Active CRM',
      badgeStyle: 'badge-cyan',
    },
    {
      title: 'Active CRM Leads',
      value: totalLeads.toString(),
      change: '+4 new qualified this week',
      icon: Users,
      iconBg: 'bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/40',
      badge: 'Supabase DB',
      badgeStyle: 'badge-purple',
    },
    {
      title: 'Closed Won Deals',
      value: formatCurrency(closedWonAmount),
      change: '+22.5% conversion',
      icon: Award,
      iconBg: 'bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40',
      badge: 'High Intent',
      badgeStyle: 'badge-emerald',
    },
    {
      title: 'Lambda Serverless Tasks',
      value: lambdaInvocations.toString(),
      change: '100% execution success',
      icon: Cpu,
      iconBg: 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/40',
      badge: 'AWS Worker',
      badgeStyle: 'badge-cyan',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;

        return (
          <div
            key={idx}
            className="pixeva-card pixeva-card-hover p-5 rounded-2xl border border-white/10 relative overflow-hidden group shadow-pixevaCard"
          >
            {/* Ambient Radial Glow */}
            <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${idx % 2 === 0 ? 'bg-[#00d4ff]/15' : 'bg-[#8b5cf6]/15'} blur-2xl group-hover:opacity-100 opacity-70 transition-all`} />

            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.iconBg} shadow-inner`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${stat.badgeStyle}`}>
                {stat.badge}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#a0a0b0]">{stat.title}</p>
              <h3 className="text-2xl font-black tracking-tight text-white" suppressHydrationWarning>
                {stat.value}
              </h3>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-[#00d4ff] font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stat.change}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#a0a0b0] group-hover:text-white transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
