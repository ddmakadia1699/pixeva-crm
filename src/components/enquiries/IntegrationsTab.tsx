'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function IntegrationsTab() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 rounded-2xl pixeva-card bg-[#12121a] border border-white/10 space-y-6 shadow-card">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Google Sheets Sync</h2>
          <p className="text-xs text-[#a0a0b0]">
            Import enquiries securely via Google OAuth
          </p>
        </div>

        {/* Step 1 Box */}
        <div className="p-5 rounded-xl bg-[#0a0a0f] border border-white/5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Step 1 — Connect your Google account
          </h3>
          <p className="text-xs text-[#a0a0b0] leading-relaxed">
            Pixeva needs read-only access to Google Sheets. Your data stays private — it is never made public.
          </p>

          <div className="pt-2">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Google Account Connected</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsConnected(false)}
                  className="text-xs text-[#a0a0b0] hover:text-white underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="btn-pixeva-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Connect Google Account</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Help & Feedback */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#a0a0b0]">
        <a
          href="https://wa.me/918904832762"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white flex items-center space-x-1"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Get Help</span>
        </a>
        <span className="hover:text-white cursor-pointer">Feedback</span>
      </div>
    </div>
  );
}
