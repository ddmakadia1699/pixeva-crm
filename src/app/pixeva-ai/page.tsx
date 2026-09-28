'use client';

import React, { useState } from 'react';
import {
  Bot,
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
  Smartphone,
  ChevronRight,
  RefreshCw,
  Search,
  Check,
  X,
  Sparkles
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

  // ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPreviewModal(false);
        setPreviewTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Usage Counter
  const [sentCount, setSentCount] = useState(0);

  // Email Config State
  const [emailSender, setEmailSender] = useState('notifications@pixeva.co');
  const [studioBrandName, setStudioBrandName] = useState('Pixeva Studio');

  // Logs state
  const [logs, setLogs] = useState<MessageLog[]>([]);
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
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Title & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pixeva CRM AI
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Automation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated WhatsApp & email notifications for your studio
          </p>
        </div>

        {/* Action Header Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl pixeva-card">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-200 font-medium">WhatsApp API Online</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-slate-100/90 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <MessageCircle className={`w-3.5 h-3.5 ${activeTab === 'whatsapp' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <Mail className={`w-3.5 h-3.5 ${activeTab === 'email' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Email</span>
          </button>

          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'log'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <History className={`w-3.5 h-3.5 ${activeTab === 'log' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Log</span>
            {logs.length > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'log' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Links on Top Right */}
        <div className="hidden sm:flex items-center space-x-4 text-xs">
          <a
            href="#how-it-works"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center space-x-1 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </a>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-700 dark:text-slate-300 hover:underline font-semibold flex items-center space-x-1"
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
        <div className="space-y-6 animate-fadeIn">
          {/* Top Info Card: Channel Status */}
          <div className="p-4 rounded-xl pixeva-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Sending via Pixeva’s WhatsApp
                  </h2>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Channel</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automated messages send from Pixeva’s shared WhatsApp number, signed off with your studio branding.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 text-right">
                <p className="text-[10px] text-slate-400">Sender Branding</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{studioBrandName}</p>
              </div>
            </div>
          </div>

          {/* Usage Meter Card */}
          <div className="p-4 rounded-xl pixeva-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">WhatsApp usage this month</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly limit resets on the 1st of every month. Unlimited studio automation plan active.
              </p>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-baseline justify-end space-x-1">
                  <span>{sentCount}</span>
                  <span className="text-xs text-slate-500 font-normal">messages sent</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium">Active & Sending Free</p>
              </div>
            </div>
          </div>

          {/* Automated Messages Section */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <span>Automated messages</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {AUTOMATED_MESSAGES.filter(m => toggles[m.id]).length} of {AUTOMATED_MESSAGES.length} Enabled
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Turn off any message you don’t want Pixeva sending automatically.
              </p>
            </div>

            {/* List of 10 Automated Triggers */}
            <div className="grid grid-cols-1 gap-2.5">
              {AUTOMATED_MESSAGES.map((msg) => {
                const IconComponent = msg.icon;
                const isEnabled = toggles[msg.id];

                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl pixeva-card transition-all flex items-start justify-between gap-4 border ${
                      isEnabled
                        ? 'hover:border-slate-300 dark:hover:border-slate-700'
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isEnabled
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
                            : 'bg-slate-50 text-slate-400 border border-slate-200/40'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                            {msg.title}
                          </h4>
                          <span
                            className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                          >
                            {msg.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center space-x-1"
                        title="Preview message template"
                      >
                        <span>Template</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(msg.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-950 shadow-xs ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-4' : 'translate-x-0'
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
          <div className="p-5 rounded-xl pixeva-card space-y-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Send a test message
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See exactly what a Pixeva WhatsApp notification looks like before relying on it.
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Select Trigger to Test */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Select Message Event Trigger
                  </label>
                  <select
                    value={selectedTestTrigger}
                    onChange={(e) => setSelectedTestTrigger(e.target.value)}
                    className="w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {AUTOMATED_MESSAGES.map((msg) => (
                      <option key={msg.id} value={msg.id}>
                        {msg.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Phone Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Your Mobile Number (with country code)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="+91 98200 00000"
                      className="flex-1 bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isSendingTest}
                      className="btn-pixeva-primary flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
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
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Test message dispatched to <strong>{testPhoneNumber}</strong> via WhatsApp!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="underline text-[11px] font-semibold hover:text-emerald-900"
                  >
                    View Preview →
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Bottom Help & Feedback Links */}
          <div
            id="how-it-works"
            className="p-4 rounded-xl pixeva-card flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          >
            <div className="flex items-center space-x-2.5">
              <LifeBuoy className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Need help setting up custom WhatsApp API or branding?</p>
                <p className="text-slate-500 dark:text-slate-400">Our studio onboarding team provides 1:1 setup assistance.</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="#how-it-works"
                className="btn-pixeva-secondary"
              >
                How it works
              </a>
              <a
                href="mailto:support@pixeva.co"
                className="btn-pixeva-secondary"
              >
                Get Help
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
          <div className="p-5 rounded-xl pixeva-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Studio Email Settings</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure transactional emails, custom sender address, and automated triggers.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                SMTP Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Default Sender Email</label>
                <input
                  type="email"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <p className="text-[11px] text-slate-400">Client replies will be routed directly to this inbox.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Studio Branding Sign-off</label>
                <input
                  type="text"
                  value={studioBrandName}
                  onChange={(e) => setStudioBrandName(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <p className="text-[11px] text-slate-400">Appears in email footers and sign-offs.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Automated Email Triggers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">Payment Received Invoice Receipt</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Enabled</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">Deliverable & Gallery Link Email</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Enabled</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">Contract Signature Confirmation</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Enabled</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">Weekly Production Summary Email</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Enabled</span>
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
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-xl pixeva-card space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Notification Audit Log</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time history of dispatched WhatsApp and Email notifications.
                </p>
              </div>

              {/* Search Log Filter */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search log history..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="w-full bg-slate-50/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Trigger Event</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.time}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">{log.trigger}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            log.channel === 'WhatsApp'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{log.recipient}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] font-semibold">
                          <Check className="w-3 h-3" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* WhatsApp Header */}
            <div className="bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                  PX
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Pixeva WhatsApp</h4>
                  <p className="text-[10px] text-emerald-600">Verified Business Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewTemplate(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-900/60 flex-1 text-xs">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed shadow-xs">
                {previewTemplate ? previewTemplate.sampleMessage : activeTriggerObj.sampleMessage}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewTemplate(null);
                }}
                className="btn-pixeva-secondary"
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
