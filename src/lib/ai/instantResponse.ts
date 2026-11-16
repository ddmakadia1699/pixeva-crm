import { Enquiry } from '@/lib/supabase/types';

export type ResponseTone = 'luxury' | 'executive' | 'whatsapp' | 'urgency';

export interface DateAvailabilityResult {
  isAvailable: boolean;
  hasConflict: boolean;
  conflictProjectName?: string;
  formattedDate: string;
  daysUntilEvent: number;
  seasonBadge: string;
}

export interface LeadScoreResult {
  score: number; // 0 - 100
  tier: 'VIP Whale' | 'High Value' | 'Standard' | 'Flexible';
  badgeColor: string;
  reasons: string[];
}

export interface ResponseDraft {
  tone: ResponseTone;
  label: string;
  channel: 'whatsapp' | 'email';
  subject: string;
  body: string;
  shortPreview: string;
}

export interface AiStudioSettings {
  studioName: string;
  leadPhotographer: string;
  whatsappNumber: string;
  studioEmail: string;
  portfolioUrl: string;
  holdPeriodHours: number;
  enableAutoDraft: boolean;
}

export const DEFAULT_AI_SETTINGS: AiStudioSettings = {
  studioName: 'Pixeva Cinematic Studios',
  leadPhotographer: 'Lead Director',
  whatsappNumber: '+1 (555) 234-5678',
  studioEmail: 'hello@pixevastudios.com',
  portfolioUrl: 'https://pixeva-crm.vercel.app/galleries',
  holdPeriodHours: 48,
  enableAutoDraft: true,
};

const AI_SETTINGS_KEY = 'pixeva_ai_studio_settings';

export function getAiStudioSettings(): AiStudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load AI studio settings:', e);
  }
  return DEFAULT_AI_SETTINGS;
}

export function saveAiStudioSettings(settings: Partial<AiStudioSettings>): AiStudioSettings {
  const current = getAiStudioSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save AI studio settings:', e);
    }
  }
  return updated;
}

/**
 * Checks calendar availability by comparing the enquiry date against existing shoot projects.
 */
export function checkDateAvailability(
  eventDate?: string,
  existingProjects?: any[]
): DateAvailabilityResult {
  if (!eventDate || !eventDate.trim()) {
    return {
      isAvailable: true,
      hasConflict: false,
      formattedDate: 'Date TBA',
      daysUntilEvent: 0,
      seasonBadge: 'Standard Booking',
    };
  }

  const rawDate = eventDate.trim();
  const parsed = new Date(rawDate);
  const isValidDate = !isNaN(parsed.getTime());

  const formattedDate = isValidDate
    ? parsed.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : rawDate;

  const now = new Date();
  const daysUntil = isValidDate
    ? Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  // Peak Wedding/Shoot Season Check (May-June & Sept-Dec)
  const month = isValidDate ? parsed.getMonth() : 5;
  const isPeakSeason = [4, 5, 8, 9, 10, 11].includes(month);
  const seasonBadge = isPeakSeason ? '🔥 Peak Season Weekend' : 'Standard Date';

  // Compare against projects stored in localStorage or passed in
  let projects: any[] = existingProjects || [];
  if ((!projects || projects.length === 0) && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('pixeva_projects');
      if (stored) projects = JSON.parse(stored);
    } catch {}
  }

  // Look for date conflicts
  const normalizedEventDate = rawDate.split('T')[0];
  const conflictingProject = projects.find((p) => {
    if (!p) return false;
    const pDate = (p.first_event || p.date || '').split('T')[0];
    const status = (p.status || '').toLowerCase();
    const isActive = status !== 'completed' && status !== 'cancelled' && status !== 'archived';
    return isActive && pDate === normalizedEventDate;
  });

  return {
    isAvailable: !conflictingProject,
    hasConflict: !!conflictingProject,
    conflictProjectName: conflictingProject ? conflictingProject.name || conflictingProject.client : undefined,
    formattedDate,
    daysUntilEvent: daysUntil,
    seasonBadge,
  };
}

/**
 * Intelligent Lead Quality & Deal-Value Scoring Engine (0-100)
 */
