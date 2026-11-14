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
  Sparkles,
  Plus,
  Trash2,
  Share2,
  Instagram,
  Globe,
  Phone,
  Mail,
  Code2,
  Wallet,
  MapPin,
  Users,
  GripVertical
} from 'lucide-react';

const STORAGE_KEY = 'pixeva_landing_page_config';

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

export default function LandingPageTab() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [origin, setOrigin] = useState('http://localhost:3000');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // 1. Dynamic Public link (working locally on localhost:3000 and in production)
  const publicLink = `${origin}/enquire/user_3I2lBpsfTZcxw4L1GpKAMPCc45a`;
  const iframeSnippet = `<iframe src="${publicLink}" width="100%" height="800"></iframe>`;

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  useEffect(() => {
    setWhatsappMessage(
      `Hello! 👋\n\nThank you for reaching out to Pixeva Studio! Here is our official Client Booking Page & Lookbook where you can explore our portfolio, packages, and reserve your event shoot date directly:\n\n👉 ${publicLink}\n\nPlease feel free to reply directly to this message if you have any questions or custom requirements!`
    );
  }, [publicLink]);

  // 2. Cover Photo
  const [coverPhoto, setCoverPhoto] = useState<string>('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80');

  // 3. Page Text
  const [headline, setHeadline] = useState("Let's capture your story");
  const [subtitle, setSubtitle] = useState("Fill in your details and we'll get back to you within 24 hours.");

  // 4. Optional & Custom Form Fields (Reorderable)
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(DEFAULT_FORM_FIELDS);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 5. Studio Social & Contact Links (Dedicated Section)
  const [showSocialSection, setShowSocialSection] = useState(true);
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialPhone, setSocialPhone] = useState('');
  const [socialEmail, setSocialEmail] = useState('');

  // Dynamic Custom Field Builder
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'number' | 'date'>('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

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

        // Load ordered form fields (or reconstruct from legacy flags)
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
        if (config.socialWhatsapp !== undefined) setSocialWhatsapp(config.socialWhatsapp);
        if (config.socialPhone !== undefined) setSocialPhone(config.socialPhone);
        if (config.socialEmail !== undefined) setSocialEmail(config.socialEmail);
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

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(url, '_blank');
    setIsWhatsAppModalOpen(false);
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

  const saveFieldsToStorage = (updatedFields: FormFieldConfig[]) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...existing,
        formFields: updatedFields,
        showLocation: updatedFields.find(f => f.id === 'location')?.enabled ?? true,
        showGuests: updatedFields.find(f => f.id === 'guests')?.enabled ?? true,
        showBudget: updatedFields.find(f => f.id === 'budget')?.enabled ?? true,
        showSource: updatedFields.find(f => f.id === 'source')?.enabled ?? true,
        customFields: updatedFields.filter(f => !f.isBuiltIn),
      }));
    } catch (err) {
      console.error('Failed to auto-save form fields:', err);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...formFields];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    setFormFields(updated);
    setDraggedIndex(null);
    saveFieldsToStorage(updated);
  };

  const handleToggleField = (id: string) => {
    const updated = formFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    setFormFields(updated);
    saveFieldsToStorage(updated);
  };

  const handleDeleteField = (id: string) => {
    const updated = formFields.filter(f => f.id !== id);
    setFormFields(updated);
    saveFieldsToStorage(updated);
  };

  const handleAddField = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newFieldLabel.trim();
    if (!trimmed) return;

    const newField: FormFieldConfig = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label: trimmed,
      isBuiltIn: false,
      enabled: true,
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim() || undefined,
      required: newFieldRequired,
    };

    const updated = [...formFields, newField];
    setFormFields(updated);
    saveFieldsToStorage(updated);

    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setIsAddingField(false);
  };

  const handleSaveChanges = () => {
    const config = {
      coverPhoto,
      headline,
      subtitle,
      formFields,
      showLocation: formFields.find(f => f.id === 'location')?.enabled ?? true,
      showGuests: formFields.find(f => f.id === 'guests')?.enabled ?? true,
      showBudget: formFields.find(f => f.id === 'budget')?.enabled ?? true,
      showSource: formFields.find(f => f.id === 'source')?.enabled ?? true,
      customFields: formFields.filter(f => !f.isBuiltIn),
      showSocialSection,
      socialInstagram,
      socialWebsite,
      socialWhatsapp,
      socialPhone,
      socialEmail,
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
          Your Public Client Booking Link
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
            {publicLink}
          </div>
          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={handleCopyLink}
              className="btn-pixeva-secondary space-x-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleCopyEmbedCode}
              className="btn-pixeva-secondary space-x-1.5 cursor-pointer"
              title="Copy Website Embed Code"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedEmbed ? 'Copied' : 'Embed Code'}</span>
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
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs shadow-emerald-600/30 cursor-pointer"
              title="Send Client Booking Link via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Send to WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Embed on Website Card */}
      <div className="pixeva-card p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/10 via-blue-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Embed on Website
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Embed form on WordPress, Squarespace, Wix or Webflow
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 flex-wrap gap-y-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium">WordPress</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium">Squarespace</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium">Wix</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-medium">Webflow</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
            Embed this responsive iframe on your booking page:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono overflow-x-auto select-all">
              {iframeSnippet}
            </div>
            <button
              onClick={handleCopyEmbedCode}
              className="btn-pixeva-primary shrink-0 space-x-1.5 py-2.5 px-4 cursor-pointer"
            >
              {copiedEmbed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Builder & Preview 2-Column Grid */}
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

          {/* Optional Form Fields (Reorderable List) */}
          <div className="pixeva-card p-5 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Optional Form Fields
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formFields.filter(f => f.enabled).length} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Name, Contact & Event Details are always included. Drag to reorder.
              </p>
            </div>

            {/* Reorderable Fields List */}
            <div className="space-y-1.5 pt-1 text-xs">
              {formFields.map((field, index) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-move select-none ${
                    draggedIndex === index
                      ? 'opacity-40 border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'bg-slate-50/80 dark:bg-[#111827] border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  {/* Left: Drag Grip Handle & Checkbox */}
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <div className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 cursor-grab active:cursor-grabbing p-0.5">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Toggle Checkbox & Label */}
                    <label className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={() => handleToggleField(field.id)}
                        className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span className={`text-xs font-semibold truncate ${
                        field.enabled ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 line-through'
                      }`}>
                        {field.label}
                      </span>
                    </label>
                  </div>

                  {/* Right: Badges & Delete */}
                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {field.isBuiltIn ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-mono">
                        Standard
                      </span>
                    ) : (
                      <>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20 font-mono">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded">
                            Required
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                          title="Delete custom field"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* + Add Custom Field Button / Inline Builder */}
            {!isAddingField ? (
              <button
                type="button"
                onClick={() => setIsAddingField(true)}
                className="w-full mt-2 py-2 px-3 border border-dashed border-slate-300 dark:border-white/15 hover:border-sky-400 dark:hover:border-sky-400/40 rounded-lg text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50/50 dark:bg-[#111827]/50 hover:bg-sky-50/40 dark:hover:bg-sky-500/5 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer group"
              >
                <Plus className="w-3.5 h-3.5 text-sky-500 group-hover:scale-110 transition-transform" />
                <span>Add Custom Field</span>
              </button>
            ) : (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-100/80 dark:bg-[#0b0f17] border border-slate-200 dark:border-white/10 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <Plus className="w-3 h-3 text-sky-500" />
                    <span>New Custom Field</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddField();
                      }
                    }}
                    placeholder="e.g. Instagram Handle, Shoot Duration, Drone Needed"
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Field Type
                    </label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="textarea">Paragraph / Multi-line</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Placeholder (Optional)
                    </label>
                    <input
                      type="text"
                      value={newFieldPlaceholder}
                      onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                      placeholder="e.g. @yourhandle"
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Required field</span>
                  </label>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingField(false)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newFieldLabel.trim()}
                      onClick={() => handleAddField()}
                      className="btn-pixeva-primary py-1 px-3 text-[11px] disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Social Links (Dedicated Separate Section) */}
          <div className="pixeva-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/20">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Social Links
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Connect your studio profiles & direct inquiry channels.
                  </p>
                </div>
              </div>
              <label className="flex items-center space-x-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showSocialSection}
                  onChange={(e) => setShowSocialSection(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Show on Page</span>
              </label>
            </div>

            {showSocialSection && (
              <div className="space-y-3 pt-1 text-xs">
                {/* 1. Instagram URL */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="text"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                {/* 2. Website URL */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>Website URL</span>
                  </label>
                  <input
                    type="text"
                    value={socialWebsite}
                    onChange={(e) => setSocialWebsite(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                {/* 3. WhatsApp number with country code */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp number with country code</span>
                  </label>
                  <input
                    type="text"
                    value={socialWhatsapp}
                    onChange={(e) => setSocialWhatsapp(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                {/* 4. Phone number */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>Phone number</span>
                  </label>
                  <input
                    type="text"
                    value={socialPhone}
                    onChange={(e) => setSocialPhone(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                {/* 5. Email address */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>Email address</span>
                  </label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
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
              <span>Save Client Booking Page Configuration</span>
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

                  {/* Dynamic Ordered Optional Form Fields in Live Preview */}
                  {formFields
                    .filter((f) => f.enabled)
                    .map((field) => {
                      if (field.id === 'budget') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Budget</label>
                            <div className="relative">
                              <Wallet className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                disabled
                                placeholder="Estimated Budget (e.g. 50,000 or Flexible)"
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md pl-8 pr-3 py-1.5 text-slate-900 dark:text-white text-xs"
                              />
                            </div>
                          </div>
                        );
                      }
                      if (field.id === 'location') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Location / Venue</label>
                            <div className="relative">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                disabled
                                placeholder="Location or Venue"
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md pl-8 pr-3 py-1.5 text-slate-900 dark:text-white text-xs"
                              />
                            </div>
                          </div>
                        );
                      }
                      if (field.id === 'guests') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">Number of Guests</label>
                            <div className="relative">
                              <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <select
                                disabled
                                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md pl-8 pr-3 py-1.5 text-slate-900 dark:text-white text-xs cursor-pointer"
                              >
                                <option>100 to 300 Guests</option>
                                <option>Under 100</option>
                                <option>300 to 500</option>
                                <option>500+ Guests</option>
                              </select>
                            </div>
                          </div>
                        );
                      }
                      if (field.id === 'source') {
                        return (
                          <div key={field.id} className="animate-fadeIn">
                            <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">How did you hear about us?</label>
                            <select
                              disabled
                              className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white text-xs cursor-pointer"
                            >
                              <option>Instagram</option>
                              <option>Friend / Referral</option>
                              <option>Website</option>
                              <option>Google Search</option>
                            </select>
                          </div>
                        );
                      }
                      // Custom Field
                      return (
                        <div key={field.id} className="animate-fadeIn">
                          <label className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              rows={2}
                              disabled
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                            />
                          ) : (
                            <input
                              type={field.type}
                              disabled
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 text-xs"
                            />
                          )}
                        </div>
                      );
                    })}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-pixeva-primary w-full py-2.5 mt-2"
                  >
                    Submit Enquiry
                  </button>
                </form>
              )}

              {/* Studio Social Links & Direct Channels in Preview */}
              {showSocialSection && (socialInstagram || socialWebsite || socialWhatsapp || socialPhone || socialEmail) && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Studio Social & Contact Links
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {socialInstagram && (
                      <a
                        href={socialInstagram.startsWith('http') ? socialInstagram : `https://instagram.com/${socialInstagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[11px] font-semibold hover:bg-pink-500/20 transition-colors"
                      >
                        <Instagram className="w-3 h-3" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {socialWebsite && (
                      <a
                        href={socialWebsite.startsWith('http') ? socialWebsite : `https://${socialWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-semibold hover:bg-sky-500/20 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                      </a>
                    )}
                    {socialWhatsapp && (
                      <a
                        href={`https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {socialPhone && (
                      <a
                        href={`tel:${socialPhone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                    {socialEmail && (
                      <a
                        href={`mailto:${socialEmail}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold hover:bg-amber-500/20 transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Public Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <a
                  href={socialWhatsapp ? `https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, '')}` : "https://wa.me/918904832762"}
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

      {/* WhatsApp Send Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Send Booking Link to WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dispatch your official client booking page directly via WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Recipient Phone */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Client WhatsApp Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210 (leave empty to pick chat in WhatsApp)"
                  className="w-full bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to choose from your existing WhatsApp chats or groups.
                </p>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Message Preview
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppMessage}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Copied Message' : 'Copy Message'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0b0f17] border border-slate-200/80 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              {/* Link Highlight Pill */}
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-emerald-800 dark:text-emerald-300 font-mono text-[11px] truncate">
                    {publicLink}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
                  Live Link
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-end space-x-2.5 bg-slate-50/50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open in WhatsApp & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
