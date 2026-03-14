"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import AnimatedMeshGradient from '@/components/AnimatedMeshGradient';
import PrototryingMesh from '@/components/PrototryingMesh';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CinematicLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

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
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group">
            <h3 className="text-xl font-bold mb-2">Pre-Mortem Diagnostics</h3>
            <p className="text-zinc-400 text-sm">Validating product-market friction.</p>
            <div className="absolute bottom-10 left-8 right-8 h-40 flex items-center justify-center">
               <div className="w-full h-full border border-emerald-500/20 rounded-xl bg-emerald-950/20 flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-emerald-400 font-[family-name:var(--font-jetbrains)] text-xs">Simulating Go-To-Market...</div>
                  <div className="w-1/2 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 delay-300" />
                  </div>
               </div>
            </div>
          </div>

          {/* Card 2: PRD Typewriter */}
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group">
            <h3 className="text-xl font-bold mb-2">Generative Architecture</h3>
            <p className="text-zinc-400 text-sm">Streaming Kano-model product specs.</p>
            <div className="absolute bottom-10 left-8 right-8 h-40 border border-zinc-800 rounded-xl bg-black p-4 font-[family-name:var(--font-jetbrains)] text-xs text-zinc-500 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-emerald-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed</span>
                <span>PRD_STRUCT</span>
              </div>
              <p className="mt-2 text-zinc-300">Targeting Vision Core...</p>
              <p className="text-zinc-500">Routing {'>'} Anthropic Claude 3.5</p>
              <span className="w-2 h-4 bg-emerald-400 animate-pulse mt-auto" />
            </div>
          </div>

          {/* Card 3: Scheduler */}
          <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900/50 border border-zinc-800 p-8 h-96 group">
            <h3 className="text-xl font-bold mb-2">B2B Routing SDK</h3>
            <p className="text-zinc-400 text-sm">Zero-maintenance live API arbitrage.</p>
            <div className="absolute bottom-10 left-8 right-8 h-40 flex flex-col gap-2">
               <div className="grid grid-cols-7 gap-1 h-2/3">
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className={`rounded-sm bg-zinc-800/50 ${i === 9 ? 'bg-emerald-500/80 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : ''} transition-colors duration-300`} />
                  ))}
               </div>
               <div className="w-full h-1/3 border border-zinc-700 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400 group-hover:bg-emerald-950 group-hover:text-emerald-400 group-hover:border-emerald-500 transition-colors duration-300">
                  Execute Route()
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section className="philo-section relative w-full py-40 px-6 md:px-16 bg-transparent">
        <PrototryingMesh />
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
        <div className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-10">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_01</p>
              <h2 className="text-5xl font-bold mb-6">Precoil Validation.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">We instantiate dual Red/Green LLM teams to ruthlessly autopsy your startup idea, finding the critical assumptions that will rip it apart before you waste hours compiling.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden">
               <div className="w-64 h-64 border border-zinc-800 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                 <div className="w-48 h-48 border border-zinc-700 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                   <div className="w-32 h-32 border border-emerald-500/50 rounded-full" />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-20">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div className="hidden md:flex aspect-square rounded-[3rem] border border-zinc-800 bg-black items-center justify-center relative overflow-hidden">
               <div className="w-full h-full relative p-8">
                 <div className="grid grid-cols-5 grid-rows-5 gap-4 w-full h-full opacity-30">
                   {[...Array(25)].map((_, i) => <div key={i} className="bg-zinc-700 rounded-full w-2 h-2 m-auto" />)}
                 </div>
                 <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34D399] animate-[scan_3s_ease-in-out_infinite_alternate]" />
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
        <div className="protocol-card min-h-[100dvh] w-full flex items-center px-6 md:px-16 bg-zinc-950 relative z-30">
          <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-[family-name:var(--font-jetbrains)] text-emerald-400 mb-6">STEP_03</p>
              <h2 className="text-5xl font-bold mb-6">B2B Arbitrage Engine.</h2>
              <p className="text-zinc-400 text-xl leading-relaxed">The production deployment isn't the finish line. Our zero-maintenance B2B router SDK continuously swaps your application's cognitive cores to capture falling API prices automatically.</p>
            </div>
            <div className="aspect-square rounded-[3rem] border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden">
               <svg viewBox="0 0 100 50" className="w-full h-full opacity-50 stroke-emerald-400 stroke-2 fill-none">
                 <path d="M 0 25 L 20 25 L 30 10 L 40 40 L 50 5 L 60 45 L 70 25 L 100 25" className="animate-[dash_2s_linear_infinite]" strokeDasharray="200" strokeDashoffset="200" />
               </svg>
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
             <span className="relative z-10 font-[family-name:var(--font-inter)]">Initiate Pre-Mortem &rarr;</span>
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
