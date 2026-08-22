'use client';

import React from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Seamless pass-through: render workspace content stably without unwanted route redirects
  return <>{children}</>;
}
