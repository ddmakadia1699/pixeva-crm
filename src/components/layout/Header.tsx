'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, Zap, Sun, Moon, LogOut, User as UserIcon, Menu } from 'lucide-react';
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

  if (pathname === '/login') {
    return null;
  }

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
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold transition-all duration-200"
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

        {/* User Auth Profile / Logout */}
        {user ? (
          <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
            <div className="flex items-center space-x-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.email || 'User'}
                  className="w-7 h-7 rounded-full border border-blue-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-white hidden lg:inline max-w-[120px] truncate">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}

        {/* Action Button */}
        {onOpenAddLeadModal && (
          <button
            onClick={onOpenAddLeadModal}
            className="btn-pixeva-primary flex items-center space-x-1.5 text-xs px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        )}

        {/* Notification Icon */}
        <button className="p-2 rounded-xl text-[#a0a0b0] hover:text-white hover:bg-white/10 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00d4ff] glow-cyan" />
        </button>
      </div>
    </header>
  );
}
