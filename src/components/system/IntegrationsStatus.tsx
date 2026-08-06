'use client';

import React, { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isAWSConfigured, invokeLambdaFunction } from '@/lib/aws/lambda';
import { Server, Database, Cpu, CheckCircle2, AlertTriangle, Play, Loader2, Terminal } from 'lucide-react';

export default function IntegrationsStatus() {
  const [testingLambda, setTestingLambda] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestLambda = async () => {
    setTestingLambda(true);
    setTestResult(null);

    const res = await invokeLambdaFunction('pixeva-system-ping', {
      source: 'Pixeva System Diagnostics',
      pingAt: new Date().toISOString(),
    });

    setTestResult(res);
    setTestingLambda(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & Tri-Cloud Architecture</h2>
        <p className="text-xs text-[#a0a0b0]">Live diagnostics and connection credentials for Vercel, Supabase, and AWS Lambda.</p>
      </div>

      {/* Cloud Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Vercel Card */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Server className="w-6 h-6" />
            </div>
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Edge Live</span>
            </span>
          </div>

          <div>
            <h3 className="font-bold text-white text-base">Vercel Edge Hosting</h3>
            <p className="text-xs text-[#a0a0b0] mt-1">
              Next.js App Router, SSR engine, and Edge middleware runtime.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Environment:</span>
              <span className="text-white font-mono">Production Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Framework:</span>
              <span className="text-white font-mono">Next.js 14+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Global CDN:</span>
              <span className="text-[#00d4ff] font-semibold">Vercel Edge</span>
            </div>
          </div>
        </div>

        {/* 2. Supabase Card */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
              <Database className="w-6 h-6" />
            </div>
            <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isSupabaseConfigured 
                ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' 
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Postgres Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Demo Mode</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-white text-base">Supabase Database</h3>
            <p className="text-xs text-[#a0a0b0] mt-1">
              PostgreSQL database, Supabase Auth, & Row Level Security (RLS).
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Database Status:</span>
              <span className="text-white font-mono truncate max-w-[140px]">
                {isSupabaseConfigured ? 'Valid Connection' : 'Needs .env keys'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">SQL Migration:</span>
              <span className="text-white font-mono">`supabase/schema.sql`</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Auth Engine:</span>
              <span className="text-[#8b5cf6] font-semibold">@supabase/ssr</span>
            </div>
          </div>
        </div>

        {/* 3. AWS Lambda Card */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Cpu className="w-6 h-6" />
            </div>
            <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              isAWSConfigured 
                ? 'bg-[#00d4ff]/20 text-[#00d4ff]' 
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isAWSConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>AWS Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulated</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-white text-base">AWS Lambda Workers</h3>
            <p className="text-xs text-[#a0a0b0] mt-1">
              On-demand serverless execution engine for PDF and batch tasks.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">AWS Region:</span>
              <span className="text-white font-mono">us-east-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">SDK Client:</span>
              <span className="text-[#00d4ff] font-semibold">@aws-sdk/client-lambda</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0b0]">Handlers:</span>
              <span className="text-white font-mono">`/lambda/functions`</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AWS Lambda Test Suite */}
      <div className="pixeva-card p-6 rounded-2xl border border-white/10 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Live AWS Lambda Diagnostics</h3>
              <p className="text-xs text-[#a0a0b0]">Send an on-demand invocation test payload to your AWS Lambda worker module.</p>
            </div>
          </div>

          <button
            onClick={handleTestLambda}
            disabled={testingLambda}
            className="btn-pixeva-primary flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {testingLambda ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{testingLambda ? 'Executing...' : 'Trigger AWS Lambda'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-xl bg-[#0a0a0f] border border-white/10 space-y-2 font-mono text-xs animate-fadeIn">
            <div className="flex items-center justify-between text-[#a0a0b0] border-b border-white/10 pb-2">
              <span>Status Code: <strong className="text-[#00d4ff]">{testResult.statusCode}</strong></span>
              <span>Execution Time: <strong className="text-[#8b5cf6]">{testResult.executionTimeMs}ms</strong></span>
              <span>Mode: <strong className="text-amber-400">{testResult.simulated ? 'Simulated Fallback' : 'Live AWS'}</strong></span>
            </div>
            <pre className="text-white overflow-x-auto pt-1">
              {JSON.stringify(testResult.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
