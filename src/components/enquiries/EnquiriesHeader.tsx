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
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Inbox className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Enquiries</h1>
          </div>
          <p className="text-xs text-[#a0a0b0] mt-1">
            Track and manage incoming leads, landing page bookings, and conversions.
          </p>
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
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#a0a0b0]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
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
