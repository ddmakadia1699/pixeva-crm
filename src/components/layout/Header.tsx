'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  Plus, 
  Zap, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Menu,
  Settings2,
  Users,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenAddLeadModal?: () => void;
}

export default function Header({ onOpenAddLeadModal }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebar();

  // Top-Right User Profile Popover State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  if (pathname === '/login' || pathname.startsWith('/enquire') || pathname.startsWith('/proposal')) {
    return null;
  }

  const userName = user?.user_metadata?.full_name || 'Dhruvi Govani';
  const userEmail = user?.email || 'dhruvigovani1699@gmail.com';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'D';

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0f]/90 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between transition-colors duration-250">
      {/* Left Area: Sidebar Toggle & Search Bar */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              toggleMobileOpen();
            } else {
              toggleCollapse();
            }
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-[#a0a0b0] hover:text-slate-900 dark:hover:text-[#00d4ff] hover:border-slate-300 dark:hover:border-[#00d4ff]/30 transition-all shrink-0 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#a0a0b0]" />
          <input
            type="text"
            placeholder="Search leads, deals, galleries, or studio tasks..."
            className="w-full bg-slate-100 dark:bg-[#12121a] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#a0a0b0] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Theme Switcher & User Controls */}
      <div className="flex items-center space-x-3">

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme (White)' : 'Switch to Dark Theme (Black)'}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold transition-all duration-200 cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-[#a0a0b0] hover:text-white hidden md:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[#0f172a] hidden md:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* User Auth Profile Trigger & Popover */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-white/20 bg-slate-50 dark:bg-[#12121a] hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer group"
            title="Account & Sign Out"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={userName}
                className="w-7 h-7 rounded-lg border border-sky-400/40 shrink-0 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0">
                {userInitial}
              </div>
            )}
            <div className="text-left hidden lg:block max-w-[120px] truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors block truncate">
                {userName}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Top-Right Floating Account Popover Menu */}
          {isProfileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 z-50 p-3 rounded-2xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/15 dark:shadow-black/70 animate-fadeIn space-y-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Account Header */}
              <div className="flex items-center space-x-3 pb-2.5 border-b border-slate-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-sky-500/20 shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {userName}
                    </p>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 shrink-0">
                      Owner
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Quick Navigation Items */}
              <div className="space-y-1 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors"
                >
                  <Settings2 className="w-4 h-4 text-slate-400" />
                  <span>Studio & Billing Settings</span>
                </Link>
                <Link
                  href="/team"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Team & Crew Permissions</span>
                </Link>
              </div>

              {/* Sign Out Action Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onOpenAddLeadModal && (
          <button
            onClick={onOpenAddLeadModal}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs px-4 py-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        )}

        {/* Notification Icon */}
        <button className="p-2 rounded-xl text-[#a0a0b0] hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00d4ff] glow-cyan" />
        </button>
      </div>
    </header>
  );
}
