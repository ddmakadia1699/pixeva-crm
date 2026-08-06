'use client';

import React from 'react';
import IntegrationsStatus from '@/components/system/IntegrationsStatus';
import { Settings2, Key, Database, Cpu, Server, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <Settings2 className="w-5 h-5 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Settings & Tri-Cloud Integrations</h1>
          <p className="text-xs text-slate-400">Configure connection strings, API credentials, and review deployment guides.</p>
        </div>
      </div>

      <IntegrationsStatus />

      {/* Account Setup Guide Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">Beginner Account & Setup Links</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vercel */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs">1. Vercel Hosting</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400">Deploy this repository to Vercel with 1 click to get a global HTTPS URL.</p>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-blue-400 hover:underline pt-1"
            >
              Open Vercel Dashboard →
            </a>
          </div>

          {/* Supabase */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs">2. Supabase Cloud</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400">Create a free project, get your URL & Anon Key, and run `supabase/schema.sql`.</p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-emerald-400 hover:underline pt-1"
            >
              Open Supabase SQL Editor →
            </a>
          </div>

          {/* AWS Lambda */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-xs">3. AWS Lambda</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400">Deploy functions in `/lambda` to AWS Lambda and create IAM access keys.</p>
            <a
              href="https://console.aws.amazon.com/lambda"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-semibold text-cyan-400 hover:underline pt-1"
            >
              Open AWS Lambda Console →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
