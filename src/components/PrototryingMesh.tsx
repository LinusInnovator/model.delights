"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PrototryingMesh() {
  const { scrollYProgress } = useScroll();
  
  // As the user scrolls down (0 -> 1), move the stars slightly UP (0% -> -20%)
  // This creates the illusion that the stars are very far away.
  const starY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  // Foreground Left-to-Right wave (Less blurred)
  const fgPath1 = "M 0 1000 L 0 600 C 300 700 500 400 800 500 C 950 550 1000 800 1000 800 L 1000 1000 Z";
  const fgPath2 = "M 0 1000 L 0 700 C 200 800 400 600 700 700 C 900 750 1000 600 1000 600 L 1000 1000 Z";

  // Foreground Right-to-Left wave (Less blurred)
  const fgTopPath1 = "M 1000 0 L 1000 400 C 700 300 500 600 200 500 C 50 450 0 200 0 200 L 0 0 Z";
  const fgTopPath2 = "M 1000 0 L 1000 300 C 800 200 600 400 300 300 C 100 250 0 400 0 400 L 0 0 Z";

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-90 pointer-events-none">
      {/* GPU Tiled Starfield (100% css performance, no JS) */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
        style={{
          y: starY,
          backgroundImage: `
            radial-gradient(2px 2px at 10% 20%, rgba(255,255,255,0.8), rgba(0,0,0,0)), 
            radial-gradient(2.5px 2.5px at 30% 60%, rgba(255,255,255,0.7), rgba(0,0,0,0)), 
            radial-gradient(3px 3px at 60% 80%, rgba(255,255,255,0.9), rgba(0,0,0,0)), 
            radial-gradient(2px 2px at 80% 30%, rgba(255,255,255,0.6), rgba(0,0,0,0)), 
            radial-gradient(2.2px 2.2px at 40% 10%, rgba(255,255,255,0.8), rgba(0,0,0,0)),
            radial-gradient(3.5px 3.5px at 90% 90%, rgba(255,255,255,0.5), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 50% 50%, rgba(255,255,255,1), rgba(0,0,0,0))
          `,
          backgroundSize: '250px 250px',
          backgroundRepeat: 'repeat',
          // We must stretch the div taller than 100% so we don't see the bottom edge when it pulls up via parallax
          height: '150vh'
        }}
      />

      {/* Foreground Left Wave SVG (Sharper) */}
      <svg
        viewBox="0 0 1000 1000"
        className="absolute w-[150vw] h-[100vh] bottom-0 -left-[25vw] opacity-70 blur-[15px] z-10 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />  {/* Ocean Blue */}
            <stop offset="50%" stopColor="#06b6d4" /> {/* Bright Cyan */}
            <stop offset="100%" stopColor="#14b8a6" />{/* Caribbean Teal */}
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
        className="absolute w-[150vw] h-[100vh] -top-[10%] -right-[25vw] opacity-80 blur-[20px] z-10 pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="appleGrad4" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />   {/* Golden Amber */}
            <stop offset="50%" stopColor="#f97316" />  {/* Vibrant Orange */}
            <stop offset="100%" stopColor="#e11d48" /> {/* Sunset Rose */}
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
