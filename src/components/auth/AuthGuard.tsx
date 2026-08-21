'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Camera } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  // Public login route does not require protection
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg animate-pulse mb-4">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-bold tracking-widest text-[#00d4ff] uppercase animate-pulse">
          Authenticating Pixeva Session...
        </p>
      </div>
    );
  }

  // If authenticated, render protected page content
  if (user) {
    return <>{children}</>;
  }

  // Fallback loading while redirecting to /login
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center glow-cyan shadow-lg animate-pulse mb-4">
        <Camera className="w-6 h-6 text-white" />
      </div>
      <p className="text-xs font-bold tracking-widest text-[#00d4ff] uppercase animate-pulse">
        Redirecting to Login...
      </p>
    </div>
  );
}
