'use client';

import React from 'react';
import InvoiceManager from '@/components/invoices/InvoiceManager';
import { Receipt } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-[#8b5cf6]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Invoices & Billing Hub</h1>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-1">
          Generate client invoices, track payment status, and dispatch payment links via AWS Lambda.
        </p>
      </div>

      <InvoiceManager />
    </div>
  );
}
