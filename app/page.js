import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';
import ComingSoonCard from '@/components/ComingSoonCard';

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center py-6 sm:py-8 px-4 select-none overflow-hidden">
      {/* Background with morphing smooth transition slideshow */}
      <BackgroundSlideshow />



      {/* Center Main Hero Card */}
      <div className="w-full flex items-center justify-center my-auto py-6 sm:py-8 z-10">
        <ComingSoonCard />
      </div>

    </main>
  );
}
