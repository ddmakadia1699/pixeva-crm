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

export default function EnquiriesPage() {
  const [activeTab, setActiveTab] = useState<EnquiryTab>('enquiries');
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);

  // Fetch enquiries directly via Amazon API Gateway HTTP Trigger (AWS Lambda Backend)
  useEffect(() => {
    async function fetchFromAmazonApiGateway() {
      try {
        const res = await fetch(`${AWS_API_GATEWAY}/enquiries`);
        if (!res.ok) return;

        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const mapped: Enquiry[] = result.data.map((lead: any) => ({
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
          }));
          setEnquiries(mapped);
        }
      } catch (e) {
        console.error('Error fetching via Amazon API Gateway:', e);
      }
    }

    fetchFromAmazonApiGateway();
  }, []);

  // Add Single Enquiry directly via Amazon API Gateway HTTP Trigger (AWS Lambda Backend)
  const handleAddEnquiry = async (newEnquiryData: Omit<Enquiry, 'id' | 'created_at'>) => {
    const tempId = `enq-${Date.now()}`;
    const newEnquiry: Enquiry = {
      ...newEnquiryData,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);

    try {
      const res = await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiryData),
      });

      const result = await res.json();
      if (result.success && result.data?.id) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === tempId ? { ...item, id: result.data.id } : item))
        );
      }
    } catch (e) {
      console.error('Failed to add enquiry via Amazon API Gateway Trigger:', e);
    }
  };

  // Batch CSV Import
  const handleImportEnquiries = (importedList: Omit<Enquiry, 'id' | 'created_at'>[]) => {
    const formatted: Enquiry[] = importedList.map((item, idx) => ({
      ...item,
      id: `enq-imp-${Date.now()}-${idx}`,
      created_at: new Date().toISOString(),
    }));
    setEnquiries([...formatted, ...enquiries]);
  };

  // Status Change directly via Amazon API Gateway HTTP Trigger (AWS Lambda Backend)
  const handleUpdateStatus = async (id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error('Failed to update status via Amazon API Gateway Trigger:', e);
    }
  };

  // Delete Single directly via Amazon API Gateway HTTP Trigger (AWS Lambda Backend)
  const handleDeleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));

    try {
      await fetch(`${AWS_API_GATEWAY}/enquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete enquiry via Amazon API Gateway Trigger:', e);
    }
  };

  // Delete Batch
  const handleDeleteBatchEnquiries = (ids: string[]) => {
    const idSet = new Set(ids);
    setEnquiries((prev) => prev.filter((e) => !idSet.has(e.id)));
  };

  // Clear All
  const handleClearAllEnquiries = () => {
    setEnquiries([]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)]">
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
          onDeleteEnquiry={handleDeleteEnquiry}
          onDeleteBatchEnquiries={handleDeleteBatchEnquiries}
          onClearAllEnquiries={handleClearAllEnquiries}
        />
      )}

      {activeTab === 'landing-page' && <LandingPageTab />}

      {activeTab === 'analytics' && <AnalyticsTab enquiries={enquiries} />}

      {activeTab === 'integrations' && <IntegrationsTab />}

      {/* Persistent RevePod Beta Feedback Drawer Button */}
      <FeedbackModal />
    </div>
  );
}

