'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Film,
  Plane,
  BookOpen,
  Heart,
  MonitorPlay,
  Check,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  Clock,
  Lock,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/apiClient';
import { useCurrency } from '@/context/CurrencyContext';
import { roundMoney } from '@/lib/utils';

const LANDING_STORAGE_KEY = 'pixeva_landing_page_config';
const STUDIO_WHATSAPP = '918904832762';

interface ServiceAddon {
  id: string;
  label: string;
  icon: LucideIcon;
  priceInr: number; // Prices are held in INR (the CRM base currency) and converted for display
  selected: boolean;
}

const BASE_PACKAGE_INR = 50000;

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'wedding', label: 'Wedding & Celebrations' },
  { value: 'pre-wedding', label: 'Pre-Wedding / Couple Session' },
  { value: 'reception', label: 'Reception & Gala' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'commercial', label: 'Fashion & Commercial' },
  { value: 'birthday', label: 'Birthday & Private Event' },
];

const inputClass =
  'w-full bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors';
const labelClass = 'text-xs font-medium text-stone-600 block mb-1.5';

export default function PublicEnquiryPage({ params }: { params: { id: string } }) {
  const studioAccountId = params?.id;
  const { currencies, currencyCode, formatCurrency } = useCurrency();

  // The studio's share link carries its display currency (?currency=AED); otherwise fall back
  // to the currency saved in this browser (e.g. the studio previewing its own page).
  const [linkCurrency, setLinkCurrency] = useState<string | null>(null);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('currency')?.toUpperCase();
    if (code && currencies.some((c) => c.code === code)) setLinkCurrency(code);
  }, [currencies]);
  const displayCode = linkCurrency || currencyCode;
  const money = (inr: number) => formatCurrency(inr, displayCode, 'INR', 2);

  // Landing page configuration
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  );
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState('Share a few details and our team will get back to you within 24 hours.');
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showCalculator, setShowCalculator] = useState(true);

  const [addons, setAddons] = useState<ServiceAddon[]>([
    { id: 'candid', label: 'Candid & master photography (full day)', icon: Camera, priceInr: 25000, selected: true },
    { id: 'cinema', label: '4K cinematic highlight film & teaser', icon: Film, priceInr: 35000, selected: true },
    { id: 'drone', label: 'Licensed aerial drone coverage', icon: Plane, priceInr: 15000, selected: true },
    { id: 'album', label: 'Hardcover flush-mount album (40 pages)', icon: BookOpen, priceInr: 18000, selected: false },
    { id: 'prewed', label: 'Pre-wedding / couple session', icon: Heart, priceInr: 30000, selected: false },
    { id: 'led', label: 'Live LED video wall (8 × 12 ft)', icon: MonitorPlay, priceInr: 35000, selected: false },
  ]);

  // Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guests, setGuests] = useState('100 - 300');
  const [source, setSource] = useState('Website');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    try {
      const saved = null /* localStorage.getItem(LANDING_STORAGE_KEY) */;
      if (saved) {
        const config = JSON.parse(saved);
        if (config.coverPhoto) setCoverPhoto(config.coverPhoto);
        if (config.headline) setHeadline(config.headline);
        if (config.subtitle) setSubtitle(config.subtitle);
        if (config.showLocation !== undefined) setShowLocation(config.showLocation);
        if (config.showGuests !== undefined) setShowGuests(config.showGuests);
        if (config.showSource !== undefined) setShowSource(config.showSource);
        if (config.showCalculator !== undefined) setShowCalculator(config.showCalculator);
      }
    } catch (e) {
      console.error('Error loading landing page config:', e);
    }
  }, []);

  const selectedAddons = addons.filter((a) => a.selected);
  const totalInr = roundMoney(BASE_PACKAGE_INR + selectedAddons.reduce((sum, a) => sum + a.priceInr, 0));
  const eventTypeLabel = EVENT_TYPES.find((t) => t.value === eventType)?.label || eventType;

  const toggleAddon = (id: string) => {
    setAddons((prev) => prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !phone || !email) {
      setSubmitError('Please enter your name, phone number and email address.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const formattedDate = eventDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    const estimate = money(totalInr);

    const enquiry = {
      name: fullName,
      email: email.trim(),
      phone: phone.trim(),
      contact: phone.trim(),
      event_name: `${fullName}'s ${eventTypeLabel}`,
      event_type: eventType,
      event_date: formattedDate,
      venue: venue || 'Venue TBA',
      estimated_budget: totalInr,
      budget: estimate,
      source: source || 'Landing Page',
      status: 'new',
      notes: [
        `Estimate: ${estimate} (${displayCode})`,
        notes.trim(),
        `Guests: ${guests}`,
        `Services: ${selectedAddons.map((a) => a.label).join(', ') || 'Base package only'}`,
      ]
        .filter(Boolean)
        .join(' | '),
      account_id: studioAccountId,
    };

    try {
      const created = await apiClient.enquiries.create(enquiry, studioAccountId);
      if (!created) throw new Error('No response');
      setReferenceId(String(created.id || '').slice(0, 8).toUpperCase());
      setIsSubmitted(true);
    } catch {
      setSubmitError('We could not send your enquiry just now. Please try again, or contact us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsAppChat = () => {
    const msg = `Hello, I have just sent an enquiry through your website for a ${eventTypeLabel.toLowerCase()} on ${
      eventDate || 'a date to be confirmed'
    }. Estimated package: ${money(totalInr)}. I look forward to hearing from you.`;
    window.open(`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <span className="font-serif text-xl tracking-tight text-stone-900">Pixeva Studio</span>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mt-0.5">Photography & Film</p>
          </div>
          <a
            href={`https://wa.me/${STUDIO_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Hero */}
        <section className="relative rounded-xl overflow-hidden bg-stone-900 aspect-[16/9] sm:aspect-[21/8]">
          <img src={coverPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-200 mb-2">Now booking 2026 – 2027</p>
            <h1 className="font-serif text-2xl sm:text-4xl leading-tight max-w-2xl">{headline}</h1>
            <p className="text-sm text-stone-200 max-w-xl mt-2">{subtitle}</p>
          </div>
        </section>

        {isSubmitted ? (
          <section className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 text-center space-y-6">
            <CheckCircle2 className="w-10 h-10 text-stone-800 mx-auto" strokeWidth={1.5} />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl">Thank you, {firstName}.</h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                We have received your enquiry and will be in touch by email or WhatsApp within 24 hours.
              </p>
            </div>

            <dl className="max-w-md mx-auto rounded-lg border border-stone-200 divide-y divide-stone-200 text-left text-sm">
              {referenceId && (
                <div className="flex justify-between px-4 py-2.5">
                  <dt className="text-stone-500">Reference</dt>
                  <dd className="font-mono text-stone-900">{referenceId}</dd>
                </div>
              )}
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-stone-500">Event</dt>
                <dd className="text-stone-900">{eventTypeLabel}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-stone-500">Date</dt>
                <dd className="text-stone-900">{eventDate || 'To be confirmed'}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-stone-500">Estimated package</dt>
                <dd className="font-mono font-semibold text-stone-900">{money(totalInr)}</dd>
              </div>
            </dl>

            <button
              onClick={handleOpenWhatsAppChat}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Continue on WhatsApp</span>
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Estimate */}
            {showCalculator && (
              <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5">
                  <div>
                    <h2 className="font-serif text-xl">Build your estimate</h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Select the services you are interested in. Base package included: {money(BASE_PACKAGE_INR)}.
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-stone-500 block">Estimated total</span>
                    <span className="font-mono text-2xl font-semibold text-stone-900">{money(totalInr)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addons.map((addon) => {
                    const Icon = addon.icon;
                    return (
                      <button
                        type="button"
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        aria-pressed={addon.selected}
                        className={`p-4 rounded-lg border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          addon.selected
                            ? 'border-stone-900 bg-stone-50'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-4 h-4 text-stone-500 shrink-0" strokeWidth={1.75} />
                          <div className="min-w-0">
                            <p className="text-sm text-stone-900 leading-snug">{addon.label}</p>
                            <span className="font-mono text-xs text-stone-600">+ {money(addon.priceInr)}</span>
                          </div>
                        </div>
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            addon.selected ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-300 bg-white'
                          }`}
                        >
                          {addon.selected && <Check className="w-3.5 h-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-stone-500">
                  Prices shown in {displayCode}, converted at today&apos;s exchange rate. This is an estimate; your final
                  quote will be confirmed by our team.
                </p>
              </section>
            )}

            {/* Details */}
            <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-xl">Your details</h2>
                <p className="text-xs text-stone-500 mt-1">Your information is used only to respond to your enquiry.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enq-first" className={labelClass}>
                    First name <span className="text-stone-400">*</span>
                  </label>
                  <input id="enq-first" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="enq-last" className={labelClass}>Last name</label>
                  <input id="enq-last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enq-phone" className={labelClass}>
                    Phone / WhatsApp <span className="text-stone-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="enq-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Include country code"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="enq-email" className={labelClass}>
                    Email address <span className="text-stone-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="enq-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enq-type" className={labelClass}>Event type</label>
                  <select id="enq-type" value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="enq-date" className={labelClass}>Event date</label>
                  <input id="enq-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              {(showLocation || showGuests) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showLocation && (
                    <div>
                      <label htmlFor="enq-venue" className={labelClass}>Venue / city</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input id="enq-venue" type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className={`${inputClass} pl-9`} />
                      </div>
                    </div>
                  )}
                  {showGuests && (
                    <div>
                      <label htmlFor="enq-guests" className={labelClass}>Approximate guests</label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select id="enq-guests" value={guests} onChange={(e) => setGuests(e.target.value)} className={`${inputClass} pl-9 cursor-pointer`}>
                          <option value="Under 100">Under 100</option>
                          <option value="100 - 300">100 – 300</option>
                          <option value="300 - 500">300 – 500</option>
                          <option value="500+">500+</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showSource && (
                <div>
                  <label htmlFor="enq-source" className={labelClass}>How did you hear about us?</label>
                  <select id="enq-source" value={source} onChange={(e) => setSource(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    <option value="Instagram">Instagram</option>
                    <option value="Friend / Referral">Friend or client referral</option>
                    <option value="Website">Our website</option>
                    <option value="Google Search">Google search</option>
                    <option value="Wedding Planner">Planner recommendation</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="enq-notes" className={labelClass}>Anything else we should know?</label>
                <textarea
                  id="enq-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Timeline, key moments, style preferences…"
                  className={inputClass}
                />
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Sending…' : 'Send enquiry'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Reply within 24 hours
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Your details stay private
                </span>
              </div>
            </section>
          </form>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Pixeva Studio. All rights reserved.
      </footer>
    </div>
  );
}
