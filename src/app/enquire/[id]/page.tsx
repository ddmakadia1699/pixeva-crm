'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Sparkles,
  Send,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Instagram,
  Globe,
  ArrowRight,
  ShieldCheck,
  Star,
  Check,
  Calculator,
  Flame,
  Award,
  Video,
  Film,
  Compass,
  HeartHandshake,
  CheckCircle
} from 'lucide-react';
import { Enquiry } from '@/lib/supabase/types';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const CONFIG_STORAGE_KEY = 'pixeva_landing_page_config';
const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';

export default function PublicEnquiryPage({ params }: { params?: { id?: string } }) {
  // Studio Config State
  const [coverPhoto, setCoverPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  );
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState(
    "Fill in your details and we'll get back to you with a bespoke photography & cinema proposal within 24 hours."
  );
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [startingPrice, setStartingPrice] = useState<string>('150000');

  // Client Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_type: 'wedding',
    event_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    venue: '',
    guests: '',
    budget: '200000',
    source: 'Instagram',
    notes: '',
  });

  // Dynamic Calculator Selection
  const [calcCoverage, setCalcCoverage] = useState<'1-day' | '2-day' | '3-day'>('2-day');
  const [calcCinematography, setCalcCinematography] = useState<boolean>(true);
  const [calcDrone, setCalcDrone] = useState<boolean>(true);
  const [calcRawFootage, setCalcRawFootage] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string>('');

  // Load Studio Customizations
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.coverPhoto) setCoverPhoto(parsed.coverPhoto);
        if (parsed.headline) setHeadline(parsed.headline);
        if (parsed.subtitle) setSubtitle(parsed.subtitle);
        if (parsed.showLocation !== undefined) setShowLocation(parsed.showLocation);
        if (parsed.showGuests !== undefined) setShowGuests(parsed.showGuests);
        if (parsed.showBudget !== undefined) setShowBudget(parsed.showBudget);
        if (parsed.showSource !== undefined) setShowSource(parsed.showSource);
        if (parsed.showCalculator !== undefined) setShowCalculator(parsed.showCalculator);
        if (parsed.startingPrice) setStartingPrice(parsed.startingPrice);
      }
    } catch (e) {
      console.error('Error reading landing page config:', e);
    }
  }, []);

  // Compute ballpark estimate
  const calculateEstimate = () => {
    let base = Number(startingPrice) || 120000;
    if (calcCoverage === '2-day') base *= 1.75;
    if (calcCoverage === '3-day') base *= 2.4;
    if (calcCinematography) base += 45000;
    if (calcDrone) base += 25000;
    if (calcRawFootage) base += 15000;
    return Math.round(base);
  };

  const calculatedTotal = calculateEstimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    const newId = `enq-${Date.now()}`;
    const rawBudget = String(showCalculator ? calculatedTotal : formData.budget).replace(/[^0-9]/g, '');
    const numericBudget = rawBudget ? Number(rawBudget) : 200000;

    const newEnquiry: Enquiry = {
      id: newId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      contact: formData.phone.trim() || formData.email.trim(),
      event_name: `${formData.name.trim()}'s ${formData.event_type.toUpperCase()} Shoot`,
      event_type: formData.event_type,
      event_date: formData.event_date,
      received_on: new Date().toISOString().slice(0, 10),
      venue: formData.venue || 'TBD Location',
      estimated_budget: numericBudget,
      budget: `₹${numericBudget.toLocaleString('en-IN')}`,
      source: (formData.source as any) || 'Landing Page',
      status: 'new',
      notes: `${formData.notes || ''} ${formData.guests ? `[Est. Guests: ${formData.guests}]` : ''} ${showCalculator ? `[Calculator Selected: ${calcCoverage}, Cinema: ${calcCinematography}, Drone: ${calcDrone}]` : ''}`.trim(),
      event_details: formData.notes,
      created_at: new Date().toISOString(),
    };

    // 1. Immediately save to localStorage
    try {
      const existingRaw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      const existing: Enquiry[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newEnquiry, ...existing.filter((item) => item.id !== newId)];
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error('Failed to save public enquiry locally:', err);
    }

    // 2. Dispatch to AWS API Gateway in background
    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry),
      });
    } catch (err) {
      console.warn('Backend sync queued.');
    }

    setSubmittedEnquiryId(newId);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-[#00d4ff] selection:text-black antialiased font-sans flex flex-col">
      {/* Top Studio Navbar */}
      <header className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-white">PIXEVA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 tracking-wider uppercase">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cinematography & AI Photography</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">4.9/5</span>
              <span>(240+ Destination Shoots)</span>
            </div>
            <a
              href="https://wa.me/918904832762?text=Hi%20Pixeva%20Studio!%20I'd%20like%20to%20inquire%20about%20your%20photography%20and%20cinematography%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all shadow-sm shadow-emerald-500/10"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Showcase Banner */}
      <div className="relative w-full overflow-hidden bg-slate-900 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src={coverPhoto}
            alt="Pixeva Studio Cover"
            className="w-full h-full object-cover object-center brightness-40 filter scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-300 mx-auto mb-4 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Bespoke Wedding & Commercial Film Production</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            {headline}
          </h1>

          <p className="text-slate-300 text-sm md:text-lg mt-4 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
        {submitted ? (
          /* Confirmation Celebratory Screen */
          <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Enquiry Received Successfully!
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Thank you, <span className="font-bold text-white">{formData.name}</span>! Our lead cinematographer is preparing your personalized itinerary and deliverable proposal for{' '}
                <span className="text-[#00d4ff] font-semibold">{formData.event_date}</span>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-3 max-w-lg mx-auto text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/10">
                <span>Reference ID:</span>
                <span className="font-mono text-white font-bold">{submittedEnquiryId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Event Type:</span>
                <span className="capitalize text-white font-semibold">{formData.event_type}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-white font-semibold">{formData.venue || 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Package:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  ₹{Number(String(showCalculator ? calculatedTotal : formData.budget).replace(/[^0-9]/g, '') || 200000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/918904832762?text=Hi%20Pixeva%20Studio!%20I%20just%20submitted%20my%20enquiry%20(Ref:%20${submittedEnquiryId})%20for%20my%20${formData.event_type}%20shoot%20on%20${formData.event_date}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    event_type: 'wedding',
                    event_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
                    venue: '',
                    guests: '',
                    budget: '200000',
                    source: 'Instagram',
                    notes: '',
                  });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
              >
                Submit Another Shoot
              </button>
            </div>
          </div>
        ) : (
          /* Dual-Column Interactive Booking Section */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Studio Brand Portfolio & Features */}
            <div className="lg:col-span-5 space-y-6">
              {/* Studio Scope Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Signature Cinema Standard</h3>
                    <p className="text-xs text-slate-400">Why top couples & brands choose Pixeva</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">4K Color-Graded Cinema Masters</strong>
                      <span>Captured with Sony FX6 / RED cinema line with licensed soundtracks.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">FPV & Aerial Drone Perspectives</strong>
                      <span>Licensed commercial drone pilots for breathtaking aerial cinematography.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">24-Hour Express Proposal & Contract</strong>
                      <span>Instant digital call-sheet, transparent pricing, and date lock.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">High-Resolution Cloud Lookbook</strong>
                      <span>Private cloud gallery with instant 4K download & print rights.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Studio Hotline */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Have urgent date queries?</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Talk to our lead producer directly</p>
                </div>
                <a
                  href="tel:+918904832762"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-colors"
                >
                  +91 89048 32762
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Booking & Consultation Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    Check Date Availability & Request Proposal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill in your event details below to receive our complete crew coverage roadmap.
                  </p>
                </div>

                {/* Interactive Ballpark Estimate Calculator (if enabled) */}
                {showCalculator && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-[#00d4ff]/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-4 h-4 text-[#00d4ff]" />
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Instant Ballpark Cost Estimator
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Est. Range</span>
                        <span className="font-mono text-lg font-black text-[#00d4ff]">
                          ₹{calculatedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Coverage Days */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 block">
                        Shoot Coverage Window
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['1-day', '2-day', '3-day'] as const).map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setCalcCoverage(opt)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                              calcCoverage === opt
                                ? 'bg-[#00d4ff] text-slate-950 shadow-md shadow-sky-500/25'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {opt === '1-day' ? '1 Day Event' : opt === '2-day' ? '2 Days (Main + Pre)' : '3 Days Grand'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Addons Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${calcCinematography ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        <input
                          type="checkbox"
                          checked={calcCinematography}
                          onChange={(e) => setCalcCinematography(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        <span className="font-bold">4K Cinema Film</span>
                      </label>

                      <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${calcDrone ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        <input
                          type="checkbox"
                          checked={calcDrone}
                          onChange={(e) => setCalcDrone(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-0"
                        />
                        <span className="font-bold">FPV / Drone Pilot</span>
                      </label>

                      <label className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${calcRawFootage ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                        <input
                          type="checkbox"
                          checked={calcRawFootage}
                          onChange={(e) => setCalcRawFootage(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span className="font-bold">Raw SSD Delivery</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Client Info: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Your Full Name <span className="text-[#00d4ff]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya & Rohan Sharma"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email Address <span className="text-[#00d4ff]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya.rohan@weddingmail.com"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>
                </div>

                {/* Phone & Event Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Shoot Type
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                    >
                      <option value="wedding">Royal Destination / Wedding</option>
                      <option value="pre-wedding">Pre-Wedding / Engagement Reel</option>
                      <option value="reception">Reception / Sangeet Gala</option>
                      <option value="corporate">Corporate Summit / Brand Commercial</option>
                      <option value="fashion">Fashion Lookbook / Portrait</option>
                      <option value="birthday">Private Celebration</option>
                    </select>
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Event / Shoot Date <span className="text-[#00d4ff]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                    />
                  </div>

                  {showLocation && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Location / Venue
                      </label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="e.g. Taj Lake Palace, Udaipur"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  )}
                </div>

                {/* Guests & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showGuests && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Expected Number of Guests
                      </label>
                      <input
                        type="text"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="e.g. 350-500 Guests"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  )}

                  {showBudget && !showCalculator && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Estimated Budget (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="e.g. ₹2,00,000"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                      />
                    </div>
                  )}

                  {showSource && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        How did you discover us?
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00d4ff] cursor-pointer"
                      >
                        <option value="Instagram">Instagram Reels / Page</option>
                        <option value="Website">Official Website</option>
                        <option value="Referral">Friend / Family Referral</option>
                        <option value="Google Ads">Google Search</option>
                        <option value="Landing Page">Social Media Ad</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Special Vision, Themes, or Production Requests
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your schedule, key rituals, preferred cinema music style, or specific deliverable needs..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-sky-500/25 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Securing Date & Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Official Enquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-2">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero spam guarantee</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Custom proposal in 24h</span>
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-white/10 py-10 bg-slate-950 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm tracking-tight text-white">PIXEVA STUDIO</span>
            <span>•</span>
            <span>AI Photography & Cinema Production</span>
          </div>
          <p>© 2026 Pixeva Studio. All rights reserved. • Powered by Pixeva CRM AI</p>
        </div>
      </footer>
    </div>
  );
}
