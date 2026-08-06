'use client';

import React, { useState } from 'react';
import { invokeLambdaFunction, isAWSConfigured } from '@/lib/aws/lambda';
import { Cpu, FileText, Mail, DatabaseBackup, Play, Loader2, CheckCircle2, Terminal, AlertTriangle } from 'lucide-react';

export default function LambdaTasksPage() {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const handleRunLambda = async (taskKey: string, functionName: string, payload: any) => {
    setActiveTask(taskKey);

    const startTime = Date.now();
    const result = await invokeLambdaFunction(functionName, payload);

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        taskKey,
        functionName,
        timestamp: new Date().toLocaleTimeString(),
        duration: `${Date.now() - startTime}ms`,
        status: result.success ? '200 OK' : '500 ERROR',
        output: result.payload,
        simulated: result.simulated,
      },
      ...prev,
    ]);

    setActiveTask(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">AWS Lambda Serverless Task Center</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Execute microservices on AWS Lambda without consuming Vercel HTTP timeouts.
        </p>
      </div>

      {/* Cloud Mode Alert Banner */}
      <div className={`p-4 rounded-2xl glass-panel border flex items-center justify-between ${
        isAWSConfigured 
          ? 'border-cyan-500/30 bg-cyan-950/20' 
          : 'border-amber-500/30 bg-amber-950/20'
      }`}>
        <div className="flex items-center space-x-3">
          {isAWSConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <h4 className="text-xs font-bold text-white">
              {isAWSConfigured ? 'Live AWS Lambda SDK Connected' : 'AWS Simulation Mode Active'}
            </h4>
            <p className="text-[11px] text-slate-300">
              {isAWSConfigured 
                ? 'Function triggers will invoke live Lambda functions configured in your AWS Account.' 
                : 'AWS credentials not detected in .env. Task runner will execute high-speed simulated worker fallback.'}
            </p>
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Task 1: PDF Generation */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 space-y-4 shadow-xl">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-white text-base">PDF Quote & Invoice Engine</h3>
            <p className="text-xs text-slate-400 mt-1">
              Compiles vector graphics & PDF documents for CRM invoices asynchronously.
            </p>
          </div>

          <button
            onClick={() => handleRunLambda('pdf', 'pdf-generator-service', { dealId: 'deal-884', amount: 85000 })}
            disabled={Boolean(activeTask)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'pdf' ? 'Generating PDF...' : 'Run PDF Generator'}</span>
          </button>
        </div>

        {/* Task 2: Batch Campaign */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 space-y-4 shadow-xl">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit">
            <Mail className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-white text-base">Batch Lead Email Dispatcher</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dispatches multi-threaded email sequences to leads in bulk via AWS Lambda.
            </p>
          </div>

          <button
            onClick={() => handleRunLambda('email', 'batch-email-service', { campaignName: 'Q3 Enterprise Outreach', recipientsCount: 450 })}
            disabled={Boolean(activeTask)}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'email' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'email' ? 'Dispatching...' : 'Run Batch Campaign'}</span>
          </button>
        </div>

        {/* Task 3: CSV Import / Sync */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 space-y-4 shadow-xl">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 w-fit">
            <DatabaseBackup className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-white text-base">Database Sync & CSV Import</h3>
            <p className="text-xs text-slate-400 mt-1">
              Parses, transforms, and validates 10,000+ lead rows into Supabase DB.
            </p>
          </div>

          <button
            onClick={() => handleRunLambda('csv', 'csv-importer-service', { rowsProcessed: 1250, targetTable: 'leads' })}
            disabled={Boolean(activeTask)}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'csv' ? 'Syncing...' : 'Run CSV Sync'}</span>
          </button>
        </div>
      </div>

      {/* Execution Logs Console */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">Real-time Execution Console</h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs max-h-80 overflow-y-auto space-y-3">
          {logs.length === 0 ? (
            <p className="text-slate-500 italic">No Lambda functions invoked in this session yet. Click any button above to test.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="pb-3 border-b border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">[{log.functionName}]</span>
                  <span>{log.timestamp} ({log.duration})</span>
                  <span className="text-emerald-400 font-bold">{log.status}</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(log.output, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
