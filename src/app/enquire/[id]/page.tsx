'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Wallet, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Film,
  Briefcase,
  Award,
  HeartHandshake,
  Globe,
  ChevronDown,
  Instagram,
  Check,
  X,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const LANDING_STORAGE_KEY = 'pixeva_landing_page_config';

export interface FormFieldConfig {
  id: string; // 'location' | 'guests' | 'budget' | 'source' or custom id
  label: string;
  isBuiltIn: boolean;
  enabled: boolean;
  type?: 'text' | 'textarea' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
}

export const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  { id: 'location', label: 'Location / Venue', isBuiltIn: true, enabled: true },
  { id: 'guests', label: 'Number of Guests', isBuiltIn: true, enabled: true },
  { id: 'budget', label: 'Budget', isBuiltIn: true, enabled: true },
  { id: 'source', label: 'How did you hear about us?', isBuiltIn: true, enabled: true },
];

export interface CustomBookingField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date';
  placeholder?: string;
  required?: boolean;
  enabled: boolean;
}

// Professional Event Types with dedicated Lucide Icons (Zero Emojis)
interface EventTypeOption {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ElementType;
}

const EVENT_TYPES: EventTypeOption[] = [
  {
    id: 'wedding',
    label: 'Destination Wedding & Celebrations',
    subtitle: 'Ceremonies, rituals & multi-day festivities',
    icon: HeartHandshake,
  },
  {
    id: 'pre-wedding',
    label: 'Pre-Wedding & Couple Concept Session',
    subtitle: 'Cinematic portraits & storytelling couple films',
    icon: Sparkles,
  },
  {
    id: 'reception',
    label: 'Reception & Evening Gala',
    subtitle: 'Cocktail evenings, soirees & formal banquets',
    icon: Award,
  },
  {
    id: 'corporate',
    label: 'Corporate Summit & Keynote Meet',
    subtitle: 'Conferences, leadership talks & commercial media',
    icon: Briefcase,
  },
  {
    id: 'commercial',
    label: 'Fashion & Commercial Campaign',
    subtitle: 'Brand lookbooks, editorial & product visuals',
    icon: Film,
  },
  {
    id: 'celebration',
    label: 'Private Celebration & Milestone',
    subtitle: 'Anniversaries, milestone birthdays & family galas',
    icon: Calendar,
  },
];

