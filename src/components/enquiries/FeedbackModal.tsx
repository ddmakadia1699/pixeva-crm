'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Star, CheckCircle2 } from 'lucide-react';

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
        className="fixed bottom-6 right-6 z-40 btn-pixeva-primary flex items-center space-x-2 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all group"
      >
        <MessageSquare className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-black text-black">Share Feedback</span>
      </button>

      {/* Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md pixeva-card bg-[#12121a] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00d4ff]" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Help us improve Pixeva CRM</h3>
                  <p className="text-[11px] text-[#a0a0b0]">Product Feedback</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#a0a0b0] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-white text-base">Thank you for your feedback!</h4>
                <p className="text-xs text-[#a0a0b0]">
                  Your input directly helps us improve Pixeva CRM.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#a0a0b0] block mb-1">Overall Experience</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-transform ${
                          star <= rating ? 'text-amber-400 scale-110' : 'text-white/20 hover:text-amber-200'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#a0a0b0] block mb-1">
                    What's working well? What could be better?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what features or improvements you'd like to see in Enquiries, Bookings, or AI Galleries..."
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-[#a0a0b0] hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pixeva-primary px-5 py-2 rounded-xl font-bold flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
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
