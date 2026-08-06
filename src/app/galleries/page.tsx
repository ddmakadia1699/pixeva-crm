'use client';

import React from 'react';
import GalleryManager from '@/components/galleries/GalleryManager';
import { QrCode } from 'lucide-react';

export default function GalleriesPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-[#00d4ff]" />
          <h1 className="text-xl font-bold text-white tracking-tight">AI Event Galleries & QR Tent Cards</h1>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-1">
          Manage AI selfie search photo galleries and print QR Code Table Tent Cards for weddings & events.
        </p>
      </div>

      <GalleryManager />
    </div>
  );
}
