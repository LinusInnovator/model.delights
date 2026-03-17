"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  alpha: number;
  neighbors: Star[];
}

interface Signal {
  current: Star;
  target: Star | null;
  previous: Star | null;
  phase: 'ring_in' | 'line_draw' | 'line_fade';
  progress: number;
  speed: number; // pixels per ms
}

export default function AnimatedStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let signals: Signal[] = [];
    let lastTime = performance.now();
    let width = 0;
    let height = 0;

    const init = () => {
      // Handle DPI scaling
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const newStars: Star[] = [];
      const density = 7000; 
      const numStars = Math.floor((width * height) / density);

      for (let i = 0; i < numStars; i++) {
         newStars.push({
           id: `star-${i}`,
           x: Math.random() * width,
           y: Math.random() * height,
           size: Math.random() < 0.1 ? 1.5 : 1, // 10% are slightly larger
           alpha: 0.4 + Math.random() * 0.6,
           neighbors: []
         });
      }

      // Pre-compute neighbors (distance < 150px)
      const MAX_DIST_SQ = 150 * 150;
      for (let i = 0; i < newStars.length; i++) {
        const dSqMap: { star: Star; dSq: number }[] = [];
        for (let j = 0; j < newStars.length; j++) {
          if (i === j) continue;
          const dx = newStars[i].x - newStars[j].x;
          const dy = newStars[i].y - newStars[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq > 400 && dSq < MAX_DIST_SQ) {
            dSqMap.push({ star: newStars[j], dSq });
          }
        }
        // sort by nearest, take up to 4
        dSqMap.sort((a, b) => a.dSq - b.dSq);
        newStars[i].neighbors = dSqMap.slice(0, 4).map(item => item.star);
      }
      stars = newStars;

      // Init signals (nodes that trace the constellation)
      // Boosted signal count slightly for more activity
      const numSignals = Math.max(5, Math.floor(width / 200));
      signals = [];
      for (let i = 0; i < numSignals; i++) {
        spawnSignal();
      }
    };

    const spawnSignal = (signal?: Signal) => {
      const availableStars = stars.filter(s => s.neighbors.length > 0);
      if (availableStars.length === 0) return; // Edge case
      const startNode = availableStars[Math.floor(Math.random() * availableStars.length)];
      const targetNode = startNode.neighbors[Math.floor(Math.random() * startNode.neighbors.length)];
      
      const newSignal: Signal = {
        current: startNode,
        target: targetNode,
        previous: null,
        phase: 'ring_in',
        progress: 0,
        speed: 0.05 + Math.random() * 0.06, // 0.05 to 0.11 px per ms
      };

      if (signal) {
        Object.assign(signal, newSignal);
      } else {
        signals.push(newSignal);
      }
    };

    const easeOutCircle = (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2));
    const maxRadius = 10;
    
    // Emerald 400 RGB: 52, 211, 153
    const drawRing = (x: number, y: number, radius: number, opacity: number) => {
      ctx.beginPath();
      // Optimization: use integer bounding boxes conceptually, but arc is fine here as it's only called ~10-20 times max per frame
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const updateAndDraw = (time: number) => {
      const dt = Math.min(time - lastTime, 50); // cap dt to prevent huge jumps
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw all static background stars exactly matching the CSS pattern
      const scrollY = window.scrollY;
      const parallaxOffset = scrollY * -0.3; // -30% parallax speed to invert direction

      for (const star of stars) {
        // Calculate a gentle glimmer offset using the star's position to stagger the phase
        const phaseOffset = (star.x + star.y) * 0.01;
        const blink = Math.pow(Math.sin(time * 0.0012 + phaseOffset), 8);
        const glimmer = 0.7 + (blink * 0.8); 
        
        ctx.fillStyle = `rgba(255, 255, 255, ${(star.alpha * 0.85) * glimmer})`;
        
        // OPTIMIZATION: Use fillRect instead of expensive path operations for tiny 1px-2px geometric dots
        let drawY = star.y - parallaxOffset;
        drawY = ((drawY % height) + height) % height; 
        
        const d = (star.size + 0.5) * 2;
        ctx.fillRect(star.x - d/2, drawY - d/2, d, d);
      }

      // 2. Update and draw signals (the active pulses moving through the network)
      for (const sig of signals) {
        if (!sig.target) {
            spawnSignal(sig);
            continue;
        }

        const dx = sig.target.x - sig.current.x;
        const dy = sig.target.y - sig.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.8)';

        const currentYPara = sig.current.y - parallaxOffset;
        const targetYPara = sig.target.y - parallaxOffset;

        if (sig.phase === 'ring_in') {
          sig.progress += dt / 600; // 600ms duration
          if (sig.progress >= 1) {
            sig.phase = 'line_draw';
            sig.progress = 0;
          } else {
            drawRing(sig.current.x, currentYPara, easeOutCircle(sig.progress) * maxRadius, sig.progress);
          }
        } 
        else if (sig.phase === 'line_draw') {
          const duration = dist / sig.speed;
          sig.progress += dt / duration;
          if (sig.progress >= 1) {
            sig.phase = 'line_fade';
            sig.progress = 0;
          } else {
            drawRing(sig.current.x, currentYPara, maxRadius, 1);
            
            const currentX = sig.current.x + dx * sig.progress;
            const currentY = currentYPara + dy * sig.progress; // Use straight interpolation for lines
            
            ctx.beginPath();
            ctx.moveTo(sig.current.x, currentYPara);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = `rgba(52, 211, 153, 1)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        else if (sig.phase === 'line_fade') {
          sig.progress += dt / 600; // 600ms fade duration
          if (sig.progress >= 1) {
            sig.previous = sig.current;
            sig.current = sig.target;
            
            // Pick new target (preferred not to bounce straight back immediately)
            const nextNeighbors = sig.current.neighbors;
            if (nextNeighbors.length > 0) {
              const withoutPrev = nextNeighbors.filter(n => n !== sig.previous);
              const choices = withoutPrev.length > 0 ? withoutPrev : nextNeighbors;
              
              sig.target = choices[Math.floor(Math.random() * choices.length)];
              sig.phase = 'line_draw';
              sig.progress = 0;
            } else {
              // Dead end -> respawn
              spawnSignal(sig);
            }
          } else {
            const fade = Math.max(0, 1 - sig.progress);
            
            // Fading out old ring
            drawRing(sig.current.x, currentYPara, maxRadius, fade);
            
            // Fading out line
            ctx.beginPath();
            ctx.moveTo(sig.current.x, currentYPara);
            ctx.lineTo(sig.target.x, targetYPara);
            ctx.strokeStyle = `rgba(52, 211, 153, ${fade})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Fading in new ring
            drawRing(sig.target.x, targetYPara, easeOutCircle(sig.progress) * maxRadius, sig.progress);
          }
        }
        
        ctx.shadowBlur = 0; // reset for next drawing operations
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    init();
    updateAndDraw(performance.now());
    
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        init();
      }, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-90' : 'opacity-0'}`}
    />
  );
}
