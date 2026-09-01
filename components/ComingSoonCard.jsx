'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function ComingSoonCard() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | duplicate | error
  const [message, setMessage] = useState('');

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f5eee6', '#d4af37', '#ffffff', '#e8a87c']
      });
    } catch {
      // fallback if canvas not available
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || "Thank you for subscribing! We've sent a welcome note to your inbox.");
        triggerConfetti();
        setEmail('');
      } else if (data.duplicate) {
        setStatus('duplicate');
        setMessage(data.message || "You're already on our exclusive debut list!");
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please check your email and try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setStatus('error');
      setMessage('Network error. Please try again in a moment.');
    }
  };

  return (
    <div className="relative w-full max-w-[620px] mx-auto px-4 sm:px-6">
      {/* Terracotta Hero Container */}
      <div 
        className="relative bg-[#b3653b] text-white rounded-none sm:rounded-sm shadow-2xl p-7 sm:p-12 md:p-14 transition-all duration-500 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(179, 101, 59, 0.35)',
        }}
      >
        {/* Subtle decorative inner corner borders */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/20 pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center">
          
          {/* Stylized Lotus in Hands Emblem SVG */}
          <Image src="/images/logo.svg" alt="Lotus" width={200} height={200} />

          {/* Section Heading */}
          <h2 className="font-cinzel text-2xl sm:text-3xl md:text-[2.1rem] tracking-[0.18em] font-normal text-white uppercase mb-4 sm:mb-5">
            LAUNCHING SOON
          </h2>

          {/* Brand Description */}
          <p className="text-sm sm:text-[15px] text-white/90 max-w-[480px] mb-8 sm:mb-10 text-center px-1 font-[helvetica]">
            CHUNNIINDIA is getting ready to make its debut. Sign up below to be the first to know about our launch, new updates, and everything we&apos;re creating behind the scenes.
          </p>
        </div>

        {/* Subscription Form / Status Area */}
        {status === 'success' ? (
          <div className="bg-black/20 border border-white/30 rounded-sm p-6 text-center animate-fadeIn">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center text-white">
              <CheckCircle2 className="w-7 h-7 text-[#f5eee6]" />
            </div>
            <h3 className="font-cinzel text-lg sm:text-xl tracking-wider text-white mb-2">
              YOU&apos;RE ON THE LIST
            </h3>
            <p className="text-sm font-light text-white/90 mb-4 leading-relaxed">
              {message}
            </p>
            <button
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
              className="text-xs tracking-widest uppercase underline underline-offset-4 text-white/80 hover:text-white transition-colors"
            >
              Sign up with another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-[500px] mx-auto">
            {/* Input & Button Container */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 ">
              {/* Email Input Field */}
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  placeholder="ENTER YOUR EMAIL"
                  required
                  disabled={status === 'loading'}
                  className="w-full h-12 sm:h-13 px-4 bg-transparent text-white placeholder-white/70 text-xs sm:text-sm tracking-widest uppercase border border-white/60 focus:border-white focus:outline-none transition-all duration-300 rounded-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-12 w-fit sm:h-13 px-6 sm:px-7 bg-[#f5eee6] hover:bg-white text-[#1a1614] text-xs sm:text-sm font-medium uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 flex items-center justify-center cursor-pointer active:scale-[0.99] whitespace-nowrap rounded-none"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1a1614]" />
                    <span className="text-[11px]">SENDING...</span>
                  </span>
                ) : (
                  <span>KEEP ME POSTED</span>
                )}
              </button>
            </div>

            {/* Status Messages / Feedback */}
            {status === 'duplicate' && (
              <div className="mt-3.5 flex items-center gap-2 justify-center text-xs text-amber-200 bg-black/20 p-2.5 rounded-none border border-amber-300/30">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-3.5 flex items-center gap-2 justify-center text-xs text-red-200 bg-black/30 p-2.5 rounded-none border border-red-300/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
