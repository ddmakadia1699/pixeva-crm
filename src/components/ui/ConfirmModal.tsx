'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Light Blue & White Premium Centered Card */}
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-[#131b2e] dark:to-[#0f172a] text-slate-900 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border border-sky-200/80 dark:border-sky-500/30 space-y-5 animate-scaleUp relative overflow-hidden"
        style={{
          boxShadow: '0 20px 50px -12px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(56, 189, 248, 0.2)'
        }}
      >
        {/* Soft Light-Blue Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon + Close */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 dark:bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shadow-sm shrink-0">
              {isDestructive ? (
                <Trash2 className="w-6 h-6 text-sky-500 dark:text-sky-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-sky-500 dark:text-sky-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Confirmation Required
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="relative z-10 py-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/25 transition-all transform active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
