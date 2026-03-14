"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
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
    <div ref={containerRef} className="w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[100dvh] w-full flex flex-col justify-end px-6 md:px-16 pb-24 md:pb-32 bg-black">
        <PrototryingMesh />
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
            Don&apos;t write a single line of code until you know the math works. Pitch your startup. We run the Pre-Mortem, validate the margin, and generate the exact fractional CTO blueprint to build it.
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
          <Link href="/validate" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">Pre-Mortem Diagnostics</h3>
            <p className="text-zinc-400 text-sm">Validating product-market friction.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-emerald-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5)] font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-wider translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               Run Diagnostics <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 flex items-center justify-center">
               <div className="w-full h-full border border-emerald-500/20 rounded-xl bg-gradient-to-br from-emerald-950/40 to-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-3 group-hover:-translate-y-2 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="text-emerald-400 font-[family-name:var(--font-jetbrains)] text-xs flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                    Simulating Go-To-Market...
                  </div>
                  <div className="w-2/3 h-1 bg-black/50 rounded-full overflow-hidden relative z-10 shadow-[inner_0_1px_2px_rgba(0,0,0,0.8)] border border-emerald-900/30">
                    <div className="h-full bg-emerald-400 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[1500ms] delay-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
               </div>
            </div>
          </Link>

          {/* Card 2: PRD Typewriter */}
          <Link href="/super-architect" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">Generative Architecture</h3>
            <p className="text-zinc-400 text-sm">Streaming Kano-model product specs.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-emerald-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5)] font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-wider translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               Open Architect <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 border border-zinc-800 rounded-xl bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-md p-4 font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500 flex flex-col gap-2 group-hover:-translate-y-2 group-hover:border-zinc-700 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 relative z-10">
                <span className="text-emerald-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" /> Live Feed</span>
                <span className="text-zinc-600 font-medium tracking-wider">PRD_STRUCT</span>
              </div>
              <div className="mt-1 flex flex-col gap-1.5 relative z-10">
                <p className="text-zinc-300">Targeting Vision Core...</p>
                <p className="text-zinc-500">Routing {'>'} Anthropic Claude 3.5</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-emerald-400/80">Generating</span>
                  <span className="w-2 h-3 bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Scheduler */}
          <Link href="/sdk" className="relative block overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group hover:border-emerald-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">B2B Routing SDK</h3>
            <p className="text-zinc-400 text-sm">Zero-maintenance live API arbitrage.</p>

            {/* Click-selling Rollover Badge */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-emerald-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.5)] font-[family-name:var(--font-inter)] text-[10px] font-bold uppercase tracking-wider translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               View SDK <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>

            <div className="absolute bottom-14 left-8 right-8 h-36 flex flex-col gap-2 group-hover:-translate-y-2 transition-transform duration-500">
               <div className="grid grid-cols-7 gap-1 h-3/5 p-2 bg-black/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm group-hover:border-zinc-700/50 transition-colors duration-500">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className={`rounded-[3px] border ${i === 9 ? 'bg-emerald-500/20 border-emerald-500/50 group-hover:bg-emerald-500/80 group-hover:border-emerald-400 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)]' : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-700 group-hover:bg-zinc-800/80'} transition-all duration-500 flex items-center justify-center relative overflow-hidden`}>
                       {i === 9 && <div className="absolute inset-0 bg-emerald-400/20 mix-blend-overlay animate-pulse" />}
                    </div>
                  ))}
               </div>
               <div className="w-full h-2/5 border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-xl flex items-center justify-center text-xs font-semibold text-zinc-400 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-emerald-950 group-hover:border-emerald-400 group-hover:shadow-[0_4px_15px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 transform active:scale-[0.98]">
                  Execute Route()
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
        <PrototryingMesh hideStars variant="philosophy" />
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

      {/* PROTOCOL SECION */}
      <section className="relative w-full bg-zinc-950 pb-40">
        {/* Card 1 */}
        <div ref={card1.ref} className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-10">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_01</p>
              <h2 className="text-5xl font-bold mb-6">Precoil Validation.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">We instantiate dual Red/Green LLM teams to ruthlessly autopsy your startup idea, finding the critical assumptions that will rip it apart before you waste hours compiling.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden group">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
               {/* Central Idea Node */}
               <div className="relative w-32 h-32 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                 <div className={`w-16 h-16 rounded-full bg-zinc-800 ${card1.inView ? 'animate-pulse' : ''} relative z-10`} />
                 
                 {/* Rare Green Team Hit Flash (Every ~12 seconds) */}
                 <div className={`absolute inset-0 rounded-full bg-emerald-500/80 blur-md min-h-full mix-blend-screen opacity-0 ${card1.inView ? 'group-hover:animate-[pulse_12s_ease-in-out_infinite_4s]' : ''} z-20 transition-opacity duration-1000`} />
                 <div className={`absolute inset-0 rounded-full bg-emerald-400 opacity-0 ${card1.inView ? 'group-hover:animate-[pulse_12s_ease-in-out_infinite_4s]' : ''} z-20 transition-opacity duration-1000`} />

                 {/* Laser Hit Trace (Synchronized with Scan Line) */}
                 <div className={`absolute inset-[-2px] rounded-full opacity-0 ${card1.inView ? 'group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite]' : ''} transition-opacity duration-300 pointer-events-none`}
                      style={{
                        background: 'conic-gradient(from 80deg, transparent 0deg, transparent 80deg, rgba(244,63,94,1) 180deg, transparent 180deg)',
                        maskImage: 'radial-gradient(transparent 60px, black 61px)',
                        WebkitMaskImage: 'radial-gradient(transparent 60px, black 61px)'
                      }}
                 />
               </div>
               
               {/* Red Team Scan Line */}
               <div className={`absolute top-1/2 left-0 w-full h-[2px] bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] opacity-0 ${card1.inView ? 'group-hover:opacity-100 animate-[spin_4s_linear_infinite]' : ''} transition-opacity duration-300 transform -translate-y-1/2 origin-left`} />
               
               {/* Green Team Validation Rings */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className={`w-40 h-40 rounded-full border border-emerald-500/0 hidden scale-50 ${card1.inView ? 'group-hover:block group-hover:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]' : ''}`} />
                 <div className={`absolute w-48 h-48 rounded-full border border-emerald-500/0 hidden scale-50 ${card1.inView ? 'group-hover:block group-hover:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]' : ''}`} />
               </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div ref={card2.ref} className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-20">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div className="hidden md:flex aspect-square rounded-[3rem] border border-zinc-800 bg-black items-center justify-center relative overflow-hidden group">
               <div className="w-full h-full relative p-12 flex flex-col justify-end gap-2">
                 {/* Blueprint Wireframes compiling into solid blocks */}
                 <div className="w-full h-12 border-2 border-dashed border-zinc-700 rounded group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-700 delay-100 flex items-center px-4">
                    <div className="w-1/3 h-2 bg-emerald-500/0 group-hover:bg-emerald-500/50 rounded transition-all duration-700 delay-300" />
                 </div>
                 <div className="flex gap-2 h-24">
                   <div className="w-1/3 h-full border-2 border-dashed border-zinc-700 rounded group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-700 delay-300 flex items-center justify-center">
                      <div className="w-1/2 h-4 bg-emerald-500/0 group-hover:bg-emerald-500/50 rounded transition-all duration-700 delay-500" />
                   </div>
                   <div className="w-2/3 h-full border-2 border-dashed border-zinc-700 rounded group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-700 delay-500 flex items-center justify-center">
                      <div className="w-1/2 h-4 bg-emerald-500/0 group-hover:bg-emerald-500/50 rounded transition-all duration-700 delay-700" />
                   </div>
                 </div>
                 <div className="w-full h-32 border-2 border-dashed border-zinc-700 rounded group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-700 delay-700 relative overflow-hidden flex items-center justify-center">
                    <div className="w-1/4 h-1/4 bg-emerald-500/0 group-hover:bg-emerald-500/50 rounded transition-all duration-700 delay-1000" />
                    {/* Scanning Laser */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#34D399] opacity-0 ${card2.inView ? 'group-hover:opacity-100 animate-[scan_2s_ease-in-out_infinite_alternate]' : ''} transition-opacity duration-300`} />
                 </div>
               </div>
            </div>
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_02</p>
              <h2 className="text-5xl font-bold mb-6">Architecture Synthesis.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">Bypassing the blank page. We stream a Kano-framework Product Requirement Document directly into a modular Next.js boilerplate, mapped precisely to your Live-ELO validated AI endpoints.</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div ref={card3.ref} className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-30">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_03</p>
              <h2 className="text-5xl font-bold mb-6">B2B Arbitrage Engine.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">The production deployment isn't the finish line. Our zero-maintenance B2B router SDK continuously swaps your application's cognitive cores to capture falling API prices automatically.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden group p-12">
               {/* 3 Model Nodes */}
               <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 group-hover:border-emerald-500 group-hover:text-emerald-400 transition-all duration-500 z-10">GPT-4</div>
               <div className="absolute bottom-24 left-16 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 group-hover:border-rose-500 group-hover:text-rose-400 transition-all duration-500 delay-150 z-10">Claude</div>
               <div className="absolute bottom-24 right-16 w-16 h-16 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-500 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-all duration-500 delay-300 z-10">Llama</div>
               
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
                   <circle r="3" fill="#34D399" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-500">
                     <animateMotion dur="1s" repeatCount="indefinite" path="M 100 100 L 100 50" />
                   </circle>
                   <circle r="3" fill="#F43F5E" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-700">
                     <animateMotion dur="1.5s" repeatCount="indefinite" path="M 100 100 L 50 140" />
                   </circle>
                   <circle r="3" fill="#6366F1" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-1000">
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
          <div className="mt-16 flex items-center gap-3 font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            INTELLIGENCE_ENGINE: OPERATIONAL
          </div>
        </div>
      </section>

    </div>
  );
}
