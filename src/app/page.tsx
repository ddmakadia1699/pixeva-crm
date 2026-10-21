'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  DollarSign, 
  Calendar, 
  Users, 
  Film, 
  Bot, 
  QrCode, 
  FileText, 
  ChevronRight, 
  Play, 
  Star, 
  Check, 
  Globe, 
  Server, 
  Database, 
  Cloud, 
  ChevronDown, 
  Lock, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  Cpu, 
  Eye, 
  ExternalLink, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Workflow,
  Receipt,
  Share2,
  HardDrive
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'enquiries' | 'projects' | 'contracts' | 'finances' | 'ai' | 'galleries'>('enquiries');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      
      {/* ───────────────────────────────────────────────────────────────────────
          1. STICKY TOP NAVBAR
      ───────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#090d16]/80 border-b border-slate-200/80 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">Pixeva CRM</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md">
                  Tri-Cloud
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">Studio Operating System</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all">
              Features
            </a>
            <a href="#workflow" className="px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all">
              Workflow
            </a>
            <a href="#architecture" className="px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all">
              Architecture
            </a>
            <a href="#pricing" className="px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all">
              Pricing
            </a>
            <a href="#faq" className="px-3 py-2 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all">
              FAQ
            </a>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Studio Demo</span>
            </Link>
          </nav>

          {/* Actions: Theme Toggle + Login + Sign Up Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Login Button */}
            <Link
              href="/login?mode=signin"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/5 transition-all shadow-sm"
            >
              Sign In
            </Link>

            {/* Sign Up Button */}
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pt-3 pb-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090d16] space-y-3 animate-fadeIn">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-600">Features</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-600">Workflow</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-600">Architecture</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-blue-600">Pricing</a>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-emerald-600 font-bold">Live Studio Demo</Link>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col space-y-2">
              <Link
                href="/login?mode=signin"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────────────────────────────────────────────────────────────────────
          2. HERO SECTION
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold shadow-sm backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            <span>The Modern Tri-Cloud Operating System for Visual Creators</span>
            <span className="hidden sm:inline-block text-blue-300 dark:text-blue-600">•</span>
            <span className="hidden sm:inline-block font-mono text-[11px] text-blue-600 dark:text-blue-300">v2.4 Enterprise</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1]">
            Run Your Entire Studio on{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              One Tri-Cloud Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Capture high-ticket client enquiries, dispatch multi-crew shoots, generate legally-binding e-signature contracts, and deliver AI-cull client galleries with sub-second speed.
          </p>

          {/* Primary & Secondary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login?mode=signup"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Create Studio Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login?mode=signin"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm transition-all"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Explore Live Dashboard</span>
            </Link>
          </div>

          {/* Social Proof & Metrics Badges */}
          <div className="pt-8 border-t border-slate-200/60 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">$2.4M+</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Booked Revenue Tracked</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">12,400+</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Shoots & Crew Dispatched</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">480,000+</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Photos & Proofs Delivered</div>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">99.98%</div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tri-Cloud Serverless Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          3. INTERACTIVE LIVE CRM PREVIEW / MOCKUP
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Interactive Studio Preview</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered Specifically for High-End Creative Operations
          </p>
        </div>

        {/* Feature Tab Switcher */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2 mb-6 scrollbar-none">
          {[
            { id: 'enquiries', label: 'Lead Enquiries', icon: Mail },
            { id: 'projects', label: 'Shoot Projects', icon: Film },
            { id: 'contracts', label: 'Digital Contracts', icon: FileText },
            { id: 'finances', label: 'Multi-Currency Finances', icon: DollarSign },
            { id: 'ai', label: 'Pixeva AI Suite', icon: Bot },
            { id: 'galleries', label: 'QR Galleries', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Mockup Window */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-2xl overflow-hidden transition-all">
          
          {/* Top Window Chrome */}
          <div className="px-4 py-3 bg-slate-100/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
              <span className="font-mono text-[11px] text-slate-400 ml-2 hidden sm:inline">
                https://studio.pixeva.co/{activeFeatureTab}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PostgreSQL RLS Active</span>
              </span>
              <Link 
                href={`/${activeFeatureTab === 'ai' ? 'pixeva-ai' : activeFeatureTab}`}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>Open module</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Dynamic Mockup Content Based on Selected Tab */}
          <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
            
            {/* 1. ENQUIRIES PREVIEW */}
            {activeFeatureTab === 'enquiries' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Active High-Ticket Enquiries</h3>
                    <p className="text-xs text-slate-500">Pipeline automatically synced from public enquiry embed forms & Instagram ads</p>
                  </div>
                  <Link href="/enquiries" className="text-xs font-bold text-blue-600 hover:underline">
                    View all enquiries →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-600 text-white">New Lead</span>
                      <span className="font-mono text-xs font-bold text-blue-600">$18,500</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Sarah & Mark Grand Wedding</div>
                    <p className="text-xs text-slate-500">3-Day Destination Wedding in Tuscany, Italy</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Received 14 minutes ago via Web Form</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500 text-white">Proposal Sent</span>
                      <span className="font-mono text-xs font-bold text-amber-600">$32,000</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Apex Global Tech Summit 2026</div>
                    <p className="text-xs text-slate-500">Keynote Cinema Coverage + 4K Drone Livestream</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Follow-up scheduled for tomorrow</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-600 text-white">Deposit Paid</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">$9,500</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">Vogue Fashion Autumn Campaign</div>
                    <p className="text-xs text-slate-500">Studio Editorial + 10x Reel Social Cutdowns</p>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Contract E-Signed & Project Created</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROJECTS PREVIEW */}
            {activeFeatureTab === 'projects' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Production & Shoot Dispatch</h3>
                    <p className="text-xs text-slate-500">Track shoot logistics, call sheets, gear checklists, and multi-day timelines</p>
                  </div>
                  <Link href="/projects" className="text-xs font-bold text-blue-600 hover:underline">
                    View all projects →
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Monaco Luxury Yacht Regatta</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                          Production Ready
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Crew: 2x Cinema Operators, 1x FPV Drone Pilot, 1x Audio Engineer</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Gear: 100% Prepped</span>
                      <span className="font-bold text-blue-600">Shoot Date: Nov 12</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Belmond Hotel Worldwide Commercial</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                          Pre-Production
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Storyboard Approved • Call Sheet Dispatched • Location Permit Secured</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>Gear: Checked Out</span>
                      <span className="font-bold text-purple-600">Shoot Date: Nov 18</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONTRACTS PREVIEW */}
            {activeFeatureTab === 'contracts' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Digital Contracts & Audit Trail</h3>
                    <p className="text-xs text-slate-500">Legally binding e-signatures with real-time PDF generation via AWS Lambda</p>
                  </div>
                  <Link href="/contracts" className="text-xs font-bold text-blue-600 hover:underline">
                    View contracts →
                  </Link>
                </div>
                <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Contract #PX-2026-089 (Signed & Verified)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Client: Elena Vance • E-Signature IP: 194.26.29.112 • Signed Oct 21, 2026 14:02 UTC
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10">
                        SHA-256 Verified
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10">
                        Auto-Deposit Triggered
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center space-x-2">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-50 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. FINANCES PREVIEW */}
            {activeFeatureTab === 'finances' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Currency Global Treasury</h3>
                    <p className="text-xs text-slate-500">Real-time daily exchange rates across USD, EUR, GBP, INR, AED, and AUD</p>
                  </div>
                  <Link href="/finances" className="text-xs font-bold text-blue-600 hover:underline">
                    View finances →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">Total Booked</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">$148,250</div>
                    <div className="text-[10px] text-emerald-500 font-semibold">+18.4% vs last quarter</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">Payments Received</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">$92,400</div>
                    <div className="text-[10px] text-slate-400">Direct Stripe & Wire</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">Pending Invoices</div>
                    <div className="text-lg font-bold text-amber-500 mt-0.5">$55,850</div>
                    <div className="text-[10px] text-slate-400">Auto-reminders enabled</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">Live FX Rates</div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">1 USD = 88.75 INR</div>
                    <div className="text-[10px] text-blue-500">Live Forex Sync</div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AI PREVIEW */}
            {activeFeatureTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Pixeva AI Studio Co-Pilot</h3>
                    <p className="text-xs text-slate-500">Facial recognition clustering, automated photo culling, and AI proposal drafts</p>
                  </div>
                  <Link href="/pixeva-ai" className="text-xs font-bold text-blue-600 hover:underline">
                    Explore Pixeva AI →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/40 dark:bg-purple-500/5 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                      <Bot className="w-4 h-4" />
                      <span>Face Recognition</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Guests upload one selfie to automatically receive all 48 photos of themselves from a 2,000-guest wedding.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-500/5 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Auto Culling</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">AI automatically detects blinks, missed focus, and unflattering duplicates, reducing 6 hours of culling to 12 minutes.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-500/5 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <Zap className="w-4 h-4" />
                      <span>Smart Proposals</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Generates custom pitch decks and cost estimates matched to the client's venue and vibe in 30 seconds.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. GALLERIES PREVIEW */}
            {activeFeatureTab === 'galleries' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">QR Tent Cards & High-Speed Galleries</h3>
                    <p className="text-xs text-slate-500">Event guests scan QR table cards to browse photos and order prints instantaneously</p>
                  </div>
                  <Link href="/galleries" className="text-xs font-bold text-blue-600 hover:underline">
                    View galleries →
                  </Link>
                </div>
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 p-2 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-800 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">Sarah & Mark Grand Gala — Table Tent Card QR</div>
                      <p className="text-xs text-slate-500">Target URL: https://pixeva.co/g/sarah-mark-wedding • 384 guest selfies matched</p>
                      <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        Ultra-Fast Edge CDN Delivery
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                    Print Tent Cards
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          4. ALL FEATURES GRID (COMPREHENSIVE PIXEVA CRM SHOWCASE)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            Enterprise Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Every Feature Needed to Scale Creative Operations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            From the moment a lead lands on your website to the day 4K deliverables are handed off, Pixeva CRM powers the entire journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Lead Pipeline */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Enquiries Pipeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Capture wedding, corporate, and fashion leads via customizable multi-step embed forms. Track budget qualifiers, conversion stages, and automated email follow-ups.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <Link href="/enquiries" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Enquiries</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2: Projects & Shoots */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Production & Shoot Dispatch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Organize multi-day itineraries, locations, gear checklists, and milestones. Keep lead directors, second cameras, and drone pilots synchronized.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
              <Link href="/projects" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Projects</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3: Digital Contracts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Digital Contracts & E-Signatures</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Legally binding contracts with timestamped IP audit trails. Built-in AWS Lambda microservice compiles professional PDF documents on demand.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Link href="/contracts" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Contracts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 4: Crew Scheduling */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Crew Roster & Scheduling</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detect booking conflicts instantly. Assign cinematographers, lighting technicians, sound operators, and editors with custom day-rate tracking.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <Link href="/crew-scheduling" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Crew Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 5: Multi-Currency Finances */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Global Multi-Currency Treasury</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bill destination clients in USD, EUR, GBP, INR, AED, or CAD with real-time live forex conversion rates. Track retainers, milestones, and tax receipts.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
              <Link href="/finances" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Finances</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 6: QR Tent Cards & Galleries */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">QR Tent Cards & Guest Galleries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Place QR codes on event tables. Wedding and gala guests scan to instantly find their photos via selfie facial search and download in full resolution.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Link href="/galleries" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Galleries</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 7: Post-Production & Revisions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Post-Production & Client Tickets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Rough cut reviews, color grading approvals, and timecode-specific client revision tickets. Eliminate endless WhatsApp and email chains.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <Link href="/post-production" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Post-Production</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 8: Pixeva AI Suite */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pixeva AI Intelligence Suite</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated photo culling, facial recognition indexing, AI proposal writing, and smart follow-up suggestions tailored to your studio voice.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <Link href="/pixeva-ai" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Explore AI Suite</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 9: Multi-Tenant Team Security */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 transition-all hover:shadow-xl space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Tenant Isolation & RLS Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              PostgreSQL Row Level Security ensures data remains strictly scoped to your studio account (`account_id`). Role-based permissions for assistants, editors, and leads.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400">
              <Link href="/settings" className="inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>View Studio Settings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          5. TRI-CLOUD ARCHITECTURE SECTION
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="bg-gradient-to-br from-slate-900 to-[#0b1329] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-3xl space-y-4 relative z-10 mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Under The Hood
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              The Power of the Tri-Cloud Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Unlike legacy monolithic CRMs that lag under thousands of RAW photo uploads, Pixeva CRM decouples UI rendering, database persistence, and background microservices across three best-in-class clouds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            {/* Cloud 1: Vercel */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-base text-white">1. Vercel Edge Layer</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Next.js 14 App Router deployed across 300+ edge locations worldwide. Provides sub-50ms Time To First Byte (TTFB) for global studios and client galleries.
              </p>
              <div className="text-[11px] font-mono text-blue-400">Edge SSR • Zero Cold Starts</div>
            </div>

            {/* Cloud 2: Supabase */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">2. Supabase Cloud</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hardened PostgreSQL engine with Row-Level Security (RLS) guaranteeing 100% tenant privacy. Real-time updates push live enquiry alerts to your devices instantly.
              </p>
              <div className="text-[11px] font-mono text-emerald-400">PostgreSQL • Row Level Security</div>
            </div>

            {/* Cloud 3: AWS Lambda */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">3. AWS Lambda Workers</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Background heavy lifting: generating multi-page PDF contracts, dispatching bulk marketing campaigns, and batching proofing assets asynchronously without blocking the UI.
              </p>
              <div className="text-[11px] font-mono text-amber-400">Serverless • Asynchronous Scale</div>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          6. WORKFLOW PIPELINE ("ENQUIRY TO FINAL MASTER")
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            End-To-End Lifecycle
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Top Studios Scale with Pixeva
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            From the initial Instagram enquiry to the final client sign-off, every step is automated.
          </p>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 -translate-y-1/2 z-0 opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Lead Capture</h3>
              <p className="text-xs text-slate-500">Clients submit date, venue, and vision via your public embed form.</p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-indigo-500/30">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Proposal & E-Contract</h3>
              <p className="text-xs text-slate-500">Auto-generated contract signed on mobile with instant deposit receipt.</p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-purple-500/30">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Crew & Gear Dispatch</h3>
              <p className="text-xs text-slate-500">Call sheets and gear assignments pushed directly to crew phones.</p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-amber-500/30">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live QR Tent Cards</h3>
              <p className="text-xs text-slate-500">Guests scan table cards during the reception to view photos live.</p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                5
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Proofing & Hand-off</h3>
              <p className="text-xs text-slate-500">Fast client timecode revisions, color grades, and final 4K delivery.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          7. PRICING SECTION (WITH SIGN UP BUTTONS ON EVERY TIER)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Invest in Operating Speed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Choose the right plan for your studio scale. Change or cancel anytime.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="p-1 rounded-xl bg-slate-200/60 dark:bg-white/10 flex items-center space-x-1 text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                  billingCycle === 'annual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-white/20 uppercase font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Plan 1: Starter */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter Studio</h3>
                <p className="text-xs text-slate-500 mt-1">Perfect for solo photographers and boutique filmmakers</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'annual' ? '39' : '49'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 30 active enquiries/month</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Digital contracts with legal e-signatures</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Shoot dispatch & production gear lists</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Multi-currency finance tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Standard Edge CDN delivery</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=signup"
              className="w-full py-3 rounded-xl text-xs font-bold text-center border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 transition-all"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Plan 2: Studio Pro (Highlighted) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent border-2 border-blue-600 dark:border-blue-500 relative flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-md">
              Most Popular Choice
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Studio Pro</h3>
                <p className="text-xs text-slate-500 mt-1">For growing cinema teams, commercial studios & wedding agencies</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'annual' ? '79' : '99'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Unlimited enquiries & lead pipelines</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Multi-crew scheduling & conflict detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Event QR tent card generator for guest access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Pixeva AI Suite (facial search & auto-culling)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Post-production timecode client revision tickets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Priority AWS Lambda PDF generation</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=signup"
              className="w-full py-3 rounded-xl text-xs font-bold text-center text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
            >
              Get Started with Studio Pro
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Tri-Cloud</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-city studios, franchise houses & high-volume media companies</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ${billingCycle === 'annual' ? '199' : '249'}
                </span>
                <span className="text-xs text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Everything in Studio Pro, plus:</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Custom branding & white-label domain (`studio.yourname.com`)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dedicated AWS Lambda concurrency workers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Unlimited team seats & custom role permissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>24/7 VIP studio migration & onboarding support</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?mode=signup"
              className="w-full py-3 rounded-xl text-xs font-bold text-center border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 transition-all"
            >
              Contact Enterprise Sales
            </Link>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          8. FAQ SECTION
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about the platform and migration.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does Pixeva CRM differ from HoneyBook or Studio Ninja?',
              a: 'Pixeva is built specifically for visual media creators. Unlike generic invoicing CRMs, Pixeva includes crew scheduling conflict detection, event QR tent card generation for wedding tables, AI facial recognition for guest photo discovery, and real-time live currency exchange rates for destination film shoots.'
            },
            {
              q: 'Are the digital e-signatures legally binding?',
              a: 'Yes. Every contract generated and signed through Pixeva CRM captures the signer’s IP address, precise UTC timestamp, device metadata, and cryptographic hash, meeting ESIGN Act and European eIDAS standards.'
            },
            {
              q: 'How do the Event QR Tent Cards work for guest photo delivery?',
              a: 'You can generate and print event tent cards directly from the CRM. Wedding and gala guests scan the QR code with their mobile cameras, snap a quick selfie, and our AI facial recognition automatically finds and presents all photos of them from the entire event gallery.'
            },
            {
              q: 'Can I bill international clients in their local currency?',
              a: 'Yes. Pixeva features a native multi-currency treasury engine that continuously queries real-time foreign exchange rates across USD, EUR, GBP, INR, AED, and AUD, letting you quote and collect payments accurately without currency conversion losses.'
            },
            {
              q: 'Is my client data isolated and secure?',
              a: 'Absolutely. Every studio account operates under strict multi-tenant Row Level Security (RLS) in PostgreSQL. Cross-tenant access is prohibited at the database engine level, ensuring complete privacy.'
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          9. HIGH-IMPACT FINAL CTA BANNER
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700 text-white p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Upgrade Your Studio to the Tri-Cloud Era?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
              Join visual directors and media studios operating at peak velocity. Create your account in 60 seconds with zero credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login?mode=signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-extrabold text-blue-600 bg-white hover:bg-slate-100 shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Free Studio Account
              </Link>
              <Link
                href="/login?mode=signin"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs font-bold text-white border border-white/30 hover:bg-white/10 transition-all"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          10. POLISHED FOOTER
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#060910] text-slate-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-xs">
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">Pixeva CRM</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              The high-performance tri-cloud enterprise CRM engineered for photography, cinema, and media production agencies worldwide.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational (Edge • DB • Lambda)</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li><Link href="/enquiries" className="hover:text-blue-600">Enquiries Pipeline</Link></li>
              <li><Link href="/projects" className="hover:text-blue-600">Shoot Projects</Link></li>
              <li><Link href="/contracts" className="hover:text-blue-600">E-Contracts</Link></li>
              <li><Link href="/crew-scheduling" className="hover:text-blue-600">Crew Scheduling</Link></li>
              <li><Link href="/finances" className="hover:text-blue-600">Multi-Currency</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">AI & Delivery</h4>
            <ul className="space-y-2">
              <li><Link href="/pixeva-ai" className="hover:text-blue-600">Pixeva AI Suite</Link></li>
              <li><Link href="/galleries" className="hover:text-blue-600">QR Tent Cards</Link></li>
              <li><Link href="/post-production" className="hover:text-blue-600">Client Proofing</Link></li>
              <li><Link href="/client-requests" className="hover:text-blue-600">Revision Tickets</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Studio Dashboard</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login?mode=signin" className="hover:text-blue-600 font-semibold">Sign In</Link></li>
              <li><Link href="/login?mode=signup" className="hover:text-blue-600 font-semibold">Register / Sign Up</Link></li>
              <li><Link href="/settings" className="hover:text-blue-600">Studio Settings</Link></li>
              <li><Link href="/team" className="hover:text-blue-600">Team Permissions</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Pixeva CRM Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-300">Security Audit</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
