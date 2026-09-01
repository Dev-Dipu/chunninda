"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";

export default function ComingSoonCard() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | error
    const [message, setMessage] = useState("");

    const triggerConfetti = () => {
        try {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ["#f5eee6", "#d4af37", "#ffffff", "#e8a87c"],
            });
        } catch {
            // fallback if canvas not available
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus("success");
                setMessage(
                    data.message ||
                        "Thank you for subscribing! We've sent a welcome note to your inbox.",
                );
                triggerConfetti();
                setEmail("");
            } else if (data.duplicate) {
                setStatus("duplicate");
                setMessage(
                    data.message ||
                        "You're already on our exclusive debut list!",
                );
            } else {
                setStatus("error");
                setMessage(
                    data.error ||
                        "Something went wrong. Please check your email and try again.",
                );
            }
        } catch (err) {
            console.error("Subscription error:", err);
            setStatus("error");
            setMessage("Network error. Please try again in a moment.");
        }
    };

    return (
        <div className="relative w-full max-w-[420px] sm:max-w-[540px] md:max-w-[580px] mx-auto px-3 xs:px-4 sm:px-6">
            {/* Terracotta Hero Container */}
            <div
                className="relative bg-[#a85e34] sm:bg-[#b3653b] text-white rounded-none sm:rounded-sm shadow-2xl px-6 py-8 xs:px-7 xs:py-10 sm:px-12 sm:py-12 md:p-14 transition-all duration-500 overflow-hidden"
                style={{
                    boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(168, 94, 52, 0.35)",
                }}
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Small Stylized Logo Emblem */}
                    <div className="mb-4 sm:mb-6">
                        <Image
                            src="/images/logo.svg"
                            alt="CHUNNIINDIA"
                            width={65}
                            height={65}
                            className="w-[56px] md:w-32 h-auto object-contain mx-auto"
                            priority
                        />
                    </div>

                    {/* Section Heading - Exact 1 Line */}
                    <h2 className="font-kannada text-[1.22rem] xs:text-[1.38rem] sm:text-2xl md:text-[1.85rem] tracking-[0.15em] sm:tracking-[0.2em] font-normal text-white uppercase mb-3 sm:mb-4 whitespace-nowrap">
                        LAUNCHING SOON
                    </h2>

                    {/* Brand Description - Exact 3 Lines on Mobile */}
                    <p className="text-[11.5px]  md:text-sm text-white/90 max-w-[315px] sm:max-w-[420px] mx-auto mb-6 sm:mb-8 text-center  font-helvetica   md:tracking-wide leading-[1.25] md:leading-[1.6]">
                        CHUNNIINDIA is getting ready to make its debut. Sign up
                        below to be the first to know about our launch, new
                        updates, and everything we&apos;re creating behind the
                        scenes.
                    </p>
                </div>

                {/* Subscription Form / Status Area */}
                {status === "success" ? (
                    <div className="bg-black/20 border border-white/30 rounded-none p-6 text-center animate-fadeIn max-w-[340px] sm:max-w-[420px] mx-auto">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-7 h-7 text-[#f5eee6]" />
                        </div>
                        <h3 className="font-kannada text-lg sm:text-xl tracking-wider text-white mb-2">
                            YOU&apos;RE ON THE LIST
                        </h3>
                        <p className="text-xs sm:text-sm font-light text-white/90 mb-4 leading-relaxed font-helvetica">
                            {message}
                        </p>
                        <button
                            onClick={() => {
                                setStatus("idle");
                                setMessage("");
                            }}
                            className="text-xs tracking-widest uppercase underline underline-offset-4 text-white/80 hover:text-white transition-colors font-helvetica"
                        >
                            Sign up with another email
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-[340px] sm:max-w-[420px] mx-auto flex flex-col gap-2.5 sm:gap-3"
                    >
                        {/* Email Input Field */}
                        <div className="relative w-full">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (status !== "idle")
                                        setStatus("idle");
                                }}
                                placeholder="ENTER YOUR EMAIL"
                                required
                                disabled={status === "loading"}
                                className="w-full font-helvetica h-11 sm:h-12 px-4 bg-transparent text-white placeholder-white/70 text-xs sm:text-sm tracking-widest uppercase border border-white/50 focus:border-white focus:outline-none transition-all duration-300 rounded-none text-left"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full h-11 sm:h-12 px-6 bg-[#f2e7dc] hover:bg-white text-[#1a1412] text-xs sm:text-sm font-medium uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 flex items-center justify-center cursor-pointer active:scale-[0.99] whitespace-nowrap rounded-none font-helvetica"
                        >
                            {status === "loading" ? (
                                <span className="flex items-center gap-2 font-helvetica">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1a1412]" />
                                    <span className="text-[11px] tracking-wider">
                                        SENDING...
                                    </span>
                                </span>
                            ) : (
                                <span className="tracking-widest">
                                    KEEP ME POSTED
                                </span>
                            )}
                        </button>

                        {/* Status Messages / Feedback */}
                        {status === "duplicate" && (
                            <div className="mt-2 flex items-center gap-2 justify-center text-xs text-amber-200 bg-black/20 p-2.5 rounded-none border border-amber-300/30 font-helvetica">
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="mt-2 flex items-center gap-2 justify-center text-xs text-red-200 bg-black/30 p-2.5 rounded-none border border-red-300/30 font-helvetica">
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
