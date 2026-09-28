'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  X,
  Check,
  UserPlus
} from 'lucide-react';
import { ScheduledEvent } from '@/lib/supabase/types';

const INITIAL_EVENTS: ScheduledEvent[] = []; // cleared mock data;

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
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(7); // August 2026
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningEvent, setAssigningEvent] = useState<ScheduledEvent | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = null /* localStorage.getItem(CREW_STORAGE_KEY) */;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
        } else {
          
        }
      } else {
        
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

  // Generate Calendar Days Grid for Selected Month (August 2026 layout)
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Crew Scheduling
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every event across every project, and who’s working it
          </p>
        </div>

        {/* Month Selector & Export Action */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 px-2 py-1 rounded-xl shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-900 dark:text-white min-w-[100px] text-center">
              {MONTHS[currentMonthIndex]}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="btn-pixeva-secondary flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Interactive Calendar Month Grid */}
      <div className="pixeva-card rounded-xl p-4 space-y-3">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
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
            const isAugust30 = d.isCurrentMonth && d.day === 30;
            const isAugust31 = d.isCurrentMonth && d.day === 31;

            return (
              <div
                key={`${d.dateStr}-${index}`}
                className={`min-h-[72px] md:min-h-[84px] p-2 rounded-lg border flex flex-col justify-between transition-all ${d.isCurrentMonth
                    ? 'bg-white dark:bg-[#0f172a] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-transparent opacity-40'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${d.isCurrentMonth ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}
                  >
                    {d.day}
                  </span>

                  {(isAugust30 || isAugust31) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
                  )}
                </div>

                {/* Event Chips */}
                {isAugust30 && (
                  <button
                    onClick={() => handleOpenAssignModal(events[0])}
                    className="w-full text-left mt-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-900 dark:text-white truncate transition-colors"
                  >
                    Reception
                  </button>
                )}

                {isAugust31 && (
                  <button
                    onClick={() => handleOpenAssignModal(events[1])}
                    className="w-full text-left mt-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-900 dark:text-white truncate transition-colors"
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Unassigned Events</h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400 text-xs font-semibold">
            {unassignedEvents.length}
          </span>
        </div>

        {/* Unassigned Events Table */}
        <div className="pixeva-card rounded-xl overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200/80 text-[10px]">
              <tr>
                <th className="w-[28%] px-4 py-3">Project</th>
                <th className="w-[20%] px-4 py-3">Event</th>
                <th className="w-[25%] px-4 py-3">Date & Time</th>
                <th className="w-[15%] px-4 py-3">Status</th>
                <th className="w-[12%] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {unassignedEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">All events fully assigned!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Great job! Every upcoming event has assigned crew members.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                unassignedEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Project Name */}
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.project_name}</span>
                      </div>
                    </td>

                    {/* Event Title */}
                    <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">{evt.event_title}</td>

                    {/* Date & Time */}
                    <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.date_time}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/30 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{evt.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenAssignModal(evt)}
                        className="btn-pixeva-primary px-3 py-1.5 inline-flex items-center space-x-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-white dark:bg-[#0f172a] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Assign Crew to {assigningEvent.event_title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{assigningEvent.project_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Event Schedule</p>
                <p className="font-mono text-slate-900 dark:text-white font-semibold">{assigningEvent.date_time}</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Select Team Members
                </label>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {AVAILABLE_CREW.map((crew) => {
                    const isChecked = selectedCrew.includes(crew);

                    return (
                      <label
                        key={crew}
                        onClick={() => handleToggleCrew(crew)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isChecked
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }} // Handled by label click
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                          <span className="font-medium text-xs">{crew}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4" />}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="btn-pixeva-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pixeva-primary"
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
