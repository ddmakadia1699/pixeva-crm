'use client';

import React from 'react';
import ContractManager from '@/components/contracts/ContractManager';
import { FileSignature } from 'lucide-react';

export default function ContractsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center space-x-2">
          <FileSignature className="w-5 h-5 text-[#00d4ff]" />
          <h1 className="text-xl font-bold text-white tracking-tight">Contracts & E-Signatures</h1>
        </div>
        <p className="text-xs text-[#a0a0b0] mt-1">
          Review legal photography agreements, release forms, and digital client signatures.
        </p>
      </div>

      <ContractManager />
    </div>
  );
}
