'use client';

import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  Mail,
  History,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  LifeBuoy,
  MessageCircle,
  FolderPlus,
  UserPlus,
  Calendar,
  Film,
  CreditCard,
  Image,
  BellRing,
  Info,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Search,
  Check,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

interface NotificationTrigger {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'client' | 'team' | 'admin';
  defaultEnabled: boolean;
  sampleMessage: string;
}

const AUTOMATED_MESSAGES: NotificationTrigger[] = [
  {
    id: 'new_project',
    title: 'New project created',
    description: 'Texts the client their portal link when a project is added.',
    icon: FolderPlus,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Hi [Client Name]! Your project portal for [Project Title] is ready. View your schedule, contract & deliverables here: https://pixeva.co/p/[id] - Pixeva Studio Team'
  },
  {
    id: 'team_member',
    title: 'Team member added',
    description: 'Texts a new crew member their schedule link.',
    icon: UserPlus,
    category: 'team',
    defaultEnabled: true,
    sampleMessage: 'Welcome to the team [Crew Name]! Access your crew portal & shoot schedule here: https://pixeva.co/c/[id]'
  },
  {
    id: 'event_assignment',
    title: 'Event assignment',
    description: 'Notifies a crew member when assigned to an event.',
    icon: Calendar,
    category: 'team',
    defaultEnabled: true,
    sampleMessage: 'Hey [Crew Name], you have been assigned to [Event Name] on [Date] at [Location]. Call time: 08:30 AM.'
  },
  {
    id: 'task_assignment',
    title: 'Post-production task assignment',
    description: 'Notifies a crew member when assigned a deliverable.',
    icon: Film,
    category: 'team',
    defaultEnabled: true,
    sampleMessage: 'Hi [Editor Name], a new post-production deliverable [Deliverable Title] is assigned to you due by [Due Date].'
  },
  {
    id: 'payment_due',
    title: 'Payment due reminder',
    description: 'Reminds the client on the date set in the payment split.',
    icon: CreditCard,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Friendly reminder from [Studio Name]: Payment installment of ₹[Amount] for [Project Title] is due today. Pay securely: https://pixeva.co/pay/[id]'
  },
  {
    id: 'payment_received',
    title: 'Payment received',
    description: 'Confirms to the client when a payment is recorded.',
    icon: CheckCircle2,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Thank you! We received your payment of ₹[Amount] for [Project Title]. Invoice receipt: https://pixeva.co/inv/[id]'
  },
  {
    id: 'deliverable_ready',
    title: 'Deliverable ready',
    description: 'Tells the client when a gallery/deliverable link goes live.',
    icon: Image,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Exciting news! Your gallery for [Project Title] is ready to view and download: https://pixeva.co/g/[id]'
  },
  {
    id: 'event_reminder',
    title: 'Event details reminder',
    description: '15 days before an event, asks the client to confirm location, guest count & contact number.',
    icon: AlertCircle,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Hi [Client Name]! Your event [Event Name] is in 15 days. Please confirm your location, guest count & emergency contact: https://pixeva.co/confirm/[id]'
  },
  {
    id: 'enquiry_ack',
    title: 'Enquiry acknowledgment',
    description: 'Auto-replies when a new enquiry comes in through your public form.',
    icon: MessageCircle,
    category: 'client',
    defaultEnabled: true,
    sampleMessage: 'Thank you for reaching out to [Studio Name]! We received your enquiry and will reply within 24 hours. View info: https://pixeva.co'
  },
  {
    id: 'new_enquiry_alert',
    title: 'New enquiry alert (to you)',
    description: 'Texts your own studio number whenever a new enquiry comes in.',
    icon: BellRing,
    category: 'admin',
    defaultEnabled: true,
    sampleMessage: '⚡ New Enquiry Alert! [Lead Name] requested quote for [Event Type] on [Date]. Phone: [Phone]. Open lead in CRM: https://pixeva.co/crm'
  }
];

interface MessageLog {
  id: string;
  time: string;
  trigger: string;
  channel: 'WhatsApp' | 'Email';
  recipient: string;
  status: 'Delivered' | 'Sent' | 'Failed';
}

