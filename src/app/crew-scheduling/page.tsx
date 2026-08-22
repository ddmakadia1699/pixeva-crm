'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Check,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { ScheduledEvent } from '@/lib/supabase/types';

const INITIAL_EVENTS: ScheduledEvent[] = [
  {
    id: 'evt-1',
    project_name: 'Bride & Groom (Demo)',
    event_title: 'Reception',
    date_time: '30 Dec 2026 · 18:00–22:00',
    date_formatted: '30 Dec 2026',
    time_formatted: '18:00–22:00',
    status: 'Pending',
    assigned_crew: [],
    is_unassigned: true,
  },
  {
    id: 'evt-2',
    project_name: 'Bride & Groom (Demo)',
    event_title: 'Wedding',
    date_time: '31 Dec 2026 · 08:00–13:00',
    date_formatted: '31 Dec 2026',
    time_formatted: '08:00–13:00',
    status: 'Pending',
    assigned_crew: [],
    is_unassigned: true,
  },
  {
    id: 'evt-3',
    project_name: 'Vance Corporate Annual Gala',
    event_title: 'Corporate Gala Shoot',
    date_time: '15 Nov 2026 · 17:00–23:00',
    date_formatted: '15 Nov 2026',
    time_formatted: '17:00–23:00',
    status: 'Assigned',
    assigned_crew: ['Alex Rivers (Lead Photog)', 'Dhruvi Patel (Second Shooter)'],
    is_unassigned: false,
  },
  {
    id: 'evt-4',
    project_name: 'BioTech Global Summit 2026',
    event_title: 'Keynote & Panel Sessions',
    date_time: '20 Oct 2026 · 09:00–18:00',
    date_formatted: '20 Oct 2026',
    time_formatted: '09:00–18:00',
    status: 'Assigned',
    assigned_crew: ['Rohan Verma (Cinematographer)', 'Alex Rivers (Lead Photog)'],
    is_unassigned: false,
  },
];

const AVAILABLE_CREW = [
  'Alex Rivers (Lead Photographer)',
  'Dhruvi Patel (Second Photographer)',
  'Rohan Verma (Lead Cinematographer)',
  'Karan Sharma (Drone Operator)',
  'Sneha Gupta (Assistant / Lighting)',
  'Vikram Malhotra (Audio Specialist)',
];

const MONTHS = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
];

const CREW_STORAGE_KEY = 'pixeva_scheduled_events';

