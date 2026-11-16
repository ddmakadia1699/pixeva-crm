'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Edit,
  Plus,
  X,
  Zap,
  CreditCard,
  QrCode,
  Building2,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  BadgePercent,
  Sliders,
  DollarSign,
  Save,
  Eye,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { openProposalPdfWindow, openReceiptPdfWindow } from '@/lib/pdf/generateProposalPdf';
import { Enquiry } from '@/lib/supabase/types';
import { apiClient } from '@/lib/api/apiClient';

export interface ProposalDeliverable {
  id: string;
  category: string;
  badge: string;
  title: string;
  description: string;
}

export type PackageTier = 'classic' | 'master' | 'bespoke';

export interface ProposalAddOn {
  id: string;
  title: string;
  subtitle: string;
  usdPrice: number;
  inrPrice: number;
  category: string;
  badge: string;
  icon?: any;
}

const DEFAULT_PROPOSAL_DELIVERABLES: ProposalDeliverable[] = [
  {
    id: 'deliv-1',
    category: 'Photography',
    badge: 'All Days',
    title: 'Candid & Traditional Photo Coverage',
    description: 'Full-day continuous coverage capturing raw emotions, rituals, and family portraits. Delivered in high-res JPEG on private cloud gallery.'
  },
  {
    id: 'deliv-2',
    category: 'Cinematography',
    badge: '4K UHD',
    title: '4K Cinematic Teaser + Feature Film',
    description: 'A 3-5 min viral highlight reel + 25-30 min cinematic narrative film featuring professional sound mixing, color grading, and licensed music.'
  },
  {
    id: 'deliv-3',
    category: 'Aerial Drone',
    badge: 'Licensed Pilot',
    title: 'Aerial Drone 4K Cinematography',
    description: 'Sweeping 4K venue establishing shots, grand guest entrances, and dramatic outdoor ceremony angles.'
  },
  {
    id: 'deliv-4',
    category: 'Heirloom Print',
    badge: 'Handcrafted',
    title: 'Luxury Canvera Hardcover Album',
    description: '40-page flush-mount heirloom album with archival velvet paper, custom gold foil embossed names, and luxury presentation box.'
  }
];

const DEFAULT_ADDONS: ProposalAddOn[] = [
  {
    id: 'addon-drone',
    title: '4K FPV Aerial Drone Cinematography',
    subtitle: 'Dynamic outdoor venue fly-throughs, sunset establishing shots, and dramatic aerial reveals by certified drone pilot.',
    usdPrice: 500,
    inrPrice: 35000,
    category: 'Aerial Drone',
    badge: 'Licensed Pilot',
  },
  {
    id: 'addon-second-shooter',
    title: 'Senior Associate 2nd Photographer',
    subtitle: 'Simultaneous dual-angle coverage for getting-ready rituals, groom prep, and spontaneous candid guest reactions.',
    usdPrice: 600,
    inrPrice: 40000,
    category: 'Photography',
    badge: 'Double Coverage',
  },
  {
    id: 'addon-parent-albums',
    title: 'Twin Handcrafted Parent Heirloom Albums',
    subtitle: 'Two 30-page archival flush-mount albums in custom embossed presentation cases for parents and grandparents.',
    usdPrice: 450,
    inrPrice: 30000,
    category: 'Heirloom Print',
    badge: 'Handcrafted',
  },
  {
    id: 'addon-express-teaser',
    title: 'Express 48-Hour Viral Instagram Reel',
    subtitle: 'High-energy 60-second vertical teaser reel edited, color-graded, and delivered within 48 hours of reception.',
    usdPrice: 350,
    inrPrice: 20000,
    category: 'Cinematography',
    badge: 'Express 48h Turnaround',
  },
  {
    id: 'addon-prewed-film',
    title: 'Pre-Wedding Sunset Concept Session',
    subtitle: 'Half-day artistic couple portrait shoot at an exclusive scenic outdoor location or heritage architectural landmark.',
    usdPrice: 750,
    inrPrice: 50000,
    category: 'Photography',
    badge: 'Editorial Portrait',
  },
  {
    id: 'addon-raw-ssd',
    title: 'Original RAW Footage & Master SSD Drive',
    subtitle: 'All uncompressed 4K video clips and RAW master image catalogs shipped on a high-speed waterproof rugged SSD.',
    usdPrice: 250,
    inrPrice: 15000,
    category: 'Archival Vault',
    badge: 'Master Archival',
  },
];

