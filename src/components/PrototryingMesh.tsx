"use client";

import React, { useId, useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedStarfield from "./AnimatedStarfield";

interface PrototryingMeshProps {
  hideStars?: boolean;
  variant?: 'default' | 'philosophy';
}

export default function PrototryingMesh({ hideStars = false, variant = 'default' }: PrototryingMeshProps) {
  const { scrollYProgress } = useScroll();
  const gradId = useId();
  
  // As the user scrolls down (0 -> 1), move the stars UP, but slower than the document (parallax)
  const starY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Fade the stars out as they scroll away from the hero section
  const starOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  // Foreground Left-to-Right wave (Less blurred)
  const fgPath1 = "M 0 1000 L 0 600 C 300 700 500 400 800 500 C 950 550 1000 800 1000 800 L 1000 1000 Z";
  const fgPath2 = "M 0 1000 L 0 700 C 200 800 400 600 700 700 C 900 750 1000 600 1000 600 L 1000 1000 Z";

  // Foreground Right-to-Left wave (Less blurred)
  const fgTopPath1 = "M 1000 0 L 1000 400 C 700 300 500 600 200 500 C 50 450 0 200 0 200 L 0 0 Z";
  const fgTopPath2 = "M 1000 0 L 1000 300 C 800 200 600 400 300 300 C 100 250 0 400 0 400 L 0 0 Z";

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-90 pointer-events-none">
      {/* Deep Base Static Background Gradient */}
      <div className="absolute inset-0 bg-[#0f0e15]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/30 via-[#d946ef]/15 to-[#ea580c]/30 mix-blend-screen pointer-events-none" />

      {/* High-Performance Canvas Starfield Constellation */}
      {!hideStars && <AnimatedStarfield />}

      {/* Foreground Left Wave SVG */}
      <svg
        viewBox="0 0 1000 1000"
        className={`absolute w-[150vw] h-[100vh] bottom-0 -left-[25vw] z-10 pointer-events-none transition-all duration-1000 ${
          variant === 'philosophy' ? 'opacity-100 blur-[2px]' : 'opacity-70 blur-[15px]'
        }`}
        preserveAspectRatio="none"
      >
        <defs>
          {variant === 'default' ? (
            <linearGradient id={`${gradId}-bottom-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />  {/* Ocean Blue */}
              <stop offset="50%" stopColor="#06b6d4" /> {/* Bright Cyan */}
              <stop offset="100%" stopColor="#14b8a6" />{/* Caribbean Teal */}
            </linearGradient>
          ) : (
            <linearGradient id={`${gradId}-bottom-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />   {/* Deep Slate/Navy */}
              <stop offset="50%" stopColor="#0f3f4a" />  {/* Dark Ocean Muted Teal */}
              <stop offset="100%" stopColor="#256d7b" /> {/* Muted Seafoam Top */}
            </linearGradient>
          )}
        </defs>
        <path
          d={fgPath1}
          fill={`url(#${gradId}-bottom-grad)`}
        />
      </svg>

      {/* Foreground Right Wave SVG */}
      <svg
        viewBox="0 0 1000 1000"
        className={`absolute w-[150vw] h-[100vh] -top-[10%] -right-[25vw] z-10 pointer-events-none transition-all duration-1000 ${
          variant === 'philosophy' ? 'opacity-100 blur-[60px]' : 'opacity-80 blur-[20px]'
        }`}
        preserveAspectRatio="none"
      >
        <defs>
          {variant === 'default' ? (
            <linearGradient id={`${gradId}-grad`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />   {/* Golden Amber */}
              <stop offset="50%" stopColor="#f97316" />  {/* Vibrant Orange */}
              <stop offset="100%" stopColor="#e11d48" /> {/* Sunset Rose */}
            </linearGradient>
          ) : (
            <linearGradient id={`${gradId}-grad`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />   {/* Violet */}
              <stop offset="50%" stopColor="#d946ef" />  {/* Fuchsia */}
              <stop offset="100%" stopColor="#f43f5e" /> {/* Rose */}
            </linearGradient>
          )}
        </defs>
        <path
          d={fgTopPath1}
          fill={`url(#${gradId}-grad)`}
        />
      </svg>
    </div>
  );
}
