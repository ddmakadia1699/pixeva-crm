'use client';

import React, { useState } from 'react';
import EnquiriesHeader, { EnquiryTab } from '@/components/enquiries/EnquiriesHeader';
import EnquiriesListTab from '@/components/enquiries/EnquiriesListTab';
import LandingPageTab from '@/components/enquiries/LandingPageTab';
import AnalyticsTab from '@/components/enquiries/AnalyticsTab';
import IntegrationsTab from '@/components/enquiries/IntegrationsTab';
import FeedbackModal from '@/components/enquiries/FeedbackModal';
import { MOCK_ENQUIRIES } from '@/lib/supabase/client';
import { Enquiry, EnquiryStatus } from '@/lib/supabase/types';

export default function EnquiriesPage() {
  const [activeTab, setActiveTab] = useState<EnquiryTab>('enquiries');
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);

  // Add Single Enquiry
  const handleAddEnquiry = (newEnquiryData: Omit<Enquiry, 'id' | 'created_at'>) => {
    const newEnquiry: Enquiry = {
      ...newEnquiryData,
      id: `enq-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setEnquiries([newEnquiry, ...enquiries]);
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

  // Status Change
  const handleUpdateStatus = (id: string, status: EnquiryStatus) => {
    setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  // Delete Single
  const handleDeleteEnquiry = (id: string) => {
    setEnquiries(enquiries.filter((e) => e.id !== id));
  };

  // Delete Batch
  const handleDeleteBatchEnquiries = (ids: string[]) => {
    const idSet = new Set(ids);
    setEnquiries(enquiries.filter((e) => !idSet.has(e.id)));
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
