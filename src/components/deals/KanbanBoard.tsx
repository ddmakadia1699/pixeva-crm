'use client';

import React from 'react';
import { Deal, DealStage } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { MoveRight, MoveLeft, CheckCircle2 } from 'lucide-react';

interface KanbanBoardProps {
  deals: Deal[];
  onMoveStage: (dealId: string, targetStage: DealStage) => void;
}

const STAGES: { key: DealStage; label: string; color: string; badge: string }[] = [
  { key: 'prospecting', label: 'Prospecting', color: 'border-white/10 bg-[#12121a]/60', badge: 'bg-white/10 text-[#a0a0b0]' },
  { key: 'qualification', label: 'Qualification', color: 'border-[#00d4ff]/30 bg-[#00d4ff]/5', badge: 'bg-[#00d4ff]/20 text-[#00d4ff]' },
  { key: 'proposal', label: 'Proposal Sent', color: 'border-[#8b5cf6]/30 bg-[#8b5cf6]/5', badge: 'bg-[#8b5cf6]/20 text-[#8b5cf6]' },
  { key: 'negotiation', label: 'Negotiation', color: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/20 text-amber-300' },
  { key: 'closed_won', label: 'Closed Won 🎉', color: 'border-emerald-500/40 bg-emerald-500/10', badge: 'bg-emerald-500/30 text-emerald-300' },
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
            className={`pixeva-card p-3.5 rounded-2xl border ${stage.color} flex flex-col justify-between min-w-[240px] min-h-[500px] shadow-card`}
          >
            <div>
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-xs text-white tracking-tight">{stage.label}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.badge}`}>
                    {stageDeals.length}
                  </span>
                </div>
              </div>

              {/* Stage Subtotal */}
              <div className="pb-3 mb-3 border-b border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#a0a0b0] text-[11px]">Subtotal:</span>
                <span className="font-mono font-bold text-white text-xs" suppressHydrationWarning>
                  {formatCurrency(stageTotal)}
                </span>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3">
                {stageDeals.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[#a0a0b0] text-[11px]">
                    No deals in stage
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="pixeva-card pixeva-card-hover p-3.5 rounded-xl border border-white/10 bg-[#161622]/90 space-y-2.5 shadow-md relative group"
                    >
                      <div className="flex items-start justify-between">
                        <h5 className="font-semibold text-white text-xs leading-snug group-hover:text-[#00d4ff] transition-colors">
                          {deal.title}
                        </h5>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#a0a0b0] font-medium">{deal.company_name}</span>
                        <span className="font-mono font-bold text-[#00d4ff]" suppressHydrationWarning>
                          {formatCurrency(deal.amount)}
                        </span>
                      </div>

                      {/* Win Probability */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#a0a0b0]">
                          <span>Win Probability</span>
                          <span className="font-mono text-white">{deal.probability}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#0a0a0f] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] rounded-full transition-all duration-300"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                      </div>

                      {/* Movement Stage Controls */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
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
                            <MoveLeft className="w-3 h-3" />
                            <span>Previous</span>
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
                            className="flex items-center space-x-1 text-[#00d4ff] hover:text-white font-semibold transition-colors ml-auto"
                          >
                            <span>Advance</span>
                            <MoveRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1 ml-auto">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Won</span>
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
