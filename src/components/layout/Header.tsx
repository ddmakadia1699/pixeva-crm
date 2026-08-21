'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, Zap, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenAddLeadModal?: () => void;
}

export default function Header({ onOpenAddLeadModal }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 pixeva-card border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl px-6 flex items-center justify-between transition-colors duration-250">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0]" />
          <input
            type="text"
            placeholder="Search leads, deals, galleries, or studio tasks..."
            className="w-full bg-[#12121a] border border-white/15 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff]"
          />
        </div>
      </div>

      {/* Production Status & Controls */}
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full badge-cyan text-[11px] font-bold">
          <Zap className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>Pixeva Studio: Live</span>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme (White)' : 'Switch to Dark Theme (Black)'}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-all duration-200"
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