export default function CrewSchedulingPage() {
  const [events, setEvents] = useState<ScheduledEvent[]>(INITIAL_EVENTS);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August 2026
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningEvent, setAssigningEvent] = useState<ScheduledEvent | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CREW_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        } else {
          localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
        }
      } else {
        localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      }
    } catch (e) {
      console.error('Error reading crew events from localStorage:', e);
    }
  }, []);

  const updateEvents = (updater: ScheduledEvent[] | ((prev: ScheduledEvent[]) => ScheduledEvent[])) => {
    setEvents((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save crew events to localStorage:', e);
        }
      }
      return next;
    });
  };

  // Unassigned Events Filter
  const unassignedEvents = events.filter((e) => e.is_unassigned);

  // Month Navigation
  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : MONTHS.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < MONTHS.length - 1 ? prev + 1 : 0));
  };

  // Open Assign Crew Modal
  const handleOpenAssignModal = (evt: ScheduledEvent) => {
    setAssigningEvent(evt);
    setSelectedCrew(evt.assigned_crew || []);
    setIsAssignModalOpen(true);
  };

  // Toggle Crew Member Checkbox
  const handleToggleCrew = (crewMember: string) => {
    if (selectedCrew.includes(crewMember)) {
      setSelectedCrew(selectedCrew.filter((c) => c !== crewMember));
    } else {
      setSelectedCrew([...selectedCrew, crewMember]);
    }
  };

  // Save Assign Crew Form
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningEvent) return;

    updateEvents(
      events.map((evt) =>
        evt.id === assigningEvent.id
          ? {
              ...evt,
              assigned_crew: selectedCrew,
              status: selectedCrew.length > 0 ? 'Assigned' : 'Pending',
              is_unassigned: selectedCrew.length === 0,
            }
          : evt
      )
    );

    setIsAssignModalOpen(false);
    setAssigningEvent(null);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (events.length === 0) return;
    const headers = ['Project Name', 'Event Title', 'Date & Time', 'Status', 'Assigned Crew'];
    const rows = events.map((e) => [
      `"${e.project_name}"`,
      `"${e.event_title}"`,
      `"${e.date_time}"`,
      e.status,
      `"${e.assigned_crew.join('; ') || 'Unassigned'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pixeva_CrewSchedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Calendar Days Grid for Selected Month (e.g. August 2026: 35 days layout)
  // Matching screenshot: Starts at 26 Sun Jul, ends at 5 Sat Sep
  const calendarDays = [
    { day: 26, isCurrentMonth: false, dateStr: '2026-07-26' },
    { day: 27, isCurrentMonth: false, dateStr: '2026-07-27' },
    { day: 28, isCurrentMonth: false, dateStr: '2026-07-28' },
    { day: 29, isCurrentMonth: false, dateStr: '2026-07-29' },
    { day: 30, isCurrentMonth: false, dateStr: '2026-07-30' },
    { day: 31, isCurrentMonth: false, dateStr: '2026-07-31' },
    { day: 1, isCurrentMonth: true, dateStr: '2026-08-01' },
    { day: 2, isCurrentMonth: true, dateStr: '2026-08-02' },
    { day: 3, isCurrentMonth: true, dateStr: '2026-08-03' },
    { day: 4, isCurrentMonth: true, dateStr: '2026-08-04' },
    { day: 5, isCurrentMonth: true, dateStr: '2026-08-05' },
    { day: 6, isCurrentMonth: true, dateStr: '2026-08-06' },
    { day: 7, isCurrentMonth: true, dateStr: '2026-08-07' },
    { day: 8, isCurrentMonth: true, dateStr: '2026-08-08' },
    { day: 9, isCurrentMonth: true, dateStr: '2026-08-09' },
    { day: 10, isCurrentMonth: true, dateStr: '2026-08-10' },
    { day: 11, isCurrentMonth: true, dateStr: '2026-08-11' },
    { day: 12, isCurrentMonth: true, dateStr: '2026-08-12' },
    { day: 13, isCurrentMonth: true, dateStr: '2026-08-13' },
    { day: 14, isCurrentMonth: true, dateStr: '2026-08-14' },
    { day: 15, isCurrentMonth: true, dateStr: '2026-08-15' },
    { day: 16, isCurrentMonth: true, dateStr: '2026-08-16' },
    { day: 17, isCurrentMonth: true, dateStr: '2026-08-17' },
    { day: 18, isCurrentMonth: true, dateStr: '2026-08-18' },
    { day: 19, isCurrentMonth: true, dateStr: '2026-08-19' },
    { day: 20, isCurrentMonth: true, dateStr: '2026-08-20' },
    { day: 21, isCurrentMonth: true, dateStr: '2026-08-21' },
    { day: 22, isCurrentMonth: true, dateStr: '2026-08-22' },
    { day: 23, isCurrentMonth: true, dateStr: '2026-08-23' },
    { day: 24, isCurrentMonth: true, dateStr: '2026-08-24' },
    { day: 25, isCurrentMonth: true, dateStr: '2026-08-25' },
    { day: 26, isCurrentMonth: true, dateStr: '2026-08-26' },
    { day: 27, isCurrentMonth: true, dateStr: '2026-08-27' },
    { day: 28, isCurrentMonth: true, dateStr: '2026-08-28' },
    { day: 29, isCurrentMonth: true, dateStr: '2026-08-29' },
    { day: 30, isCurrentMonth: true, dateStr: '2026-08-30' },
    { day: 31, isCurrentMonth: true, dateStr: '2026-08-31' },
    { day: 1, isCurrentMonth: false, dateStr: '2026-09-01' },
    { day: 2, isCurrentMonth: false, dateStr: '2026-09-02' },
    { day: 3, isCurrentMonth: false, dateStr: '2026-09-03' },
    { day: 4, isCurrentMonth: false, dateStr: '2026-09-04' },
    { day: 5, isCurrentMonth: false, dateStr: '2026-09-05' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative min-h-[calc(100vh-100px)] max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1 flex items-center space-x-3">
            <span>Crew Scheduling</span>
          </h1>
          <p className="text-sm text-[#a0a0b0]">
            Every event across every project, and who’s working it
          </p>
        </div>

        {/* Month Selector & Export Action */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-[#12121a] border border-white/10 px-3 py-1.5 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-[#a0a0b0] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white min-w-[100px] text-center">
              {MONTHS[currentMonthIndex]}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-[#a0a0b0] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#12121a] hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Interactive Calendar Month Grid */}
      <div className="pixeva-card rounded-2xl border border-white/10 overflow-hidden shadow-card p-4 space-y-3 bg-[#0a0a0f]/90">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-[#a0a0b0] border-b border-white/10 pb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((d, index) => {
            // Demo events logic for 30 and 31 Dec (and August demo days)
            const isAugust30 = d.isCurrentMonth && d.day === 30;
            const isAugust31 = d.isCurrentMonth && d.day === 31;

            return (
              <div
                key={`${d.dateStr}-${index}`}
                className={`min-h-[72px] md:min-h-[84px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                  d.isCurrentMonth
                    ? 'bg-[#12121a] border-white/10 hover:border-[#00d4ff]/40'
                    : 'bg-[#0a0a0f]/40 border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold ${
                      d.isCurrentMonth ? 'text-white' : 'text-[#a0a0b0]'
                    }`}
                  >
                    {d.day}
                  </span>

                  {(isAugust30 || isAugust31) && (
                    <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                  )}
                </div>

                {/* Event Chips */}
                {isAugust30 && (
                  <button
                    onClick={() => handleOpenAssignModal(events[0])}
                    className="w-full text-left mt-1 px-1.5 py-1 rounded-lg bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[10px] font-bold text-[#00d4ff] truncate transition-colors"
                  >
                    Reception
                  </button>
                )}

                {isAugust31 && (
                  <button
                    onClick={() => handleOpenAssignModal(events[1])}
                    className="w-full text-left mt-1 px-1.5 py-1 rounded-lg bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[10px] font-bold text-[#8b5cf6] truncate transition-colors"
                  >
                    Wedding
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unassigned Events Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2 px-1">
          <h2 className="text-lg font-extrabold text-white tracking-tight">Unassigned Events</h2>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold">
            {unassignedEvents.length}
          </span>
        </div>

        {/* Unassigned Events Table */}
        <div className="pixeva-card rounded-2xl border border-white/10 overflow-x-auto shadow-card w-full">
          <table className="w-full text-left text-xs text-[#a0a0b0] min-w-[750px]">
            <thead className="bg-[#0a0a0f] text-[#a0a0b0] uppercase tracking-wider font-bold border-b border-white/10 text-[10px]">
              <tr>
                <th className="w-[28%] min-w-[160px] px-4 py-3.5">Project</th>
                <th className="w-[20%] min-w-[130px] px-4 py-3.5">Event</th>
                <th className="w-[25%] min-w-[160px] px-4 py-3.5">Date & Time</th>
                <th className="w-[15%] min-w-[100px] px-4 py-3.5">Status</th>
                <th className="w-[12%] min-w-[100px] px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unassignedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-sm font-bold text-white">All events fully assigned!</p>
                      <p className="text-xs text-[#a0a0b0]">
                        Great job! Every upcoming event has assigned crew members.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                unassignedEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-white/5 transition-colors group">
                    {/* Project Name */}
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-[#00d4ff] shrink-0" />
                        <span className="truncate">{evt.project_name}</span>
                      </div>
                    </td>

                    {/* Event Title */}
                    <td className="px-5 py-4 font-medium text-white">{evt.event_title}</td>

                    {/* Date & Time */}
                    <td className="px-5 py-4 font-mono text-white/80 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
                        <span>{evt.date_time}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{evt.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenAssignModal(evt)}
                        className="btn-pixeva-primary px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1 shadow-md shadow-[#00d4ff]/20"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Crew Modal */}
      {isAssignModalOpen && assigningEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Assign Crew to {assigningEvent.event_title}
                </h3>
                <p className="text-xs text-[#a0a0b0]">{assigningEvent.project_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div className="p-3 bg-[#0a0a0f] rounded-xl border border-white/10 space-y-1">
                <p className="text-[11px] text-[#a0a0b0] font-semibold">Event Schedule</p>
                <p className="font-mono text-white font-bold">{assigningEvent.date_time}</p>
              </div>

              <div>
                <label className="block text-[#a0a0b0] font-semibold mb-2">
                  Select Team Members
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {AVAILABLE_CREW.map((crew) => {
                    const isChecked = selectedCrew.includes(crew);

                    return (
                      <label
                        key={crew}
                        onClick={() => handleToggleCrew(crew)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-white'
                            : 'bg-[#0a0a0f] border-white/10 text-[#a0a0b0] hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by label click
                            className="rounded border-white/20 bg-[#12121a] text-[#00d4ff] focus:ring-0 cursor-pointer"
                          />
                          <span className="font-semibold text-xs">{crew}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-[#00d4ff]" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a0a0f] hover:bg-white/5 text-[#a0a0b0] hover:text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Crew Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