export default function ClientProposalPage() {
  const { formatCurrency, currency } = useCurrency();
  const [isMounted, setIsMounted] = useState(false);
  const params = useParams();
  const proposalId = (params?.id as string) || 'prop-default';

  // Studio Edit Mode Toggle State
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Studio Info (Editable)
  const [studioName, setStudioName] = useState('Pixeva');
  const [studioTagline, setStudioTagline] = useState('Cinematic Media & Photography');
  const [studioHeadline, setStudioHeadline] = useState('Bespoke Coverage Proposal');
  const [studioDescription, setStudioDescription] = useState(
    'Customize your production tier, select optional high-impact add-ons, review your live investment total, and lock your date with a secure 20% advance retainer.'
  );

  // Proposal Enquiry Core Data (Editable)
  const [enquiry, setEnquiry] = useState<Enquiry>({
    id: proposalId,
    name: 'Rahul & Priya',
    contact: '+91 98765 43210',
    email: 'client@example.com',
    event_name: 'Wedding & Reception',
    venue: 'Grand Palace Hotel',
    received_on: new Date().toISOString().slice(0, 10),
    source: 'Website',
    estimated_budget: 250000,
    status: 'proposal',
    created_at: new Date().toISOString(),
  });

  // Base Anchor Budget & Tier selection
  const [baseAnchorBudget, setBaseAnchorBudget] = useState<number>(250000);
  const [selectedTier, setSelectedTier] = useState<PackageTier>('master');

  // Custom Deliverables (Editable List)
  const [deliverables, setDeliverables] = useState<ProposalDeliverable[]>(DEFAULT_PROPOSAL_DELIVERABLES);

  // Interactive Add-ons (Editable List)
  const [availableAddons, setAvailableAddons] = useState<ProposalAddOn[]>(DEFAULT_ADDONS);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Set<string>>(new Set(['addon-drone']));

  // Contract Terms Accordion
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  const [contractTerms, setContractTerms] = useState({
    turnaround: 'Express teasers dispatched within 48–72 hours. Full edited high-res photo gallery delivered within 25 days. Master cinematic film and albums delivered within 45 days.',
    rescheduling: 'In the event of unforeseen weather or venue shifts, your 20% retainer is 100% transferable to any available date within 12 months with 30-day prior written notice.',
    rights: 'You receive unlimited perpetual personal printing, sharing, and digital distribution rights. Pixeva Studios securely archives your master footage in cloud cold-storage for 5 years.',
  });

  // Signature States
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('Rahul & Priya');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Payment Method & Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'bank'>('card');
  const [copiedLink, setCopiedLink] = useState(false);
  const [receiptRef, setReceiptRef] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine if budget is in USD/EUR scale (< 15,000) or INR scale (>= 15,000)
  const isUsdScale = baseAnchorBudget < 15000;

  // Compute Base Tier Price
  const baseTierPrice = useMemo(() => {
    if (selectedTier === 'classic') return Math.round(baseAnchorBudget * 0.8);
    if (selectedTier === 'bespoke') return Math.round(baseAnchorBudget * 1.35);
    return baseAnchorBudget; // master tier
  }, [baseAnchorBudget, selectedTier]);

  // Compute Total Add-Ons Price
  const addOnsTotal = useMemo(() => {
    let sum = 0;
    availableAddons.forEach((addon) => {
      if (selectedAddOnIds.has(addon.id)) {
        sum += isUsdScale ? addon.usdPrice : addon.inrPrice;
      }
    });
    return sum;
  }, [availableAddons, selectedAddOnIds, isUsdScale]);

  // Grand Total & Payment Split (20% Advance, 60% Event Day, 20% Final)
  const grandTotal = baseTierPrice + addOnsTotal;
  const advance = Math.round(grandTotal * 0.2);
  const eventDay = Math.round(grandTotal * 0.6);
  const finalBal = Math.round(grandTotal * 0.2);

  // =========================================================================
  // Hydration: 1. Custom Storage -> 2. Local Projects/Leads -> 3. Cloud Sync
  // =========================================================================
  useEffect(() => {
    setIsMounted(true);

    // Check if ?edit=true was passed in URL query
    if (typeof window !== 'undefined' && window.location.search.includes('edit=true')) {
      setIsEditMode(true);
    }

    let foundMatch = false;

    try {
      // 1. Check custom saved proposal draft first
      const customKey = `pixeva_proposal_custom_${proposalId}`;
      const savedCustom = localStorage.getItem(customKey);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (parsed.enquiry) setEnquiry(parsed.enquiry);
        if (parsed.baseAnchorBudget) setBaseAnchorBudget(parsed.baseAnchorBudget);
        if (parsed.deliverables && Array.isArray(parsed.deliverables)) setDeliverables(parsed.deliverables);
        if (parsed.availableAddons && Array.isArray(parsed.availableAddons)) setAvailableAddons(parsed.availableAddons);
        if (parsed.selectedTier) setSelectedTier(parsed.selectedTier);
        if (parsed.selectedAddOnIds) setSelectedAddOnIds(new Set(parsed.selectedAddOnIds));
        if (parsed.studioName) setStudioName(parsed.studioName);
        if (parsed.studioTagline) setStudioTagline(parsed.studioTagline);
        if (parsed.studioHeadline) setStudioHeadline(parsed.studioHeadline);
        if (parsed.studioDescription) setStudioDescription(parsed.studioDescription);
        if (parsed.typedSignature) setTypedSignature(parsed.typedSignature);
        foundMatch = true;
      }

      // 2. Check local projects
      if (!foundMatch) {
        const savedProjects = localStorage.getItem('pixeva_projects');
        if (savedProjects) {
          const projList = JSON.parse(savedProjects);
          const projMatch = projList.find(
            (p: any) => p.id === proposalId || (p.name && p.name.toLowerCase().includes(proposalId.toLowerCase()))
          );
          if (projMatch) {
            const matchedBudget = Number(projMatch.total_amount) || 250000;
            setEnquiry({
              id: projMatch.id,
              name: projMatch.client || projMatch.name || 'Client',
              contact: projMatch.client_phone || '+91 98765 43210',
              email: '',
              event_name: projMatch.name || 'Wedding & Reception',
              venue: projMatch.venue || 'Grand Palace Hotel',
              received_on: projMatch.first_event || new Date().toISOString().slice(0, 10),
              source: 'Website',
              estimated_budget: matchedBudget,
              status: 'proposal',
              created_at: projMatch.created_at || new Date().toISOString(),
            });
            setTypedSignature(projMatch.client || 'Client');
            setBaseAnchorBudget(matchedBudget);
            foundMatch = true;
          }
        }
      }

      // 3. Check local enquiries
      if (!foundMatch) {
        const saved = localStorage.getItem('pixeva_enquiries');
        if (saved) {
          const list: Enquiry[] = JSON.parse(saved);
          const match = list.find((e) => e.id === proposalId || (e.name && e.name.toLowerCase().includes(proposalId.toLowerCase())));
          if (match) {
            const matchedBudget = match.estimated_budget || (match.budget ? parseFloat(match.budget.replace(/[^0-9.]/g, '')) : 250000) || 250000;
            setEnquiry(match);
            setTypedSignature(match.name);
            setBaseAnchorBudget(matchedBudget);
            foundMatch = true;
          }
        }
      }
    } catch (e) {
      console.warn('Local proposal hydration warning:', e);
    }

    // 4. Asynchronously fetch from Cloud API Gateway (Supabase) if not found or to sync
    async function fetchCloudRecord() {
      try {
        const [cloudLeads, cloudProjects] = await Promise.all([
          apiClient.enquiries.list().catch(() => []),
          apiClient.projects.list().catch(() => [])
        ]);

        if (Array.isArray(cloudLeads) && cloudLeads.length > 0) {
          const matchedLead = cloudLeads.find((l: any) => l.id === proposalId);
          if (matchedLead) {
            const clientName = `${matchedLead.first_name || ''} ${matchedLead.last_name || ''}`.trim() || matchedLead.name || 'Valued Client';
            const val = Number(matchedLead.estimated_value) || 250000;
            const mappedDate = matchedLead.notes?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString().slice(0, 10);
            const mappedVenue = matchedLead.notes?.match(/at\s+([^\n.]+)/i)?.[1] || 'Grand Palace Hotel';
            
            setEnquiry((prev) => ({
              ...prev,
              id: matchedLead.id,
              name: clientName,
              email: matchedLead.email || prev.email,
              phone: matchedLead.phone || prev.phone,
              contact: matchedLead.phone || prev.contact,
              event_name: matchedLead.company || 'Wedding & Reception',
              venue: mappedVenue,
              received_on: mappedDate,
              estimated_budget: val,
            }));
            setTypedSignature(clientName);
            setBaseAnchorBudget(val);
            return;
          }
        }

        if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
          const matchedProj = cloudProjects.find((p: any) => p.id === proposalId);
          if (matchedProj) {
            const val = Number(matchedProj.total_amount) || 250000;
            setEnquiry((prev) => ({
              ...prev,
              id: matchedProj.id,
              name: matchedProj.client || prev.name,
              event_name: matchedProj.name || prev.event_name,
              venue: matchedProj.venue || prev.venue,
              received_on: matchedProj.first_event || prev.received_on,
              estimated_budget: val,
            }));
            setTypedSignature(matchedProj.client || 'Client');
            setBaseAnchorBudget(val);
          }
        }
      } catch (err) {
        console.warn('Cloud proposal sync notice:', err);
      }
    }

    fetchCloudRecord();
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
      const cleanUrl = window.location.origin + window.location.pathname;
      navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleAddOn = (addonId: string) => {
    setSelectedAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) {
        next.delete(addonId);
      } else {
        next.add(addonId);
      }
      return next;
    });
  };

  const isSignatureReady = signatureMode === 'type' ? typedSignature.trim().length > 0 : hasDrawn;

  // Compiled deliverables combining base deliverables + selected add-ons
  const compiledDeliverables = useMemo(() => {
    const list = [...deliverables];
    availableAddons.forEach((addon) => {
      if (selectedAddOnIds.has(addon.id)) {
        list.push({
          id: addon.id,
          category: addon.category,
          badge: addon.badge,
          title: addon.title,
          description: addon.subtitle,
        });
      }
    });
    return list;
  }, [deliverables, availableAddons, selectedAddOnIds]);

  // =========================================================================
  // Master Save Handler: Saves all edits to LocalStorage and Cloud
  // =========================================================================
  const handleSaveAllChanges = async () => {
    const customPayload = {
      enquiry,
      baseAnchorBudget,
      deliverables,
      availableAddons,
      selectedTier,
      selectedAddOnIds: Array.from(selectedAddOnIds),
      studioName,
      studioTagline,
      studioHeadline,
      studioDescription,
      typedSignature,
      lastSaved: new Date().toISOString(),
    };

    try {
      if (typeof window !== 'undefined') {
        // 1. Save proposal custom record
        localStorage.setItem(`pixeva_proposal_custom_${proposalId}`, JSON.stringify(customPayload));

        // 2. Update enquiry in pixeva_enquiries
        const rawEnquiries = localStorage.getItem('pixeva_enquiries');
        if (rawEnquiries) {
          const enqList: Enquiry[] = JSON.parse(rawEnquiries);
          const updated = enqList.map((e) =>
            e.id === proposalId || e.name.toLowerCase().includes(proposalId.toLowerCase())
              ? {
                  ...e,
                  name: enquiry.name,
                  event_name: enquiry.event_name,
                  venue: enquiry.venue,
                  event_date: enquiry.received_on,
                  received_on: enquiry.received_on,
                  estimated_budget: grandTotal,
                }
              : e
          );
          localStorage.setItem('pixeva_enquiries', JSON.stringify(updated));
        }

        // 3. Update project in pixeva_projects
        const rawProjects = localStorage.getItem('pixeva_projects');
        if (rawProjects) {
          const projList = JSON.parse(rawProjects);
          const updated = projList.map((p: any) =>
            p.id === proposalId || (p.name === enquiry.event_name && p.client === enquiry.name)
              ? {
                  ...p,
                  name: enquiry.event_name,
                  client: enquiry.name,
                  venue: enquiry.venue,
                  first_event: enquiry.received_on,
                  total_amount: grandTotal,
                }
              : p
          );
          localStorage.setItem('pixeva_projects', JSON.stringify(updated));
        }
      }

      // 4. Fire cloud sync in background
      try {
        await apiClient.enquiries.update(proposalId, enquiry.status);
      } catch {}

      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3000);
    } catch (err) {
      console.error('Failed to save proposal changes:', err);
      alert('Error saving proposal changes.');
    }
  };

  // Add-on item management (in Edit Mode)
  const handleAddNewAddOn = () => {
    const newId = `addon-custom-${Date.now()}`;
    const newAddon: ProposalAddOn = {
      id: newId,
      title: 'Custom Production Upgrade',
      subtitle: 'Describe the custom service, gear, or deliverable included.',
      usdPrice: 300,
      inrPrice: 20000,
      category: 'Production',
      badge: 'Custom Upgrade',
    };
    setAvailableAddons([...availableAddons, newAddon]);
    setSelectedAddOnIds((prev) => new Set([...Array.from(prev), newId]));
  };

  const handleDeleteAddOn = (addonId: string) => {
    setAvailableAddons(availableAddons.filter((a) => a.id !== addonId));
    setSelectedAddOnIds((prev) => {
      const next = new Set(prev);
      next.delete(addonId);
      return next;
    });
  };

  // Deliverable item management (in Edit Mode)
  const handleAddNewDeliverable = () => {
    const newDeliverable: ProposalDeliverable = {
      id: `deliv-${Date.now()}`,
      category: 'Photography',
      badge: 'Master Deliverable',
      title: 'New Service Item',
      description: 'Specifications of coverage, camera gear, and delivery format.',
    };
    setDeliverables([...deliverables, newDeliverable]);
  };

  const handleDeleteDeliverable = (delivId: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== delivId));
  };

  // Confirm booking & payment
  const handleConfirmAcceptanceAndPay = () => {
    const newRef = `REC-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReceiptRef(newRef);
    setPaymentSuccess(true);

    const clientSigner = signatureMode === 'type' ? typedSignature : enquiry.name;
    const selectedAddonTitles = availableAddons.filter((a) => selectedAddOnIds.has(a.id)).map((a) => a.title);

    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pixeva_enquiries');
        if (saved) {
          const list: Enquiry[] = JSON.parse(saved);
          const updated = list.map((e) =>
            e.id === proposalId || e.name.toLowerCase().includes(proposalId.toLowerCase())
              ? {
                  ...e,
                  status: 'booked' as const,
                  estimated_budget: grandTotal,
                  notes: `${e.notes || ''}\n• [Proposal Accepted & Signed by ${clientSigner} on ${new Date().toLocaleDateString()}]\n• Package Tier: ${selectedTier.toUpperCase()} (${formatCurrency(grandTotal)})\n• Add-ons: ${selectedAddonTitles.join(', ') || 'None'}\n• 20% Retainer Paid: ${formatCurrency(advance)}`,
                }
              : e
          );
          localStorage.setItem('pixeva_enquiries', JSON.stringify(updated));
        }

        const rawProjects = localStorage.getItem('pixeva_projects');
        let projects = rawProjects ? JSON.parse(rawProjects) : [];
        const enqEventName = enquiry.event_name || `${enquiry.name}'s Shoot`;

        const existingProjIndex = projects.findIndex(
          (p: any) => p.id === proposalId || (p.name === enqEventName && p.client === enquiry.name)
        );

        const projectDeliverables = compiledDeliverables.map((d) => ({
          id: d.id,
          title: d.title,
          completed: false,
        }));

        if (existingProjIndex >= 0) {
          projects[existingProjIndex] = {
            ...projects[existingProjIndex],
            total_amount: grandTotal,
            paid_amount: advance,
            payment_status: 'Partially Paid (20% Retainer Received)',
            status: 'Active',
            contract: 'Accepted',
            deliverables: projectDeliverables,
          };
        } else {
          const newProject = {
            id: `proj-${Date.now()}`,
            name: enqEventName,
            type: enquiry.event_type === 'corporate' ? 'Corporate' : 'Wedding',
            client: enquiry.name,
            client_phone: enquiry.contact || enquiry.phone || '',
            first_event: enquiry.received_on || new Date().toISOString().slice(0, 10),
            venue: enquiry.venue || 'Venue TBA',
            call_time: '08:00 AM',
            total_amount: grandTotal,
            paid_amount: advance,
            payment_status: 'Partially Paid (20% Retainer Received)',
            status: 'Active',
            completeness: 'In Progress (20%)',
            contract: 'Accepted',
            assigned_crew: [
              { id: 'c1', name: 'Lead Director', role: 'Director & Lead Cine', initials: 'LD', phone: '15552345678' },
            ],
            deliverables: projectDeliverables,
            created_at: new Date().toISOString(),
          };
          projects = [newProject, ...projects];
        }
        localStorage.setItem('pixeva_projects', JSON.stringify(projects));
      }
    } catch (err) {
      console.error('Error auto-syncing accepted proposal to CRM:', err);
    }
  };

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
        <div className="rounded-2xl bg-white/85 dark:bg-[#0d1424]/85 backdrop-blur-xl border border-white/60 dark:border-white/10 px-4 sm:px-5 py-3 flex items-center justify-between shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 transform hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="font-black text-base sm:text-lg tracking-tight bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 max-w-[120px]"
                  />
                ) : (
                  <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">{studioName}</span>
                )}
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white uppercase tracking-wider shadow-xs">
                  STUDIO
                </span>
              </div>
              {isEditMode ? (
                <input
                  type="text"
                  value={studioTagline}
                  onChange={(e) => setStudioTagline(e.target.value)}
                  className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-0.2 mt-0.5 text-slate-500 dark:text-slate-400"
                />
              ) : (
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{studioTagline}</p>
              )}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Studio Edit Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                isEditMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30 ring-2 ring-amber-400/40'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
              }`}
              title="Toggle Edit Mode to customize text, rates, deliverables and client info"
            >
              {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isEditMode ? 'Preview Mode' : 'Edit Proposal'}</span>
            </button>

            {/* Share / Copy Link */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-sky-500" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={() => openProposalPdfWindow({ ...enquiry, estimated_budget: grandTotal }, compiledDeliverables)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-6 sm:space-y-8">

        {/* Studio Edit Mode Announcement Banner (Visible when isEditMode is true) */}
        {isEditMode && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                <Edit className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Studio Proposal Editor Active
                  </h3>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 uppercase">
                    Live Editing
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Click any dashed field below to edit client names, event details, package investment, services, or add-ons.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveAllChanges}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccessToast ? 'Saved!' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Save Toast */}
        {saveSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-2xl flex items-center space-x-2.5 animate-slideUp font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            <span>Proposal saved successfully! Live link updated.</span>
          </div>
        )}

        {/* 3D Elevated Hero Banner */}
        <div className="relative rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 p-6 sm:p-10 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-extrabold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {isEditMode ? (
                  <input
                    type="text"
                    value={studioHeadline}
                    onChange={(e) => setStudioHeadline(e.target.value)}
                    className="bg-transparent border-b border-sky-400 focus:outline-hidden font-extrabold"
                  />
                ) : (
                  <span>{studioHeadline}</span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Valid for 14 Days</span>
            </div>
          </div>

          <div className="space-y-3 max-w-2xl">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Proposal Prepared For:</span>
              {isEditMode ? (
                <div>
                  <input
                    type="text"
                    value={enquiry.name}
                    onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                    className="w-full text-2xl sm:text-4xl font-black bg-amber-50/70 dark:bg-amber-950/30 border-2 border-dashed border-amber-400 dark:border-amber-500 rounded-2xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-hidden"
                    placeholder="Client or Couple Name (e.g. Sophia Miller)"
                  />
                </div>
              ) : (
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">{enquiry.name}</span>
                </h1>
              )}
            </div>

            {isEditMode ? (
              <textarea
                rows={2}
                value={studioDescription}
                onChange={(e) => setStudioDescription(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-700 dark:text-slate-300"
              />
            ) : (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {studioDescription}
              </p>
            )}
          </div>

          {/* Meta Details Pills (Editable in Edit Mode) */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            
            {/* Event Date */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <Calendar className="w-4 h-4 text-sky-500" />
              {isEditMode ? (
                <input
                  type="date"
                  value={enquiry.received_on || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, received_on: e.target.value, event_date: e.target.value })}
                  className="bg-transparent border-b border-sky-400 focus:outline-hidden text-xs font-semibold"
                />
              ) : (
                <span>{enquiry.received_on || 'Upcoming Date'}</span>
              )}
            </div>

            {/* Event Name */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-purple-500" />
              {isEditMode ? (
                <input
                  type="text"
                  value={enquiry.event_name || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, event_name: e.target.value })}
                  placeholder="Event Title"
                  className="bg-transparent border-b border-purple-400 focus:outline-hidden text-xs font-semibold"
                />
              ) : (
                <span>{enquiry.event_name || 'Wedding & Reception'}</span>
              )}
            </div>

            {/* Event Venue */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {isEditMode ? (
                <input
                  type="text"
                  value={enquiry.venue || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, venue: e.target.value })}
                  placeholder="Venue Location"
                  className="bg-transparent border-b border-emerald-400 focus:outline-hidden text-xs font-semibold"
                />
              ) : (
                <span>{enquiry.venue || 'Venue TBA'}</span>
              )}
            </div>

            {/* Contact Phone (in Edit Mode) */}
            {isEditMode && (
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold shadow-xs">
                <Phone className="w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  value={enquiry.contact || enquiry.phone || ''}
                  onChange={(e) => setEnquiry({ ...enquiry, contact: e.target.value, phone: e.target.value })}
                  placeholder="Phone Number"
                  className="bg-transparent border-b border-blue-400 focus:outline-hidden text-xs font-semibold"
                />
              </div>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. INTERACTIVE PACKAGE TIER SELECTOR */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-sky-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Step 1: Choose Your Production Tier
              </h2>
            </div>

            {/* Base Budget Editor (Editable in Edit Mode) */}
            {isEditMode ? (
              <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Anchor Budget:</span>
                <input
                  type="number"
                  value={baseAnchorBudget}
                  onChange={(e) => setBaseAnchorBudget(Number(e.target.value) || 0)}
                  className="w-28 text-xs font-black font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1"
                />
              </div>
            ) : (
              <span className="text-xs text-slate-400">Tap tier to toggle package</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Tier 1: Classic Signature */}
            <div
              onClick={() => setSelectedTier('classic')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedTier === 'classic'
                  ? 'bg-white dark:bg-[#0e1628] border-sky-500 ring-2 ring-sky-500/20 shadow-xl'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">Classic Signature</span>
                  {selectedTier === 'classic' && (
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(Math.round(baseAnchorBudget * 0.8))}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Essential full-day cinematic coverage</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/10">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>2-Camera Master Crew (1 Photo + 1 Cinema)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>4K Highlights Cinematic Teaser (3-5 min)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>Private Cloud Gallery (1-Year Access)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tier 2: Master Cinematic (Recommended) */}
            <div
              onClick={() => setSelectedTier('master')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedTier === 'master'
                  ? 'bg-white dark:bg-[#0e1628] border-sky-500 ring-2 ring-sky-500/30 shadow-2xl scale-[1.02]'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                ⭐ Most Popular Choice
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Master Cinematic</span>
                  {selectedTier === 'master' && (
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(baseAnchorBudget)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Signature 3-crew production + 4K drone</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/10">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>3-Camera Crew (2 Photo + 1 Cinema)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>4K Teaser + 30-min Master Feature Film</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>4K Aerial Drone Coverage Included</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span>40-Page Canvera Archival Heirloom Album</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tier 3: Royal Bespoke Luxe */}
            <div
              onClick={() => setSelectedTier('bespoke')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                selectedTier === 'bespoke'
                  ? 'bg-white dark:bg-[#0e1628] border-purple-500 ring-2 ring-purple-500/20 shadow-xl'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Royal Bespoke Luxe</span>
                  {selectedTier === 'bespoke' && (
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(Math.round(baseAnchorBudget * 1.35))}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">VIP full luxury multi-day entourage</p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/10">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>4-Camera Elite Master Team + Director</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Pre-Wedding Sunset Film & Photo Shoot</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>2 Parent Mini Heirloom Albums Included</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Archival SSD Drive with All RAW Media</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. INCLUDED SERVICES & MASTER DELIVERABLES (Editable) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Included Master Deliverables ({deliverables.length})
              </h2>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={handleAddNewDeliverable}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deliverable</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliverables.map((deliv, index) => {
              return (
                <div
                  key={deliv.id || index}
                  className={`p-6 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] transition-all space-y-3 relative ${
                    isEditMode ? 'ring-1 ring-amber-400/50' : 'hover:-translate-y-1.5'
                  }`}
                >
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={deliv.category}
                          onChange={(e) => {
                            const next = [...deliverables];
                            next[index].category = e.target.value;
                            setDeliverables(next);
                          }}
                          placeholder="Category (e.g. Photography)"
                          className="text-xs font-black uppercase text-sky-600 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 w-32"
                        />
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={deliv.badge}
                            onChange={(e) => {
                              const next = [...deliverables];
                              next[index].badge = e.target.value;
                              setDeliverables(next);
                            }}
                            placeholder="Badge (e.g. 4K UHD)"
                            className="text-[10px] font-bold text-purple-600 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 w-24 text-right"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteDeliverable(deliv.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                            title="Delete this deliverable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={deliv.title}
                        onChange={(e) => {
                          const next = [...deliverables];
                          next[index].title = e.target.value;
                          setDeliverables(next);
                        }}
                        placeholder="Service Title"
                        className="w-full font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                      />

                      <textarea
                        rows={2}
                        value={deliv.description}
                        onChange={(e) => {
                          const next = [...deliverables];
                          next[index].description = e.target.value;
                          setDeliverables(next);
                        }}
                        placeholder="Deliverable description..."
                        className="w-full text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {deliv.category}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
                          {deliv.badge}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {deliv.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {deliv.description}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INTERACTIVE PRODUCTION UPGRADES & ADD-ONS (Editable) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Step 2: Customize With Production Add-Ons
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleAddNewAddOn}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Upgrade</span>
                </button>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select optional upgrades. Live totals adjust automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {availableAddons.map((addon) => {
              const isSelected = selectedAddOnIds.has(addon.id);
              const price = isUsdScale ? addon.usdPrice : addon.inrPrice;

              return (
                <div
                  key={addon.id}
                  onClick={() => !isEditMode && handleToggleAddOn(addon.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                    isEditMode
                      ? 'bg-white dark:bg-[#0e1628] border-amber-300 dark:border-amber-700/60'
                      : isSelected
                      ? 'bg-blue-50/70 border-blue-500 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm cursor-pointer'
                      : 'bg-white/80 dark:bg-[#0e1628]/80 border-slate-200/80 dark:border-white/10 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  {/* Checkbox box (in Client View) */}
                  {!isEditMode && (
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    {isEditMode ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={addon.title}
                            onChange={(e) => {
                              const next = [...availableAddons];
                              const idx = next.findIndex((a) => a.id === addon.id);
                              if (idx >= 0) {
                                next[idx].title = e.target.value;
                                setAvailableAddons(next);
                              }
                            }}
                            className="font-bold text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteAddOn(addon.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                            title="Delete upgrade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={addon.subtitle}
                          onChange={(e) => {
                            const next = [...availableAddons];
                            const idx = next.findIndex((a) => a.id === addon.id);
                            if (idx >= 0) {
                              next[idx].subtitle = e.target.value;
                              setAvailableAddons(next);
                            }
                          }}
                          className="w-full text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-400"
                        />

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-semibold text-slate-500">Rate:</span>
                          <input
                            type="number"
                            value={isUsdScale ? addon.usdPrice : addon.inrPrice}
                            onChange={(e) => {
                              const next = [...availableAddons];
                              const idx = next.findIndex((a) => a.id === addon.id);
                              if (idx >= 0) {
                                const num = Number(e.target.value) || 0;
                                if (isUsdScale) next[idx].usdPrice = num;
                                else next[idx].inrPrice = num;
                                setAvailableAddons(next);
                              }
                            }}
                            className="text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 w-28"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">{currency.code}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {addon.title}
                          </h4>
                          <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 shrink-0">
                            +{formatCurrency(price)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {addon.subtitle}
                        </p>

                        <div className="pt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {addon.badge}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DYNAMIC INVESTMENT SUMMARY & PAYMENT ROADMAP */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-sky-400/30 dark:border-sky-500/30 shadow-[0_20px_50px_-15px_rgba(14,165,233,0.18)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Total Customized Investment
                </span>
                {selectedAddOnIds.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {selectedAddOnIds.size} {selectedAddOnIds.size === 1 ? 'Add-on' : 'Add-ons'} Included
                  </span>
                )}
              </div>
              <h3 suppressHydrationWarning className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {isMounted ? formatCurrency(grandTotal) : `₹${grandTotal.toLocaleString('en-IN')}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Base Package: {formatCurrency(baseTierPrice)} + Upgrades: {formatCurrency(addOnsTotal)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-3.5 py-2 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>All-Inclusive Studio Pricing • No Hidden Fees</span>
            </div>
          </div>

          {/* 3 Payment Split Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-sky-50/80 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-sky-700 dark:text-sky-300 uppercase">1. Booking Advance (20%)</span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              </div>
              <p suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {isMounted ? formatCurrency(advance) : `₹${advance.toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Due now to officially reserve crew & dates</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-sm">
              <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase">2. Event Day (60%)</span>
              <p suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {isMounted ? formatCurrency(eventDay) : `₹${eventDay.toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payable upon arrival on primary shoot day</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-sm">
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase">3. Final Delivery (20%)</span>
              <p suppressHydrationWarning className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {isMounted ? formatCurrency(finalBal) : `₹${finalBal.toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payable upon delivery of all edited assets</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. CONTRACT TERMS ACCORDION */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-7 space-y-4 shadow-sm">
          <button
            type="button"
            onClick={() => setIsTermsExpanded(!isTermsExpanded)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Studio Service Agreement & Deliverable Terms
                </h3>
                <p className="text-[11px] text-slate-500">
                  Delivery SLAs, copyright rights, and courtesy rescheduling rules
                </p>
              </div>
            </div>
            {isTermsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {isTermsExpanded && (
            <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-fadeIn">
              {isEditMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold block mb-1">1. Turnaround SLA:</label>
                    <textarea
                      rows={2}
                      value={contractTerms.turnaround}
                      onChange={(e) => setContractTerms({ ...contractTerms, turnaround: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">2. Rescheduling Policy:</label>
                    <textarea
                      rows={2}
                      value={contractTerms.rescheduling}
                      onChange={(e) => setContractTerms({ ...contractTerms, rescheduling: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">3. Usage Rights:</label>
                    <textarea
                      rows={2}
                      value={contractTerms.rights}
                      onChange={(e) => setContractTerms({ ...contractTerms, rights: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>1. Turnaround Timeline:</strong> {contractTerms.turnaround}</p>
                  <p><strong>2. Courtesy Rescheduling:</strong> {contractTerms.rescheduling}</p>
                  <p><strong>3. Usage Rights & Archival:</strong> {contractTerms.rights}</p>
                </>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="accept-terms" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              I have reviewed and agree to the Bespoke Production Agreement and studio deliverables.
            </label>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. DIGITAL E-SIGNATURE */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#0e1628]/90 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-xs">
                <FileSignature className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 3: Digital Agreement & Signature</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Draw or type your legal signature to seal your booking</p>
              </div>
            </div>

            {/* Segmented Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`px-4 py-2 rounded-xl font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  signatureMode === 'draw'
                    ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw Signature</span>
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`px-4 py-2 rounded-xl font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  signatureMode === 'type'
                    ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type Name</span>
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
                  className="text-rose-500 hover:underline flex items-center space-x-1 text-xs font-bold cursor-pointer"
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
                className="w-full bg-white dark:bg-[#070b14] border border-slate-300 dark:border-white/15 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-sky-500 shadow-sm"
              />

              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Generated E-Signature</span>
                <p className="font-serif italic text-3xl text-sky-600 dark:text-sky-400 tracking-wide select-none">
                  {typedSignature || 'Your Signature'}
                </p>
              </div>
            </div>
          )}

          {/* Action CTA Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>256-Bit Encrypted & Legally Binding E-Signature</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isSignatureReady) {
                  alert(signatureMode === 'draw' ? 'Please draw your signature in the box.' : 'Please enter your full name.');
                  return;
                }
                if (!termsAccepted) {
                  alert('Please check the box confirming you agree to the Studio Service Agreement.');
                  return;
                }
                setShowPaymentModal(true);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)] flex items-center justify-center space-x-2 transition-all transform active:scale-95 hover:scale-[1.02] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span suppressHydrationWarning>
                Lock Date & Pay {isMounted ? formatCurrency(advance) : `₹${advance.toLocaleString('en-IN')}`} Retainer Advance
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* PAYMENT & RETAINER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e1628] border border-sky-400/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp">
            {paymentSuccess ? (
              <div className="text-center space-y-4 py-2 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-pulse">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Booking Confirmed! 🎉</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your date is 100% reserved on our studio production calendar</p>
                </div>

                {/* Instant In-App Receipt Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-white/10 pb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Receipt Reference</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{receiptRef || 'REC-2026-CONFIRMED'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Client / Signer:</span>
                    <strong className="text-slate-900 dark:text-white">{signatureMode === 'type' ? typedSignature : enquiry.name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Package Tier:</span>
                    <span className="font-bold uppercase text-slate-800 dark:text-slate-200">{selectedTier} Package</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Selected Add-ons:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {selectedAddOnIds.size > 0 ? `${selectedAddOnIds.size} Upgrades Included` : 'Standard Package'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/80 dark:border-white/10 pt-2">
                    <span className="text-slate-500 dark:text-slate-400">Advance Paid (20%):</span>
                    <strong suppressHydrationWarning className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {isMounted ? formatCurrency(advance) : `₹${advance.toLocaleString('en-IN')}`}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Remaining Balance:</span>
                    <span suppressHydrationWarning className="font-mono text-slate-600 dark:text-slate-400">
                      {isMounted ? formatCurrency(Math.max(0, grandTotal - advance)) : `₹${(Math.max(0, grandTotal - advance)).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => openReceiptPdfWindow(enquiry, advance, signatureMode === 'type' ? typedSignature : enquiry.name)}
                    className="w-full flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white text-xs font-black shadow-lg shadow-sky-500/30 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentSuccess(false);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">Confirm 20% Retainer Advance</h3>
                    <p className="text-xs text-slate-500 font-medium">Secures dates & assigns lead master crew</p>
                  </div>
                  <span suppressHydrationWarning className="font-mono font-black text-xl text-sky-600 dark:text-sky-400">
                    {isMounted ? formatCurrency(advance) : `₹${advance.toLocaleString('en-IN')}`}
                  </span>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Payment Channel:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPaymentMethod === 'card'
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-500" />
                      <span className="text-[11px] block">Credit / Debit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPaymentMethod === 'upi'
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                      <span className="text-[11px] block">UPI / Apple Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('bank')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedPaymentMethod === 'bank'
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                      <span className="text-[11px] block">Bank Wire</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Details */}
                {selectedPaymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Instant Online Authorization</p>
                    <p className="text-[11px] text-slate-500">Supports Visa, MasterCard, Amex, and Apple Pay with 256-bit PCI-DSS vault encryption.</p>
                  </div>
                )}

                {selectedPaymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Studio VPA / UPI ID:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">pixevastudios@hdfcbank</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Scan QR or transfer via Google Pay, PhonePe, or Apple Cash.</p>
                  </div>
                )}

                {selectedPaymentMethod === 'bank' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">HDFC Bank Ltd.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Pixeva Cinematic Studios LLP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account #:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">50200088192837</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC / SWIFT:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">HDFC0001234</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Back to Proposal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAcceptanceAndPay}
                    className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white text-xs font-black shadow-lg shadow-sky-500/30 cursor-pointer"
                  >
                    Confirm & Reserve Date
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
