'use client';

import React from 'react';
import BookingCalendar from '@/components/bookings/BookingCalendar';
import { CalendarDays } from 'lucide-react';

export default function BookingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-[#00d4ff]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Shoot Bookings & Event Calendar</h1>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-1">
          Manage upcoming photography sessions, wedding shoots, client deposits, and lead photographers.
        </p>
      </div>

      <BookingCalendar />
    </div>
  );
}