const INITIAL_LOGS: MessageLog[] = [
  { id: '1', time: '10 mins ago', trigger: 'New enquiry alert (to you)', channel: 'WhatsApp', recipient: '+91 98200 00000 (Studio)', status: 'Delivered' },
  { id: '2', time: '1 hour ago', trigger: 'Enquiry acknowledgment', channel: 'WhatsApp', recipient: 'Rahul Sharma (+91 98765 43210)', status: 'Delivered' },
  { id: '3', time: '3 hours ago', trigger: 'Deliverable ready', channel: 'WhatsApp', recipient: 'Priya & Vikram (+91 97111 22233)', status: 'Delivered' },
  { id: '4', time: 'Yesterday 18:45', trigger: 'Payment received', channel: 'Email', recipient: 'ananya@example.com', status: 'Delivered' },
  { id: '5', time: 'Yesterday 14:20', trigger: 'Event assignment', channel: 'WhatsApp', recipient: 'Amit Photographer (+91 99887 76655)', status: 'Delivered' },
];

export default function PixevaCRMAIPage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'log'>('whatsapp');
  
  // Toggles state for the 10 triggers
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    AUTOMATED_MESSAGES.forEach(msg => {
      initial[msg.id] = msg.defaultEnabled;
    });
    return initial;
  });

  // Test message states
  const [testPhoneNumber, setTestPhoneNumber] = useState('+91 98200 00000');
  const [selectedTestTrigger, setSelectedTestTrigger] = useState('new_project');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTrigger | null>(null);
  
  // Usage Counter
  const [sentCount, setSentCount] = useState(0);

  // Email Config State
  const [emailSender, setEmailSender] = useState('notifications@pixeva.co');
  const [studioBrandName, setStudioBrandName] = useState('Pixeva Studio');

  // Logs state
  const [logs, setLogs] = useState<MessageLog[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState('');

  const handleToggle = (id: string) => {
    setToggles(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhoneNumber.trim()) return;

    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestSentSuccess(true);
      setSentCount(prev => prev + 1);

      // Add to log
      const selectedItem = AUTOMATED_MESSAGES.find(m => m.id === selectedTestTrigger);
      const newLog: MessageLog = {
        id: Date.now().toString(),
        time: 'Just now',
        trigger: selectedItem?.title || 'Test Message',
        channel: 'WhatsApp',
        recipient: testPhoneNumber,
        status: 'Delivered'
      };
      setLogs(prev => [newLog, ...prev]);

      // Open WhatsApp preview modal
      setShowPreviewModal(true);

      setTimeout(() => {
        setTestSentSuccess(false);
      }, 4000);
    }, 800);
  };

  const activeTriggerObj = AUTOMATED_MESSAGES.find(m => m.id === selectedTestTrigger) || AUTOMATED_MESSAGES[0];

  const filteredLogs = logs.filter(l => 
    l.trigger.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.recipient.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.channel.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Title & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Pixeva CRM AI</h1>
                <span className="badge-cyan text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                  Automated Engine
                </span>
              </div>
              <p className="text-xs text-[#a0a0b0]">
                Automated WhatsApp & email notifications for your studio
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl pixeva-card bg-[#12121a] border border-white/10 text-[#a0a0b0]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-white font-medium">WhatsApp API Online</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2 bg-[#12121a] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'whatsapp'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'email'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'log'
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#3b82f6] text-white shadow-lg glow-cyan'
                : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Log</span>
            {logs.length > 0 && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Links on Top Right */}
        <div className="hidden sm:flex items-center space-x-4 text-xs">
          <a
            href="#how-it-works"
            className="text-[#a0a0b0] hover:text-[#00d4ff] transition-colors flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#00d4ff] hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Get 1:1 setup help</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: WHATSAPP TAB */}
      {/* ========================================================= */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner: Sending via Pixeva's WhatsApp */}
          <div className="p-5 rounded-2xl pixeva-card bg-gradient-to-r from-[#0d1527] via-[#12182b] to-[#17122b] border border-[#00d4ff]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00d4ff]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start space-x-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Sending via Pixeva’s WhatsApp
                  </h2>
                  <span className="badge-emerald text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Channel</span>
                  </span>
                </div>
                <p className="text-xs text-[#a0a0b0] max-w-2xl leading-relaxed">
                  Automated messages send from Pixeva’s shared WhatsApp number, signed off with your own studio branding.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-3 relative z-10">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right">
                <p className="text-[10px] text-[#a0a0b0]">Sender Branding</p>
                <p className="text-xs font-bold text-white">{studioBrandName}</p>
              </div>
            </div>
          </div>

          {/* Usage Meter Card */}
          <div className="p-5 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="text-sm font-bold text-white">WhatsApp usage this month</h3>
              </div>
              <p className="text-xs text-[#a0a0b0]">
                Monthly limit resets on the 1st of every month. Unlimited studio automation plan active.
              </p>
            </div>

            <div className="flex items-center space-x-6 shrink-0">
              <div className="text-right">
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline justify-end space-x-1">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#3b82f6]">
                    {sentCount}
                  </span>
                  <span className="text-xs text-[#a0a0b0] font-normal">messages sent</span>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold">Active & Sending Free</p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#00d4ff]" />
              </div>
            </div>
          </div>

          {/* Automated Messages Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Automated messages</span>
                <span className="text-xs font-normal text-[#a0a0b0] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {AUTOMATED_MESSAGES.filter(m => toggles[m.id]).length} of {AUTOMATED_MESSAGES.length} Enabled
                </span>
              </h3>
              <p className="text-xs text-[#a0a0b0]">
                Turn off any message you don’t want Pixeva sending automatically. Everything below is on by default.
              </p>
            </div>

            {/* List of 10 Automated Triggers */}
            <div className="grid grid-cols-1 gap-3">
              {AUTOMATED_MESSAGES.map((msg) => {
                const IconComponent = msg.icon;
                const isEnabled = toggles[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl pixeva-card transition-all duration-200 flex items-start justify-between gap-4 border ${
                      isEnabled
                        ? 'bg-[#12121a] border-white/10 hover:border-[#00d4ff]/40'
                        : 'bg-[#0f0f16]/60 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                          isEnabled
                            ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30'
                            : 'bg-white/5 text-[#a0a0b0] border border-white/10'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {msg.title}
                          </h4>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.2 rounded ${
                              msg.category === 'client'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : msg.category === 'team'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {msg.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#a0a0b0] leading-relaxed">
                          {msg.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Side Controls: Template Preview Button & Toggle Switch */}
                    <div className="flex items-center space-x-3 shrink-0 self-center">
                      <button
                        onClick={() => {
                          setPreviewTemplate(msg);
                          setShowPreviewModal(true);
                        }}
                        className="text-[11px] font-semibold text-[#a0a0b0] hover:text-[#00d4ff] px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors hidden sm:flex items-center space-x-1"
                        title="Preview message template"
                      >
                        <span>Template</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(msg.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-[#00d4ff]' : 'bg-white/20'
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send a Test Message Card */}
          <div className="p-6 rounded-2xl pixeva-card bg-gradient-to-br from-[#12121a] via-[#141824] to-[#12121a] border border-white/10 space-y-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Send a test message
                </h3>
              </div>
              <p className="text-xs text-[#a0a0b0]">
                See exactly what a Pixeva WhatsApp notification looks like before relying on it.
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Trigger to Test */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#a0a0b0]">
                    Select Message Event Trigger
                  </label>
                  <select
                    value={selectedTestTrigger}
                    onChange={(e) => setSelectedTestTrigger(e.target.value)}
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    {AUTOMATED_MESSAGES.map((msg) => (
                      <option key={msg.id} value={msg.id}>
                        {msg.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#a0a0b0]">
                    Your Mobile Number (with country code)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="flex-1 bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                    />
                    <button
                      type="submit"
                      disabled={isSendingTest}
                      className="btn-pixeva-primary px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                    >
                      {isSendingTest ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send test</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {testSentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Test message successfully dispatched to <strong>{testPhoneNumber}</strong> via Pixeva WhatsApp!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="underline text-[11px] font-bold text-white hover:text-emerald-300"
                  >
                    View WhatsApp Mobile Preview →
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Bottom Help & Feedback Links */}
          <div
            id="how-it-works"
            className="p-5 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center space-x-3">
              <LifeBuoy className="w-5 h-5 text-[#00d4ff]" />
              <div>
                <p className="font-bold text-white">Need help setting up custom WhatsApp API or branding?</p>
                <p className="text-[#a0a0b0]">Our studio onboarding team provides 1:1 setup assistance for your studio.</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="#how-it-works"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                How it works
              </a>
              <a
                href="mailto:support@pixeva.co"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
              >
                Get Help
              </a>
              <a
                href="mailto:feedback@pixeva.co"
                className="px-3 py-1.5 rounded-xl badge-cyan font-bold transition-all"
              >
                Feedback
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EMAIL TAB */}
      {/* ========================================================= */}
      {activeTab === 'email' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-[#00d4ff]" />
                  <h2 className="text-lg font-bold text-white">Studio Email Automation Settings</h2>
                </div>
                <p className="text-xs text-[#a0a0b0]">
                  Configure transactional emails, custom SMTP, and automated client notifications.
                </p>
              </div>
              <span className="badge-emerald text-xs font-bold px-2.5 py-1 rounded-full">
                SMTP Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Default Sender Email Address</label>
                <input
                  type="email"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
                <p className="text-[11px] text-[#a0a0b0]">Client replies will be routed directly to this inbox.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Studio Branding Sign-off</label>
                <input
                  type="text"
                  value={studioBrandName}
                  onChange={(e) => setStudioBrandName(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
                <p className="text-[11px] text-[#a0a0b0]">Appears in email footers and sign-offs.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white">Automated Email Triggers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Payment Received Invoice Receipt</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Deliverable & Gallery Link Email</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Contract Signature Confirmation</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Weekly Production Summary Email</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LOG TAB */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-[#00d4ff]" />
                  <span>Notification Audit Log</span>
                </h2>
                <p className="text-xs text-[#a0a0b0]">
                  Real-time history of all dispatched WhatsApp and Email notifications.
                </p>
              </div>

              {/* Search Log Filter */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
                <input
                  type="text"
                  placeholder="Search log history..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="w-full bg-[#161622] border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#a0a0b0] uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Trigger Event</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Recipient</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 text-[#a0a0b0] whitespace-nowrap">{log.time}</td>
                      <td className="py-3 px-3 font-sans font-bold text-white">{log.trigger}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.channel === 'WhatsApp'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white/90">{log.recipient}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="py-8 text-center text-[#a0a0b0] text-xs">
                  No matching notification logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WHATSAPP MESSAGE PREVIEW MODAL */}
      {/* ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0b141a] rounded-3xl border border-emerald-500/40 shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            {/* Phone Screen WhatsApp Header */}
            <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  PX
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Pixeva WhatsApp</h4>
                  <p className="text-[10px] text-emerald-400">Verified Business Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewTemplate(null);
                }}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 bg-[radial-gradient(#111b21_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] flex-1">
              <div className="flex justify-center">
                <span className="text-[9px] bg-[#182229] text-slate-400 px-2.5 py-0.5 rounded-md font-mono">
                  TODAY
                </span>
              </div>

              {/* Message Bubble */}
              <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tl-none max-w-[90%] shadow-md space-y-2 text-xs leading-relaxed">
                <div className="flex items-center space-x-1.5 border-b border-white/20 pb-1 text-[11px] font-bold text-emerald-200">
                  <Bot className="w-3.5 h-3.5" />
                  <span>{studioBrandName}</span>
                </div>

                <p className="whitespace-pre-wrap">
                  {previewTemplate ? previewTemplate.sampleMessage : activeTriggerObj.sampleMessage}
                </p>

                <div className="flex justify-end items-center space-x-1 text-[9px] text-emerald-200 pt-1">
                  <span>10:45 AM</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#202c33] border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Sample Notification Preview</span>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewTemplate(null);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
