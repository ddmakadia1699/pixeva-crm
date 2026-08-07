'use client';

import React, { useState } from 'react';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { Cpu, FileText, Mail, DatabaseBackup, Play, Loader2, CheckCircle2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export default function AutomationsPage() {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showDeveloperLogs, setShowDeveloperLogs] = useState(false);
  const [lastNotification, setLastNotification] = useState<{ title: string; message: string; duration: string } | null>(null);

  const handleRunTask = async (taskKey: string, functionName: string, title: string, successMessage: string, payload: any) => {
    setActiveTask(taskKey);

    const startTime = Date.now();
    const result = await invokeLambdaFunction(functionName, payload);
    const duration = `${Date.now() - startTime}ms`;

    setLastNotification({
      title,
      message: successMessage,
      duration,
    });

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        taskKey,
        functionName,
        timestamp: new Date().toLocaleTimeString(),
        duration,
        status: result.success ? '200 OK' : '500 ERROR',
        output: result.payload,
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
          <Cpu className="w-5 h-5 text-[#00d4ff]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Studio Automations Center</h1>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-1">
          Execute automated background tasks for PDF invoices, email sequences, and client directory syncing.
        </p>
      </div>

      {/* Human-Readable User Notification Banner */}
      {lastNotification && (
        <div className="p-4 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{lastNotification.title}</h4>
              <p className="text-[11px] text-[#a0a0b0] mt-0.5">{lastNotification.message}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#00d4ff] font-bold px-3 py-1 rounded-full bg-[#00d4ff]/20">
            {lastNotification.duration}
          </span>
        </div>
      )}

      {/* Studio Automation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Task 1: PDF Invoice Generation */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 w-fit">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">PDF Invoice Engine</h3>
              <p className="text-xs text-[#a0a0b0] mt-1">
                Automatically compile vector PDF invoices for shoot bookings and client payments.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRunTask(
              'pdf', 
              'pdf-generator-service', 
              'PDF Invoice Engine Completed', 
              'Compiled vector PDF invoice for client shoot INV-88421.', 
              { dealId: 'deal-884', amount: 85000 }
            )}
            disabled={Boolean(activeTask)}
            className="w-full btn-pixeva-primary flex items-center justify-center space-x-2 text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'pdf' ? 'Generating Invoice...' : 'Generate PDF Invoice'}</span>
          </button>
        </div>

        {/* Task 2: Bulk Lead Email Campaign */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/30 w-fit">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Lead Email Sequence</h3>
              <p className="text-xs text-[#a0a0b0] mt-1">
                Dispatch automated email follow-ups to active leads and shoot inquiries in bulk.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRunTask(
              'email', 
              'batch-email-service', 
              'Email Sequence Dispatched', 
              'Dispatched 450 automated lead follow-up emails in background worker queue.', 
              { campaignName: 'Pixeva Lead Nurture', recipientsCount: 450 }
            )}
            disabled={Boolean(activeTask)}
            className="w-full btn-pixeva-primary flex items-center justify-center space-x-2 text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'email' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'email' ? 'Dispatching Emails...' : 'Send Lead Email Sequence'}</span>
          </button>
        </div>

        {/* Task 3: CSV Client Sync */}
        <div className="pixeva-card p-5 rounded-2xl border border-white/10 space-y-4 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit">
              <DatabaseBackup className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Client Directory Sync</h3>
              <p className="text-xs text-[#a0a0b0] mt-1">
                Sync and validate client contact records, invoices, and booking histories.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleRunTask(
              'csv', 
              'csv-importer-service', 
              'Client Directory Sync Completed', 
              'Successfully synced 1,250 client records with primary database vault.', 
              { rowsProcessed: 1250, targetTable: 'leads' }
            )}
            disabled={Boolean(activeTask)}
            className="w-full btn-pixeva-primary flex items-center justify-center space-x-2 text-xs font-semibold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {activeTask === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{activeTask === 'csv' ? 'Syncing Records...' : 'Sync Client Directory'}</span>
          </button>
        </div>
      </div>

      {/* Developer Debug Accordion (Hidden by default for clean UX) */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card">
        <button
          onClick={() => setShowDeveloperLogs(!showDeveloperLogs)}
          className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold text-[#a0a0b0] hover:text-white transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#00d4ff]" />
            <span>Developer Debug Console ({logs.length} Executions)</span>
          </div>
          {showDeveloperLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDeveloperLogs && (
          <div className="p-4 bg-[#0a0a0f] border-t border-white/10 font-mono text-xs max-h-80 overflow-y-auto space-y-3">
            {logs.length === 0 ? (
              <p className="text-[#a0a0b0] italic">No technical logs recorded in this session. Click an automation card above to run a task.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="pb-3 border-b border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[#a0a0b0]">
                    <span className="text-[#00d4ff] font-bold">[{log.functionName}]</span>
                    <span>{log.timestamp} ({log.duration})</span>
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                  </div>
                  <pre className="text-white overflow-x-auto text-[11px]">
                    {JSON.stringify(log.output, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
