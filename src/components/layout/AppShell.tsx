'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = 
    pathname === '/login' || 
    pathname.startsWith('/enquire') || 
    pathname.startsWith('/proposal');

  if (isPublicPage) {
    return <div className="min-h-screen w-full bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Studio Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