export function scoreLead(enquiry: Enquiry, availability: DateAvailabilityResult): LeadScoreResult {
  let score = 50;
  const reasons: string[] = [];

  // Budget Analysis
  const budget = enquiry.estimated_budget || (enquiry.budget ? parseFloat(enquiry.budget.replace(/[^0-9.]/g, '')) : 0);
  if (budget >= 5000) {
    score += 25;
    reasons.push('High-budget Tier ($5k+)');
  } else if (budget >= 2500) {
    score += 15;
    reasons.push('Mid-to-High Tier ($2.5k+)');
  } else if (budget > 0) {
    score += 5;
  }

  // Calendar Fit
  if (availability.hasConflict) {
    score -= 20;
    reasons.push(`Double-Booking Conflict with ${availability.conflictProjectName}`);
  } else {
    score += 10;
    reasons.push('Calendar Date 100% Open');
  }

  // Contact Completeness
  if (enquiry.phone && enquiry.phone.trim().length >= 8) {
    score += 10;
    reasons.push('Direct WhatsApp/Phone Verified');
  }
  if (enquiry.email && enquiry.email.includes('@')) {
    score += 5;
  }
  if (enquiry.venue && enquiry.venue.trim().length > 2 && enquiry.venue.toLowerCase() !== 'venue tba') {
    score += 5;
    reasons.push(`Confirmed Venue: ${enquiry.venue}`);
  }

  // Timeline Urgency
  if (availability.daysUntilEvent > 0 && availability.daysUntilEvent <= 60) {
    score += 5;
    reasons.push('Urgent Booking Horizon (<60 Days)');
  }

  // Normalize
  score = Math.max(15, Math.min(99, score));

  let tier: 'VIP Whale' | 'High Value' | 'Standard' | 'Flexible' = 'Standard';
  let badgeColor = 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

  if (score >= 80) {
    tier = 'VIP Whale';
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700';
  } else if (score >= 65) {
    tier = 'High Value';
    badgeColor = 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-700';
  } else if (score < 45) {
    tier = 'Flexible';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700';
  }

  return { score, tier, badgeColor, reasons };
}

/**
 * Generate 4 distinct, hyper-personalized instant response drafts.
 */
