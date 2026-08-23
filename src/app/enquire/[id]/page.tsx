'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Calculator,
  Film,
  Video,
  BookOpen,
  MonitorPlay,
  HeartHandshake,
  Globe,
  ChevronDown
} from 'lucide-react';

const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';
const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const LANDING_STORAGE_KEY = 'pixeva_landing_page_config';

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateFromUSD: number; // Conversion rate from base USD (1 USD = rate)
}

const GLOBAL_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateFromUSD: 1 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateFromUSD: 83.5 },
  { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', flag: '🇦🇪', rateFromUSD: 3.67 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateFromUSD: 0.79 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateFromUSD: 0.92 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', rateFromUSD: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateFromUSD: 1.52 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateFromUSD: 1.34 },
];

interface ServiceAddon {
  id: string;
  label: string;
  icon: string;
  usdPrice: number;
  selected: boolean;
}

export default function PublicEnquiryPage({ params }: { params: { id: string } }) {
  // Default to USD for global audience
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(GLOBAL_CURRENCIES[0]);

  // Landing Page Configuration State
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  );
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState("Fill in your details and our production team will get back to you within 24 hours.");
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showCalculator, setShowCalculator] = useState(true);
  const [basePriceUSD, setBasePriceUSD] = useState(600); // Standard base package

  // Addons for Estimate Calculator (in USD)
  const [addons, setAddons] = useState<ServiceAddon[]>([
    { id: 'candid', label: 'Candid & Master Photography (Full Day)', icon: '📸', usdPrice: 300, selected: true },
    { id: 'cinema', label: '4K Cinematic Highlight Film & Teaser Reel', icon: '🎬', usdPrice: 420, selected: true },
    { id: 'drone', label: 'Licensed Aerial Drone Cinematography', icon: '🚁', usdPrice: 180, selected: true },
    { id: 'album', label: 'Luxury Hardcover Flush-Mount Album (40 Pages)', icon: '📖', usdPrice: 220, selected: false },
    { id: 'prewed', label: 'Pre-Wedding / Couple Concept Session', icon: '✨', usdPrice: 360, selected: false },
    { id: 'led', label: 'Live LED Video Wall Display (8x12 ft)', icon: '🖥️', usdPrice: 420, selected: false },
  ]);

  // Form State
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

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string>('');

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANDING_STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.coverPhoto) setCoverPhoto(config.coverPhoto);
        if (config.headline) setHeadline(config.headline);
        if (config.subtitle) setSubtitle(config.subtitle);
        if (config.showLocation !== undefined) setShowLocation(config.showLocation);
        if (config.showGuests !== undefined) setShowGuests(config.showGuests);
        if (config.showBudget !== undefined) setShowBudget(config.showBudget);
        if (config.showSource !== undefined) setShowSource(config.showSource);
        if (config.showCalculator !== undefined) setShowCalculator(config.showCalculator);
      }
    } catch (e) {
      console.error('Error loading landing page config:', e);
    }
  }, []);

  // Format amount dynamically according to selected currency
  const formatMoney = (usdAmount: number) => {
    const converted = Math.round(usdAmount * selectedCurrency.rateFromUSD);
    if (selectedCurrency.code === 'INR') {
      return `₹${converted.toLocaleString('en-IN')}`;
    }
    return `${selectedCurrency.symbol}${converted.toLocaleString('en-US')}`;
  };

  // Calculate live estimate in USD
  const totalUsdEstimate = basePriceUSD + addons.filter((a) => a.selected).reduce((sum, a) => sum + a.usdPrice, 0);

  const toggleAddon = (id: string) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !phone || !email) {
      alert('Please enter your Name, WhatsApp Number, and Email.');
      return;
    }

    setIsSubmitting(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const tempId = `enq-${Date.now()}`;
    const formattedDate = eventDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    const formattedPrice = formatMoney(totalUsdEstimate);

    const newEnquiry = {
      id: tempId,
      name: fullName,
      email: email.trim(),
      phone: phone.trim(),
      contact: phone.trim(),
      event_name: `${fullName}'s ${eventType === 'wedding' ? 'Wedding' : eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
      event_type: eventType,
      event_date: formattedDate,
      venue: venue || 'Venue TBA',
      estimated_budget: totalUsdEstimate * 83.5, // Normalized INR
      budget: formattedPrice,
      source: source || 'Landing Page',
      status: 'new',
      notes: `Currency: ${selectedCurrency.code} (${formattedPrice}) | ${notes ? notes + ' | ' : ''}Guests: ${guests} | Addons: ${addons.filter((a) => a.selected).map((a) => a.label.split('(')[0].trim()).join(', ')}`,
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

    // 2. Submit to AWS Lambda backend
    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry),
      });
    } catch (err) {
      console.warn('Cloud trigger offline, stored securely in CRM database.');
    }

    setSubmittedLeadId(tempId);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleOpenWhatsAppChat = () => {
    const rawNum = phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawNum.length === 10 ? `91${rawNum}` : rawNum;
    const msg = `Hi Pixeva Studio! 👋 I just submitted an enquiry on your portal for our ${eventType} on ${eventDate || 'an upcoming date'}.\n\nEstimated Package: ${formatMoney(totalUsdEstimate)} (${selectedCurrency.code}).\n\nLooking forward to speaking with you!`;
    const url = `https://wa.me/918904832762?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Studio Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xl text-slate-900 tracking-tight">Pixeva</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 tracking-wider">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Bespoke Cinematic & Candid Media</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sleek Currency Selector Pill in Header */}
            <div className="relative">
              <select
                value={selectedCurrency.code}
                onChange={(e) => {
                  const found = GLOBAL_CURRENCIES.find((c) => c.code === e.target.value);
                  if (found) setSelectedCurrency(found);
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-colors shadow-2xs"
                title="Select Currency"
              >
                {GLOBAL_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} ({curr.symbol.trim()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <a
              href="https://wa.me/918904832762"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Hero Lookbook Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 aspect-[21/9] sm:aspect-[16/7] group">
          <img
            src={coverPhoto}
            alt="Studio Lookbook Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Official 2026-2027 Calendar Open</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl leading-tight">
              {headline}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mt-1.5 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Confirmation Screen on Submission */}
        {isSubmitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Thank You, {firstName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your enquiry has been received by our lead director. We have created your custom booking file and will reach out via WhatsApp & Email within 24 hours.
              </p>
            </div>

            {/* Summary Box */}
            <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Booking Ref:</span>
                <span className="font-mono font-bold text-sky-600">{submittedLeadId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Event:</span>
                <span className="font-bold text-slate-900 capitalize">{eventType} Shoot</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Event Date:</span>
                <span className="font-bold text-slate-900">{eventDate || 'To be confirmed'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Estimated Package:</span>
                <span className="font-mono font-black text-emerald-600 text-base">
                  {formatMoney(totalUsdEstimate)} {selectedCurrency.code}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleOpenWhatsAppChat}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Director on WhatsApp</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Back to Pixeva Studio</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Live Estimate Calculator */}
            {showCalculator && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
                
                {/* Header with Integrated Price & Currency */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        Live Estimate Calculator
                      </h2>
                      <p className="text-xs text-slate-500">
                        Choose your deliverables for an instant ballpark
                      </p>
                    </div>
                  </div>

                  {/* Clean Estimated Package Display with Currency Switcher */}
                  <div className="flex items-center space-x-3 self-start sm:self-auto bg-slate-50 p-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200/80">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        Estimated Total
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-sky-600">
                        {formatMoney(totalUsdEstimate)}
                      </span>
                    </div>

                    <div className="border-l border-slate-200 pl-3">
                      <select
                        value={selectedCurrency.code}
                        onChange={(e) => {
                          const found = GLOBAL_CURRENCIES.find((c) => c.code === e.target.value);
                          if (found) setSelectedCurrency(found);
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                      >
                        {GLOBAL_CURRENCIES.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.flag} {curr.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Deliverables Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        addon.selected
                          ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 pr-2">
                        <span className="text-xl group-hover:scale-110 transition-transform">{addon.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{addon.label}</p>
                          <span className="font-mono text-xs font-extrabold text-sky-600">
                            +{formatMoney(addon.usdPrice)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                          addon.selected ? 'bg-sky-600 border-sky-600 text-white shadow-xs' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {addon.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Client & Shoot Details Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Your Contact & Event Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  We maintain strict privacy and will never share your personal information.
                </p>
              </div>

              {/* Row 1: Name */}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Vance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    WhatsApp / Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000 or +91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-medium font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Event Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Event / Shoot Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-bold cursor-pointer"
                  >
                    <option value="wedding">💍 Destination Wedding & Celebrations</option>
                    <option value="pre-wedding">✨ Pre-Wedding / Couple Concept Session</option>
                    <option value="reception">🥂 Reception & Cocktail Gala</option>
                    <option value="corporate">💼 Corporate Summit & Keynote Meet</option>
                    <option value="commercial">📸 Fashion & Commercial Campaign</option>
                    <option value="birthday">🎉 Birthday & Private Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Shoot / Event Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Optional Fields (Location & Guests) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {showLocation && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Venue / Destination
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. Paris / Beverly Hills / Dubai"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 font-medium"
                      />
                    </div>
                  </div>
                )}

                {showGuests && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Approx. Number of Guests
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
                      >
                        <option value="Under 100">Intimate Gathering (Under 100)</option>
                        <option value="100 - 300">100 to 300 Guests</option>
                        <option value="300 - 500">Grand Celebration (300 to 500)</option>
                        <option value="500+">Royal Mega Gathering (500+)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 5: Source */}
              {showSource && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    How did you discover Pixeva Studio?
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
                  >
                    <option value="Instagram">Instagram Reels / Post</option>
                    <option value="Friend / Referral">Friend / Client Referral</option>
                    <option value="Website">Official Portfolio Website</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Wedding Planner">Event Producer Recommendation</option>
                  </select>
                </div>
              )}

              {/* Row 6: Requirements / Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Vision, Itinerary, or Creative Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about special moments, timeline details, drone permits, or preferred visual aesthetic..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Securing Your Booking File...' : `Submit Enquiry (${formatMoney(totalUsdEstimate)})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Badges Footer */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500 pt-2">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified 4K Production Studio</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-sky-600" />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Pixeva Studio. All rights reserved. • International Cinematic & Photography Portal</p>
      </footer>
    </div>
  );
}
