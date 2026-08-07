'use client';

import React from 'react';
import { Search, Bell, Plus, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenAddLeadModal?: () => void;
}

export default function Header({ onOpenAddLeadModal }: HeaderProps) {
  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 pixeva-card border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            placeholder="Search leads, deals, galleries, or studio tasks..."
            className="w-full bg-[#12121a] border border-white/15 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
          />
        </div>
      </div>

      {/* Clean Production Status Badge */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full badge-cyan text-[11px] font-bold">
          <Zap className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>Pixeva Studio: Live</span>
        </div>

        {/* Action Button */}
        {onOpenAddLeadModal && (
          <button
            onClick={onOpenAddLeadModal}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        )}

        {/* Notification Icon */}
        <button className="p-2 rounded-xl text-[#a0a0b0] hover:text-white hover:bg-white/10 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00d4ff] glow-cyan" />
        </button>
      </div>
    </header>
  );
}
