"use client";

import { motion } from "framer-motion";

export default function AnimatedMeshGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-80 pointer-events-none">
      {/* Base Deep Background */}
      <div className="absolute inset-0 bg-[#050508]" />

      {/* Deep Emerald Wave */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[#064E3B]/40 blur-[120px] mix-blend-screen"
        animate={{
          x: ["0%", "10%", "-5%", "0%"],
          y: ["0%", "5%", "-10%", "0%"],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Bright Emerald Highlight */}
      <motion.div
        className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-[#10B981]/20 blur-[100px] mix-blend-screen"
        animate={{
          x: ["0%", "-15%", "10%", "0%"],
          y: ["0%", "-10%", "15%", "0%"],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 2 }}
      />

      {/* Subtle Dark Slate / Indigo contrast (gives depth like the apple wallpaper) */}
      <motion.div
        className="absolute -bottom-[30%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-[#312E81]/20 blur-[140px] mix-blend-screen"
        animate={{
          x: ["0%", "-20%", "5%", "0%"],
          y: ["0%", "-15%", "10%", "0%"],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity, delay: 1 }}
      />
      
      {/* Floating Center Core */}
      <motion.div
        className="absolute top-[40%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#047857]/30 blur-[110px] mix-blend-screen"
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
