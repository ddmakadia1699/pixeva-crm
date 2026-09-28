'use client';

import React, { useState, useEffect } from 'react';
import EnquiriesHeader, { EnquiryTab } from '@/components/enquiries/EnquiriesHeader';
import EnquiriesListTab from '@/components/enquiries/EnquiriesListTab';
import LandingPageTab from '@/components/enquiries/LandingPageTab';
import AnalyticsTab from '@/components/enquiries/AnalyticsTab';
import IntegrationsTab from '@/components/enquiries/IntegrationsTab';
import FeedbackModal from '@/components/enquiries/FeedbackModal';

import { Enquiry, EnquiryStatus } from '@/lib/supabase/types';
import { apiClient } from '@/lib/api/apiClient';

const ENQUIRIES_STORAGE_KEY = 'pixeva_enquiries';
const DELETED_IDS_KEY = 'pixeva_deleted_enquiries';

function getDeletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save deleted ID in localStorage:', e);
  }
}

export default function EnquiriesPage() {
  const [activeTab, setActiveTab] = useState<EnquiryTab>('enquiries');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Helper to auto-create a Shoot Project when an Enquiry is booked
  const autoCreateProjectFromEnquiry = (enq: Enquiry) => {
    try {
      if (typeof window === 'undefined') return;
      const rawProjects = null /* localStorage.getItem('pixeva_projects') */;
      let projects = rawProjects ? JSON.parse(rawProjects) : [];
      
      const enqEventName = enq.event_name || `${enq.name}'s Event`;
      
      // Prevent duplicate creation
      const exists = projects.find((p: any) => p.name === enqEventName && p.client === enq.name);
      if (!exists) {
        const newProject = {
          id: `proj-auto-${Date.now()}`,
          name: enqEventName,
          type: enq.event_type === 'wedding' ? 'Wedding' : 'Corporate',
          client: enq.name,
          client_phone: enq.phone || '',
          first_event: enq.event_date || new Date().toISOString().slice(0, 10),
          venue: enq.venue || 'TBA',
          call_time: '08:00 AM',
          total_amount: enq.estimated_budget || 0,
          paid_amount: 0,
          payment_status: 'Pending',
          status: 'Active',
          completeness: 'In Progress (20%)',
          contract: 'Pending',
          assigned_crew: [
            { id: 'c1', name: 'Amit Sharma', role: 'Lead Photographer', initials: 'AS', phone: '919876543219' },
          ],
          deliverables: [
            { id: 'd1', title: 'Master Cinematic Video Cut', completed: false },
            { id: 'd2', title: 'High-Resolution Edited Photo Album', completed: false },
          ],
          created_at: new Date().toISOString()
        };
        projects = [newProject, ...projects];
        localStorage.setItem('pixeva_projects', JSON.stringify(projects));
      }
    } catch (e) {
      console.error('Failed to auto-create project:', e);
    }
  };


  // Helper to update both React state AND localStorage immediately
  const updateEnquiries = (updater: Enquiry[] | ((prev: Enquiry[]) => Enquiry[])) => {
    setEnquiries((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to persist enquiries to localStorage:', e);
        }
      }
      return next;
    });
  };

  // 1. On Mount: Load via AWS API Gateway scoped to active account ID
  useEffect(() => {
    const deletedSet = getDeletedIds();

    async function loadFromCloud() {
      try {
        const cloudData = await apiClient.enquiries.list();
        if (Array.isArray(cloudData)) {
          const mapped: Enquiry[] = cloudData
            .map((lead: any) => ({
              id: lead.id,
              name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Client',
              email: lead.email || '',
              phone: lead.phone || '',
              event_name: lead.company || 'Event',
              event_type: lead.notes?.includes('wedding') ? 'wedding' : 'corporate',
              event_date: lead.notes?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString().split('T')[0],
              estimated_budget: Number(lead.estimated_value) || 0,
              source: lead.source || 'Website',
              status: lead.status || 'new',
              notes: lead.notes || '',
              created_at: lead.created_at || new Date().toISOString(),
            }))
            .filter((item: Enquiry) => !deletedSet.has(item.id));

          setEnquiries(mapped);
          try {
            localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(mapped));
          } catch { }
          setIsHydrated(true);
          return;
        }
      } catch (e) {
        console.warn('API Gateway sync notice, checking local cache:', e);
      }

      // Local storage fallback if offline
      try {
        const saved = null /* localStorage.getItem(ENQUIRIES_STORAGE_KEY) */;
        if (saved) {
          const parsed: Enquiry[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEnquiries(parsed.filter((e) => !deletedSet.has(e.id)));
          }
        }
      } catch { }
      setIsHydrated(true);
    }

    loadFromCloud();
  }, []);

  // Listen for local storage changes from other tabs (e.g. Landing Page submissions)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ENQUIRIES_STORAGE_KEY && e.newValue) {
        try {
          const parsed: Enquiry[] = JSON.parse(e.newValue);
          const deletedSet = getDeletedIds();
          if (Array.isArray(parsed)) {
            setEnquiries(parsed.filter((item) => !deletedSet.has(item.id)));
          }
        } catch (err) {
          console.error('Failed to parse storage update:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add Single Enquiry
  const handleAddEnquiry = async (newEnquiryData: Omit<Enquiry, 'id' | 'created_at'>) => {
    const tempId = `enq-${Date.now()}`;
    const newEnquiry: Enquiry = {
      ...newEnquiryData,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    updateEnquiries((prev) => [newEnquiry, ...prev]);

    try {
      const created = await apiClient.enquiries.create(newEnquiryData);
      if (created?.id) {
        updateEnquiries((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: created.id } : item))
        );
      }
    } catch (e) {
      console.error('Failed to sync added enquiry to cloud:', e);
    }
  };

  // Batch CSV Import
  const handleImportEnquiries = (importedList: Omit<Enquiry, 'id' | 'created_at'>[]) => {
    const formatted: Enquiry[] = importedList.map((item, idx) => ({
      ...item,
      id: `enq-imp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));
    updateEnquiries((prev) => [...formatted, ...prev]);
  };

  // Status Change
  const handleUpdateStatus = async (id: string, status: EnquiryStatus) => {
    updateEnquiries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status } : e));
      if (status.toLowerCase() === 'booked') {
        const bookedEnq = updated.find((e) => e.id === id);
        if (bookedEnq) autoCreateProjectFromEnquiry(bookedEnq);
      }
      return updated;
    });

    try {
      await apiClient.enquiries.update(id, status);
    } catch (e) {
      console.error('Failed to sync status to cloud:', e);
    }
  };

  // Update Full Enquiry details (Save Button from Edit Modal)
  const handleUpdateEnquiry = async (updatedEnquiry: Enquiry) => {
    updateEnquiries((prev) =>
      prev.map((e) => (e.id === updatedEnquiry.id ? updatedEnquiry : e))
    );
    if (updatedEnquiry.status.toLowerCase() === 'booked') {
      autoCreateProjectFromEnquiry(updatedEnquiry);
    }

    try {
      await apiClient.enquiries.update(updatedEnquiry.id, updatedEnquiry.status);
    } catch (e) {
      console.error('Failed to sync updated enquiry to cloud:', e);
    }
  };

  // Delete Single Enquiry
  const handleDeleteEnquiry = async (id: string) => {
    updateEnquiries((prev) => prev.filter((e) => e.id !== id));
    addDeletedId(id);

    try {
      await apiClient.enquiries.delete(id);
    } catch (e) {
      console.error('Failed to delete enquiry in cloud:', e);
    }
  };

  // Delete Batch
  const handleDeleteBatchEnquiries = async (ids: string[]) => {
    const idSet = new Set(ids);
    updateEnquiries((prev) => prev.filter((e) => !idSet.has(e.id)));
    ids.forEach((id) => addDeletedId(id));

    try {
      await apiClient.enquiries.deleteBatch(ids);
    } catch (e) {
      console.error('Failed to delete batch enquiries in cloud:', e);
    }
  };

  // Clear All
  const handleClearAllEnquiries = async () => {
    enquiries.forEach((e) => addDeletedId(e.id));
    updateEnquiries([]);

    try {
      await apiClient.enquiries.deleteBatch(enquiries.map((e) => e.id));
    } catch (e) {
      console.error('Failed to clear all enquiries in cloud:', e);
    }
  };

  return (
    <div suppressHydrationWarning className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)]">
      {/* Top Header & Sub-Navigation */}
      <EnquiriesHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        enquiryCount={enquiries.length}
      />

      {/* Tab Contents */}
      {activeTab === 'enquiries' && (
        <EnquiriesListTab
          enquiries={enquiries}
          onAddEnquiry={handleAddEnquiry}
          onImportEnquiries={handleImportEnquiries}
          onUpdateStatus={handleUpdateStatus}
          onUpdateEnquiry={handleUpdateEnquiry}
          onDeleteEnquiry={handleDeleteEnquiry}
          onDeleteBatchEnquiries={handleDeleteBatchEnquiries}
          onClearAllEnquiries={handleClearAllEnquiries}
        />
      )}

      {activeTab === 'landing-page' && <LandingPageTab />}
      {activeTab === 'analytics' && <AnalyticsTab enquiries={enquiries} />}
      {activeTab === 'integrations' && <IntegrationsTab />}

      {/* Floating Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
