'use client';

import React, { useState, useEffect } from 'react';
import { FileSignature, CheckCircle2, Clock, Eye, Sparkles, X, ShieldCheck } from 'lucide-react';

const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://wng538wd9k.execute-api.us-east-1.amazonaws.com';

export interface Contract {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  terms_summary: string;
  status: 'signed' | 'pending_signature' | 'draft';
  signed_at?: string;
}

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    title: 'Standard Wedding Photography & AI Rights Release',
    client_name: 'Sarah Jenkins & Mark Davis',
    client_email: 'sarah@acme.com',
    terms_summary: 'Includes 8 hours coverage, 2 photographers, AI selfie recognition gallery access, and personal reproduction rights.',
    status: 'signed',
    signed_at: '2026-08-02 10:45 AM',
  },
  {
    id: 'c-2',
    title: 'Corporate Summit Media Coverage Agreement',
    client_name: 'Nexus Tech (Marcus Vance)',
    client_email: 'marcus@nexus.io',
    terms_summary: 'Includes live camera FTP upload, real-time photo wall display, commercial licensing, and same-day RAW delivery.',
    status: 'pending_signature',
  },
  {
    id: 'c-3',
    title: 'Commercial Executive Headshot & License Release',
    client_name: 'Cyberdyne Systems (Elena Rostova)',
    client_email: 'elena@cyberdyne.net',
    terms_summary: 'Commercial licensing rights for corporate website, press releases, and digital marketing materials.',
    status: 'pending_signature',
  },
];

export default function ContractManager() {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [activePreview, setActivePreview] = useState<Contract | null>(null);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch(`${AWS_API_GATEWAY}/contracts`);
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setContracts(result.data);
        }
      } catch (e) {
        console.error('Error fetching contracts via Amazon API Gateway:', e);
      }
    }
    fetchContracts();
  }, []);

  const handleSignContract = async (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'signed', signed_at: new Date().toLocaleString() } : c))
    );

    try {
      await fetch(`${AWS_API_GATEWAY}/contracts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error('Failed to sign contract via Amazon API Gateway:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="pixeva-card pixeva-card-hover p-5 rounded-2xl border border-white/10 space-y-4 shadow-card flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  c.status === 'signed' ? 'badge-emerald' : 'badge-amber'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>
                {c.signed_at && (
                  <span className="text-[10px] font-mono text-[#00d4ff] flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified E-Sign</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-white text-base leading-snug">{c.title}</h3>
                <p className="text-xs text-[#a0a0b0] mt-1 line-clamp-2">{c.terms_summary}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#a0a0b0] block">Client:</span>
                <span className="text-xs font-bold text-white">{c.client_name}</span>
              </div>

              <button
                onClick={() => setActivePreview(c)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#12121a] hover:bg-[#00d4ff]/20 text-[#00d4ff] border border-white/10 text-xs font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View E-Sign</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* E-Signature Modal Preview */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-bold text-white text-base">Digital Agreement Preview</h3>
              </div>
              <button onClick={() => setActivePreview(null)} className="p-1 text-[#a0a0b0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0a0f] border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">{activePreview.title}</h4>
              <p className="text-[#a0a0b0] leading-relaxed">{activePreview.terms_summary}</p>
              
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#a0a0b0]">Client Name:</span>
                  <span className="text-white font-bold">{activePreview.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0b0]">Email Address:</span>
                  <span className="text-white font-mono">{activePreview.client_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a0a0b0]">Signature Status:</span>
                  <span className="text-[#00d4ff] font-bold uppercase">{activePreview.status.replace('_', ' ')}</span>
                </div>
              </div>

              {activePreview.signed_at ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-mono font-bold">
                  ✓ Digitally Signed & Encrypted on {activePreview.signed_at}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center font-semibold">
                  ⏳ Client E-Signature Link Sent to {activePreview.client_email}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActivePreview(null)} className="btn-pixeva-primary px-4 py-2 text-xs">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
