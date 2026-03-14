"use client";

import { motion } from "framer-motion";

export default function PrototryingMesh() {
  // State 1: Corresponds roughly to the cresting, bunched-up wave in Image 1
  // We maintain the identical path command structure: M (move), L (line), C (bezier), C (bezier), L (line), Z (close)
  const path1 = "M 0 0 L 1000 0 L 1000 800 C 700 800 600 400 300 500 C 100 550 0 300 0 300 Z";
  
  // State 2: Corresponds to the elongated, shallower wave in Image 2
  const path2 = "M 0 0 L 1000 0 L 1000 900 C 600 900 400 600 200 700 C 50 750 0 500 0 500 Z";

  // We'll also add an inverted blob on the bottom right for full depth
  const bottomPath1 = "M 1000 1000 L 0 1000 L 0 200 C 300 200 400 600 700 500 C 900 450 1000 700 1000 700 Z";
  const bottomPath2 = "M 1000 1000 L 0 1000 L 0 100 C 400 100 600 400 800 300 C 950 250 1000 500 1000 500 Z";

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-90 pointer-events-none">
      {/* Deep Base Background */}
      <div className="absolute inset-0 bg-[#0f0e15]" />

      {/* Top Left Organic Wave SVG */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute w-[180vw] md:w-[120vw] h-[120vh] -top-[10%] -left-[10%] opacity-50 mix-blend-screen blur-[40px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />   {/* Deep Violet */}
            <stop offset="50%" stopColor="#d946ef" />  {/* Magenta */}
            <stop offset="100%" stopColor="#0ea5e9" /> {/* Bright Cyan */}
          </linearGradient>
        </defs>
        <motion.path
          d={path1}
          fill="url(#appleGrad1)"
          animate={{ d: [path1, path2, path1] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
      </svg>

      {/* Bottom Right Counter-Wave SVG */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute w-[180vw] md:w-[120vw] h-[120vh] -bottom-[10%] -right-[10%] opacity-40 mix-blend-screen blur-[50px]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />   {/* Warm Orange */}
            <stop offset="50%" stopColor="#ec4899" />  {/* Pink */}
            <stop offset="100%" stopColor="#0ea5e9" /> {/* Cyan */}
          </linearGradient>
        </defs>
        <motion.path
          d={bottomPath1}
          fill="url(#appleGrad2)"
          animate={{ d: [bottomPath1, bottomPath2, bottomPath1] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
      </svg>
    </div>
  );
}
