'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Bell, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  Menu,
  Settings2,
  Users,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useCurrency } from '@/context/CurrencyContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenAddLeadModal?: () => void;
}

export default function Header({ onOpenAddLeadModal }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isCollapsed, toggleCollapse, toggleMobileOpen } = useSidebar();
  const { currencies, currencyCode, currency, setCurrencyCode } = useCurrency();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    }
    if (isProfileOpen || isCurrencyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isCurrencyOpen]);

  if (pathname === '/login' || pathname.startsWith('/enquire') || pathname.startsWith('/proposal')) {
    return null;
  }

  const userName = user?.user_metadata?.full_name || 'Dhruvi Govani';
  const userEmail = user?.email || 'dhruvigovani1699@gmail.com';
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'D';

  return (
    <header className="h-13 shrink-0 sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0b0f17]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between transition-colors duration-150">
      {/* Left: Sidebar Toggle & Command Search Bar */}
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
          className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shrink-0 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, shoots, galleries, or ledger..."
            className="w-full bg-slate-100/80 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-lg pl-8 pr-10 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-[#0f172a] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-white/10 px-1 py-0.2 rounded border border-slate-200 dark:border-white/10">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Theme Switcher & Profile */}
      <div className="flex items-center space-x-2">
        {/* Quick New Lead Button */}
        {onOpenAddLeadModal && (
          <button
            onClick={onOpenAddLeadModal}
            className="btn-pixeva-primary space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        )}

        {/* Currency Switcher Dropdown */}
        <div className="relative" ref={currencyMenuRef}>
          <button
            type="button"
            onClick={() => setIsCurrencyOpen((prev) => !prev)}
            title="Active Studio Currency (Click to switch)"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-sm leading-none">{currency.flag}</span>
            <span className="font-mono">{currency.code}</span>
            <span className="text-slate-400 font-bold">{currency.symbol.trim()}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCurrencyOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Studio Currency LOV</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Select Active Currency</p>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 font-bold">
                  Dynamic
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {currencies.map((c) => {
                  const isSelected = c.code === currencyCode;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCurrencyCode(c.code);
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 dark:bg-blue-500/10 font-bold text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <div className="truncate">
                          <span className="font-semibold">{c.code}</span>
                          <span className="text-slate-400 text-[11px] ml-1.5 truncate">
                            ({c.symbol.trim()}) {c.name.split('(')[0].trim()}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs ml-2 shrink-0">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <Link
                  href="/settings?tab=payments"
                  onClick={() => setIsCurrencyOpen(false)}
                  className="block text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Configure in Settings →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        {/* Notification Icon */}
        <button className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all relative cursor-pointer">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center space-x-2 pl-1.5 pr-2 py-1 rounded-lg border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
          >
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
            <span className="text-xs font-semibold text-slate-900 dark:text-white hidden lg:inline max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
          </button>

          {/* Popover */}
          {isProfileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-60 z-50 p-2 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-900/5 animate-fadeIn space-y-1.5"
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

              <div className="space-y-0.5 text-xs">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings & Preferences</span>
                </Link>
                <Link
                  href="/team"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Team Members</span>
                </Link>
              </div>

              <div className="pt-1.5 border-t border-slate-100 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
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
        </div>
      </div>
    </header>
  );
}
