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
    <div className="space-y-4 pb-3 border-b border-white/10">
      {/* Professional Clean Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] text-white flex items-center justify-center shadow-lg glow-cyan">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Enquiries Management</h1>
              <p className="text-xs text-slate-300 font-medium">
                Track incoming leads, automate follow-ups, and manage event inquiries.
              </p>
            </div>
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-md border border-[#00d4ff]/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-white/5 bg-[#12121a]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-cyan-300'
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
