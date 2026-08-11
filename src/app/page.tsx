'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight, TrendingUp, Calendar, AlertCircle, Users, Briefcase, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#a0a0b0]">Your studio at a glance</p>
        </div>
        
        <div className="relative max-w-md w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#a0a0b0]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-sm placeholder-[#a0a0b0] text-white focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition-all"
            placeholder="What would you like to see on this dashboard? Tell us..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Enquiries Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#00d4ff]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-sm shadow-[#00d4ff]"></span>
              Enquiries
            </h2>
            <Link href="/enquiries" className="text-xs font-semibold text-[#00d4ff] hover:underline transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">New</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Follow Up</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Booked</p>
              <p className="text-2xl font-bold text-emerald-400">1</p>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#a0a0b0]">Leads / day (30d)</p>
              <TrendingUp className="w-4 h-4 text-[#a0a0b0]" />
            </div>
            <div className="h-16 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 border-dashed">
              <p className="text-xs text-[#a0a0b0]">No enquiries yet.</p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#8b5cf6]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
              Projects
            </h2>
            <Link href="/deals" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Total</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Missing</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-xs font-semibold text-[#a0a0b0] mb-3">Next Project</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bride & Groom (Demo)</p>
                <p className="text-xs text-[#a0a0b0] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" /> 30 Dec 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Finances Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#10b981]/30 transition-colors flex flex-col h-full md:row-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              Finances
            </h2>
            <Link href="/invoices" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Received</p>
              <p className="text-lg font-bold text-[#10b981]">₹10,000</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Balance Due</p>
              <p className="text-lg font-bold text-white">₹1,08,000</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Expenses</p>
              <p className="text-lg font-bold text-[#ef4444]">₹1,000</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Net Profit</p>
              <p className="text-lg font-bold text-white">₹-1,000</p>
            </div>
          </div>
          
          <div className="mt-4 pt-6 border-t border-white/10">
            <p className="text-xs font-semibold text-[#a0a0b0] mb-3">Next Payment Due</p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-white mb-1">₹49,000</p>
                  <p className="text-xs text-[#a0a0b0] leading-tight">for Bride & Groom (Demo)</p>
                </div>
                <div className="px-2 py-1 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-xs text-[#fbbf24] whitespace-nowrap">
                  Due 30 Oct 2026
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#a0a0b0]">Project amount / month (6mo)</p>
              <TrendingUp className="w-4 h-4 text-[#a0a0b0]" />
            </div>
            <div className="h-24 flex items-end justify-between gap-2 px-2">
              {/* Mock Bar Chart */}
              <div className="w-full bg-[#10b981] rounded-t-sm" style={{ height: '20%' }}></div>
              <div className="w-full bg-[#10b981]/20 rounded-t-sm" style={{ height: '0%' }}></div>
              <div className="w-full bg-[#10b981]/20 rounded-t-sm" style={{ height: '0%' }}></div>
              <div className="w-full bg-[#10b981]/20 rounded-t-sm" style={{ height: '0%' }}></div>
              <div className="w-full bg-[#10b981]/20 rounded-t-sm" style={{ height: '0%' }}></div>
              <div className="w-full bg-[#10b981] rounded-t-sm" style={{ height: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Post Production Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#f59e0b]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              Post Production
            </h2>
            <Link href="#" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">In Progress</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Not Started</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Review</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        {/* Delivery Timeline Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#ec4899]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ec4899]"></span>
              Delivery Timeline
            </h2>
            <Link href="#" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white/5 border border-white/5 border-dashed rounded-xl">
            <Clock className="w-6 h-6 text-[#a0a0b0] mb-2" />
            <p className="text-xs text-[#a0a0b0] leading-relaxed max-w-[200px]">
              No upcoming delivery deadlines — set a delivery timeline on your deliverables in Settings to see them here.
            </p>
          </div>
        </div>

        {/* Client Requests Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#00d4ff]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff]"></span>
              Client Requests
            </h2>
            <Link href="#" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">New</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </div>

        {/* Team Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#a855f7]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>
              Team
            </h2>
            <Link href="#" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Total</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">In House</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Freelancer</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