export function generateResponseDrafts(
  enquiry: Enquiry,
  availability: DateAvailabilityResult,
  customSettings?: Partial<AiStudioSettings>
): Record<ResponseTone, ResponseDraft> {
  const settings: AiStudioSettings = { ...getAiStudioSettings(), ...customSettings };
  const clientName = enquiry.name ? enquiry.name.split(' ')[0] : 'there';
  const eventName = enquiry.event_name || 'your upcoming event';
  const venue = enquiry.venue && enquiry.venue !== 'Venue TBA' ? `at ${enquiry.venue}` : '';
  const dateStr = availability.formattedDate !== 'Date TBA' ? availability.formattedDate : 'your requested date';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pixeva-crm.vercel.app';
  const proposalUrl = `${baseUrl}/proposal/${enquiry.id}`;
  const galleryUrl = settings.portfolioUrl || `${baseUrl}/galleries`;

  // 1. Luxury & Warm (Tailored for high-end weddings & destination shoots)
  const luxurySubject = `Exclusive Availability for ${dateStr} — ${settings.studioName}`;
  const luxuryBody = availability.hasConflict
    ? `Dear ${clientName},\n\nThank you for considering ${settings.studioName} for ${eventName}! We are deeply honored by your message.\n\nRegarding ${dateStr} ${venue}: our main team is currently slated for a shoot on that date, but we have our associate master team available or can accommodate adjacent dates. Would you be open to a quick 10-minute discovery call to explore our options?\n\nIn the meantime, feel free to browse our private lookbook:\n${galleryUrl}\n\nWarm regards,\n${settings.leadPhotographer}\n${settings.studioName}`
    : `Dear ${clientName},\n\nThank you so much for reaching out to ${settings.studioName}! Congratulations on ${eventName}${venue ? ` ${venue}` : ''}!\n\nI am thrilled to share that ${dateStr} is currently OPEN on our calendar. Because this is a high-demand date, we have placed a courtesy ${settings.holdPeriodHours}-hour hold on the date for you.\n\nWe have prepared an interactive live proposal with our signature 4K cinematic lookbook and bespoke packages for you:\n${proposalUrl}\n\nWould you like to schedule a quick 15-minute concept call this week to walk through your vision?\n\nWith warm regards,\n${settings.leadPhotographer}\n${settings.studioName}`;

  // 2. Executive & Crisp (Best for Corporate, Summits, Commercial, Fashion)
  const execSubject = `Booking & Rate Confirmation: ${eventName} (${dateStr})`;
  const execBody = availability.hasConflict
    ? `Hi ${clientName},\n\nThank you for contacting ${settings.studioName}. Regarding your enquiry for ${dateStr}${venue ? ` ${venue}` : ''}:\n\nOur primary unit has a scheduled production on this calendar date. We can assign our senior second unit or discuss schedule flexibility. Let us know if a brief call today suits your schedule.\n\nBest regards,\n${settings.leadPhotographer}\n${settings.studioName}`
    : `Hi ${clientName},\n\nThank you for reaching out regarding photography & cinematography coverage for ${eventName}${venue ? ` ${venue}` : ''}.\n\nOur production unit is available on ${dateStr}. We have compiled our tailored enterprise rate card and interactive deliverable breakdown here:\n${proposalUrl}\n\nPlease review the deliverables and let us know your preferred call time so we can lock in crew scheduling.\n\nBest regards,\n${settings.leadPhotographer}\n${settings.studioName}`;

  // 3. WhatsApp Fast-Track (Optimized for 1-tap mobile chat)
  const whatsappSubject = `WhatsApp Instant Message`;
  const whatsappBody = availability.hasConflict
    ? `Hi ${clientName}! ✨ Thanks for reaching out to ${settings.studioName} for ${eventName}. Regarding ${dateStr}, our lead team is partially booked, but we'd love to see if our associate unit or an adjacent slot works for you! Can we hop on a quick call today? ${galleryUrl}`
    : `Hi ${clientName}! ✨ Thanks for reaching out to ${settings.studioName}! Great news — *${dateStr}* is currently 100% available on our calendar! 📸\n\nI’ve placed a courtesy ${settings.holdPeriodHours}h hold on your date. Here is your custom interactive proposal & 4K cinematic lookbook:\n👉 ${proposalUrl}\n\nTake a look and let me know if you’d like to chat on a quick 5-min call! — ${settings.leadPhotographer}`;

  // 4. High-Urgency Booking Incentive (Early-bird hold & scarcity)
  const urgencySubject = `Priority Notice: Date Hold Activated for ${dateStr} (${settings.studioName})`;
  const urgencyBody = availability.hasConflict
    ? `Hi ${clientName},\n\nThank you for reaching out! Your date (${dateStr}) has multiple pending inquiries in our system. Let's connect today so we can advise on availability before slots close.\n\nReview packages: ${proposalUrl}\n\nBest,\n${settings.leadPhotographer}`
    : `Hi ${clientName},\n\nThank you for your enquiry for ${eventName}! We receive several requests for ${dateStr} during this season, so we have automatically activated a priority *${settings.holdPeriodHours}-Hour Date Hold* for you.\n\nTo review your tailored investment guide and lock in your date before other requests clear, open your interactive portal:\n${proposalUrl}\n\nLet's chat today to reserve your date!\n\nBest,\n${settings.leadPhotographer}\n${settings.studioName}`;

  return {
    luxury: {
      tone: 'luxury',
      label: 'Luxury & Storytelling',
      channel: 'email',
      subject: luxurySubject,
      body: luxuryBody,
      shortPreview: `Dear ${clientName}, Congratulations on ${eventName}! ${dateStr} is open on our calendar...`,
    },
    executive: {
      tone: 'executive',
      label: 'Executive & Crisp',
      channel: 'email',
      subject: execSubject,
      body: execBody,
      shortPreview: `Hi ${clientName}, production unit available on ${dateStr}. Tailored rate card ready...`,
    },
    whatsapp: {
      tone: 'whatsapp',
      label: 'WhatsApp Fast-Track',
      channel: 'whatsapp',
      subject: whatsappSubject,
      body: whatsappBody,
      shortPreview: `Hi ${clientName}! ✨ Great news — ${dateStr} is available on our calendar! 📸...`,
    },
    urgency: {
      tone: 'urgency',
      label: 'Priority 48h Hold',
      channel: 'whatsapp',
      subject: urgencySubject,
      body: urgencyBody,
      shortPreview: `Hi ${clientName}, priority 48-Hour date hold activated for ${dateStr}...`,
    },
  };
}

/**
 * Sanitizes phone numbers and generates direct click-to-chat WhatsApp link.
 */
export function buildWhatsAppClickUrl(phone: string, message: string): string {
  if (!phone) return '';
  // Clean phone number: remove spaces, dashes, parentheses
  let clean = phone.replace(/[^0-9+]/g, '');

  // If number starts with 0 or doesn't have country code, keep numbers
  if (clean.startsWith('+')) {
    clean = clean.substring(1);
  }

  // If 10 digits without country code, default to US +1 or leave as digits
  if (clean.length === 10) {
    clean = '1' + clean;
  }

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

