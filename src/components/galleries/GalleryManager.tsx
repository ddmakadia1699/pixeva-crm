'use client';

import React, { useState } from 'react';
import { QrCode, Sparkles, Camera, Users, Share2, ExternalLink, Printer, CheckCircle2, X } from 'lucide-react';

export interface Gallery {
  id: string;
  title: string;
  event_date: string;
  photo_count: number;
  guest_selfie_count: number;
  qr_code_text: string;
  cover_image: string;
}

export const INITIAL_GALLERIES: Gallery[] = [
  {
    id: 'g-1',
    title: 'Sarah & Mark Grand Wedding',
    event_date: '2026-08-05',
    photo_count: 1420,
    guest_selfie_count: 384,
    qr_code_text: 'https://pixeva.co/g/sarah-mark-wedding',
    cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'g-2',
    title: 'Nexus Tech Global AI Summit 2026',
    event_date: '2026-07-28',
    photo_count: 2850,
    guest_selfie_count: 920,
    qr_code_text: 'https://pixeva.co/g/nexus-ai-summit',
    cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'g-3',
    title: 'Cyberdyne Gala & Awards Night',
    event_date: '2026-07-15',
    photo_count: 980,
    guest_selfie_count: 240,
    qr_code_text: 'https://pixeva.co/g/cyberdyne-gala',
    cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60',
  },
];

export default function GalleryManager() {
  const [galleries, setGalleries] = useState<Gallery[]>(INITIAL_GALLERIES);
  const [activeQrModal, setActiveQrModal] = useState<Gallery | null>(null);

  return (
    <div className="space-y-6">
      {/* Galleries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {galleries.map((g) => (
          <div
            key={g.id}
            className="pixeva-card pixeva-card-hover rounded-2xl border border-white/10 overflow-hidden shadow-card flex flex-col justify-between"
          >
            {/* Gallery Image Header */}
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img
                src={g.cover_image}
                alt={g.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/40 to-transparent" />
              
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full badge-cyan text-[10px] font-extrabold uppercase flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Face Match Active</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-extrabold text-white text-base leading-snug">{g.title}</h3>
                <p className="text-xs text-[#a0a0b0] font-mono mt-0.5">{g.event_date}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-[#a0a0b0] block">Indexed Photos:</span>
                  <span className="font-mono font-bold text-white text-xs">{g.photo_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#a0a0b0] block">Selfie Matches:</span>
                  <span className="font-mono font-bold text-[#00d4ff] text-xs">{g.guest_selfie_count.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => setActiveQrModal(g)}
                  className="flex-1 btn-pixeva-primary flex items-center justify-center space-x-1.5 text-xs py-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate Table QR Cards</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Tent Card Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-card text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-left">
                <QrCode className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-bold text-white text-base">QR Tent Card Generator</h3>
              </div>
              <button onClick={() => setActiveQrModal(null)} className="p-1 text-[#a0a0b0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tent Card Preview */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0a0a0f] to-[#161622] border-2 border-dashed border-[#00d4ff]/40 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full badge-cyan text-[10px] font-bold">
                <Camera className="w-3.5 h-3.5" />
                <span>Pixeva AI Face Recognition</span>
              </div>

              <h4 className="font-extrabold text-white text-lg">{activeQrModal.title}</h4>
              <p className="text-xs text-[#a0a0b0]">Scan QR Code with your phone & upload a selfie to instantly find all your photos!</p>

              {/* Simulated QR Code Graphic */}
              <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-full h-full border-4 border-black bg-black/5 flex flex-col items-center justify-center p-2 text-black space-y-1">
                  <QrCode className="w-16 h-16 text-black" />
                  <span className="text-[9px] font-bold tracking-widest uppercase">SCAN FOR PHOTOS</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#00d4ff] truncate">{activeQrModal.qr_code_text}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => alert(`Printing QR Table Tent Cards for ${activeQrModal.title}`)}
                className="btn-pixeva-primary flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Table Tent Cards</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
