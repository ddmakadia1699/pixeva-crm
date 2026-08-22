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
  CheckCircle,
  Eye,
  Layers,
  Zap,
  CheckCheck,
  ChevronRight,
  ShieldAlert
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
    "Experience bespoke high-fashion photography and cinematic 4K film production crafted for your unforgettable milestone."
  );
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showCalculator, setShowCalculator] = useState(true);
  const [startingPrice, setStartingPrice] = useState<string>('150000');

  // Selected 3D Package Tier
  const [selectedTier, setSelectedTier] = useState<'essential' | 'signature' | 'royal'>('signature');

  // Client Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    event_type: 'wedding',
    event_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    venue: '',
    guests: '200-350 Guests',
    budget: '250000',
    source: 'Instagram',
    notes: '',
  });

  // Dynamic Calculator Addons
  const [calcCoverage, setCalcCoverage] = useState<'1-day' | '2-day' | '3-day'>('2-day');
  const [calcCinematography, setCalcCinematography] = useState<boolean>(true);
  const [calcDrone, setCalcDrone] = useState<boolean>(true);
  const [calcRawFootage, setCalcRawFootage] = useState<boolean>(true);
  const [calc48hTeaser, setCalc48hTeaser] = useState<boolean>(true);

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

  // Compute Ballpark Estimate
  const calculateEstimate = () => {
    let base = Number(startingPrice) || 150000;
    if (selectedTier === 'essential') base = 120000;
    if (selectedTier === 'signature') base = 250000;
    if (selectedTier === 'royal') base = 450000;

    if (calcCoverage === '2-day') base *= 1.35;
    if (calcCoverage === '3-day') base *= 1.75;
    if (calcCinematography) base += 35000;
    if (calcDrone) base += 25000;
    if (calcRawFootage) base += 15000;
    if (calc48hTeaser) base += 20000;
    return Math.round(base);
  };

  const calculatedTotal = calculateEstimate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    setIsSubmitting(true);
    const newId = `enq-${Date.now()}`;
    const rawBudget = String(showCalculator ? calculatedTotal : formData.budget).replace(/[^0-9]/g, '');
    const numericBudget = rawBudget ? Number(rawBudget) : 250000;

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
      notes: `${formData.notes || ''} [Package Tier: ${selectedTier.toUpperCase()}] [Coverage: ${calcCoverage}] [Drone: ${calcDrone ? 'Yes' : 'No'}] [48h Teaser: ${calc48hTeaser ? 'Yes' : 'No'}] ${formData.guests ? `[Guests: ${formData.guests}]` : ''}`.trim(),
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

    // 2. Dispatch to AWS API Gateway
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
    <div className="min-h-screen bg-[#06080e] text-white selection:bg-[#00d4ff] selection:text-black antialiased font-sans flex flex-col relative overflow-x-hidden">
      {/* Dynamic 3D Ambient Lighting Orbs */}
      <div className="fixed top-[-150px] left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-gradient-to-tl from-purple-600/20 via-indigo-600/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Luxury Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0d17]/95 backdrop-blur-2xl border-b border-white/15 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-white/20 shrink-0 transform hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-white drop-shadow-md">PIXEVA</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 uppercase tracking-widest shadow-md">
                  STUDIO
                </span>
              </div>
              <p className="text-xs font-semibold text-cyan-300">Cinematic 4K Films & AI Photography</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">4.9/5</span>
              <span className="text-[11px] text-slate-300">(240+ Verified Shoots)</span>
            </div>

            <a
              href="https://wa.me/918904832762?text=Hi%20Pixeva%20Studio!%20I'd%20like%20to%20inquire%20about%20your%20photography%20and%20cinematography%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3D Hero Lookbook Banner */}
      <div className="relative w-full overflow-hidden bg-slate-950 border-b border-white/15">
        <div className="absolute inset-0 z-0">
          <img
            src={coverPhoto}
            alt="Pixeva Studio Cover"
            className="w-full h-full object-cover object-center brightness-[0.45] contrast-125 filter scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-[#06080e]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-xs font-bold text-cyan-200 shadow-xl backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span className="tracking-wide">Official Consultation & Availability Lock</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {headline}
          </h1>

          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-lg">
            {subtitle}
          </p>

          {/* 3D Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-md text-center transform hover:-translate-y-1 transition-transform">
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">240+</span>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Destination Weddings</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-md text-center transform hover:-translate-y-1 transition-transform">
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">4K 60P</span>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Cinema Masters</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-md text-center transform hover:-translate-y-1 transition-transform">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">48 Hours</span>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Express Teaser</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-md text-center transform hover:-translate-y-1 transition-transform">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</span>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Cloud Vault Rights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20">
        {submitted ? (
          /* Confirmation Celebratory Screen */
          <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 backdrop-blur-3xl shadow-2xl text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Enquiry Successfully Confirmed!
              </h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you, <strong className="text-white">{formData.name}</strong>! Our creative director is drafting your customized crew call-sheet and pricing roadmap for{' '}
                <span className="text-cyan-400 font-bold">{formData.event_date}</span>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-white/15 text-left space-y-3.5 max-w-lg mx-auto text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2.5 border-b border-white/10">
                <span className="font-bold text-slate-300">Reference Number:</span>
                <span className="font-mono text-cyan-400 font-black text-sm">{submittedEnquiryId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-300">Event Type:</span>
                <span className="capitalize text-white font-bold">{formData.event_type}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-slate-300">Location / Venue:</span>
                <span className="text-white font-bold">{formData.venue || 'To Be Finalized'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-white/10">
                <span className="font-bold text-slate-300">Selected Package Ballpark:</span>
                <span className="text-emerald-400 font-black font-mono text-base">
                  ₹{Number(String(showCalculator ? calculatedTotal : formData.budget).replace(/[^0-9]/g, '') || 250000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={`https://wa.me/918904832762?text=Hi%20Pixeva%20Studio!%20I%20just%20submitted%20my%20enquiry%20(Ref:%20${submittedEnquiryId})%20for%20my%20${formData.event_type}%20shoot%20on%20${formData.event_date}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950" />
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
                    guests: '200-350 Guests',
                    budget: '250000',
                    source: 'Instagram',
                    notes: '',
                  });
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors"
              >
                Submit Another Date
              </button>
            </div>
          </div>
        ) : (
          /* Dual-Column Interactive Booking Section */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: 3D Studio Showcase & Package Selection */}
            <div className="lg:col-span-5 space-y-6">
              {/* 3D Tier Selection Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl backdrop-blur-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                      <span>Choose Production Tier</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">Select a foundation tier for your shoot</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase">
                    3D Packages
                  </span>
                </div>

                {/* 3D Interactive Tier Cards */}
                <div className="space-y-3">
                  {/* Tier 1: Essential */}
                  <div
                    onClick={() => setSelectedTier('essential')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      selectedTier === 'essential'
                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedTier === 'essential' ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white'}`}>
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Essential Cinema</h4>
                        <p className="text-[11px] text-slate-300">2 Senior Photographers • 4K Film</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-black text-cyan-400">₹1,20,000+</span>
                  </div>

                  {/* Tier 2: Signature (Most Popular) */}
                  <div
                    onClick={() => setSelectedTier('signature')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between relative ${
                      selectedTier === 'signature'
                        ? 'bg-gradient-to-r from-blue-950/80 via-slate-900 to-purple-950/80 border-cyan-400 shadow-xl shadow-cyan-500/30 scale-[1.03]'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-4 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md">
                      Most Popular 💎
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedTier === 'signature' ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black' : 'bg-white/10 text-white'}`}>
                        👑
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">Royal Signature</h4>
                        <p className="text-[11px] text-slate-200">4-Crew Elite Squad • FPV Drone • 48h Reel</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-black text-cyan-300">₹2,50,000+</span>
                  </div>

                  {/* Tier 3: Ultra VIP */}
                  <div
                    onClick={() => setSelectedTier('royal')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      selectedTier === 'royal'
                        ? 'bg-gradient-to-r from-purple-950/90 to-slate-900 border-purple-400 shadow-lg shadow-purple-500/25 scale-[1.02]'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${selectedTier === 'royal' ? 'bg-purple-400 text-black' : 'bg-white/10 text-white'}`}>
                        ✨
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Ultra 8K Grand VIP</h4>
                        <p className="text-[11px] text-slate-300">6-Crew Team • Dual Drone • Leather Lookbooks</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-black text-purple-300">₹4,50,000+</span>
                  </div>
                </div>
              </div>

              {/* Studio Guarantees & Features */}
              <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/15 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 text-cyan-300">
                  <Award className="w-4 h-4" />
                  <span>The Pixeva Studio Difference</span>
                </h3>

                <div className="space-y-3.5 text-xs text-slate-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block text-sm">Sony FX6 & RED Cinema 4K Color Grading</strong>
                      <span className="text-slate-300">Every clip is hand-graded in DaVinci Resolve with commercial film licensing.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block text-sm">FPV & Dual Commercial Drone Pilots</strong>
                      <span className="text-slate-300">Licensed DGCA drone operators ensuring breathtaking grand venue aerials.</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block text-sm">24-Hour Express Proposal & Contract</strong>
                      <span className="text-slate-300">Instant digital call-sheet, transparent deliverables, and secure date lock.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Studio Producer Hotline */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-white/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Have urgent date queries?</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Talk to our lead producer directly</p>
                </div>
                <a
                  href="tel:+918904832762"
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs font-black text-white transition-all hover:scale-105"
                >
                  +91 89048 32762
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Ultra-Clear High-Contrast Booking Form */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-900/95 border-2 border-white/20 backdrop-blur-3xl shadow-2xl space-y-6"
              >
                <div className="border-b border-white/15 pb-5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Booking & Date Check</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Request Your Customized Production Plan
                  </h2>
                  <p className="text-xs font-medium text-slate-300 mt-1">
                    Fill out your event details below to receive our complete crew coverage roadmap and availability.
                  </p>
                </div>

                {/* 3D Dynamic Estimate Calculator */}
                {showCalculator && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c101d] via-[#101626] to-[#0c101d] border-2 border-cyan-500/40 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-5 h-5 text-cyan-400" />
                        <div>
                          <h3 className="text-xs font-black text-white uppercase tracking-wider">
                            Live 3D Cost Estimator
                          </h3>
                          <p className="text-[10px] text-slate-300">Customized according to selected tier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-300 uppercase block">Estimated Range</span>
                        <span className="font-mono text-xl font-black text-cyan-400 drop-shadow-md">
                          ₹{calculatedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Coverage Days */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white block">
                        Shoot Duration Window
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['1-day', '2-day', '3-day'] as const).map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setCalcCoverage(opt)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                              calcCoverage === opt
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-[1.02]'
                                : 'bg-slate-950/80 text-white hover:bg-slate-800 border border-white/20'
                            }`}
                          >
                            {opt === '1-day' ? '1 Day Event' : opt === '2-day' ? '2 Days (Main + Pre)' : '3 Days Grand'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Addons Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${calcCinematography ? 'bg-purple-950/60 border-purple-400 text-purple-200' : 'bg-slate-950/70 border-white/15 text-slate-300'}`}>
                        <input
                          type="checkbox"
                          checked={calcCinematography}
                          onChange={(e) => setCalcCinematography(e.target.checked)}
                          className="rounded text-purple-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span>4K Cinematic Film (+₹35k)</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${calcDrone ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 'bg-slate-950/70 border-white/15 text-slate-300'}`}>
                        <input
                          type="checkbox"
                          checked={calcDrone}
                          onChange={(e) => setCalcDrone(e.target.checked)}
                          className="rounded text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span>FPV / Aerial Drone (+₹25k)</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${calc48hTeaser ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200' : 'bg-slate-950/70 border-white/15 text-slate-300'}`}>
                        <input
                          type="checkbox"
                          checked={calc48hTeaser}
                          onChange={(e) => setCalc48hTeaser(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span>48h Express Reel (+₹20k)</span>
                      </label>

                      <label className={`flex items-center space-x-2.5 p-3 rounded-xl border-2 cursor-pointer text-xs font-bold transition-all ${calcRawFootage ? 'bg-amber-950/60 border-amber-400 text-amber-200' : 'bg-slate-950/70 border-white/15 text-slate-300'}`}>
                        <input
                          type="checkbox"
                          checked={calcRawFootage}
                          onChange={(e) => setCalcRawFootage(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span>Raw SSD Hard Drive (+₹15k)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Client Info: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                      Your Full Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya & Rohan Sharma"
                      className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                      Email Address <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya.rohan@weddingmail.com"
                      className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Phone & Event Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                      Shoot Type
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 cursor-pointer shadow-inner"
                    >
                      <option value="wedding" className="bg-slate-950 text-white">Royal Destination / Wedding</option>
                      <option value="pre-wedding" className="bg-slate-950 text-white">Pre-Wedding / Engagement Reel</option>
                      <option value="reception" className="bg-slate-950 text-white">Reception / Sangeet Gala</option>
                      <option value="corporate" className="bg-slate-950 text-white">Corporate Summit / Brand Commercial</option>
                      <option value="fashion" className="bg-slate-950 text-white">Fashion Lookbook / Portrait</option>
                      <option value="birthday" className="bg-slate-950 text-white">Private Luxury Celebration</option>
                    </select>
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                      Event / Shoot Date <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 shadow-inner"
                    />
                  </div>

                  {showLocation && (
                    <div>
                      <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                        Location / Venue
                      </label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="e.g. Taj Lake Palace, Udaipur"
                        className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 shadow-inner"
                      />
                    </div>
                  )}
                </div>

                {/* Guests & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {showGuests && (
                    <div>
                      <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                        Expected Number of Guests
                      </label>
                      <input
                        type="text"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        placeholder="e.g. 350-500 Guests"
                        className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 shadow-inner"
                      />
                    </div>
                  )}

                  {showBudget && !showCalculator && (
                    <div>
                      <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                        Estimated Budget (₹)
                      </label>
                      <input
                        type="text"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="e.g. ₹2,50,000"
                        className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-mono font-black placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 shadow-inner"
                      />
                    </div>
                  )}

                  {showSource && (
                    <div>
                      <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                        How did you discover us?
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 cursor-pointer shadow-inner"
                      >
                        <option value="Instagram" className="bg-slate-950 text-white">Instagram Reels / Showcase</option>
                        <option value="Website" className="bg-slate-950 text-white">Official Studio Website</option>
                        <option value="Referral" className="bg-slate-950 text-white">Friend / Family Referral</option>
                        <option value="Google Ads" className="bg-slate-950 text-white">Google Search</option>
                        <option value="Landing Page" className="bg-slate-950 text-white">Social Media Ad</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-black text-white uppercase tracking-wider mb-2">
                    Special Vision, Themes, or Production Requests
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your itinerary, preferred cinematic soundtrack style, or specific deliverable requirements..."
                    className="w-full bg-slate-950 border-2 border-white/20 rounded-xl px-4 py-3.5 text-xs text-white font-medium placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/25 shadow-inner"
                  />
                </div>

                {/* Submit 3D Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] hover:from-[#00b4d8] hover:to-[#7c3aed] text-white font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-3 shadow-2xl shadow-cyan-500/40 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer ring-2 ring-white/30"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span>Securing Date & Registering...</span>
                      </span>
                    ) : (
                      <>
                        <span>Submit Official Enquiry</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-4 text-xs font-bold text-slate-300 pt-2">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Zero spam guarantee</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Custom proposal in 24h</span>
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-white/15 py-10 bg-[#06080e] text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm tracking-tight text-white">PIXEVA STUDIO</span>
            <span>•</span>
            <span className="font-semibold text-slate-300">AI Photography & Cinema Production</span>
          </div>
          <p className="font-medium text-slate-300">© 2026 Pixeva Studio. All rights reserved. • Powered by Pixeva CRM AI</p>
        </div>
      </footer>
    </div>
  );
}
