'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { 
  CalendarDays, 
  MapPin, 
  User, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  X,
  Camera
} from 'lucide-react';

export interface Booking {
  id: string;
  title: string;
  event_type: 'wedding' | 'corporate' | 'portrait' | 'party' | 'travel';
  date: string;
  location: string;
  client_name: string;
  client_email: string;
  price: number;
  deposit_paid: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  photographer_name: string;
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    title: 'Sarah & Mark Wedding Coverage',
    event_type: 'wedding',
    date: '2026-08-15 14:00',
    location: 'Grand Palace Hotel, New York',
    client_name: 'Sarah Jenkins',
    client_email: 'sarah@acme.com',
    price: 4500,
    deposit_paid: 1500,
    status: 'upcoming',
    photographer_name: 'Alex Rivera (Lead)',
  },
  {
    id: 'b-2',
    title: 'Nexus Tech AI Summit Photography',
    event_type: 'corporate',
    date: '2026-08-20 09:00',
    location: 'Convention Center, San Francisco',
    client_name: 'Marcus Vance',
    client_email: 'marcus@nexus.io',
    price: 8200,
    deposit_paid: 4100,
    status: 'upcoming',
    photographer_name: 'Elena Vance (Lead)',
  },
  {
    id: 'b-3',
    title: 'Cyberdyne Executive Portraits',
    event_type: 'portrait',
    date: '2026-08-10 11:30',
    location: 'Studio Loft 4, Los Angeles',
    client_name: 'Elena Rostova',
    client_email: 'elena@cyberdyne.net',
    price: 2500,
    deposit_paid: 2500,
    status: 'completed',
    photographer_name: 'David Kim',
  },
];

export default function BookingCalendar() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    event_type: 'wedding' as Booking['event_type'],
    date: '2026-08-25',
    time: '14:00',
    location: '',
    client_name: '',
    client_email: '',
    price: 3500,
    deposit_paid: 1000,
  });

  const filteredBookings = bookings.filter(
    (b) => selectedType === 'all' || b.event_type === selectedType
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client_name || !formData.location) return;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      title: formData.title,
      event_type: formData.event_type,
      date: `${formData.date} ${formData.time}`,
      location: formData.location,
      client_name: formData.client_name,
      client_email: formData.client_email,
      price: Number(formData.price),
      deposit_paid: Number(formData.deposit_paid),
      status: 'upcoming',
      photographer_name: 'Pixeva Lead Staff',
    };

    setBookings([newBooking, ...bookings]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'wedding', 'corporate', 'portrait', 'party'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedType === type
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                  : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-pixeva-primary flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Shoot Booking</span>
        </button>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="pixeva-card pixeva-card-hover p-5 rounded-2xl border border-white/10 space-y-4 shadow-card relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                b.event_type === 'wedding' ? 'badge-purple' : 'badge-cyan'
              }`}>
                {b.event_type}
              </span>
              <span className={`flex items-center space-x-1 text-[11px] font-bold ${
                b.status === 'completed' ? 'text-emerald-400' : 'text-[#00d4ff]'
              }`}>
                {b.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span className="capitalize">{b.status}</span>
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base leading-snug">{b.title}</h3>
              <div className="mt-2 space-y-1 text-xs text-[#a0a0b0]">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <span className="font-mono text-white">{b.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  <span>{b.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>{b.client_name} ({b.client_email})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-[#a0a0b0] text-[10px] block">Package Rate:</span>
                <span className="font-mono font-bold text-white text-sm" suppressHydrationWarning>
                  {formatCurrency(b.price)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#a0a0b0] text-[10px] block">Deposit Paid:</span>
                <span className="font-mono font-bold text-[#00d4ff] text-sm" suppressHydrationWarning>
                  {formatCurrency(b.deposit_paid)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-bold text-white text-base">Book Photography Shoot</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[#a0a0b0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Shoot / Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Miller Wedding Photo Coverage"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Summit</option>
                    <option value="portrait">Portrait Session</option>
                    <option value="party">Party / Event</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Location Venue *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Grand Ballroom, Chicago"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="John Miller"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#a0a0b0] block mb-1">Package Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#a0a0b0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pixeva-primary px-4 py-2 text-xs font-semibold">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
