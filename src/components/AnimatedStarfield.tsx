"use client";

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

      // Generate stars - 1 per 8000 sq px approx
      const area = width * height;
      const numStars = Math.floor(area / 8000); 
      
      const newStars: Star[] = [];
      for (let i = 0; i < numStars; i++) {
        newStars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          neighbors: [],
        });
      }

      // Pre-compute neighbors (distance < 150px)
      for (let i = 0; i < newStars.length; i++) {
        const dSqMap: { star: Star; dSq: number }[] = [];
        for (let j = 0; j < newStars.length; j++) {
          if (i === j) continue;
          const dx = newStars[i].x - newStars[j].x;
          const dy = newStars[i].y - newStars[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < 150 * 150) {
            dSqMap.push({ star: newStars[j], dSq });
          }
        }
        // sort by nearest, take up to 4
        dSqMap.sort((a, b) => a.dSq - b.dSq);
        newStars[i].neighbors = dSqMap.slice(0, 4).map(item => item.star);
      }
      stars = newStars;

      // Init signals (nodes that trace the constellation)
      const numSignals = Math.max(3, Math.floor(width / 300));
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
        speed: 0.05 + Math.random() * 0.05, // 0.05 to 0.1 px per ms
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
    const drawRing = (star: Star, radius: number, opacity: number) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const updateAndDraw = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw all static stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (const star of stars) {
        ctx.beginPath();
        // tiny dots for distant stars
        ctx.arc(star.x, star.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw signals (the active pulses moving through the network)
      for (const sig of signals) {
        if (!sig.target) {
            spawnSignal(sig);
            continue;
        }

        const dx = sig.target.x - sig.current.x;
        const dy = sig.target.y - sig.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.8)';

        if (sig.phase === 'ring_in') {
          sig.progress += dt / 600; // 600ms duration
          if (sig.progress >= 1) {
            sig.phase = 'line_draw';
            sig.progress = 0;
          } else {
            drawRing(sig.current, easeOutCircle(sig.progress) * maxRadius, sig.progress);
          }
        } 
        else if (sig.phase === 'line_draw') {
          const duration = dist / sig.speed;
          sig.progress += dt / duration;
          if (sig.progress >= 1) {
            sig.phase = 'line_fade';
            sig.progress = 0;
          } else {
            drawRing(sig.current, maxRadius, 1);
            
            const currentX = sig.current.x + dx * sig.progress;
            const currentY = sig.current.y + dy * sig.progress;
            
            ctx.beginPath();
            ctx.moveTo(sig.current.x, sig.current.y);
            ctx.lineTo(currentX, currentY);
            ctx.strokeStyle = `rgba(52, 211, 153, 1)`;
            ctx.lineWidth = 1;
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
            drawRing(sig.current, maxRadius, fade);
            
            // Fading out line
            ctx.beginPath();
            ctx.moveTo(sig.current.x, sig.current.y);
            ctx.lineTo(sig.target.x, sig.target.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${fade})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Fading in new ring
            drawRing(sig.target, easeOutCircle(sig.progress) * maxRadius, sig.progress);
          }
        }
        
        ctx.shadowBlur = 0; // reset for next drawing operations
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    init();
    updateAndDraw(performance.now());
    
    // Handle resize with debounce
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
      className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen"
    />
  );
}
