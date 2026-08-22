'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Download, 
  Share2, 
  ShieldCheck, 
  FileSignature, 
  Trash2, 
  Check, 
  Play, 
  Film, 
  Layers, 
  PenTool, 
  Type,
  MapPin,
  Flame,
  Award,
  Lock,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { openProposalPdfWindow } from '@/lib/pdf/generateProposalPdf';
import { Enquiry } from '@/lib/supabase/types';

export default function ClientProposalPage() {
  const params = useParams();
  const proposalId = (params?.id as string) || 'prop-default';

  const [enquiry, setEnquiry] = useState<Enquiry>({
    id: proposalId,
    name: 'Priya & Rohan Sharma',
    contact: '+91 98765 43210',
    email: 'priya.rohan@weddingmail.com',
    event_name: 'Royal Destination Wedding & Sangeet',
    venue: 'Taj Lake Palace, Udaipur',
    received_on: '2026-11-20',
    source: 'Instagram',
    estimated_budget: 250000,
    status: 'proposal',
    created_at: new Date().toISOString(),
  });

  // Signature States
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('Priya Sharma');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Modal & Actions
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load matching enquiry from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pixeva_enquiries');
      if (saved) {
        const list: Enquiry[] = JSON.parse(saved);
        const match = list.find((e) => e.id === proposalId || e.name.toLowerCase().includes(proposalId.toLowerCase()));
        if (match) {
          setEnquiry(match);
          setTypedSignature(match.name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [proposalId]);

  // Setup HiDPI Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 500;
    const height = 140;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0284c7';
  }, [signatureMode]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setHasDrawn(true);
    setLastPoint(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;
    if ('touches' in e) e.preventDefault();

    const currentCoords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const midX = (lastPoint.x + currentCoords.x) / 2;
    const midY = (lastPoint.y + currentCoords.y) / 2;

    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    setLastPoint(currentCoords);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasDrawn(false);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const budget = enquiry.estimated_budget || 250000;
  const advance = Math.round(budget * 0.2);
  const eventDay = Math.round(budget * 0.6);
  const finalBal = Math.round(budget * 0.2);

  const isSignatureReady = signatureMode === 'type' ? typedSignature.trim().length > 0 : hasDrawn;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white font-sans antialiased overflow-x-hidden transition-colors duration-300">
      {/* 3D Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-purple-500/20 rounded-full blur-[100px] dark:opacity-50 opacity-70" />
        <div className="absolute top-[40%] -right-40 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[120px] dark:opacity-30 opacity-60" />
        <div className="absolute bottom-10 -left-40 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] dark:opacity-30 opacity-60" />
      </div>

      {/* Floating 3D Nav Header */}
      <header className="sticky top-4 z-40 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 px-5 py-3.5 flex items-center justify-between shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 transform hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Pixeva</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white uppercase tracking-wider shadow-xs">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cinematic Media & Photography</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-sky-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => openProposalPdfWindow(enquiry)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-500/25 transition-all transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-8">
        
        {/* 3D Elevated Hero Banner */}
        <div className="relative rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 p-6 sm:p-10 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
          {/* Subtle Top Specular Light Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Bespoke Coverage Proposal</span>
            </span>

            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Valid for 14 Days</span>
            </div>
          </div>

          <div className="space-y-2.5 max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Prepared for <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">{enquiry.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              We are honored to document your celebration. Below is your tailored coverage itinerary, cinematographic deliverable package, and payment roadmap.
            </p>
          </div>

          {/* 3D Floating Meta Pills */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2.5 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>{enquiry.received_on || 'Nov 20, 2026'}</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2.5 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>{enquiry.event_name || 'Wedding & Reception'}</span>
            </div>

            {enquiry.venue && (
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2.5 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{enquiry.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Visual Portfolio Showcase Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Studio Visual Style & Signature Grade</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Archival color grading and artistic cinematic composition</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 uppercase tracking-wider">
              SIGNATURE PORTFOLIO
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 shadow-xl border border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80"
              alt="Cinematic Portfolio"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-white/95 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                ✨ Pixeva Signature Wedding & Cinema Lookbook
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-white/80 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                Ultra HD • Archival Grade
              </span>
            </div>
          </div>
        </div>

        {/* 3D Deliverables Grid with Hover Lift */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Included Services & Master Deliverables</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deliverable 1 */}
            <div className="group p-6 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">Photography</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">All Days</span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Candid & Traditional Photo Coverage</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Full-day continuous coverage capturing raw emotions, rituals, and family portraits. Delivered in high-res JPEG on private cloud gallery.
              </p>
            </div>

            {/* Deliverable 2 */}
            <div className="group p-6 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">Cinematography</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">4K UHD</span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">4K Cinematic Teaser + Feature Film</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                A 3-5 min viral highlight reel + 25-30 min cinematic narrative film featuring professional sound mixing, color grading, and licensed music.
              </p>
            </div>

            {/* Deliverable 3 */}
            <div className="group p-6 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Aerial Drone</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">Licensed Pilot</span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Aerial Drone 4K Cinematography</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Sweeping 4K venue establishing shots, grand guest entrances, and dramatic outdoor ceremony angles.
              </p>
            </div>

            {/* Deliverable 4 */}
            <div className="group p-6 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Heirloom Print</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">Handcrafted</span>
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Luxury Canvera Hardcover Album</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                40-page flush-mount heirloom album with archival velvet paper, custom gold foil embossed names, and luxury presentation box.
              </p>
            </div>
          </div>
        </div>

        {/* 3D Investment & 3-Tier Split Cards */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-sky-400/30 dark:border-sky-500/30 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-5">
            <div>
              <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">Package Investment</span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(budget)}</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>All-Inclusive Studio Pricing</span>
            </div>
          </div>

          {/* 3 Floating Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-sm hover:border-sky-500/50 transition-colors">
              <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase">1. Booking Advance (20%)</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(advance)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Secures dates & reserves studio crew</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-sm hover:border-purple-500/50 transition-colors">
              <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase">2. Event Day (60%)</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(eventDay)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Due on the primary shoot date</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-sm hover:border-emerald-500/50 transition-colors">
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase">3. Final Delivery (20%)</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(finalBal)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payable upon delivery of all assets</p>
            </div>
          </div>
        </div>

        {/* 3D Tactile E-Signature Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs">
                <FileSignature className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Digital Agreement & Signature</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Draw or type your signature below to lock your date</p>
              </div>
            </div>

            {/* 3D Segmented Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-4 py-2 rounded-xl font-extrabold flex items-center space-x-1.5 transition-all ${
                  signatureMode === 'draw'
                    ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw</span>
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`px-4 py-2 rounded-xl font-extrabold flex items-center space-x-1.5 transition-all ${
                  signatureMode === 'type'
                    ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type</span>
              </button>
            </div>
          </div>

          {/* Signature Box */}
          {signatureMode === 'draw' ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Draw your signature with finger or mouse:</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-rose-500 hover:underline flex items-center space-x-1 text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-500/40 bg-white dark:bg-[#070b14] overflow-hidden relative shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400 font-semibold select-none">
                    ✍️ Sign with finger or mouse here
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                Type your full legal name:
              </label>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Your Full Name"
                className="w-full bg-white dark:bg-[#070b14] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-sky-500 shadow-sm"
              />

              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Generated E-Signature</span>
                <p className="font-serif italic text-3xl text-sky-600 dark:text-sky-400 tracking-wide select-none">
                  {typedSignature || 'Your Signature'}
                </p>
              </div>
            </div>
          )}

          {/* 3D Action CTA Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>256-Bit Encrypted & Legally Binding</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isSignatureReady) {
                  alert(signatureMode === 'draw' ? 'Please draw your signature in the box.' : 'Please enter your full name.');
                  return;
                }
                setShowPaymentModal(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)] flex items-center justify-center space-x-2 transition-all transform active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Proposal & Pay {formatCurrency(advance)} Advance</span>
            </button>
          </div>
        </div>
      </main>

      {/* 3D Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0e1628] border border-sky-400/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp">
            {paymentSuccess ? (
              <div className="text-center space-y-4 py-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-pulse">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Booking Confirmed! 🎉</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Thank you, <strong className="text-slate-900 dark:text-white">{enquiry.name}</strong>! Your 20% advance booking deposit ({formatCurrency(advance)}) has been recorded and your shoot dates are officially locked.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentSuccess(false);
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-extrabold shadow-lg shadow-sky-500/30"
                  >
                    Done & View Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">Pay Booking Advance</h3>
                    <p className="text-xs text-slate-500 font-medium">Instant Retainer Deposit</p>
                  </div>
                  <span className="font-mono font-black text-lg text-sky-600 dark:text-sky-400">
                    {formatCurrency(advance)}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-inner">
                    <p className="font-bold text-slate-900 dark:text-white">Client: {enquiry.name}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Event: {enquiry.event_name || 'Wedding Shoot'}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Signed By: <strong className="text-slate-900 dark:text-white">{signatureMode === 'type' ? typedSignature : enquiry.name}</strong></p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-sky-500" />
                    <span className="font-medium text-[11px]">Instant receipt and booking verification will be issued immediately.</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentSuccess(true)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white text-xs font-black shadow-lg shadow-sky-500/30"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
