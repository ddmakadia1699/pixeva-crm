'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public client-facing routes that render full-screen standalone without CRM sidebar/header
  const isPublicStandaloneRoute =
    pathname.startsWith('/enquire') ||
    pathname.startsWith('/proposal') ||
    pathname === '/login';

  if (isPublicStandaloneRoute) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
