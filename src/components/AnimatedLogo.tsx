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
        @keyframes drawLine {
          0% { stroke-dashoffset: 100; opacity: 0; }
          10% { opacity: 1; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          90% { opacity: 1; }
          100% { stroke-dashoffset: -100; opacity: 0; }
        }
        .anim-line-1 {
          stroke-dasharray: 40 100;
          animation: drawLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .anim-line-2 {
          stroke-dasharray: 40 100;
          animation: drawLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
        }
        .anim-line-3 {
          stroke-dasharray: 40 100;
          animation: drawLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
        }
      `}} />
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 72 83" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-zinc-400 group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]"
      >
        {/* Core Geometry (Hexagons) */}
        <path d="M1 61.5139L35.9324 81.6821L70.8649 61.5139V21.3229L35.9324 1.15466L1 21.3229V61.5139Z" stroke="currentColor" strokeWidth="2" className="opacity-80"/>
        <path d="M10.6777 55.9465L35.9323 70.5273L61.1869 55.9465V26.8903L35.9323 12.3096L10.6777 26.8903V55.9465Z" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
        <path d="M23.2722 19.7666H48.5921L61.0928 41.4184L48.5921 63.0702H23.2722L10.7715 41.4184L23.2722 19.7666Z" stroke="currentColor" strokeWidth="2" className="opacity-40"/>
        
        {/* Center Node */}
        <ellipse cx="35.4458" cy="40.6349" rx="4.40088" ry="4.21413" fill="currentColor" className="opacity-100 group-hover:animate-pulse"/>

        {/* Animated Inner Intersecting Lines */}
        <line className="anim-line-1" x1="0.746925" y1="61.4883" x2="70.6122" y2="20.4859" stroke="currentColor" strokeWidth="1"/>
        <line className="anim-line-2" y1="-0.5" x2="81.0083" y2="-0.5" transform="matrix(-0.862445 -0.506151 -0.506151 0.862445 70.3779 62.1256)" stroke="currentColor" strokeWidth="1"/>
        <line className="anim-line-3" x1="35.4326" y1="80.8987" x2="35.4326" y2="0.371216" stroke="currentColor" strokeWidth="1"/>
      </svg>
    </div>
  );
}
