'use client';

import React, { useState } from 'react';
import { 
  Layout, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Globe, 
  Smartphone, 
  Monitor, 
  Palette, 
  Send,
  Eye
} from 'lucide-react';

export default function LandingPageTab() {
  const [copied, setCopied] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  // Customization Form State
  const [formTitle, setFormTitle] = useState('Book Your Dream Event Photography');
  const [formSubtitle, setFormSubtitle] = useState('Tell us about your upcoming date and let us create timeless memories.');
  const [primaryColor, setPrimaryColor] = useState('#00d4ff');
  const [studioName, setStudioName] = useState('Ruhana Studio & Pixeva');
  const [requireBudget, setRequireBudget] = useState(true);
  const [requireDate, setRequireDate] = useState(true);

  // Form Preview Interactive Inputs
  const [previewName, setPreviewName] = useState('');
  const [previewEmail, setPreviewEmail] = useState('');
  const [previewDate, setPreviewDate] = useState('');
  const [previewBudget, setPreviewBudget] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const embedCode = `<iframe 
  src="https://pixeva-crm.vercel.app/embed/enquiry-form?studio=${encodeURIComponent(studioName)}&color=${encodeURIComponent(primaryColor)}"
  width="100%" 
  height="680px" 
  style="border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"
  title="${formTitle}"
></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewSubmitted(true);
    setTimeout(() => setPreviewSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl pixeva-card bg-gradient-to-r from-[#12121a] via-[#161622] to-[#0a0a0f] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-base font-extrabold text-white">Public Enquiry Landing Page Builder</h2>
          </div>
          <p className="text-xs text-[#a0a0b0] mt-1 max-w-2xl">
            Design your custom lead acquisition landing page and embed it seamlessly into your website, Linktree, or Instagram bio.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyEmbed}
            className="btn-pixeva-primary flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-xl shadow-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Code Copied!' : 'Copy Embed Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Builder Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <Palette className="w-4 h-4 text-[#8b5cf6]" />
              <h3 className="text-sm font-extrabold text-white">Branding & Text Options</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#a0a0b0] block mb-1">Studio / Brand Header</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#a0a0b0] block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#a0a0b0] block mb-1">Sub-headline Description</label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#a0a0b0] block mb-1">Primary Accent Color</label>
                <div className="flex items-center space-x-2">
                  {['#00d4ff', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        primaryColor === color ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="font-bold text-white block">Required Fields</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireDate}
                    onChange={(e) => setRequireDate(e.target.checked)}
                    className="rounded bg-[#0a0a0f] border-white/20 text-[#00d4ff] focus:ring-0"
                  />
                  <span className="text-[#a0a0b0]">Require Event Date selection</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireBudget}
                    onChange={(e) => setRequireBudget(e.target.checked)}
                    className="rounded bg-[#0a0a0f] border-white/20 text-[#00d4ff] focus:ring-0"
                  />
                  <span className="text-[#a0a0b0]">Require Estimated Budget Range</span>
                </label>
              </div>
            </div>
          </div>

          {/* Code Snippet Box */}
          <div className="pixeva-card bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#a0a0b0] uppercase tracking-wider">Embed Code (HTML / Iframe)</span>
              <button onClick={handleCopyEmbed} className="text-xs text-[#00d4ff] hover:underline flex items-center space-x-1">
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#12121a] text-[11px] font-mono text-emerald-400 overflow-x-auto border border-white/5 scrollbar-none">
              {embedCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Live Responsive Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</span>
            </div>

            <div className="flex items-center space-x-1 p-1 bg-[#12121a] border border-white/10 rounded-xl">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                  deviceView === 'desktop' ? 'bg-white/10 text-white' : 'text-[#a0a0b0] hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                  deviceView === 'mobile' ? 'bg-white/10 text-white' : 'text-[#a0a0b0] hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Preview Container Container */}
          <div className="flex justify-center transition-all duration-300">
            <div
              className={`w-full transition-all duration-300 ${
                deviceView === 'mobile' ? 'max-w-sm rounded-3xl border-8 border-[#1a1a24] shadow-2xl overflow-hidden' : 'w-full'
              }`}
            >
              <div className="pixeva-card bg-gradient-to-b from-[#12121a] to-[#0a0a0f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                {/* Form Branding */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>{studioName}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{formTitle}</h2>
                  <p className="text-xs text-[#a0a0b0] max-w-md mx-auto">{formSubtitle}</p>
                </div>

                {previewSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fadeIn">
                    <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-extrabold text-white">Enquiry Received!</h3>
                    <p className="text-xs text-[#a0a0b0]">
                      Thank you! Our studio team will reach out within 2 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePreviewSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#a0a0b0] block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={previewName}
                          onChange={(e) => setPreviewName(e.target.value)}
                          placeholder="Dhruvi Patel"
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#a0a0b0] block mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={previewEmail}
                          onChange={(e) => setPreviewEmail(e.target.value)}
                          placeholder="dhruvi@example.com"
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {requireDate && (
                        <div>
                          <label className="font-semibold text-[#a0a0b0] block mb-1">Proposed Event Date *</label>
                          <input
                            type="date"
                            required
                            value={previewDate}
                            onChange={(e) => setPreviewDate(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                          />
                        </div>
                      )}

                      {requireBudget && (
                        <div>
                          <label className="font-semibold text-[#a0a0b0] block mb-1">Estimated Budget Range</label>
                          <select
                            value={previewBudget}
                            onChange={(e) => setPreviewBudget(e.target.value)}
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                          >
                            <option value="">Select Range</option>
                            <option value="5k-10k">$5,000 - $10,000</option>
                            <option value="10k-25k">$10,000 - $25,000</option>
                            <option value="25k+">$25,000+</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-semibold text-[#a0a0b0] block mb-1">Tell Us About Your Vision</label>
                      <textarea
                        rows={3}
                        value={previewMessage}
                        onChange={(e) => setPreviewMessage(e.target.value)}
                        placeholder="Location, estimated guests, venue details, preferred photography style..."
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-3 rounded-xl text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Studio Enquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
