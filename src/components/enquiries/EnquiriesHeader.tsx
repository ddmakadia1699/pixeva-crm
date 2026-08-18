'use client';

import React from 'react';
import { Inbox, Layout, BarChart2, Share2, Sparkles } from 'lucide-react';

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
    <div className="space-y-4 pb-2 border-b border-white/10">
      {/* Top Banner & Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center shadow-md text-white">
              <Inbox className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Enquiries</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 uppercase tracking-widest">
              RevePod OS Suite
            </span>
          </div>
          <p className="text-xs text-[#a0a0b0] mt-1 flex items-center space-x-1.5">
            <span>Landing page</span>
            <span className="text-white/20">·</span>
            <span>leads</span>
            <span className="text-white/20">·</span>
            <span>analytics</span>
            <span className="text-white/20">·</span>
            <span>integrations</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#12121a] border border-white/10 flex items-center space-x-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
            <span className="text-[#a0a0b0]">Studio Status:</span>
            <span className="font-semibold text-white">Active Ingestion</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pt-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#8b5cf6]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/10'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00d4ff]' : 'text-[#a0a0b0]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black shadow-sm transition-all ${
                    isActive
                      ? 'bg-[#00d4ff] text-slate-950'
                      : 'bg-black/20 text-[#a0a0b0]'
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
  );
}
