'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings2, 
  Camera,
  Zap,
  CalendarDays,
  Inbox,
  Briefcase,
  Layers,
  MessageSquare,
  DollarSign,
  Sun,
  Moon,
  HardDrive,
  Bot,
  LogOut
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Enquiries', href: '/enquiries', icon: Inbox },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Crew Scheduling', href: '/crew-scheduling', icon: CalendarDays },
  { label: 'Finances', href: '/finances', icon: DollarSign },
  { label: 'Post Production', href: '/post-production', icon: Layers },
  { label: 'Client Requests', href: '/client-requests', icon: MessageSquare },
  { label: 'Data', href: '/data', icon: HardDrive },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Pixeva CRM AI', href: '/pixeva-ai', icon: Bot, badge: 'AI' },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  if (pathname === '/login') {
    return null;
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col justify-between pixeva-card border-r border-white/10 bg-[#0a0a0f] p-4 z-40 transition-colors duration-250">
      <div className="space-y-4">
        {/* Pixeva Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-xl tracking-tight text-white">Pixeva</h1>
              <span className="badge-cyan text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">STUDIO</span>
            </div>
            <p className="text-[11px] text-[#a0a0b0]">AI Photography & Studio</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/40 shadow-md shadow-[#00d4ff]/15'
                    : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#00d4ff]' : 'text-[#a0a0b0] group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 transition-all ${
                    isActive 
                      ? 'bg-[#00d4ff] text-slate-950 shadow-sm' 
                      : 'bg-black/20 text-[#a0a0b0] group-hover:text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cloud Architecture, Theme Switcher & User Footer */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        {/* Quick Theme Switcher Pill */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl pixeva-card bg-[#12121a] border border-white/10 text-xs hover:border-[#00d4ff]/40 transition-all"
        >
          <span className="text-xs text-[#a0a0b0] font-medium">Appearance</span>
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-white/5 text-[11px] font-bold">
            {theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span className="text-white">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[#0f172a]">Light</span>
              </>
            )}
          </div>
        </button>

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl pixeva-card bg-[#12121a] border border-white/10">
          <div className="flex items-center space-x-2 truncate">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.email || 'User'}
                className="w-7 h-7 rounded-full border border-[#00d4ff]/40 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center font-bold text-[10px] text-white shadow-sm shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'PX'}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Studio User'}
              </p>
              <p className="text-[9px] text-[#a0a0b0] truncate">{user?.email || 'admin@pixeva.co'}</p>
            </div>
          </div>
        </div>

        {/* Explicit Sign Out / Log Out Button */}
        {user && (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Sign Out / Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
