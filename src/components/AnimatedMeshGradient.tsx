"use client";

import { motion } from "framer-motion";

export default function AnimatedMeshGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-80 pointer-events-none">
      {/* Deep Purple/Cyan Base */}
      <div className="absolute inset-0 bg-[#0f0e15]" />

      {/* Deep Violet Wave (Top Right dominant) */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#7c3aed]/40 blur-[30px] mix-blend-screen"
        animate={{
          x: ["0%", "10%", "-5%", "0%"],
          y: ["0%", "5%", "-10%", "0%"],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Bright Cyan / Blue Highlight (Left / Bottom) */}
      <motion.div
        className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] rounded-full bg-[#0ea5e9]/30 blur-[30px] mix-blend-screen"
        animate={{
          x: ["0%", "-15%", "10%", "0%"],
          y: ["0%", "-10%", "15%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2 }}
      />

      {/* Warm Orange / Peach contrast (gives depth like the apple wallpaper) */}
      <motion.div
        className="absolute -bottom-[30%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-[#f97316]/20 blur-[30px] mix-blend-screen"
        animate={{
          x: ["0%", "-20%", "5%", "0%"],
          y: ["0%", "-15%", "10%", "0%"],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity, delay: 1 }}
      />
      
      {/* Floating Magenta / Pink Core */}
      <motion.div
        className="absolute top-[40%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-[#d946ef]/20 blur-[30px] mix-blend-screen"
        animate={{
          x: ["0%", "20%", "-10%", "0%"],
          y: ["0%", "-20%", "5%", "0%"],
          scale: [0.8, 1.1, 0.9, 0.8],
        }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, delay: 4 }}
      />
    </div>
  );
}
