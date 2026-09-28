'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Upload, 
  Settings, 
  X, 
  Save, 
  MessageCircle,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'pixeva_landing_page_config';

export default function LandingPageTab() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // 1. Dynamic Public link (working locally on localhost:3000 and in production)
  const publicLink = `${origin}/enquire/user_3I2lBpsfTZcxw4L1GpKAMPCc45a`;

  // 2. Cover Photo
  const [coverPhoto, setCoverPhoto] = useState<string>('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80');

  // 3. Page Text
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState("Fill in your details and we'll get back to you within 24 hours.");

  // 4. Optional Form Fields
  const [showLocation, setShowLocation] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  // 5. Estimate Calculator
  const [showCalculator, setShowCalculator] = useState(false);
  const [startingPrice, setStartingPrice] = useState<string>('');

  // Form submission state in preview
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.coverPhoto !== undefined) setCoverPhoto(config.coverPhoto);
        if (config.headline !== undefined) setHeadline(config.headline);
        if (config.subtitle !== undefined) setSubtitle(config.subtitle);
        if (config.showLocation !== undefined) setShowLocation(config.showLocation);
        if (config.showGuests !== undefined) setShowGuests(config.showGuests);
        if (config.showBudget !== undefined) setShowBudget(config.showBudget);
        if (config.showSource !== undefined) setShowSource(config.showSource);
        if (config.showSocialLinks !== undefined) setShowSocialLinks(config.showSocialLinks);
        if (config.showCalculator !== undefined) setShowCalculator(config.showCalculator);
        if (config.startingPrice !== undefined) setStartingPrice(config.startingPrice);
      }
    } catch (e) {
      console.error('Failed to load landing page config:', e);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) {
        alert('File size exceeds 1 MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const config = {
      coverPhoto,
      headline,
      subtitle,
      showLocation,
      showGuests,
      showBudget,
      showSource,
      showSocialLinks,
      showCalculator,
      startingPrice,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewSubmitted(true);
    setTimeout(() => setPreviewSubmitted(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Public Enquiry Link Bar */}
      <div className="pixeva-card p-4">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
          Your Public Enquiry Link
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
            {publicLink}
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="btn-pixeva-secondary space-x-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={publicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pixeva-secondary space-x-1.5"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Builder & Preview 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cover Photo */}
          <div className="pixeva-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Cover Photo <span className="text-slate-400 font-normal">· 16:9 · max 1 MB</span>
              </label>
              {coverPhoto && (
                <button
                  onClick={() => setCoverPhoto('')}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            {coverPhoto ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200/80 dark:border-white/10 aspect-video group">
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-semibold space-x-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Change Cover Photo</span>
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-slate-400 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#111827]/50 text-center space-y-2 aspect-video">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Click to upload cover photo</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WebP · 16:9 · Max 1 MB</p>
                </div>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Page Text */}
          <div className="pixeva-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Page Text</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Let's capture your story"
                  className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Fill in your details and we'll get back to you within 24 hours."
                  className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Optional Form Fields */}
          <div className="pixeva-card p-5 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Optional Form Fields</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Name, Contact & Event Details are always included.
              </p>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">Location / Venue</span>
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">Number of Guests</span>
                <input
                  type="checkbox"
                  checked={showGuests}
                  onChange={(e) => setShowGuests(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">Budget</span>
                <input
                  type="checkbox"
                  checked={showBudget}
                  onChange={(e) => setShowBudget(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">How did you hear about us?</span>
                <input
                  type="checkbox"
                  checked={showSource}
                  onChange={(e) => setShowSource(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer">
                <span className="font-medium text-slate-700 dark:text-slate-300">Social Links</span>
                <input
                  type="checkbox"
                  checked={showSocialLinks}
                  onChange={(e) => setShowSocialLinks(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Estimate Calculator */}
          <div className="pixeva-card p-5 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Estimate Calculator</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Let clients get an instant ballpark estimate before submitting.
              </p>
            </div>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200/60 dark:border-white/5 cursor-pointer text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Show Calculator on public page</span>
              <input
                type="checkbox"
                checked={showCalculator}
                onChange={(e) => setShowCalculator(e.target.checked)}
                className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
            </label>

            {showCalculator && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10 text-xs animate-fadeIn">
                <div>
                  <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Starting Price (base package)
                  </label>
                  <input
                    type="text"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Changes Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveChanges}
              className="btn-pixeva-primary flex-1 py-2"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Landing Page Configuration</span>
            </button>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Preview */}
        <div className="lg:col-span-7 space-y-3 sticky top-20">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            Live Client Preview
          </span>

          <div className="pixeva-card overflow-hidden">
            {/* Cover Photo */}
            {coverPhoto && (
              <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] overflow-hidden">
                <img src={coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0f172a] via-transparent to-transparent" />
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-5">
              {/* Page Title & Subtitle */}
              <div className="text-center space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {headline || "Let's capture your story"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {subtitle || "Fill in your details and we'll get back to you within 24 hours."}
                </p>
              </div>

              {/* Enquiry Form */}
              {previewSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center space-y-1.5 animate-fadeIn">
                  <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Thank you for submitting!</h3>
                  <p className="text-[11px] text-slate-500">We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handlePreviewSubmit} className="space-y-3.5 text-xs">
                  {/* Name */}
                  <div>
                    <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Name</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Contact</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Event Details</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Event Type (e.g. Wedding)"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="date"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Optional: Location / Venue */}
                  {showLocation && (
                    <div>
                      <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Location / Venue</label>
                      <input
                        type="text"
                        placeholder="Location or Venue"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  )}

                  {/* Optional: Budget */}
                  {showBudget && (
                    <div>
                      <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Budget</label>
                      <input
                        type="text"
                        placeholder="Estimated Budget"
                        className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-pixeva-primary w-full py-2.5 mt-2"
                  >
                    Submit Enquiry
                  </button>
                </form>
              )}

              {/* Public Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <a
                  href="https://wa.me/918904832762"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-700 dark:hover:text-white flex items-center space-x-1"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Get Help</span>
                </a>
                <span>Powered by Pixeva CRM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
