'use client';

import React from 'react';
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
  X
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

  if (pathname === '/login') {
    return null;
  }

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
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-40 flex flex-col justify-between pixeva-card border-r border-white/10 bg-[#0a0a0f] p-3 md:p-4 transition-all duration-300 ease-in-out ${
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
                    <h1 className="font-extrabold text-xl tracking-tight text-white">Pixeva</h1>
                    <span className="badge-cyan text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded">STUDIO</span>
                  </div>
                  <p className="text-[11px] text-[#a0a0b0] truncate">AI Photography & Studio</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/10 md:hidden"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle Button in Header */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-[#a0a0b0] hover:text-[#00d4ff] hover:bg-white/5 transition-colors shrink-0"
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
                      ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/40 shadow-md shadow-[#00d4ff]/15'
                      : 'text-[#a0a0b0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`flex items-center space-x-2.5 ${isCollapsed ? 'md:space-x-0' : 'truncate'}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#00d4ff]' : 'text-[#a0a0b0] group-hover:text-white'
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
                          : 'bg-black/20 text-[#a0a0b0] group-hover:text-white'
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

        {/* Theme Switcher & User Footer */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`w-full flex items-center ${
              isCollapsed ? 'md:justify-center p-2.5' : 'justify-between p-2.5'
            } rounded-xl pixeva-card bg-[#12121a] border border-white/10 text-xs hover:border-[#00d4ff]/40 transition-all`}
          >
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xs text-[#a0a0b0] font-medium">Appearance</span>
            )}
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-white/5 text-[11px] font-bold">
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#00d4ff]" />
                  {(!isCollapsed || isMobileOpen) && <span className="text-white">Dark</span>}
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  {(!isCollapsed || isMobileOpen) && <span className="text-[#0f172a]">Light</span>}
                </>
              )}
            </div>
          </button>

          {/* User Profile Card */}
          <div
            className={`flex items-center ${
              isCollapsed ? 'md:justify-center p-2' : 'justify-between p-2'
            } rounded-xl pixeva-card bg-[#12121a] border border-white/10`}
          >
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
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Studio User'}
                  </p>
                  <p className="text-[9px] text-[#a0a0b0] truncate">{user?.email || 'admin@pixeva.co'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sign Out / Log Out Button */}
          {user && (
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className={`w-full flex items-center justify-center space-x-2 py-2 ${
                isCollapsed ? 'md:px-2' : 'px-3'
              } rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all duration-200 group`}
            >
              <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
