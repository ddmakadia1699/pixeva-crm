'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Database,
  CloudOff
} from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requirePermission?: boolean;
  itemName?: string;
  itemType?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isDestructive = true,
  requirePermission = true,
  itemName,
  itemType,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset confirmation checkbox state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setHasPermission(!requirePermission);
      setIsDeleting(false);
    }
  }, [isOpen, requirePermission]);

  // Keyboard shortcut: ESC to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (requirePermission && !hasPermission) return;
    setIsDeleting(true);
    onConfirm();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 rounded-3xl p-6 md:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-5 animate-scaleUp overflow-hidden">
        {/* Subtle Ambient Warning Glow */}
        {isDestructive && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Header: Icon + Title + Security Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isDestructive
                  ? 'bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                  : 'bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-6 h-6 animate-pulse" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isDestructive 
                    ? 'bg-rose-100/80 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/50 dark:border-rose-500/20'
                    : 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/20'
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                  {isDestructive ? 'Destructive Action' : 'Action Confirmation'}
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Cloud Database
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message & Target Entity Card */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>

          {itemName && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block">
                    {itemType || 'Target Item'}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {itemName}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/40 dark:border-rose-900/40 shrink-0">
                Will be purged
              </span>
            </div>
          )}

          {/* Cloud Synchronization Warning Callout */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <CloudOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="leading-snug">
              <span className="font-semibold">Irreversible Cloud Purge:</span> This action executes immediately across AWS API Gateway & Supabase PostgreSQL and cannot be restored.
            </div>
          </div>
        </div>

        {/* Explicit Permission Verification Checkbox */}
        {requirePermission && (
          <div className="pt-1">
            <label
              htmlFor="confirm-delete-permission"
              className={`group flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                hasPermission
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-500/30'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <input
                  id="confirm-delete-permission"
                  type="checkbox"
                  checked={hasPermission}
                  onChange={(e) => setHasPermission(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-600 focus:ring-rose-500/30 dark:bg-slate-800 cursor-pointer accent-rose-600"
                />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                  Grant delete permission & confirm authorization
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Check this box to confirm that you have verified this deletion and authorize the immediate removal of this record.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting || (requirePermission && !hasPermission)}
            className={`relative flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              requirePermission && !hasPermission
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300/40 dark:border-white/5'
                : isDestructive
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-500/20 active:scale-95 cursor-pointer'
                : 'btn-pixeva-primary active:scale-95 cursor-pointer'
            }`}
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                {isDestructive ? <Trash2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
