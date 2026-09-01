import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";
import ComingSoonCard from "@/components/ComingSoonCard";

export default function HomePage() {
    return (
        <main className="relative h-[100dvh] w-full flex flex-col justify-between items-center py-6 sm:py-8 px-3 xs:px-4 select-none overflow-hidden">
            {/* Background with morphing smooth transition slideshow */}
            <BackgroundSlideshow />

            <div className="w-full h-2 sm:h-6" />

            {/* Center Main Hero Card */}
            <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6 z-10">
                <ComingSoonCard />
            </div>

            {/* Bottom Instagram Handle */}
            <div className="z-10  flex items-center justify-center md:justify-between  w-full px-8">
                <a
                    href="https://instagram.com/chunniindia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/80 hover:text-white transition-opacity text-xs tracking-widest font-helvetica"
                >
                    <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>chunniindia</span>
                </a>
                <h4 className="text-white/80 text-xs hidden md:block tracking-widest font-helvetica drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">STAY TUNED</h4>
            </div>
        </main>
    );
}
