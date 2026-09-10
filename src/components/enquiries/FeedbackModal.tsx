'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Star, CheckCircle2 } from 'lucide-react';

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 btn-pixeva-primary space-x-2 px-3.5 py-2 rounded-full shadow-lg hover:scale-105 transition-all group"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Feedback</span>
      </button>

      {/* Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md pixeva-card p-5 space-y-4 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Product Feedback</h3>
                <p className="text-[11px] text-slate-500">Help us improve Pixeva CRM</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-500">
                  Your input directly helps us improve the platform.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">Overall Experience</label>
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-transform cursor-pointer ${
                          star <= rating ? 'text-amber-500 scale-105' : 'text-slate-300 dark:text-white/20 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    What's working well? What could be better?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what features or improvements you'd like to see..."
                    className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-md p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-pixeva-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pixeva-primary space-x-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
