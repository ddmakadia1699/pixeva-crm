'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { Receipt, FileText, Mail, CheckCircle2, Clock, AlertTriangle, Plus, Loader2, Sparkles, X } from 'lucide-react';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  total_amount: number;
  amount_paid: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2026-001',
    client_name: 'Acme Corp (Sarah Jenkins)',
    client_email: 'sarah@acme.com',
    total_amount: 4500,
    amount_paid: 4500,
    due_date: '2026-08-01',
    status: 'paid',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2026-002',
    client_name: 'Nexus Tech (Marcus Vance)',
    client_email: 'marcus@nexus.io',
    total_amount: 8200,
    amount_paid: 4100,
    due_date: '2026-08-20',
    status: 'pending',
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-2026-003',
    client_name: 'Cyberdyne Systems (Elena Rostova)',
    client_email: 'elena@cyberdyne.net',
    total_amount: 12000,
    amount_paid: 0,
    due_date: '2026-07-28',
    status: 'overdue',
  },
];

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activeLambdaTask, setActiveLambdaTask] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadPdf = async (inv: Invoice) => {
    setActiveLambdaTask(`pdf-${inv.id}`);
    const res = await invokeLambdaFunction('pdf-generator-service', {
      dealId: inv.invoice_number,
      clientName: inv.client_name,
      amount: inv.total_amount,
    });
    setActiveLambdaTask(null);
    setToastMessage(`[AWS Lambda PDF Engine] Rendered ${inv.invoice_number} in ${res.executionTimeMs}ms!`);
  };

  const handleSendReminder = async (inv: Invoice) => {
    setActiveLambdaTask(`email-${inv.id}`);
    const res = await invokeLambdaFunction('batch-email-service', {
      campaignName: `Invoice ${inv.invoice_number} Payment Link`,
      recipients: [inv.client_email],
    });
    setActiveLambdaTask(null);
    setToastMessage(`[AWS Lambda Dispatcher] Sent payment reminder to ${inv.client_email}!`);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-2xl pixeva-card bg-[#12121a] border border-[#00d4ff]/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <Sparkles className="w-4 h-4 text-[#00d4ff]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-[#a0a0b0] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invoices Table Container */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#a0a0b0]">
            <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Client</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Amount Paid</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">AWS Lambda Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-[#00d4ff]">
                    {inv.invoice_number}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    {inv.client_name}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-white" suppressHydrationWarning>
                    {formatCurrency(inv.total_amount)}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-[#00d4ff]" suppressHydrationWarning>
                    {formatCurrency(inv.amount_paid)}
                  </td>
                  <td className="px-5 py-4 font-mono text-[#a0a0b0]">
                    {inv.due_date}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      inv.status === 'paid' ? 'badge-emerald' : inv.status === 'pending' ? 'badge-cyan' : 'badge-amber'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleDownloadPdf(inv)}
                      disabled={Boolean(activeLambdaTask)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 text-[11px] font-semibold"
                    >
                      {activeLambdaTask === `pdf-${inv.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>Render PDF</span>
                    </button>

                    <button
                      onClick={() => handleSendReminder(inv)}
                      disabled={Boolean(activeLambdaTask)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#8b5cf6]/20 text-[#8b5cf6] border border-white/10 text-[11px] font-semibold"
                    >
                      {activeLambdaTask === `email-${inv.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>Send Remind</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
