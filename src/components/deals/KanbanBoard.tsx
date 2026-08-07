'use client';

import React, { useState } from 'react';
import { Deal, DealStage } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, ArrowLeft, CheckCircle2, LayoutGrid, List, Sparkles, Building2 } from 'lucide-react';

interface KanbanBoardProps {
  deals: Deal[];
  onMoveStage: (dealId: string, targetStage: DealStage) => void;
}

const STAGES: { key: DealStage; label: string; description: string; badge: string; color: string }[] = [
  { key: 'prospecting', label: '1. New Inquiries', description: 'Fresh client leads', badge: 'bg-white/10 text-white', color: 'border-blue-500/20' },
  { key: 'qualification', label: '2. In Contact', description: 'Discussing shoot details', badge: 'bg-[#00d4ff]/20 text-[#00d4ff]', color: 'border-[#00d4ff]/30' },
  { key: 'proposal', label: '3. Proposal Sent', description: 'Price quote sent', badge: 'bg-[#8b5cf6]/20 text-[#8b5cf6]', color: 'border-[#8b5cf6]/30' },
  { key: 'negotiation', label: '4. Final Review', description: 'Reviewing agreement', badge: 'bg-amber-500/20 text-amber-300', color: 'border-amber-500/30' },
  { key: 'closed_won', label: '5. Booked & Paid 🎉', description: 'Confirmed booking', badge: 'bg-emerald-500/30 text-emerald-300', color: 'border-emerald-500/40' },
];

export default function KanbanBoard({ deals, onMoveStage }: KanbanBoardProps) {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  return (
    <div className="space-y-4">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#a0a0b0]">
          <Sparkles className="w-4 h-4 text-[#00d4ff]" />
          <span>Active Pipeline: <strong className="text-white font-mono">{deals.length} Active Deals</strong></span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-[#12121a] border border-white/10 rounded-xl">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-sm'
                : 'text-[#a0a0b0] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board View</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-sm'
                : 'text-[#a0a0b0] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* 1. Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.key);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div
                key={stage.key}
                className="p-4 rounded-2xl bg-[#0d0d14] border border-white/10 flex flex-col justify-between min-w-[240px] min-h-[440px]"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-white tracking-tight">{stage.label}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stage.badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a0a0b0] mb-3">{stage.description}</p>

                  {/* Column Total */}
                  <div className="pb-3 mb-4 border-b border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#a0a0b0] text-[11px]">Stage Total:</span>
                    <span className="font-mono font-extrabold text-[#00d4ff] text-xs" suppressHydrationWarning>
                      {formatCurrency(stageTotal)}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {stageDeals.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[#a0a0b0] text-[11px]">
                        No shoots in stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="p-4 rounded-xl bg-[#161622] border border-white/10 hover:border-[#00d4ff]/50 transition-all space-y-3 shadow-sm"
                        >
                          <div>
                            <h5 className="font-bold text-white text-xs leading-snug">
                              {deal.title}
                            </h5>
                            <div className="flex items-center space-x-1.5 mt-1 text-[#a0a0b0]">
                              <Building2 className="w-3 h-3 text-[#a0a0b0]" />
                              <span className="text-[11px] font-medium">{deal.company_name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[#a0a0b0] uppercase font-bold tracking-wider">Amount</span>
                            <span className="font-mono font-black text-[#00d4ff] text-sm" suppressHydrationWarning>
                              {formatCurrency(deal.amount)}
                            </span>
                          </div>

                          {/* Movement Stage Controls */}
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                            {/* Move Left */}
                            {stage.key !== 'prospecting' ? (
                              <button
                                onClick={() => {
                                  const currentIndex = STAGES.findIndex((s) => s.key === stage.key);
                                  if (currentIndex > 0) {
                                    onMoveStage(deal.id, STAGES[currentIndex - 1].key);
                                  }
                                }}
                                className="flex items-center space-x-1 text-[#a0a0b0] hover:text-white transition-colors"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {/* Move Right */}
                            {stage.key !== 'closed_won' ? (
                              <button
                                onClick={() => {
                                  const currentIndex = STAGES.findIndex((s) => s.key === stage.key);
                                  if (currentIndex < STAGES.length - 1) {
                                    onMoveStage(deal.id, STAGES[currentIndex + 1].key);
                                  }
                                }}
                                className="flex items-center space-x-1 text-[#00d4ff] hover:text-white font-bold transition-colors ml-auto"
                              >
                                <span>Move Next</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-bold flex items-center space-x-1 ml-auto">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Booked</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Table View */}
      {viewMode === 'list' && (
        <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a0a0b0]">
              <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-semibold border-b border-white/10 text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Deal / Project</th>
                  <th className="px-5 py-3.5">Client / Company</th>
                  <th className="px-5 py-3.5">Deal Value</th>
                  <th className="px-5 py-3.5">Current Stage</th>
                  <th className="px-5 py-3.5 text-right">Advance Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deals.map((deal) => {
                  const stageObj = STAGES.find((s) => s.key === deal.stage);
                  const currentIndex = STAGES.findIndex((s) => s.key === deal.stage);

                  return (
                    <tr key={deal.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-bold text-white text-sm">{deal.title}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#a0a0b0]">{deal.company_name}</td>
                      <td className="px-5 py-4 font-mono font-extrabold text-[#00d4ff] text-sm" suppressHydrationWarning>
                        {formatCurrency(deal.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${stageObj?.badge}`}>
                          {stageObj?.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {currentIndex > 0 && (
                          <button
                            onClick={() => onMoveStage(deal.id, STAGES[currentIndex - 1].key)}
                            className="px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-white/10 text-[#a0a0b0] border border-white/10 text-xs font-semibold"
                          >
                            ← Back
                          </button>
                        )}
                        {currentIndex < STAGES.length - 1 ? (
                          <button
                            onClick={() => onMoveStage(deal.id, STAGES[currentIndex + 1].key)}
                            className="px-3 py-1.5 rounded-xl btn-pixeva-primary text-xs font-bold"
                          >
                            Advance →
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-bold text-xs">Booked 🎉</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
