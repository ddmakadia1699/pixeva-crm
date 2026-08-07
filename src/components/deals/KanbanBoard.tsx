'use client';

import React from 'react';
import { Deal, DealStage } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  deals: Deal[];
  onMoveStage: (dealId: string, targetStage: DealStage) => void;
}

const STAGES: { key: DealStage; label: string; description: string; badge: string }[] = [
  { key: 'prospecting', label: '1. New Inquiries', description: 'Fresh client leads', badge: 'bg-white/10 text-[#a0a0b0]' },
  { key: 'qualification', label: '2. In Contact', description: 'Discussing requirements', badge: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
  { key: 'proposal', label: '3. Proposal Sent', description: 'Price quote sent', badge: 'bg-[#8b5cf6]/20 text-[#8b5cf6]' },
  { key: 'negotiation', label: '4. Final Review', description: 'Finalizing contract', badge: 'bg-amber-500/20 text-amber-300' },
  { key: 'closed_won', label: '5. Booked & Paid 🎉', description: 'Confirmed shoot', badge: 'bg-emerald-500/30 text-emerald-300' },
];

export default function KanbanBoard({ deals, onMoveStage }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.key);
        const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

        return (
          <div
            key={stage.key}
            className="p-4 rounded-2xl bg-[#0a0a0f] border border-white/10 flex flex-col justify-between min-w-[240px] min-h-[440px]"
          >
            <div>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-extrabold text-sm text-white tracking-tight">{stage.label}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                  {stageDeals.length}
                </span>
              </div>
              <p className="text-[11px] text-[#a0a0b0] mb-3">{stage.description}</p>

              {/* Column Total */}
              <div className="pb-3 mb-4 border-b border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#a0a0b0] text-[11px]">Total Value:</span>
                <span className="font-mono font-extrabold text-[#00d4ff] text-xs" suppressHydrationWarning>
                  {formatCurrency(stageTotal)}
                </span>
              </div>

              {/* Single Clean Deal Cards */}
              <div className="space-y-3">
                {stageDeals.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[#a0a0b0] text-[11px]">
                    No shoots in stage
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 rounded-xl bg-[#12121a] border border-white/10 hover:border-[#00d4ff]/50 transition-all space-y-3"
                    >
                      <div>
                        <h5 className="font-bold text-white text-xs leading-snug">
                          {deal.title}
                        </h5>
                        <p className="text-[11px] text-[#a0a0b0] mt-0.5">{deal.company_name}</p>
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
  );
}
