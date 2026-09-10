'use client';

import React from 'react';
import { Inbox, Layout, BarChart2, Share2 } from 'lucide-react';

export type EnquiryTab = 'enquiries' | 'landing-page' | 'analytics' | 'integrations';

interface EnquiriesHeaderProps {
  activeTab: EnquiryTab;
  onTabChange: (tab: EnquiryTab) => void;
  enquiryCount: number;
}

export default function EnquiriesHeader({ activeTab, onTabChange, enquiryCount }: EnquiriesHeaderProps) {
  const tabs = [
    { id: 'enquiries' as EnquiryTab, label: 'Enquiries', count: enquiryCount, icon: Inbox },
    { id: 'landing-page' as EnquiryTab, label: 'Landing Page', icon: Layout },
    { id: 'analytics' as EnquiryTab, label: 'Analytics', icon: BarChart2 },
    { id: 'integrations' as EnquiryTab, label: 'Integrations', icon: Share2 },
  ];

  return (
    <div className="space-y-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Enquiries & Lead Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, qualify, and convert incoming leads, client booking pages, and automated campaigns.
          </p>
        </div>
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 scrollbar-none">
        <div className="inline-flex items-center p-1 bg-slate-100/90 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 rounded-xl space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
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
