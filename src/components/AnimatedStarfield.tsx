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

interface GrowthFront {
  from: Star;
  to: Star;
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
    let initialTimeoutId: NodeJS.Timeout;
    let stars: Star[] = [];
    
    // Persistent network state
    let awakeNodes = new Set<Star>();
    let activeLines = new Map<string, {a: Star; b: Star}>(); 
    let fronts: GrowthFront[] = [];
    
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

      // Recreate the exact 200x200 CSS grid from the original implementation
      const pattern = [
        { x: 20, y: 30, size: 1, alpha: 1 },
        { x: 40, y: 70, size: 1, alpha: 0.8 },
        { x: 50, y: 160, size: 1, alpha: 0.5 },
        { x: 90, y: 40, size: 1, alpha: 0.7 },
        { x: 130, y: 80, size: 1, alpha: 1 },
        { x: 160, y: 120, size: 1.5, alpha: 0.9 },
      ];

      const newStars: Star[] = [];
      for (let gridY = 0; gridY < height + 200; gridY += 200) {
        for (let gridX = 0; gridX < width + 200; gridX += 200) {
          pattern.forEach(p => {
            const sx = gridX + p.x;
            const sy = gridY + p.y;
            if (sx < width + 50 && sy < height + 50) {
                newStars.push({
                   id: `${sx}-${sy}`,
                   x: sx,
                   y: sy,
                   size: p.size,
                   alpha: p.alpha,
                   neighbors: []
                });
            }
          });
        }
      }

      // Pre-compute neighbors (distance < 110px works well for the 200x200 grid)
      const MAX_DIST_SQ = 110 * 110;
      for (let i = 0; i < newStars.length; i++) {
        const dSqMap: { star: Star; dSq: number }[] = [];
        for (let j = 0; j < newStars.length; j++) {
          if (i === j) continue;
          const dx = newStars[i].x - newStars[j].x;
          const dy = newStars[i].y - newStars[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < MAX_DIST_SQ) {
            dSqMap.push({ star: newStars[j], dSq });
          }
        }
        // Take up to 4 nearest neighbors to avoid overly dense webs
        dSqMap.sort((a, b) => a.dSq - b.dSq);
        newStars[i].neighbors = dSqMap.slice(0, 4).map(item => item.star);
      }
      stars = newStars;

      // Reset network state
      awakeNodes.clear();
      activeLines.clear();
      fronts = [];
      clearTimeout(initialTimeoutId);

      // Seed the initial network growth after a 2-second delay
      // so the underlying static star map is clearly visible first
      initialTimeoutId = setTimeout(() => {
        // Find a star near the left-center of the screen to start the sweep
        const targetX = width * 0.15;
        const targetY = height * 0.5;
        
        let bestStar: Star | null = null;
        let bestDist = Infinity;

        for (const s of stars) {
           const dx = s.x - targetX;
           const dy = s.y - targetY;
           const dist = dx * dx + dy * dy;
           if (dist < bestDist && s.neighbors.length > 0) {
              bestDist = dist;
              bestStar = s;
           }
        }

        const startNode = bestStar || stars[Math.floor(Math.random() * stars.length)];

        if (startNode) {
          awakeNodes.add(startNode);
          seedFronts(startNode);
        }
      }, 2000);
    };

    const getLineId = (a: Star, b: Star) => {
      return a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    };

    const seedFronts = (fromNode: Star) => {
      // Don't spawn too many concurrent fronts
      if (fronts.length > 8) return;

      const availableNeighbors = fromNode.neighbors.filter(n => {
        const lineId = getLineId(fromNode, n);
        return !activeLines.has(lineId);
      });

      if (availableNeighbors.length === 0) return;

      // Pick 1 to 2 random neighbors to grow towards
      const numToSpawn = Math.min(availableNeighbors.length, Math.random() > 0.5 ? 2 : 1);
      
      // Shuffle simply
      availableNeighbors.sort(() => 0.5 - Math.random());

      for (let i = 0; i < numToSpawn; i++) {
        fronts.push({
          from: fromNode,
          to: availableNeighbors[i],
          progress: 0,
          speed: 0.03 + Math.random() * 0.04, // 0.03 to 0.07 px per ms
        });
      }
    };

    // Pre-allocate pi * 2
    const PI2 = Math.PI * 2;

    const drawRing = (star: Star, opacity: number) => {
      ctx.beginPath();
      // Optimization: use integer bounding boxes conceptually, but arc is fine here as it's only called ~5-10 times max per frame
      ctx.arc(star.x, star.y, 6, 0, PI2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const updateAndDraw = (time: number) => {
      const dt = Math.min(time - lastTime, 50); // cap dt to prevent huge jumps
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw all static background stars exactly matching the CSS pattern
      // with a slight time-offset glimmer
      for (const star of stars) {
        // Calculate a gentle glimmer offset using the star's position to stagger the phase
        const phaseOffset = (star.x + star.y) * 0.01;
        const glimmer = Math.sin(time * 0.001 + phaseOffset) * 0.2 + 0.8; // creates a multiplier between 0.6 and 1.0
        
        ctx.fillStyle = `rgba(255, 255, 255, ${(star.alpha * 0.85) * glimmer})`; // Much brighter base alpha
        
        // OPTIMIZATION: Use fillRect instead of expensive path operations for tiny 1px-2px geometric dots
        const d = (star.size + 0.5) * 2;
        ctx.fillRect(star.x - d/2, star.y - d/2, d, d);
      }

      // 2. Draw permanent network lines (dimly glowing)
      ctx.beginPath();
      for (const line of activeLines.values()) {
        // NO MORE EXPENSIVE STRING SPLITS AND ARRAY FINDS HERE
        // It's a direct hash map traversal now, 10x faster
        ctx.moveTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
      }
      ctx.strokeStyle = `rgba(52, 211, 153, 0.4)`; // Brighter permanent lines
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Draw permanent awake nodes (rings)
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
      for (const node of awakeNodes) {
        drawRing(node, 0.6);
        // Highlight the star itself
        const d = (node.size + 0.5) * 2;
        ctx.fillStyle = `rgba(52, 211, 153, 1)`;
        ctx.fillRect(node.x - d/2, node.y - d/2, d, d);
      }
      ctx.shadowBlur = 0;

      // 4. Update and draw active growth fronts
      for (let i = fronts.length - 1; i >= 0; i--) {
        const front = fronts[i];
        const dx = front.to.x - front.from.x;
        const dy = front.to.y - front.from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const duration = dist / front.speed;
        front.progress += dt / duration;

        if (front.progress >= 1) {
          // Front is complete. 
          // Solidify the line and the node
          const lineId = getLineId(front.from, front.to);
          activeLines.set(lineId, { a: front.from, b: front.to });
          awakeNodes.add(front.to);
          
          // Remove this front
          fronts.splice(i, 1);

          // Spawn new fronts from the destination, occasionally spawn a lateral branch
          seedFronts(front.to);
          if (Math.random() > 0.8) {
             const randomAwakeNode = Array.from(awakeNodes)[Math.floor(Math.random() * awakeNodes.size)];
             seedFronts(randomAwakeNode);
          }
        } else {
          // Draw the growing line very bright
          const currentX = front.from.x + dx * front.progress;
          const currentY = front.from.y + dy * front.progress;
          
          ctx.beginPath();
          ctx.moveTo(front.from.x, front.from.y);
          ctx.lineTo(currentX, currentY);
          
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(52, 211, 153, 1)';
          ctx.strokeStyle = `rgba(52, 211, 153, 1)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
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
      clearTimeout(initialTimeoutId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-90' : 'opacity-0'}`}
    />
  );
}
