'use client';

import React, { useState, useEffect } from 'react';
import EnquiriesHeader, { EnquiryTab } from '@/components/enquiries/EnquiriesHeader';
import EnquiriesListTab from '@/components/enquiries/EnquiriesListTab';
import LandingPageTab from '@/components/enquiries/LandingPageTab';
import AnalyticsTab from '@/components/enquiries/AnalyticsTab';
import IntegrationsTab from '@/components/enquiries/IntegrationsTab';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import { MOCK_ENQUIRIES } from '@/lib/supabase/client';
import { Enquiry, EnquiryStatus } from '@/lib/supabase/types';

const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';
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

  // 1. On Mount: Load saved enquiries from localStorage first
  useEffect(() => {
    const deletedSet = getDeletedIds();
    let initialList: Enquiry[] = [];

    try {
      const saved = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (saved) {
        const parsed: Enquiry[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialList = parsed.filter((e) => !deletedSet.has(e.id));
        }
      }
    } catch (e) {
      console.error('Error reading localStorage enquiries:', e);
    }

    if (initialList.length === 0) {
      initialList = MOCK_ENQUIRIES.filter((e) => !deletedSet.has(e.id));
    }

    setEnquiries(initialList);
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(initialList));
    } catch {}
    setIsHydrated(true);

    // 2. Background sync with AWS API Gateway if available (merge new leads without overwriting local edits)
    async function syncFromCloud() {
      try {
        const res = await fetch(`${AWS_API_GATEWAY}/enquiries`);
        if (!res.ok) return;

        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const mapped: Enquiry[] = result.data
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

          if (mapped.length > 0) {
            updateEnquiries((current) => {
              const currentMap = new Map(current.map((item) => [item.id, item]));
              const toAppend = mapped.filter((item) => !currentMap.has(item.id));
              return toAppend.length > 0 ? [...current, ...toAppend] : current;
            });
          }
        }
      } catch (e) {
        console.warn('Cloud sync offline, working seamlessly with persistent local storage.');
      }
    }

    syncFromCloud();
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
      const res = await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiryData),
      });

      const result = await res.json();
      if (result.success && result.data?.id) {
        updateEnquiries((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: result.data.id } : item))
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
    updateEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error('Failed to sync status to cloud:', e);
    }
  };

  // Update Full Enquiry details (Save Button from Edit Modal)
  const handleUpdateEnquiry = async (updatedEnquiry: Enquiry) => {
    updateEnquiries((prev) =>
      prev.map((e) => (e.id === updatedEnquiry.id ? updatedEnquiry : e))
    );

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEnquiry),
      });
    } catch (e) {
      console.error('Failed to sync updated enquiry to cloud:', e);
    }
  };

  // Delete Single Enquiry
  const handleDeleteEnquiry = async (id: string) => {
    updateEnquiries((prev) => prev.filter((e) => e.id !== id));
    addDeletedId(id);

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
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
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch (e) {
      console.error('Failed to delete batch enquiries in cloud:', e);
    }
  };

  // Clear All
  const handleClearAllEnquiries = async () => {
    enquiries.forEach((e) => addDeletedId(e.id));
    updateEnquiries([]);

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
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
