'use client';

import React from 'react';
import { Inbox, Layout, ExternalLink, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export type EnquiryTab = 'enquiries' | 'landing-page' | 'analytics';

interface EnquiriesHeaderProps {
  activeTab: EnquiryTab;
  onTabChange: (tab: EnquiryTab) => void;
  enquiryCount: number;
}

export default function EnquiriesHeader({ activeTab, onTabChange, enquiryCount }: EnquiriesHeaderProps) {
  const tabs = [
    { id: 'enquiries' as EnquiryTab, label: 'Lead Pipeline & Enquiries', count: enquiryCount, icon: Inbox },
    { id: 'landing-page' as EnquiryTab, label: 'Client Booking Page Builder', icon: Layout },
    { id: 'analytics' as EnquiryTab, label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="space-y-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
      {/* Header Title & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enquiries & Lead Pipeline
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track, qualify, and convert incoming leads from web forms, WhatsApp, and booking pages into confirmed bookings.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onTabChange('analytics')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              activeTab === 'analytics'
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
            title="Open Pipeline & Enquiry Analytics"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Analytics</span>
          </button>

          <Link
            href="/enquire/client"
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-2xs"
            title="Open Live Public Client Enquiry Form"
          >
            <span>Public Booking Form</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex items-center space-x-2 pt-0.5">
        <div className="inline-flex items-center p-1 bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl space-x-1 shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    suppressHydrationWarning
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                        : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
