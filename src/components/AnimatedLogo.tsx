"use client";

import React from "react";

interface AnimatedLogoProps {
  className?: string;
}

export default function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Inline style for the custom keyframe animations on the intersecting lines */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes clockSweep {
          0% { stroke-dashoffset: 100; opacity: 0; }
          2% { opacity: 1; }
          15% { stroke-dashoffset: 0; opacity: 1; }
          30% { stroke-dashoffset: -100; opacity: 0; }
          100% { stroke-dashoffset: -100; opacity: 0; }
        }
        [class^="anim-spoke-"] {
          stroke-dasharray: 100 100;
        }
        .anim-spoke-1 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0s; }
        .anim-spoke-2 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.0s; }
        .anim-spoke-3 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 2.0s; }
        .anim-spoke-4 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 3.0s; }
        .anim-spoke-5 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 4.0s; }
        .anim-spoke-6 { animation: clockSweep 6s cubic-bezier(0.4, 0, 0.2, 1) infinite 5.0s; }
      `}} />
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 72 83" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-white group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]"
      >
        {/* Core Geometry (Hexagons) */}
        <path d="M1 61.5139L35.9324 81.6821L70.8649 61.5139V21.3229L35.9324 1.15466L1 21.3229V61.5139Z" stroke="currentColor" strokeWidth="3" />
        <path d="M10.6777 55.9465L35.9323 70.5273L61.1869 55.9465V26.8903L35.9323 12.3096L10.6777 26.8903V55.9465Z" stroke="currentColor" strokeWidth="3" />
        <path d="M23.2722 19.7666H48.5921L61.0928 41.4184L48.5921 63.0702H23.2722L10.7715 41.4184L23.2722 19.7666Z" stroke="currentColor" strokeWidth="3" />
        
        {/* Center Node */}
        <ellipse cx="35.4458" cy="40.6349" rx="5.5" ry="5.5" fill="currentColor" className="opacity-100 group-hover:animate-pulse"/>

        {/* Animated Inner Intersecting Lines (Clockwise Sweep) */}
        {/* Top (12 o'clock) */}
        <line className="anim-spoke-1" x1="35.4458" y1="40.6349" x2="35.4326" y2="0.371216" stroke="currentColor" strokeWidth="2" pathLength="100" />
        {/* Top-Right (2 o'clock) */}
        <line className="anim-spoke-2" x1="35.4458" y1="40.6349" x2="70.6122" y2="20.4859" stroke="currentColor" strokeWidth="2" pathLength="100" />
        {/* Bottom-Right (4 o'clock) */}
        <line className="anim-spoke-3" x1="35.4458" y1="40.6349" x2="70.63" y2="61.69" stroke="currentColor" strokeWidth="2" pathLength="100" />
        {/* Bottom (6 o'clock) */}
        <line className="anim-spoke-4" x1="35.4458" y1="40.6349" x2="35.4326" y2="80.8987" stroke="currentColor" strokeWidth="2" pathLength="100" />
        {/* Bottom-Left (8 o'clock) */}
        <line className="anim-spoke-5" x1="35.4458" y1="40.6349" x2="0.746925" y2="61.4883" stroke="currentColor" strokeWidth="2" pathLength="100" />
        {/* Top-Left (10 o'clock) */}
        <line className="anim-spoke-6" x1="35.4458" y1="40.6349" x2="0.76" y2="20.69" stroke="currentColor" strokeWidth="2" pathLength="100" />
      </svg>
    </div>
  );
}