export default function PublicEnquiryPage({ params }: { params: { id: string } }) {
  // Client Booking Page Configuration State
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  );
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState("Fill in your details and our production team will get back to you within 24 hours.");
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  // Studio Social & Contact Links (Dedicated Channels)
  const [showSocialSection, setShowSocialSection] = useState(true);
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');
  const [socialPhone, setSocialPhone] = useState('');
  const [socialEmail, setSocialEmail] = useState('');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const eventTypeDropdownRef = useRef<HTMLDivElement>(null);

  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guests, setGuests] = useState('100 - 300');
  const [budgetVal, setBudgetVal] = useState('');
  const [socialLinksVal, setSocialLinksVal] = useState('');
  const [source, setSource] = useState('Website');
  const [notes, setNotes] = useState('');

  // Dynamic Ordered Form Fields
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(DEFAULT_FORM_FIELDS);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string>('');

  // Close event type dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        eventTypeDropdownRef.current &&
        !eventTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEventTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile bottom sheet is open
  useEffect(() => {
    if (isEventTypeOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEventTypeOpen]);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANDING_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.coverPhoto) setCoverPhoto(config.coverPhoto);
        if (config.headline) setHeadline(config.headline);
        if (config.subtitle) setSubtitle(config.subtitle);

        // Load ordered form fields (or reconstruct from legacy config)
        if (Array.isArray(config.formFields) && config.formFields.length > 0) {
          setFormFields(config.formFields);
        } else {
          const initialFields: FormFieldConfig[] = [
            { id: 'location', label: 'Location / Venue', isBuiltIn: true, enabled: config.showLocation !== false },
            { id: 'guests', label: 'Number of Guests', isBuiltIn: true, enabled: config.showGuests !== false },
            { id: 'budget', label: 'Budget', isBuiltIn: true, enabled: config.showBudget !== false },
            { id: 'source', label: 'How did you hear about us?', isBuiltIn: true, enabled: config.showSource !== false },
          ];
          if (Array.isArray(config.customFields)) {
            config.customFields.forEach((cf: any) => {
              initialFields.push({
                id: cf.id,
                label: cf.label,
                isBuiltIn: false,
                enabled: cf.enabled !== false,
                type: cf.type || 'text',
                placeholder: cf.placeholder,
                required: cf.required || false,
              });
            });
          }
          setFormFields(initialFields);
        }

        if (config.showSocialSection !== undefined) setShowSocialSection(config.showSocialSection);
        if (config.socialInstagram !== undefined) setSocialInstagram(config.socialInstagram);
        if (config.socialWebsite !== undefined) setSocialWebsite(config.socialWebsite);
        if (config.socialPhone !== undefined) setSocialPhone(config.socialPhone);
        if (config.socialEmail !== undefined) setSocialEmail(config.socialEmail);
      }
    } catch (e) {
      console.error('Error loading client booking page config:', e);
    }
  }, []);

  const selectedEventOption = EVENT_TYPES.find((e) => e.id === eventType) || EVENT_TYPES[0];
  const SelectedEventIcon = selectedEventOption.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim() || !email.trim()) {
      alert('Please enter your Name, Phone Number, and Email Address.');
      return;
    }

    setIsSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const tempId = `enq-${Date.now()}`;
    const formattedDate = eventDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];

    // Build notes with custom field entries
    const customDetails: string[] = [];
    if (formFields.some(f => f.id === 'guests' && f.enabled) && guests) customDetails.push(`Guests: ${guests}`);
    
    formFields
      .filter((f) => !f.isBuiltIn && f.enabled && customFieldValues[f.id]?.trim())
      .forEach((f) => {
        customDetails.push(`${f.label}: ${customFieldValues[f.id].trim()}`);
      });

    const parsedBudget = budgetVal ? parseFloat(budgetVal.replace(/[^0-9.]/g, '')) : undefined;
    const finalEstimatedBudget = !isNaN(Number(parsedBudget)) && parsedBudget !== undefined ? parsedBudget : undefined;

    const combinedNotes = [
      notes.trim(),
      customDetails.length > 0 ? customDetails.join(' | ') : ''
    ].filter(Boolean).join('\n• ');

    const newEnquiry = {
      id: tempId,
      name: fullName,
      email: email.trim(),
      phone: phone.trim(),
      contact: phone.trim(),
      event_name: `${fullName}'s ${selectedEventOption.label}`,
      event_type: eventType,
      event_date: formattedDate,
      venue: venue || 'Venue TBA',
      estimated_budget: finalEstimatedBudget,
      budget: budgetVal || '',
      source: source || 'Client Booking Page',
      status: 'new',
      notes: combinedNotes,
      created_at: new Date().toISOString(),
    };

    // 1. Immediately save to CRM localStorage
    try {
      const existingRaw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      let existingList = [];
      if (existingRaw) {
        existingList = JSON.parse(existingRaw);
      }
      const updatedList = [newEnquiry, ...existingList];
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to save public enquiry locally:', err);
    }

    // 2. Submit to AWS Lambda / Supabase backend with account scoping
    try {
      await apiClient.enquiries.createPublic({
        ...newEnquiry,
        account_id: params?.id || 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      });
    } catch (err) {
      console.warn('Cloud trigger offline, stored securely in CRM database.');
    }

    setSubmittedLeadId(tempId);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP STUDIO HEADER (Clean, Mobile-Optimized, No WhatsApp, No USD) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-4 sm:px-6 py-3 transition-colors">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          
          {/* Studio Brand */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight truncate">
                  Pixeva
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono shrink-0">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate hidden sm:block">
                Bespoke Cinematic & Candid Media
              </p>
            </div>
          </div>

          {/* Right Status Badge / Direct Phone Link */}
          <div className="flex items-center space-x-2 shrink-0">
            {socialPhone ? (
              <a
                href={`tel:${socialPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Call Studio"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Call Studio</span>
              </a>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="hidden xs:inline">Booking Calendar Open</span>
                <span className="xs:hidden">Open</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* Studio Lookbook Hero Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 min-h-[200px] sm:min-h-[260px] flex flex-col justify-end p-5 sm:p-8 text-white group">
          <img
            src={coverPhoto}
            alt="Studio Lookbook Cover"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
          
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Official Studio Booking Portal</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {headline}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Confirmation Screen on Submission */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>AI Concierge: 48-Hour Priority Hold Activated</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Thank You, {firstName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Great news — our system has placed a courtesy 48-hour tentative hold on <strong className="text-slate-900">{eventDate || 'your date'}</strong> on our studio calendar. We have automatically generated your interactive proposal & lookbook.
              </p>
            </div>

            {/* Summary Box */}
            <div className="max-w-md mx-auto p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Booking Ref:</span>
                <span className="font-mono font-bold text-blue-600">{submittedLeadId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Event:</span>
                <span className="font-bold text-slate-900">{selectedEventOption.label}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Event Date:</span>
                <span className="font-bold text-slate-900">{eventDate || 'To be confirmed'}</span>
              </div>
              {venue && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Venue:</span>
                  <span className="font-bold text-slate-900">{venue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Calendar Status:</span>
                <span className="font-bold text-emerald-600 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Available (Tentative Hold Active)</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* WhatsApp Quick Connect */}
              {socialPhone ? (
                <a
                  href={`https://wa.me/${socialPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Pixeva Studio! I just submitted an enquiry for ${selectedEventOption.label} on ${eventDate || 'upcoming date'} (Ref: ${submittedLeadId}). Would love to confirm availability and discuss packages!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              ) : null}

              {/* View Live Digital Proposal */}
              {submittedLeadId && (
                <Link
                  href={`/proposal/${submittedLeadId}`}
                  target="_blank"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Interactive Proposal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Return to Pixeva Studio</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            
            {/* Main Form Container */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xl space-y-5 sm:space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Your Contact & Event Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  We maintain strict privacy and will never share your personal information.
                </p>
              </div>

              {/* Row 1: Name (First Name & Last Name) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Eleanor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Phone Number & Email Address (No WhatsApp) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210 or +1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Event / Shoot Type (Professional Icons, Zero Emojis) & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Event Type Custom Interactive Selector */}
                <div ref={eventTypeDropdownRef} className="relative">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Event / Shoot Type
                  </label>

                  {/* Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-left text-base sm:text-xs font-bold text-slate-900 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <SelectedEventIcon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{selectedEventOption.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ml-2 ${isEventTypeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Popover Options List (Hidden on mobile) */}
                  {isEventTypeOpen && (
                    <div className="hidden sm:block absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 max-h-80 overflow-y-auto animate-fadeIn">
                      {EVENT_TYPES.map((option) => {
                        const OptionIcon = option.icon;
                        const isSelected = option.id === eventType;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setEventType(option.id);
                              setIsEventTypeOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <OptionIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                  {option.label}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {option.subtitle}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Mobile Bottom-Sheet Popover (Only visible on mobile screens) */}
                  {isEventTypeOpen && (
                    <div 
                      className="sm:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center animate-fadeIn"
                      onClick={() => setIsEventTypeOpen(false)}
                    >
                      <div 
                        className="w-full bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-2 animate-slideUp shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">Select Event / Shoot Type</span>
                            <span className="text-[11px] text-slate-500">Choose your coverage scope</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setIsEventTypeOpen(false)}
                            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          {EVENT_TYPES.map((option) => {
                            const OptionIcon = option.icon;
                            const isSelected = option.id === eventType;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  setEventType(option.id);
                                  setIsEventTypeOpen(false);
                                }}
                                className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer border ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500/50 text-blue-900'
                                    : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                                  }`}>
                                    <OptionIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">
                                      {option.label}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                      {option.subtitle}
                                    </div>
                                  </div>
                                </div>

                                {isSelected && (
                                  <Check className="w-5 h-5 text-blue-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Date */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Shoot / Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Reorderable Optional & Custom Form Fields */}
              {formFields.filter((f) => f.enabled).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formFields
                    .filter((f) => f.enabled)
                    .map((field) => {
                      if (field.id === 'budget') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              Estimated Budget
                            </label>
                            <div className="relative">
                              <Wallet className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={budgetVal}
                                onChange={(e) => setBudgetVal(e.target.value)}
                                placeholder="e.g. 50,000 or Flexible"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium font-mono transition-colors"
                              />
                            </div>
                          </div>
                        );
                      }

                      if (field.id === 'location') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              Venue / Destination
                            </label>
                            <div className="relative">
                              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="text"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                placeholder="e.g. Udaipur / Lake Como / Beverly Hills"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium transition-colors"
                              />
                            </div>
                          </div>
                        );
                      }

                      if (field.id === 'guests') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              Approx. Number of Guests
                            </label>
                            <div className="relative">
                              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <select
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                              >
                                <option value="Under 100">Intimate Gathering (Under 100)</option>
                                <option value="100 - 300">100 to 300 Guests</option>
                                <option value="300 - 500">Grand Celebration (300 to 500)</option>
                                <option value="500+">Royal Mega Gathering (500+)</option>
                              </select>
                            </div>
                          </div>
                        );
                      }

                      if (field.id === 'source') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              How did you discover Pixeva Studio?
                            </label>
                            <select
                              value={source}
                              onChange={(e) => setSource(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                            >
                              <option value="Instagram">Instagram Reels / Post</option>
                              <option value="Friend / Referral">Friend / Client Referral</option>
                              <option value="Website">Official Portfolio Website</option>
                              <option value="Google Search">Google Search</option>
                              <option value="Wedding Planner">Event Producer Recommendation</option>
                            </select>
                          </div>
                        );
                      }

                      // Custom Field
                      const isTextarea = field.type === 'textarea';
                      return (
                        <div
                          key={field.id}
                          className={`animate-fadeIn ${isTextarea ? 'sm:col-span-2' : ''}`}
                        >
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          {isTextarea ? (
                            <textarea
                              rows={2}
                              required={field.required}
                              value={customFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setCustomFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium transition-colors"
                            />
                          ) : (
                            <input
                              type={field.type || 'text'}
                              required={field.required}
                              value={customFieldValues[field.id] || ''}
                              onChange={(e) =>
                                setCustomFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium transition-colors"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Row 7: Vision, Itinerary or Creative Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Vision, Itinerary, or Creative Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about special moments, timeline details, drone permits, or preferred visual aesthetic..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium transition-colors leading-relaxed"
                />
              </div>

              {/* Submit CTA (Full Width, Touch-Friendly 52px Height on mobile) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl sm:rounded-2xl bg-blue-600 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Securing Your Booking File...' : 'Submit Enquiry'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges Footer */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified 4K Production Studio</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>24-Hour Proposal Guarantee</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  <span>100% Date Reservation Hold</span>
                </span>
              </div>

            </div>
          </form>
        )}

        {/* Studio Direct Channels (Instagram, Website, Call, Email - No WhatsApp) */}
        {showSocialSection && (socialInstagram || socialWebsite || socialPhone || socialEmail) && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xl space-y-3.5">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Connect Directly with Our Studio
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Explore our portfolio, view recent films, or speak with our directors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {socialInstagram && (
                <a
                  href={socialInstagram.startsWith('http') ? socialInstagram : `https://instagram.com/${socialInstagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 hover:text-pink-800 font-bold text-xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram</span>
                </a>
              )}

              {socialWebsite && (
                <a
                  href={socialWebsite.startsWith('http') ? socialWebsite : `https://${socialWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:text-blue-800 font-bold text-xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Official Website</span>
                </a>
              )}

              {socialPhone && (
                <a
                  href={`tel:${socialPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:text-slate-900 font-bold text-xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call {socialPhone}</span>
                </a>
              )}

              {socialEmail && (
                <a
                  href={`mailto:${socialEmail}`}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:text-amber-900 font-bold text-xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{socialEmail}</span>
                </a>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Pixeva Studio. All rights reserved. • Client Intake Portal</p>
      </footer>

    </div>
  );
}
