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
        <div className="relative w-full md:w-1/2 max-w-[420px] sm:max-w-[540px] md:max-w-[820px] mx-auto px-3 xs:px-4 sm:px-6">
            {/* Terracotta Hero Container */}
            <div
                className="relative bg-[#B56E3B] text-[#F3E9DC] shadow-2xl px-6 py-8 xs:px-7 xs:py-10 sm:px-12 sm:py-12 md:p-14 transition-all duration-500 overflow-hidden"
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
                            className="w-[82px] md:w-36 h-auto object-contain mx-auto"
                            priority
                        />
                    </div>

                    {/* Section Heading - Exact 1 Line */}
                    <h2 className="font-kannada text-[1.22rem] xs:text-[1.38rem] sm:text-2xl md:text-[1.85rem] text-[#F3E9DC] uppercase mb-3 sm:mb-4[#F3E9DC] whitespace-nowrap">
                        LAUNCHING SOON
                    </h2>

                    {/* Brand Description - Exact 3 Lines on Mobile */}
                    <p className="text-[11.5px]  md:text-sm text-[#F3E9DC] 90 max-w-[490px]  mx-auto mb-6 sm:mb-8 text-center  font-helvetica tracking-wide md:tracking-[1px] leading-[1.25] ">
                        CHUNNIINDIA is getting ready to make its debut. Sign up
                        below to be the first to know about our launch, new
                        updates, and everything we&apos;re creating behind the
                        scenes.
                    </p>
                </div>

                {/* Subscription Form / Status Area */}
                {status === "success" ? (
                    <div className="bg-black/20 border border-[#F3E9DC] 30 rounded-none p-6 text-center animate-fadeIn max-w-[340px] sm:max-w-[420px] mx-auto">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F3E9DC] 10 flex items-center justify-center text-[#F3E9DC] ">
                            <CheckCircle2 className="w-7 h-7 text-[#f5eee6]" />
                        </div>
                        <h3 className="font-kannada text-lg sm:text-xl tracking-wider text-[#F3E9DC] mb-2">
                            YOU&apos;RE ON THE LIST
                        </h3>
                        <p className="text-xs sm:text-sm font-light text-[#F3E9DC] 90 mb-4 leading-relaxed font-helvetica">
                            {message}
                        </p>
                        <button
                            onClick={() => {
                                setStatus("idle");
                                setMessage("");
                            }}
                            className="text-xs tracking-widest uppercase underline underline-offset-4 text-[#F3E9DC] 80 hover:text-[#F3E9DC] transition-colors font-helvetica"
                        >
                            Sign up with another email
                        </button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto flex md:flex-row flex-col gap-2.5"
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
                                className="w-full font-helvetica placeholder:font-helvetica h-11 sm:h-12 px-4 bg-transparent text-[#F3E9DC] placeholder-[#F3E9DC] text-xs sm:text-sm tracking-widest uppercase border border-[#F3E9DC]  focus:border-[#F3E9DC] focus:outline-none transition-all duration-300 rounded-none text-left"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full md:w-fit h-11 sm:h-12 px-5 bg-[#f2e7dc] hover:bg-[#F3E9DC] text-[#1a1412] text-xs sm:text-sm font-medium uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-75 flex items-center justify-center cursor-pointer active:scale-[0.99][#F3E9DC] whitespace-nowrap rounded-none font-helvetica"
                        >
                            {status === "loading" ? (
                                <span className="flex items-center gap-2 font-helvetica">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#1a1412]" />
                                    <span className="text-[11px] tracking-wider">
                                        SENDING...
                                    </span>
                                </span>
                            ) : (
                                <span className="tracking-wider font-helvetica">
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
