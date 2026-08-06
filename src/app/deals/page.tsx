'use client';

import React, { useState } from 'react';
import KanbanBoard from '@/components/deals/KanbanBoard';
import { MOCK_DEALS } from '@/lib/supabase/client';
import { Deal, DealStage } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { KanbanSquare } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);

  const totalPipeline = deals.reduce((sum, d) => sum + d.amount, 0);

  const handleMoveStage = (dealId: string, targetStage: DealStage) => {
    setDeals(
      deals.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <KanbanSquare className="w-5 h-5 text-[#8b5cf6]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Sales Pipeline Kanban</h1>
          </div>
          <p className="text-xs text-[#a0a0b0] mt-1">
            Drag and advance deals across sales stages. Real-time subtotal tracking included.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-xl pixeva-card bg-[#12121a] border border-white/10 text-xs flex items-center space-x-2">
            <span className="text-[#a0a0b0]">Total Pipeline:</span>
            <span className="font-mono font-bold text-[#00d4ff] text-sm" suppressHydrationWarning>
              {formatCurrency(totalPipeline)}
            </span>
          </div>
        </div>
      </div>

      <KanbanBoard deals={deals} onMoveStage={handleMoveStage} />
    </div>
  );
}
