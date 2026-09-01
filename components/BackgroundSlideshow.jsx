'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const IMAGES = [
  {
    src: '/images/img1.jpeg',
    alt: 'CHUNNIINDIA - Traditional Embroidered Scarf on Sculpture',
  },
  {
    src: '/images/img2.jpeg',
    alt: 'CHUNNIINDIA - Sky Blue Embroidered Dupatta with Tassels',
  },
  {
    src: '/images/img3.jpeg',
    alt: 'CHUNNIINDIA - Terracotta Dupatta with Zari Sequins',
  },
];

export default function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#0d0a08]">
      {/* Render each image layer with smooth crossfade & slow morphing zoom */}
      {IMAGES.map((image, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={image.src}
            className="absolute inset-0 w-full h-full transition-opacity duration-[2500ms] ease-in-out will-change-transform"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            <div
              className={`relative w-full h-full transition-transform duration-[8000ms] ease-out ${
                isActive ? 'scale-105 translate-x-1' : 'scale-100 translate-x-0'
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                className="object-cover object-center brightness-[0.88] contrast-[1.05]"
                sizes="100vw"
              />
            </div>
          </div>
        );
      })}

      {/* Cinematic Vignette & Ambient Luxury Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50 z-[2]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.65)_100%)] z-[3]" />
      
      {/* Subtle warm golden ambient tint */}
      <div className="absolute inset-0 bg-[#3a1d10]/15 mix-blend-color z-[4]" />
    </div>
  );
}
