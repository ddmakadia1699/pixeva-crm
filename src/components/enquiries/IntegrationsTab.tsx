'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  MessageSquare, 
  Globe, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  Code2, 
  Key, 
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function IntegrationsTab() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [integrations, setIntegrations] = useState([
    {
      id: 'webhook',
      name: 'Custom Webhooks & API',
      description: 'Receive real-time HTTP POST JSON payloads whenever a new enquiry is submitted.',
      icon: Code2,
      status: 'Connected',
      active: true,
      badge: 'High Speed',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      description: 'Send instant automated WhatsApp welcome messages to new lead phone numbers.',
      icon: MessageSquare,
      status: 'Connected',
      active: true,
      badge: 'Instant Auto-Responder',
    },
    {
      id: 'meta',
      name: 'Meta Lead Ads (FB & Instagram)',
      description: 'Sync leads automatically from Facebook & Instagram ad campaigns into Pixeva.',
      icon: Share2,
      status: 'Connected',
      active: fontTrue(),
      badge: 'Ad Manager Sync',
    },
    {
      id: 'zapier',
      name: 'Zapier & Make.com',
      description: 'Connect Pixeva Enquiries to 5,000+ apps including Gmail, Slack, and Google Sheets.',
      icon: Zap,
      status: 'Available',
      active: false,
      badge: 'Automation',
    },
  ]);

  function fontTrue() {
    return true;
  }

  const apiKey = 'px_live_enq_99a8b7c6d5e4f3a2b1c0_2026';

  const handleToggle = (id: string) => {
    setIntegrations(
      integrations.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-base font-extrabold text-white">Enquiry Ingestion & API Integrations</h2>
          </div>
          <p className="text-xs text-[#a0a0b0] mt-1 max-w-2xl">
            Automatically ingest leads from social media, web forms, WhatsApp, and third-party CRMs into your RevePod Pixeva workspace.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 text-xs font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>3 Integrations Active</span>
          </span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl pixeva-card bg-[#12121a] border transition-all space-y-4 ${
                item.active ? 'border-[#00d4ff]/40 shadow-lg shadow-[#00d4ff]/5' : 'border-white/10 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-[#00d4ff]/20 to-[#8b5cf6]/20 text-[#00d4ff] border border-white/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">{item.name}</h3>
                    <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider">{item.badge}</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={() => handleToggle(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00d4ff]"></div>
                </label>
              </div>

              <p className="text-xs text-[#a0a0b0] leading-relaxed">{item.description}</p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className={`font-bold ${item.active ? 'text-emerald-400' : 'text-[#a0a0b0]'}`}>
                  {item.active ? '● Active & Syncing' : '○ Disabled'}
                </span>
                <button className="text-[#00d4ff] hover:underline font-semibold flex items-center space-x-1">
                  <span>Configure</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* API Key Credentials Box */}
      <div className="pixeva-card bg-[#0a0a0f] border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-[#00d4ff]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Inbound Webhook API Key</h3>
        </div>
        <p className="text-xs text-[#a0a0b0]">
          Use this key in your HTTP Authorization headers when posting inbound lead JSON data to <code className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded">https://pixeva-crm.vercel.app/api/enquiries/ingest</code>.
        </p>

        <div className="flex items-center space-x-2 max-w-xl">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="w-full bg-[#12121a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
          />
          <button
            onClick={handleCopyKey}
            className="btn-pixeva-primary shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
