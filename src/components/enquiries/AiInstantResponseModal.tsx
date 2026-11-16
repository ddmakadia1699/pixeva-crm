'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  X,
  MessageSquare,
  Mail,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Flame,
  ShieldCheck,
  Send,
  Loader2,
  Sliders,
  DollarSign,
  User,
  Clock,
  Wand2,
  RefreshCw,
  Settings2,
  CheckCheck
} from 'lucide-react';
import { Enquiry, EnquiryStatus } from '@/lib/supabase/types';
import {
  ResponseTone,
  ResponseDraft,
  AiStudioSettings,
  getAiStudioSettings,
  saveAiStudioSettings,
  checkDateAvailability,
  scoreLead,
  generateResponseDrafts,
  buildWhatsAppClickUrl,
} from '@/lib/ai/instantResponse';
import { invokeLambdaFunction } from '@/lib/aws/lambda';
import { useCurrency } from '@/context/CurrencyContext';

interface AiInstantResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: Enquiry | null;
  onUpdateStatus?: (id: string, status: EnquiryStatus) => void;
  onAddNote?: (id: string, note: string) => void;
}

export default function AiInstantResponseModal({
  isOpen,
  onClose,
  enquiry,
  onUpdateStatus,
  onAddNote,
}: AiInstantResponseModalProps) {
  const { formatCurrency } = useCurrency();
  const [selectedTone, setSelectedTone] = useState<ResponseTone>('luxury');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [whatsappSentSuccess, setWhatsappSentSuccess] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AiStudioSettings>(getAiStudioSettings());

  // Reload settings on mount or open
  useEffect(() => {
    if (isOpen) {
      const current = getAiStudioSettings();
      setSettings(current);
      setEmailSentSuccess(false);
      setWhatsappSentSuccess(false);
      setCopied(false);
    }
  }, [isOpen]);

  // Calendar & Lead Scoring computations
  const availability = useMemo(() => {
    if (!enquiry) {
      return {
        isAvailable: true,
        hasConflict: false,
        formattedDate: 'Date TBA',
        daysUntilEvent: 0,
        seasonBadge: 'Standard',
      };
    }
    return checkDateAvailability(enquiry.event_date);
  }, [enquiry]);

  const leadScore = useMemo(() => {
    if (!enquiry) return { score: 50, tier: 'Standard', badgeColor: '', reasons: [] };
    return scoreLead(enquiry, availability);
  }, [enquiry, availability]);

  // Drafts generation
  const drafts = useMemo(() => {
    if (!enquiry) return null;
    return generateResponseDrafts(enquiry, availability, settings);
  }, [enquiry, availability, settings]);

  // Auto-select WhatsApp tone if lead came from WhatsApp or has a verified phone
  useEffect(() => {
    if (enquiry && drafts) {
      if (enquiry.source === 'WhatsApp' || (!enquiry.email && enquiry.phone)) {
        setSelectedTone('whatsapp');
      } else if (enquiry.event_type === 'corporate') {
        setSelectedTone('executive');
      } else {
        setSelectedTone('luxury');
      }
    }
  }, [enquiry]);

  // Update text editor when tone or drafts change
  useEffect(() => {
    if (drafts && drafts[selectedTone]) {
      setEditedSubject(drafts[selectedTone].subject);
      setEditedBody(drafts[selectedTone].body);
    }
  }, [selectedTone, drafts]);

  if (!isOpen || !enquiry) return null;

  const currentDraft = drafts ? drafts[selectedTone] : null;
  const clientPhone = enquiry.phone || enquiry.contact || '';
  const clientEmail = enquiry.email || '';
  const proposalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/proposal/${enquiry.id}`
    : `https://pixeva-crm.vercel.app/proposal/${enquiry.id}`;

  // Quick AI Prompt Modifiers
  const applyQuickModifier = (type: 'early-bird' | 'drone' | 'zoom' | 'shorter') => {
    if (type === 'early-bird') {
      setEditedBody((prev) =>
        prev + `\n\n🎁 Exclusive Courtesy: Confirm your booking within the next 48 hours to receive a complimentary 10% Early-Bird Studio Credit towards fine-art wedding albums or drone coverage!`
      );
    } else if (type === 'drone') {
      setEditedBody((prev) =>
        prev + `\n\n🚁 Production Note: This package automatically includes 4K Cinematic FPV Drone aerial coverage for dramatic establishing landscape shots of your venue.`
      );
    } else if (type === 'zoom') {
      setEditedBody((prev) =>
        prev + `\n\n📅 You can also grab a 15-minute concept chat directly on our calendar: https://calendly.com/pixevastudios/consultation`
      );
    } else if (type === 'shorter') {
      const lines = editedBody.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 4) {
        setEditedBody(`${lines[0]}\n\n${lines[1]}\n\nProposal & Lookbook: ${proposalUrl}\n\nBest,\n${settings.leadPhotographer}`);
      }
    }
  };

  // Copy Message
  const handleCopy = () => {
    const textToCopy = currentDraft?.channel === 'email'
      ? `Subject: ${editedSubject}\n\n${editedBody}`
      : editedBody;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send WhatsApp
  const handleSendWhatsApp = () => {
    if (!clientPhone) {
      alert('This enquiry does not have a phone number attached.');
      return;
    }
    const waUrl = buildWhatsAppClickUrl(clientPhone, editedBody);
    window.open(waUrl, '_blank');
    setWhatsappSentSuccess(true);

    // Update status in CRM
    if (onUpdateStatus && enquiry.status.toLowerCase() === 'new') {
      onUpdateStatus(enquiry.id, 'Follow Up');
    }
    if (onAddNote) {
      onAddNote(enquiry.id, `AI Instant Response dispatched via WhatsApp on ${new Date().toLocaleString()}`);
    }
  };

  // Send Email via AWS Lambda batch-email-service
  const handleSendEmail = async () => {
    if (!clientEmail) {
      alert('This enquiry does not have an email address attached.');
      return;
    }
    setIsSendingEmail(true);

    try {
      await invokeLambdaFunction('batch-email-service', {
        campaignName: 'AI Instant Response Concierge',
        recipients: [clientEmail],
        subject: editedSubject,
        body: editedBody,
        dealId: enquiry.id,
      });

      setEmailSentSuccess(true);
      if (onUpdateStatus) {
        onUpdateStatus(enquiry.id, 'Proposal Sent');
      }
      if (onAddNote) {
        onAddNote(enquiry.id, `AI Instant Response sent via Email (${selectedTone} tone) on ${new Date().toLocaleString()}`);
      }
    } catch (err) {
      console.error('Error dispatching AI email:', err);
      // Fallback: open mailto link
      const mailto = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(editedSubject)}&body=${encodeURIComponent(editedBody)}`;
      window.open(mailto, '_blank');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-[#0f172a] dark:to-indigo-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  AI Instant Response Studio
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  Autonomous Concierge
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crafted for <span className="font-semibold text-slate-700 dark:text-slate-300">{enquiry.name}</span> • {enquiry.event_name || 'Event Inquiry'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Configure AI Studio Persona"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Persona Settings Drawer (Collapsible) */}
        {showSettingsDrawer && (
          <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                <span>AI Studio Persona & Branding</span>
              </div>
              <span className="text-[11px] text-slate-400">Saved to browser storage</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Studio Name</label>
                <input
                  type="text"
                  value={settings.studioName}
                  onChange={(e) => {
                    const next = saveAiStudioSettings({ studioName: e.target.value });
                    setSettings(next);
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Lead Photographer / Director</label>
                <input
                  type="text"
                  value={settings.leadPhotographer}
                  onChange={(e) => {
                    const next = saveAiStudioSettings({ leadPhotographer: e.target.value });
                    setSettings(next);
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Courtesy Hold Duration</label>
                <select
                  value={settings.holdPeriodHours}
                  onChange={(e) => {
                    const next = saveAiStudioSettings({ holdPeriodHours: Number(e.target.value) });
                    setSettings(next);
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours (Recommended)</option>
                  <option value={72}>72 Hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Top Intelligence Insight Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Calendar Availability Card */}
            <div className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
              availability.hasConflict
                ? 'bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-200'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-200'
            }`}>
              {availability.hasConflict ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold uppercase tracking-wider">
                  {availability.hasConflict ? 'Date Conflict Detected' : 'Calendar Date Open'}
                </div>
                <div className="text-xs font-semibold">
                  {availability.formattedDate}
                </div>
                <p className="text-[11px] opacity-80 leading-tight">
                  {availability.hasConflict
                    ? `Clashes with active shoot: "${availability.conflictProjectName}". Associate team suggested.`
                    : `${availability.daysUntilEvent > 0 ? `${availability.daysUntilEvent} days out` : 'Immediate'} • ${availability.seasonBadge}`}
                </p>
              </div>
            </div>

            {/* AI Deal Score & Value */}
            <div className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                {leadScore.score}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lead Value</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${leadScore.badgeColor}`}>
                    {leadScore.tier}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {enquiry.estimated_budget && enquiry.estimated_budget > 0
                    ? formatCurrency(enquiry.estimated_budget)
                    : (enquiry.budget || 'Custom Quote')}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
                  {leadScore.reasons[0] || 'Standard qualified lead'}
                </div>
              </div>
            </div>

            {/* Quick Contact Badge */}
            <div className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact & Source</span>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {clientPhone || clientEmail || 'No contact provided'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Via {enquiry.source || 'Website'} • {enquiry.venue || 'Venue TBA'}
                </div>
              </div>
            </div>

          </div>

          {/* Tone Selector Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>Select Response Tone:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Channel: <strong className="text-slate-700 dark:text-slate-300 capitalize">{currentDraft?.channel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'luxury', label: 'Luxury & Story', icon: Sparkles, desc: 'Weddings & High-End' },
                  { id: 'executive', label: 'Executive & Crisp', icon: ShieldCheck, desc: 'Corporate & Brands' },
                  { id: 'whatsapp', label: 'WhatsApp Fast', icon: MessageSquare, desc: 'Quick 1-Tap Mobile' },
                  { id: 'urgency', label: 'Priority 48h Hold', icon: Flame, desc: 'Scarcity & Direct Close' },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedTone === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTone(tab.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-100 shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{tab.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{tab.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick AI Polishers */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center space-x-1">
              <Wand2 className="w-3 h-3 text-purple-500" />
              <span>Quick Enhancers:</span>
            </span>
            <button
              type="button"
              onClick={() => applyQuickModifier('early-bird')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              + 10% Early-Bird Credit
            </button>
            <button
              type="button"
              onClick={() => applyQuickModifier('drone')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              + 4K FPV Drone Included
            </button>
            <button
              type="button"
              onClick={() => applyQuickModifier('zoom')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              + Add 15-Min Zoom Call Link
            </button>
            <button
              type="button"
              onClick={() => applyQuickModifier('shorter')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Make Shorter
            </button>
          </div>

          {/* Live Editable Message Area */}
          <div className="space-y-2 pt-1">
            {currentDraft?.channel === 'email' && (
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subject Line</label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {currentDraft?.channel === 'whatsapp' ? 'WhatsApp Message Content' : 'Email Message Body'}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {editedBody.length} characters • {editedBody.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full p-3 text-xs leading-relaxed font-sans rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-y"
              />
            </div>
          </div>

          {/* Direct Links Preview */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Attached Live Proposal:</span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-xs">
                {proposalUrl}
              </span>
            </div>
            <a
              href={`/proposal/${enquiry.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>Preview Proposal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2 text-xs">
            {emailSentSuccess && (
              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCheck className="w-4 h-4" />
                <span>Email dispatched via AWS Lambda</span>
              </span>
            )}
            {whatsappSentSuccess && (
              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCheck className="w-4 h-4" />
                <span>WhatsApp opened & lead updated</span>
              </span>
            )}
            {!emailSentSuccess && !whatsappSentSuccess && (
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Clicking send will update lead status to <strong>Follow Up</strong>.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* WhatsApp Send Button */}
            {clientPhone && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
            )}

            {/* Email Send Button */}
            {clientEmail && (
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>{isSendingEmail ? 'Sending via Lambda...' : 'Send Email'}</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
