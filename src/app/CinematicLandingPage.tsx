"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import AnimatedLogo from "@/components/AnimatedLogo";
import AnimatedTextLogo from "@/components/AnimatedTextLogo";
import AnimatedMeshGradient from '@/components/AnimatedMeshGradient';
import PrototryingMesh from '@/components/PrototryingMesh';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Custom hook to pause heavy CSS/SVG animations when off-screen
function useInView(options: IntersectionObserverInit = {}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

export default function CinematicLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1 = useInView();
  const card2 = useInView();
  const card3 = useInView();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.from(".hero-text", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });

      // Philosophy Animation
      gsap.from(".philo-line", {
        scrollTrigger: {
          trigger: ".philo-section",
          start: "top 70%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Protocol Stacking
      const cards = gsap.utils.toArray(".protocol-card") as HTMLElement[];
      cards.forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          pin: true,
          pinSpacing: false,
          end: "+=100%",
          animation: gsap.to(card, {
            scale: 0.9,
            opacity: 0.5,
            filter: "blur(10px)",
            ease: "none"
          }),
          scrub: true
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      
      {/* Fixed Branding Header (Persists across scroll) */}
      <header className="absolute top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex items-center gap-4 group">
          <AnimatedLogo className="w-11 h-11 shrink-0 opacity-90" />
          <AnimatedTextLogo className="h-9 w-auto shrink-0 opacity-90 mt-1" />
        </div>
        <div className="pointer-events-auto">
          <Link 
            href="/unicorn" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-950/30 border border-emerald-900/50 backdrop-blur-md hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-all duration-300 mr-4"
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-emerald-400/80 tracking-widest uppercase group-hover:text-emerald-300 transition-colors">The Unicorn Thesis</span>
          </Link>
          <Link 
            href="/manifesto" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md hover:bg-zinc-800 hover:border-emerald-500/30 transition-all duration-300"
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-zinc-400 tracking-widest uppercase group-hover:text-emerald-400 transition-colors">Manifesto</span>
            <span className="text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">&rarr;</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative h-[100dvh] w-full flex flex-col justify-end px-6 md:px-16 pb-24 md:pb-32 bg-black">
        <PrototryingMesh id="hero-mesh" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />

        <div className="relative z-20 max-w-4xl">
          <h1 className="flex flex-col gap-2">
            <span className="hero-text text-2xl md:text-3xl font-bold tracking-tight text-zinc-300">
              Architecture is
            </span>
            <span className="hero-text text-7xl md:text-9xl font-[family-name:var(--font-playfair)] italic tracking-tight text-white leading-none">
              Everything.
            </span>
          </h1>
          <p className="hero-text mt-8 text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Don&apos;t write a single line of code until you know you're building the right thing. Pitch your startup. We stress-test your assumptions, validate your target market, generate the technical blueprint to build it, and power its intelligence forever with our Intelligent Model Routing SDK.
          </p>
          <div className="hero-text mt-10">
            <Link href="/validate" className="group relative inline-flex items-center justify-center overflow-hidden rounded-[2rem] bg-emerald-500 px-8 py-4 text-emerald-950 font-semibold transition-transform hover:scale-[1.03] active:scale-95 z-30">
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative z-10 font-[family-name:var(--font-inter)] tracking-wide">Enter the Validator Gateway &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES / INTERACTIVE CARDS */}
      <section className="relative w-full py-32 px-6 md:px-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Diagnostic */}
          <Link href="/validate" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:bg-zinc-900/80 transition-all duration-500">
            {/* Sweeping Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/5 transition-colors duration-1000 pointer-events-none" />
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors relative z-10">Idea Stress-Testing</h3>
            <p className="text-zinc-400 text-sm relative z-10">Exposing critical market assumptions.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               Run Diagnostics <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 flex items-center justify-center pointer-events-none z-10">
               <div className="w-full h-full border border-emerald-500/20 rounded-xl bg-gradient-to-br from-emerald-950/40 to-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-3 group-hover:-translate-y-3 group-hover:scale-105 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.2),inset_0_0_20px_rgba(16,185,129,0.1)] transition-all duration-700 ease-out overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="text-emerald-400 font-[family-name:var(--font-jetbrains)] text-xs flex items-center gap-2 relative z-10 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_8px_rgba(52,211,153,1)]" />
                    Simulating Go-To-Market...
                  </div>
                  <div className="w-3/4 h-1.5 bg-black/60 rounded-full overflow-hidden relative z-10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.8)] border border-emerald-900/50">
                    {/* The Progress Bar fills faster and brighter on hover */}
                    <div className="h-full bg-emerald-400 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[2000ms] delay-100 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_0_15px_rgba(52,211,153,1)]" />
                  </div>
               </div>
            </div>
          </Link>

          {/* Card 2: PRD Typewriter */}
          <Link href="/super-architect" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:bg-zinc-900/80 transition-all duration-500">
            {/* Sweeping Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/5 transition-colors duration-1000 pointer-events-none" />

            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors relative z-10">Blueprint Generation</h3>
            <p className="text-zinc-400 text-sm relative z-10">Translating ideas to production boilerplates.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               Open Architect <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 border border-zinc-800 rounded-xl bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-md p-5 font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500 flex flex-col gap-2 group-hover:-translate-y-3 group-hover:scale-105 group-hover:border-emerald-500/40 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(16,185,129,0.05)] transition-all duration-700 ease-out overflow-hidden pointer-events-none z-10">
              {/* Animated Scanline overlay that triggers on hover */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent translate-x-[-100%] group-hover:animate-[scan_2.5s_ease-in-out_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 relative z-10 group-hover:border-zinc-700 transition-colors duration-500">
                <span className="text-emerald-400 flex items-center gap-2 group-hover:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] transition-all duration-500"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Live Feed</span>
                <span className="text-zinc-600 font-medium tracking-wider group-hover:text-zinc-400 transition-colors duration-500">PRD_STRUCT</span>
              </div>
              <div className="mt-2 flex flex-col gap-1.5 relative z-10">
                <p className="text-zinc-300 group-hover:translate-x-1 transition-transform duration-500 delay-100">Targeting Vision Core...</p>
                <p className="text-zinc-500 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all duration-500 delay-200">Routing {'>'} Anthropic Claude 3.5</p>
                <div className="flex items-center gap-2 mt-2 group-hover:translate-x-1 transition-transform duration-500 delay-300">
                  <span className="text-emerald-400/80 group-hover:text-emerald-400 font-bold transition-colors duration-500 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">Generating</span>
                  <span className="w-2.5 h-3.5 bg-emerald-400 animate-[pulse_0.4s_ease-in-out_infinite] shadow-[0_0_8px_rgba(52,211,153,1)]" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Scheduler */}
          <Link href="/sdk" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:bg-zinc-900/80 transition-all duration-500">
            {/* Sweeping Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/5 transition-colors duration-1000 pointer-events-none" />

            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors relative z-10">Cost Optimization SDK</h3>
            <p className="text-zinc-400 text-sm relative z-10">Dynamic model routing for maximum ROI.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               View SDK <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 flex flex-col gap-2 group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-700 ease-out pointer-events-none z-10">
               <div className="grid grid-cols-7 gap-1 h-3/5 p-2 bg-black/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm group-hover:border-emerald-500/30 group-hover:bg-zinc-950/80 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500">
                  {[...Array(14)].map((_, i) => {
                     // Determine stagger delay cleanly inside map based on index for a "wipe" effect
                     const staggerDelay = `${(i % 7) * 75}ms`;
                     return (
                      <div key={i} 
                           className={`rounded-[3px] border ${i === 9 ? 'bg-emerald-500/40 border-emerald-500/70 shadow-[0_0_15px_rgba(52,211,153,0.5)] group-hover:bg-emerald-400 group-hover:border-emerald-300 group-hover:shadow-[0_0_20px_rgba(52,211,153,1)]' : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-700 group-hover:bg-zinc-800/80'} transition-all duration-300 flex items-center justify-center relative overflow-hidden`}
                           style={{ transitionDelay: i !== 9 ? staggerDelay : '0ms' }}>
                         {i === 9 && <div className="absolute inset-0 bg-emerald-300/30 mix-blend-overlay animate-pulse" />}
                         {/* Optional tiny network ping on hover for empty nodes */}
                         {i !== 9 && <div className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/30 transition-colors duration-500" style={{ transitionDelay: staggerDelay }} />}
                      </div>
                     );
                  })}
               </div>
               
               {/* 3D Button Push Effect on Hover */}
               <div className="w-full h-2/5 border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-xl flex items-center justify-center text-xs font-semibold text-zinc-400 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-emerald-950 group-hover:border-emerald-400 group-hover:shadow-[0_5px_0_0_#065f46,0_10px_20px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] group-active:shadow-[0_0_0_0_#065f46,0_0_0_rgba(16,185,129,0.4)] group-active:translate-y-[5px] transition-all duration-300 transform">
                  <span className="group-hover:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Execute Route()</span>
               </div>
            </div>
          </Link>

        </div>
        
        {/* Prominent Link to Models Page */}
        <div className="mt-16 flex justify-center">
          <Link 
            href="/models" 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 font-[family-name:var(--font-inter)] text-sm font-semibold tracking-wide text-zinc-300 group-hover:text-white transition-colors">
              Explore Available Models
            </span>
            <span className="relative z-10 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="philo-section relative w-full py-40 px-6 md:px-16 bg-transparent">
        <PrototryingMesh hideStars variant="philosophy" id="philo-mesh" />
        <div className="absolute inset-0 bg-zinc-950/70 z-10 pointer-events-none" />
        <div className="relative z-20 max-w-5xl mx-auto flex flex-col gap-16">
          <h2 className="philo-line text-2xl md:text-4xl font-medium text-zinc-500 tracking-tight">
            Most platforms focus on: <span className="text-zinc-400">Comparing arbitrary benchmarking scores.</span>
          </h2>
          <h2 className="philo-line text-5xl md:text-8xl font-[family-name:var(--font-playfair)] italic text-white tracking-tight leading-tight">
            We focus on: <br/><span className="text-emerald-400 font-bold not-italic font-sans">Execution.</span>
          </h2>
        </div>
      </section>

      {/* GLOBAL NOISE TEXTURE (Frosted grain effect over backgrounds) */}
      <div className="pointer-events-none fixed inset-0 z-[1] w-full h-full opacity-[0.04] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* PROTOCOL SECION */}
      <section className="relative w-full bg-zinc-950 pb-40">
        {/* Card 1 */}
        <div ref={card1.ref} className="protocol-card overflow-hidden min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 rounded-t-[4rem] border-t border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative z-10 pt-20">
          {/* Subtle Ambient Coloration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_01</p>
              <h2 className="text-5xl font-bold mb-6">Automated Idea Stress-Testing.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">We deploy specialized AI agents to rigorously debate your startup idea, exposing the critical assumptions and fatal flaws before you spend a single dollar on development.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
               {/* Central Idea Node */}
               <div className="relative w-32 h-32 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 {/* Inner Idea Core (Target of the Green Flash) */}
                 <div className="relative w-16 h-16 z-20">
                   <div className={`absolute inset-0 rounded-full bg-zinc-800 ${card1.inView ? 'animate-pulse' : ''} z-10`} />
                   
                   {/* Rare Green Team Hit Flash (Every ~12 seconds) */}
                   <div className={`absolute inset-[-8px] rounded-full bg-emerald-500/80 blur-md opacity-0 ${card1.inView ? 'animate-[pulse_12s_ease-in-out_infinite_4s]' : ''} z-20 transition-opacity duration-1000`} />
                   <div className={`absolute inset-0 rounded-full bg-emerald-400 shadow-[0_0_20px_#34D399] opacity-0 ${card1.inView ? 'animate-[pulse_12s_ease-in-out_infinite_4s]' : ''} z-30 transition-opacity duration-1000`} />
                 </div>

                 {/* Laser Hit Trace (Synchronized with Scan Line) */}
                 <div className={`absolute inset-[-2px] rounded-full opacity-0 ${card1.inView ? 'opacity-100 animate-[spin_4s_linear_infinite]' : ''} transition-opacity duration-300 pointer-events-none`}
                      style={{
                        background: 'conic-gradient(from 80deg, transparent 0deg, transparent 80deg, rgba(244,63,94,1) 180deg, transparent 180deg)',
                        maskImage: 'radial-gradient(transparent 60px, black 61px)',
                        WebkitMaskImage: 'radial-gradient(transparent 60px, black 61px)'
                      }}
                 />
               </div>
               
               {/* Red Team Scan Line */}
               <div className={`absolute top-1/2 left-0 w-full h-[2px] bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] opacity-0 ${card1.inView ? 'opacity-100 animate-[spin_4s_linear_infinite]' : ''} transition-opacity duration-300 transform -translate-y-1/2 origin-left`} />
               
               {/* Green Team Validation Rings */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className={`w-40 h-40 rounded-full border border-emerald-500/0 scale-50 ${card1.inView ? 'block animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]' : 'hidden'}`} />
                 <div className={`absolute w-48 h-48 rounded-full border border-emerald-500/0 scale-50 ${card1.inView ? 'block animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]' : 'hidden'}`} />
               </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div ref={card2.ref} className="protocol-card overflow-hidden min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-[#050508] rounded-t-[4rem] border-t border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative z-20 pt-20">
          {/* Subtle Ambient Coloration */}
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3" />

          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="hidden md:flex aspect-square rounded-[3rem] border border-zinc-800 bg-black items-center justify-center relative overflow-hidden">
               <div className="w-full h-full relative p-12 flex flex-col justify-end gap-2">
                 {/* Blueprint Wireframes compiling into solid blocks */}
                 <style dangerouslySetInnerHTML={{__html: `
                   @keyframes bpOuter {
                     0%, 100% { background-color: transparent; border-color: rgba(63, 63, 70, 1); } /* border-zinc-700 */
                     40%, 60% { background-color: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.5); }
                   }
                   @keyframes bpInner {
                     0%, 100% { background-color: transparent; }
                     40%, 60% { background-color: rgba(16, 185, 129, 0.5); }
                   }
                   .animate-bp-outer-1 { animation: bpOuter 4s ease-in-out infinite 0s; }
                   .animate-bp-inner-1 { animation: bpInner 4s ease-in-out infinite 0.2s; }
                   .animate-bp-outer-2 { animation: bpOuter 4s ease-in-out infinite 0.4s; }
                   .animate-bp-inner-2 { animation: bpInner 4s ease-in-out infinite 0.6s; }
                   .animate-bp-outer-3 { animation: bpOuter 4s ease-in-out infinite 0.8s; }
                   .animate-bp-inner-3 { animation: bpInner 4s ease-in-out infinite 1.0s; }
                   .animate-bp-outer-4 { animation: bpOuter 4s ease-in-out infinite 1.2s; }
                   .animate-bp-inner-4 { animation: bpInner 4s ease-in-out infinite 1.4s; }
                 `}} />
                 <div className={`w-full h-12 border-2 border-dashed border-zinc-700 rounded flex items-center px-4 ${card2.inView ? 'animate-bp-outer-1' : ''}`}>
                    <div className={`w-1/3 h-2 rounded ${card2.inView ? 'animate-bp-inner-1' : ''}`} />
                 </div>
                 <div className="flex gap-2 h-24">
                   <div className={`w-1/3 h-full border-2 border-dashed border-zinc-700 rounded flex items-center justify-center ${card2.inView ? 'animate-bp-outer-2' : ''}`}>
                      <div className={`w-1/2 h-4 rounded ${card2.inView ? 'animate-bp-inner-2' : ''}`} />
                   </div>
                   <div className={`w-2/3 h-full border-2 border-dashed border-zinc-700 rounded flex items-center justify-center ${card2.inView ? 'animate-bp-outer-3' : ''}`}>
                      <div className={`w-1/2 h-4 rounded ${card2.inView ? 'animate-bp-inner-3' : ''}`} />
                   </div>
                 </div>
                 <div className={`w-full h-32 border-2 border-dashed border-zinc-700 rounded relative overflow-hidden flex items-center justify-center ${card2.inView ? 'animate-bp-outer-4' : ''}`}>
                    <div className={`w-1/4 h-1/4 rounded ${card2.inView ? 'animate-bp-inner-4' : ''}`} />
                    {/* Scanning Laser */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#34D399] opacity-0 ${card2.inView ? 'opacity-100 animate-[scan_2s_ease-in-out_infinite_alternate]' : ''} transition-opacity duration-300`} />
                 </div>
               </div>
            </div>
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_02</p>
              <h2 className="text-5xl font-bold mb-6">Requirements & Boilerplates.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">Skip the blank page. We convert your validated idea into prioritized product specifications and immediately generate a production-ready Next.js boilerplate customized for your application.</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div ref={card3.ref} className="protocol-card overflow-hidden min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-black rounded-t-[4rem] border-t border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] relative z-30 pt-20">
          {/* Subtle Ambient Coloration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_03</p>
              <h2 className="text-5xl font-bold mb-6">Zero-Proxy AI Routing SDK.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">Deployment isn't the finish line. Our zero-maintenance SDK operates strictly as a Control Plane. It continuously evaluates global LLM capabilities and autonomously executes the best mathematical routing natively on your server. Zero proxying. 100% data privacy.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden p-12">
               {/* 3 Model Nodes */}
               <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 transition-all duration-500 z-10 ${card3.inView ? 'border-emerald-500 text-emerald-400' : ''}`}>GPT-4</div>
               <div className={`absolute bottom-24 left-16 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 transition-all duration-500 delay-150 z-10 ${card3.inView ? 'border-rose-500 text-rose-400' : ''}`}>Claude</div>
               <div className={`absolute bottom-24 right-16 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 transition-all duration-500 delay-300 z-10 ${card3.inView ? 'border-indigo-500 text-indigo-400' : ''}`}>Llama</div>
               
               {/* Center Router Node */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center z-20">
                 <div className={`w-2 h-2 rounded-full bg-emerald-400 ${card3.inView ? 'animate-pulse' : ''}`} />
               </div>

               {/* Routing Data Packets (SVG Paths) */}
               {card3.inView && (
                 <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none">
                   <path id="path1" d="M 100 100 L 100 50" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                   <path id="path2" d="M 100 100 L 50 140" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                   <path id="path3" d="M 100 100 L 150 140" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                   
                   {/* Moving Particles */}
                   <circle r="3" fill="#34D399" className={`opacity-0 transition-opacity duration-300 delay-500 ${card3.inView ? 'opacity-100' : ''}`}>
                     <animateMotion dur="1s" repeatCount="indefinite" path="M 100 100 L 100 50" />
                   </circle>
                   <circle r="3" fill="#F43F5E" className={`opacity-0 transition-opacity duration-300 delay-700 ${card3.inView ? 'opacity-100' : ''}`}>
                     <animateMotion dur="1.5s" repeatCount="indefinite" path="M 100 100 L 50 140" />
                   </circle>
                   <circle r="3" fill="#6366F1" className={`opacity-0 transition-opacity duration-300 delay-1000 ${card3.inView ? 'opacity-100' : ''}`}>
                     <animateMotion dur="2s" repeatCount="indefinite" path="M 100 100 L 150 140" />
                   </circle>
                 </svg>
               )}
            </div>
          </div>
        </div>

      </section>

      {/* FOOTER / CTA */}
      <section className="relative w-full py-40 px-6 md:px-16 bg-[#050508] rounded-t-[4rem] border-t border-zinc-900 z-40">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">Stop comparing. <br />Start compiling.</h2>
          <Link href="/validate" className="group relative inline-flex items-center justify-center overflow-hidden rounded-[2rem] bg-emerald-500 px-12 py-6 text-emerald-950 text-xl font-bold transition-transform hover:scale-[1.03] active:scale-95">
             <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
             <span className="relative z-10 font-[family-name:var(--font-inter)]">Test Your Idea Now &rarr;</span>
          </Link>
          <div className="mt-8 flex items-center gap-8">
            <Link href="/manifesto" className="font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500 hover:text-emerald-400 underline decoration-zinc-800 underline-offset-4 hover:decoration-emerald-500/30 transition-all uppercase tracking-widest">
              Read The Manifesto
            </Link>
            <span className="text-zinc-800">|</span>
            <Link href="/unicorn" className="font-[family-name:var(--font-jetbrains)] text-xs text-emerald-500/70 hover:text-emerald-400 underline decoration-emerald-900 underline-offset-4 hover:decoration-emerald-500/50 transition-all uppercase tracking-widest">
              The Unicorn Thesis
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-3 font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            INTELLIGENCE_ENGINE: OPERATIONAL
          </div>
        </div>
      </section>

    </div>
  );
}
