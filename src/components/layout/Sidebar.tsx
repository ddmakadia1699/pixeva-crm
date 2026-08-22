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
  MoreVertical,
  ShieldCheck,
  UserCheck
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
  { label: 'Pixeva CRM AI', href: '/pixeva-ai', icon: Bot, badge: 'AI' },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

  // User Account Popover State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop Sticky + Mobile Slide-out Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-40 flex flex-col justify-between border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0f] p-3 md:p-4 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className={`flex items-center space-x-3 ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00d4ff] via-[#3b82f6] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <h1 className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Pixeva</h1>
                    <span className="badge-cyan text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">STUDIO</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#a0a0b0] truncate">AI Photography & Studio</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#a0a0b0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 md:hidden"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle Button in Header */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-[#a0a0b0] dark:hover:text-[#00d4ff] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
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
                    isCollapsed ? 'md:justify-center md:px-0' : 'justify-between px-3'
                  } py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-sky-50 dark:bg-[#00d4ff]/15 text-sky-600 dark:text-[#00d4ff] border border-sky-300 dark:border-[#00d4ff]/40 shadow-sm'
                      : 'text-slate-600 dark:text-[#a0a0b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center space-x-2.5 ${isCollapsed ? 'md:space-x-0' : 'truncate'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-sky-600 dark:text-[#00d4ff]' : 'text-slate-400 dark:text-[#a0a0b0] group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 transition-all ${
                        isActive 
                          ? 'bg-[#00d4ff] text-slate-950 shadow-sm' 
                          : 'bg-slate-100 dark:bg-black/20 text-slate-600 dark:text-[#a0a0b0] group-hover:text-slate-900 dark:group-hover:text-white'
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

        {/* Theme Switcher & Interactive User Footer */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10 relative" ref={userMenuRef}>
          {/* Floating Luxury User Popover Menu */}
          {isUserMenuOpen && (
            <div
              className={`absolute bottom-full mb-2 ${
                isCollapsed ? 'left-0 w-64' : 'left-0 right-0'
              } z-50 p-3 rounded-2xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-900/15 dark:shadow-black/70 animate-fadeIn space-y-2.5`}
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
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors"
                >
                  <Settings2 className="w-4 h-4 text-slate-400" />
                  <span>Studio & Billing Settings</span>
                </Link>
                <Link
                  href="/team"
                  onClick={() => setIsUserMenuOpen(false)}
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
                    setIsUserMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Pixeva</span>
                </button>
              </div>
            </div>
          )}

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`w-full flex items-center ${
              isCollapsed ? 'md:justify-center p-2.5' : 'justify-between p-2.5'
            } rounded-xl bg-slate-50 dark:bg-[#12121a] border border-slate-200 dark:border-white/10 text-xs hover:border-sky-400 dark:hover:border-[#00d4ff]/40 transition-all cursor-pointer`}
          >
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xs text-slate-500 dark:text-[#a0a0b0] font-medium">Appearance</span>
            )}
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-200/60 dark:bg-white/5 text-[11px] font-bold">
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#00d4ff]" />
                  {(!isCollapsed || isMobileOpen) && <span className="text-white">Dark</span>}
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {(!isCollapsed || isMobileOpen) && <span className="text-slate-900">Light</span>}
                </>
              )}
            </div>
          </button>

          {/* Interactive User Profile Trigger Card (Opens Popover on Click) */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={`w-full flex items-center ${
              isCollapsed ? 'md:justify-center p-2' : 'justify-between p-2'
            } rounded-xl bg-slate-50 dark:bg-[#12121a] border ${
              isUserMenuOpen 
                ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50 dark:bg-sky-500/10' 
                : 'border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-white/20'
            } transition-all text-left cursor-pointer group`}
            title="Click to view profile & sign out"
          >
            <div className="flex items-center space-x-2.5 truncate">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={userName}
                  className="w-8 h-8 rounded-xl border border-sky-400/40 shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0">
                  {userInitial}
                </div>
              )}
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-[#a0a0b0] truncate font-mono">
                    {userEmail}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 dark:text-[#a0a0b0] dark:group-hover:text-white transition-colors shrink-0">
                <MoreVertical className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
