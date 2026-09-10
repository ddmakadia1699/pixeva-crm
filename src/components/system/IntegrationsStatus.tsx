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

    const res = await invokeLambdaFunction('pdf-generator-service', {
      source: 'Pixeva System Diagnostics',
      dealId: 'INV-DIAG-001',
      clientName: 'Live Diagnostics Test',
      amount: 50000,
      pingAt: new Date().toISOString(),
    });

    setTestResult(res);
    setTestingLambda(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System & Tri-Cloud Architecture</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live diagnostics and connection credentials for Vercel, Supabase, and AWS Lambda.</p>
      </div>

      {/* Cloud Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Vercel Card */}
        <div className="pixeva-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Server className="w-5 h-5" />
            </div>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Edge Live</span>
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Vercel Edge Hosting</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Next.js App Router, SSR engine, and Edge middleware runtime.
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Environment:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium">Production Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Framework:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium">Next.js 14+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Global CDN:</span>
              <span className="text-slate-900 dark:text-white font-semibold">Vercel Edge</span>
            </div>
          </div>
        </div>

        {/* 2. Supabase Card */}
        <div className="pixeva-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Database className="w-5 h-5" />
            </div>
            <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isSupabaseConfigured 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Postgres Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Demo Mode</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Supabase Database</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PostgreSQL database, Supabase Auth, & Row Level Security (RLS).
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Database Status:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium truncate max-w-[140px]">
                {isSupabaseConfigured ? 'Valid Connection' : 'Needs .env keys'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SQL Migration:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium">`supabase/schema.sql`</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auth Engine:</span>
              <span className="text-slate-900 dark:text-white font-semibold">@supabase/ssr</span>
            </div>
          </div>
        </div>

        {/* 3. AWS Lambda Card */}
        <div className="pixeva-card p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Cpu className="w-5 h-5" />
            </div>
            <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isAWSConfigured 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isAWSConfigured ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>AWS Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  <span>Simulated</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">AWS Lambda Workers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              On-demand serverless execution engine for PDF and batch tasks.
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">AWS Region:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium">us-east-1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SDK Client:</span>
              <span className="text-slate-900 dark:text-white font-semibold">@aws-sdk/client-lambda</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Handlers:</span>
              <span className="text-slate-900 dark:text-white font-mono font-medium">`/lambda/functions`</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AWS Lambda Test Suite */}
      <div className="pixeva-card p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Live AWS Lambda Diagnostics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Send an on-demand invocation test payload to your live `pdf-generator-service` AWS Lambda function.</p>
            </div>
          </div>

          <button
            onClick={handleTestLambda}
            disabled={testingLambda}
            className="btn-pixeva-primary flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
          >
            {testingLambda ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{testingLambda ? 'Executing...' : 'Trigger AWS Lambda'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 font-mono text-xs animate-fadeIn">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/60 dark:border-slate-800 pb-2">
              <span>Status Code: <strong className="text-slate-900 dark:text-white">{testResult.statusCode}</strong></span>
              <span>Execution Time: <strong className="text-slate-900 dark:text-white">{testResult.executionTimeMs}ms</strong></span>
              <span>Mode: <strong className="text-emerald-700 dark:text-emerald-400">{testResult.simulated ? 'Simulated Fallback' : 'Live AWS Account'}</strong></span>
            </div>
            <pre className="text-slate-800 dark:text-slate-200 overflow-x-auto pt-1 text-[11px]">
              {JSON.stringify(testResult.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
