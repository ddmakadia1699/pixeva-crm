'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings2, 
  Camera, 
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
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X,
  MoreVertical
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

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
  { label: 'Pixeva AI', href: '/pixeva-ai', icon: Bot, badge: 'AI' },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  if (pathname === '/login' || pathname.startsWith('/enquire') || pathname.startsWith('/proposal')) {
    return null;
  }

  const userName = user?.user_metadata?.full_name || 'Dhruvi Govani';
  const userEmail = user?.email || 'dhruvigovani1699@gmail.com';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'D';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-40 flex flex-col justify-between border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b0f17] p-3 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'md:w-18' : 'md:w-60'
        } ${
          isMobileOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1.5 py-1">
            <Link
              href="/"
              className={`flex items-center space-x-2.5 group ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                      Pixeva
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 font-mono">
                      STUDIO
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Enterprise CRM Suite</p>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 md:hidden cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isMobileOpen) closeMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center ${
                    isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-2.5'
                  } py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-slate-100/90 text-slate-900 font-semibold dark:bg-white/10 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center space-x-2.5 ${isCollapsed ? 'md:space-x-0' : 'truncate'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 transition-all ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300' 
                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Minimalist User Profile */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 relative" ref={userMenuRef}>
          {/* Popover */}
          {isUserMenuOpen && (
            <div
              className="absolute bottom-full mb-2 left-0 right-0 z-50 p-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-900/5 animate-fadeIn space-y-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-white/10 px-1">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Theme</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              <div className="space-y-0.5 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/team"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Team</span>
                </Link>
              </div>

              <div className="pt-1.5 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Trigger Card */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={`w-full flex items-center ${
              isCollapsed ? 'md:justify-center p-1' : 'justify-between p-1.5'
            } rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left cursor-pointer group`}
          >
            <div className="flex items-center space-x-2 truncate">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={userName}
                  className="w-6 h-6 rounded-md object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {userInitial}
                </div>
              )}
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {userName}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <MoreVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
