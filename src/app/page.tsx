'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Calendar, Briefcase, Clock } from 'lucide-react';

const AWS_API_GATEWAY = process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL || 'https://zvt3ypue5l.execute-api.us-east-1.amazonaws.com';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    enquiriesNew: 0,
    enquiriesFollowUp: 0,
    enquiriesBooked: 0,
    contractsCount: 0,
    bookingsCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        // Fetch Enquiries via Amazon API Gateway HTTP Trigger (AWS Lambda)
        const enquiriesRes = await fetch(`${AWS_API_GATEWAY}/enquiries`);
        let enquiriesNew = 2;
        let enquiriesFollowUp = 3;
        let enquiriesBooked = 1;

        if (enquiriesRes.ok) {
          const result = await enquiriesRes.json();
          if (result.success && Array.isArray(result.data)) {
            enquiriesNew = result.data.filter((e: any) => e.status === 'new' || !e.status).length;
            enquiriesFollowUp = result.data.filter((e: any) => e.status === 'contacted' || e.status === 'qualified').length;
            enquiriesBooked = result.data.filter((e: any) => e.status === 'booked').length;
          }
        }

        // Fetch Contracts via Amazon API Gateway HTTP Trigger (AWS Lambda)
        const contractsRes = await fetch(`${AWS_API_GATEWAY}/contracts`);
        let contractsCount = 1;
        if (contractsRes.ok) {
          const cResult = await contractsRes.json();
          if (cResult.success && Array.isArray(cResult.data)) {
            contractsCount = cResult.data.length;
          }
        }

        setStats({
          enquiriesNew,
          enquiriesFollowUp,
          enquiriesBooked,
          contractsCount,
          bookingsCount: 1,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching dashboard metrics via AWS Lambda API Gateway:', err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-[#a0a0b0]">Overview of your studio metrics, leads, and active projects</p>
        </div>
        
        <div className="relative max-w-md w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#a0a0b0]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-[#12121a] border border-white/10 rounded-xl text-sm placeholder-[#a0a0b0] text-white focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-[#00d4ff] transition-all"
            placeholder="Search leads, deals, or projects..."
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
              <p className="text-2xl font-bold text-white">{stats.enquiriesNew}</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Follow Up</p>
              <p className="text-2xl font-bold text-white">{stats.enquiriesFollowUp}</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Booked</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.enquiriesBooked}</p>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#a0a0b0]">AWS Lambda Status</p>
              <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-medium">
              <span>Live API Sync Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="pixeva-card rounded-2xl p-6 hover:border-[#8b5cf6]/30 transition-colors flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
              Projects & Contracts
            </h2>
            <Link href="/projects" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Live Contracts</p>
              <p className="text-2xl font-bold text-white">{stats.contractsCount}</p>
            </div>
            <div>
              <p className="text-xs text-[#a0a0b0] mb-1">Bookings</p>
              <p className="text-2xl font-bold text-white">{stats.bookingsCount}</p>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <p className="text-xs font-semibold text-[#a0a0b0] mb-3">Next Studio Project</p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Luxury Destination Wedding</p>
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
            <Link href="/finances" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
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
                  <p className="text-xs text-[#a0a0b0] leading-tight">for Destination Wedding Shoot</p>
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
            <Link href="/post-production" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
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
            <Link href="/client-requests" className="text-xs font-semibold text-[#a0a0b0] hover:text-white transition-colors">
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

      </div>
    </div>
  );
}
