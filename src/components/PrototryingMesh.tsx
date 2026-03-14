"use client";

import { motion } from "framer-motion";

export default function PrototryingMesh() {

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
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 via-transparent to-[#f97316]/10" />

      {/* Foreground Left Wave SVG (Sharper) */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute w-[150vw] h-[100vh] bottom-0 -left-[25vw] opacity-70 mix-blend-screen blur-[15px] z-10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />  {/* Cyan */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
            <stop offset="100%" stopColor="#8b5cf6" />{/* Violet */}
          </linearGradient>
        </defs>
        <motion.path
          d={fgPath1}
          fill="url(#appleGrad3)"
          animate={{ d: [fgPath1, fgPath2, fgPath1] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
      </svg>

      {/* Foreground Right Wave SVG (Sharper) */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute w-[150vw] h-[100vh] -top-[10%] -right-[25vw] opacity-60 mix-blend-screen blur-[20px] z-10"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad4" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d946ef" />   {/* Magenta */}
            <stop offset="50%" stopColor="#f43f5e" />  {/* Rose */}
            <stop offset="100%" stopColor="#f97316" /> {/* Orange */}
          </linearGradient>
        </defs>
        <motion.path
          d={fgTopPath1}
          fill="url(#appleGrad4)"
          animate={{ d: [fgTopPath1, fgTopPath2, fgTopPath1] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, delay: 3 }}
        />
      </svg>
    </div>
  );
}
