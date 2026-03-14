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
    let awakeNodes = new Map<Star, number>(); // Star -> spawn time
    let activeLines = new Map<string, {a: Star; b: Star; spawnedAt: number}>(); 
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

      const newStars: Star[] = [];
      
      // Calculate amount of stars based on screen area (roughly 1 star per 6000 pixels)
      // This gives about 300-400 stars on a standard 1080p monitor
      const density = 7000; 
      const numStars = Math.floor((width * height) / density);

      for (let i = 0; i < numStars; i++) {
         newStars.push({
           id: `star-${i}`,
           x: Math.random() * width,
           y: Math.random() * height,
           size: Math.random() < 0.1 ? 1.5 : 1, // 10% are slightly larger
           alpha: 0.4 + Math.random() * 0.6, // random opacity between 0.4 and 1.0
           neighbors: []
         });
      }

      // Pre-compute neighbors (distance < 300px works well for random scatter)
      const MAX_DIST_SQ = 300 * 300;
      for (let i = 0; i < newStars.length; i++) {
        const dSqMap: { star: Star; dSq: number }[] = [];
        for (let j = 0; j < newStars.length; j++) {
          if (i === j) continue;
          const dx = newStars[i].x - newStars[j].x;
          const dy = newStars[i].y - newStars[j].y;
          const dSq = dx * dx + dy * dy;
          // Only connect if distance is between 30px and 300px to avoid dense overlapping clusters
          if (dSq > 900 && dSq < MAX_DIST_SQ) {
            dSqMap.push({ star: newStars[j], dSq });
          }
        }
        // Take up to 4 nearest neighbors to avoid overly dense webs while ensuring connectivity
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
        // Find a star near the bottom-left of the screen to start the sweep
        const targetX = width * 0.1;
        const targetY = height * 0.9;
        
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
          awakeNodes.set(startNode, performance.now());
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

      if (availableNeighbors.length === 0) {
        // If we hit a dead end, randomly jump-start a new branch from anywhere alive to prevent the network from totally stalling
        if (fronts.length < 2 && awakeNodes.size > 0) {
          const aliveStars = Array.from(awakeNodes.keys());
          const randomAwakeNode = aliveStars[Math.floor(Math.random() * aliveStars.length)];
          if (randomAwakeNode) seedFronts(randomAwakeNode);
        }
        return;
      }

      // Sort neighbors by Y coordinate to aggressively prioritize growing UPWARDS towards the top of the screen
      availableNeighbors.sort((a, b) => a.y - b.y);

      // Pick 1 to 2 neighbors to grow towards (preferentially the highest ones)
      const numToSpawn = Math.min(availableNeighbors.length, Math.random() > 0.4 ? 2 : 1);

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
      ctx.arc(star.x, star.y, 7, 0, PI2);
      ctx.strokeStyle = `rgba(52, 211, 153, ${opacity})`;
      ctx.lineWidth = 2; // Made ring slightly thicker and larger for visibility
      ctx.stroke();
    };

    const updateAndDraw = (time: number) => {
      const dt = Math.min(time - lastTime, 50); // cap dt to prevent huge jumps
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw all static background stars exactly matching the CSS pattern
      for (const star of stars) {
        // Calculate a gentle glimmer offset using the star's position to stagger the phase
        const phaseOffset = (star.x + star.y) * 0.01;
        // Power of 8 creates a sharp, occasional peak. 
        // Base visibility is a solid 0.7, peaking up to 1.5 during a blink.
        const blink = Math.pow(Math.sin(time * 0.0012 + phaseOffset), 8);
        const glimmer = 0.7 + (blink * 0.8); 
        
        ctx.fillStyle = `rgba(255, 255, 255, ${(star.alpha * 0.85) * glimmer})`;
        
        // OPTIMIZATION: Use fillRect instead of expensive path operations for tiny 1px-2px geometric dots
        const d = (star.size + 0.5) * 2;
        ctx.fillRect(star.x - d/2, star.y - d/2, d, d);
      }

      // 2. Draw active fading network lines
      ctx.beginPath();
      for (const [lineId, line] of activeLines.entries()) {
        const age = time - line.spawnedAt;
        if (age > 10000) {
          activeLines.delete(lineId); // Line is fully faded and dead
          continue;
        }

        // Keep 100% visible for 3s, then fade out linearly over 7s
        const fade = age < 3000 ? 1 : 1 - ((age - 3000) / 7000);
        
        ctx.moveTo(line.a.x, line.a.y);
        ctx.lineTo(line.b.x, line.b.y);
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.7 * fade})`; 
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath(); // Must begin new path after stroke since strokeStyle changes per line
      }

      // 3. Draw active fading nodes (rings)
      for (const [node, spawnedAt] of awakeNodes.entries()) {
        const age = time - spawnedAt;
        if (age > 10000) {
          awakeNodes.delete(node); // Node is fully faded and asleep
          continue;
        }

        // Keep 100% visible for 3s, then fade out linearly over 7s
        const fade = age < 3000 ? 1 : 1 - ((age - 3000) / 7000);

        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(52, 211, 153, ${0.9 * fade})`;
        drawRing(node, 0.9 * fade); 
        
        // Highlight the star itself
        const d = (node.size + 1.0) * 2;
        ctx.fillStyle = `rgba(52, 211, 153, ${fade})`;
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
          // Solidify the line and the node with a timestamp
          const lineId = getLineId(front.from, front.to);
          activeLines.set(lineId, { a: front.from, b: front.to, spawnedAt: time });
          awakeNodes.set(front.to, time);
          
          // Remove this front
          fronts.splice(i, 1);

          // Spawn new fronts from the destination, occasionally spawn a lateral branch
          seedFronts(front.to);
          if (Math.random() > 0.8 && awakeNodes.size > 0) {
             const aliveStars = Array.from(awakeNodes.keys());
             const randomAwakeNode = aliveStars[Math.floor(Math.random() * aliveStars.length)];
             if (randomAwakeNode) seedFronts(randomAwakeNode);
          }
        } else {
          // Draw the growing line very bright
          const currentX = front.from.x + dx * front.progress;
          const currentY = front.from.y + dy * front.progress;
          
          ctx.beginPath();
          ctx.moveTo(front.from.x, front.from.y);
          ctx.lineTo(currentX, currentY);
          
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(52, 211, 153, 1)';
          ctx.strokeStyle = `rgba(52, 211, 153, 1)`;
          ctx.lineWidth = 2.5; // Thicker actively growing line
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
