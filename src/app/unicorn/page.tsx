"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import AnimatedTextLogo from "@/components/AnimatedTextLogo";

export default function UnicornThesisPage() {
  const [teamSize, setTeamSize] = useState(7);
  const [agileMonths, setAgileMonths] = useState(6);
  
  const [unicornCost, setUnicornCost] = useState(30000); // Premium price
  const [unicornMonths, setUnicornMonths] = useState(1);

  const LOADED_COST_PER_HEAD = 15000;

  // Math
  const communicationPaths = (teamSize * (teamSize - 1)) / 2;
  const agileMonthlyBurn = teamSize * LOADED_COST_PER_HEAD;
  const totalAgileBurn = agileMonthlyBurn * agileMonths;
  const totalUnicornBurn = unicornCost * unicornMonths;
  
  const monthsSaved = agileMonths - unicornMonths;
  const theoreticalMonthlyRevenue = 25000; // Assumption for opportunity cost
  const lostRevenueDays = Math.max(0, monthsSaved * 30);
  const opportunityCost = Math.max(0, monthsSaved * theoreticalMonthlyRevenue);

  // The Brooks's Law Coordination Tax
  const hoursLostPerPathPerWeek = 1.5;
  const weeksPerMonth = 4.33;
  const totalHoursLostPerMonth = communicationPaths * hoursLostPerPathPerWeek * weeksPerMonth;
  const blendedHourlyRate = LOADED_COST_PER_HEAD / 160;
  const monthlyCoordinationTax = totalHoursLostPerMonth * blendedHourlyRate;
  const totalCoordinationTax = monthlyCoordinationTax * agileMonths;
  const coordinationTaxPct = Math.min(100, Math.round((monthlyCoordinationTax / agileMonthlyBurn) * 100));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-[family-name:var(--font-inter)] selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Fixed Branding Header (Persists across scroll) */}
      <header className="absolute top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto cursor-pointer flex items-center gap-4 group">
          <Link href="/" className="flex items-center gap-4 group">
             <AnimatedLogo className="w-11 h-11 shrink-0 opacity-90" />
             <AnimatedTextLogo className="h-9 w-auto shrink-0 opacity-90 mt-1" />
          </Link>
        </div>
        <div className="pointer-events-auto">
          <Link 
            href="/manifesto" 
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md hover:bg-zinc-800 hover:border-emerald-500/30 transition-all duration-300"
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] text-zinc-400 tracking-widest uppercase group-hover:text-emerald-400 transition-colors">Manifesto</span>
            <span className="text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">&rarr;</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-40">
        
        {/* 1. THE HERO */}
        <div className="max-w-5xl mx-auto px-6 lg:px-12 mb-40 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                THE ASYMMETRIC ADVANTAGE
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight rendering-fix">
                <span className="text-zinc-400">Buying</span><br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                  Time Travel.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light">
                The market does not care about your burn rate. It cares about traction. The traditional model of software development is a slow, expensive coordination tax. <strong className="text-white font-medium">The Singular Unicorn operates on a different plane of physics.</strong>
              </p>
            </motion.div>
        </div>

        {/* 2. THE EXTINCTION THREAT */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 mb-40">
           <div className="bg-red-950/20 border border-red-900/50 rounded-3xl p-8 md:p-16 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full" />
             <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white relative z-10 font-[family-name:var(--font-jetbrains)]">The Unapologetic Truth</h2>
             <div className="space-y-6 text-lg md:text-xl text-zinc-300 relative z-10 max-w-4xl leading-relaxed">
               <p>
                 If you are on the market six months before your competitor, you win. The monetary cost is irrelevant if your competitor is still arguing over database schemas while you are collecting Stripe payments.
               </p>
               <p className="text-white font-medium border-l-4 border-red-500 pl-6">
                 And if you don't hire the Unicorn to build your vision? They possess the raw capability to launch a competing product over the weekend and own the market before your Product Manager finishes Sprint Planning. 
               </p>
               <p>
                 You aren't paying a premium for code. You are paying a premium to ensure they are weaponizing their speed for you, not against you.
               </p>
             </div>
           </div>
        </div>

        {/* 3. THE TIME-DILATION TIMELINE */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-40">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-jetbrains)]">Time Dilation</h2>
              <p className="text-zinc-500 text-lg">Visualizing six months of execution throughput.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              {/* Agile Corp */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 to-zinc-600 rounded-t-3xl" />
                 <h3 className="text-2xl font-bold mb-2 flex items-center justify-between">
                   Traditional Agile Team
                   <span className="text-zinc-500 text-sm font-mono bg-zinc-900 px-3 py-1 rounded-full">Bloat</span>
                 </h3>
                 <p className="text-zinc-500 mb-8 border-b border-zinc-800/50 pb-8 text-sm">PM, Frontend, Backend, DevOps, QA. Communication paths: N(N-1)/2.</p>
                 
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {/* Event 1 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 z-10 shrinks-0">M1</div>
                       <div className="w-[85%] bg-black border border-zinc-800 p-4 rounded-xl">
                          <p className="text-sm text-zinc-300">Scoping, Refinement, Architecture Approvals.</p>
                       </div>
                    </div>
                    {/* Event 2 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 z-10 shrinks-0">M3</div>
                       <div className="w-[85%] bg-black border border-zinc-800 p-4 rounded-xl">
                          <p className="text-sm text-zinc-300">Building MVP. Backend blocked by Frontend mocks.</p>
                       </div>
                    </div>
                    {/* Event 3 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-400 z-10 shrinks-0">M5</div>
                       <div className="w-[85%] bg-black border border-zinc-800 p-4 rounded-xl">
                          <p className="text-sm text-zinc-300">QA testing, bug fixing, deployment delays.</p>
                       </div>
                    </div>
                    {/* Event 4 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-xs font-mono text-zinc-200 z-10 shrinks-0">M6</div>
                       <div className="w-[85%] bg-zinc-900 border border-zinc-700 p-4 rounded-xl">
                          <p className="font-bold text-white text-sm">V1 Launch.</p>
                          <p className="text-xs text-zinc-500 mt-1">Total Output: 1 Product.</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Unicorn Corp */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-3xl p-8 relative shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-teal-400 rounded-t-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                 <h3 className="text-2xl font-bold mb-2 flex items-center justify-between">
                   The Singular Unicorn
                   <span className="text-emerald-400 text-sm font-mono bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">Apex</span>
                 </h3>
                 <p className="text-zinc-400 mb-8 border-b border-emerald-900/50 pb-8 text-sm">1 Architect + Agent Swarm. Communication paths: 0.</p>
                 
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-900 before:to-transparent">
                    {/* Event 1 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-xs font-mono text-emerald-400 z-10 shrinks-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">W1</div>
                       <div className="w-[85%] bg-black border border-emerald-900/50 p-4 rounded-xl shadow-lg shadow-emerald-900/5 hover:border-emerald-500/50 transition-colors">
                          <p className="font-bold text-emerald-400 text-sm leading-tight mb-1">MVP 1 Live.</p>
                          <p className="text-xs text-zinc-400">Deployed to production. Collecting payments.</p>
                       </div>
                    </div>
                    {/* Event 2 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-700 flex items-center justify-center text-xs font-mono text-emerald-500 z-10 shrinks-0">W3</div>
                       <div className="w-[85%] bg-black border border-emerald-900/30 p-4 rounded-xl">
                          <p className="text-sm text-zinc-300 leading-tight">Ruthless pivot based on actual Stripe data.</p>
                       </div>
                    </div>
                    {/* Event 3 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-800 flex items-center justify-center text-xs font-mono text-emerald-600 z-10 shrinks-0">W8</div>
                       <div className="w-[85%] bg-black border border-emerald-900/30 p-4 rounded-xl">
                          <p className="text-sm text-zinc-300 leading-tight">Shipped MVP 2, MVP 3, and 14 new features.</p>
                       </div>
                    </div>
                    {/* Event 4 */}
                    <div className="flex items-center justify-between relative">
                       <div className="w-10 h-10 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center text-xs font-mono text-white z-10 shrinks-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">M6</div>
                       <div className="w-[85%] bg-gradient-to-br from-emerald-950 to-black border border-emerald-500 p-4 rounded-xl">
                          <p className="font-bold text-white text-sm">Market Optimization.</p>
                          <p className="text-xs text-emerald-200 mt-1">Total Output: 55 independent product streams tested.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 4. THE TRACTION MATRIX CALCULATOR */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative">
           
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-jetbrains)] bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">The Traction Matrix</h2>
              <p className="text-zinc-400 text-lg">Calculate the true cost of coordination tax vs raw execution speed.</p>
           </div>
           
           <div className="grid lg:grid-cols-12 gap-12 bg-zinc-900/20 border border-zinc-800 rounded-3xl p-8 md:p-12 overflow-hidden relative">
              
              {/* Sliders (Left) */}
              <div className="lg:col-span-5 space-y-12 relative z-10">
                 
                 {/* Agile Slider */}
                 <div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-6 flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                       Traditional Team (Bloat)
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-zinc-400 mb-2">
                         <span>Team Size (PM, SM, Devs, QA)</span>
                         <span className="font-mono text-white">{teamSize} heads</span>
                      </div>
                      <input 
                         type="range" min="3" max="15" step="1"
                         value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))}
                         className="w-full accent-zinc-500 bg-black rounded-lg appearance-none h-2"
                      />
                      <div className="mt-3 flex justify-between text-xs font-mono text-zinc-500 border-t border-zinc-800/50 pt-3">
                         <span>Burn: ${(agileMonthlyBurn / 1000).toFixed(0)}k/mo</span>
                         <span className="text-red-400/80">Comm. Paths: {communicationPaths}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-zinc-400 mb-2">
                         <span>Time to Market MVP</span>
                         <span className="font-mono text-white">{agileMonths} months</span>
                      </div>
                      <input 
                         type="range" min="3" max="12" step="1"
                         value={agileMonths} onChange={(e) => setAgileMonths(Number(e.target.value))}
                         className="w-full accent-zinc-500 bg-black rounded-lg appearance-none h-2"
                      />
                    </div>
                 </div>

                 <div className="w-full h-px bg-zinc-800"></div>

                 {/* Unicorn Slider */}
                 <div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                       Singular Unicorn (Premium)
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-zinc-400 mb-2">
                         <span>Monthly Retainer</span>
                         <span className="font-mono text-white">${unicornCost.toLocaleString()}/mo</span>
                      </div>
                      <input 
                         type="range" min="15000" max="60000" step="5000"
                         value={unicornCost} onChange={(e) => setUnicornCost(Number(e.target.value))}
                         className="w-full accent-emerald-500 bg-black rounded-lg appearance-none h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-zinc-400 mb-2">
                         <span>Time to Market MVP</span>
                         <span className="font-mono text-white">{unicornMonths} month{unicornMonths > 1 ? 's' : ''}</span>
                      </div>
                      <input 
                         type="range" min="1" max="4" step="1"
                         value={unicornMonths} onChange={(e) => setUnicornMonths(Number(e.target.value))}
                         className="w-full accent-emerald-500 bg-black rounded-lg appearance-none h-2"
                      />
                    </div>
                 </div>

              </div>

              {/* Outputs (Right) */}
              <div className="lg:col-span-7 bg-black rounded-2xl border border-zinc-800 p-8 flex flex-col justify-center relative z-10">
                 
                 <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
                    <div>
                       <p className="text-zinc-500 text-sm mb-1">Traditional Build Cost</p>
                       <p className="text-3xl font-mono text-zinc-300 drop-shadow-md">
                         ${Math.round(totalAgileBurn).toLocaleString()}
                       </p>
                    </div>
                    <div>
                       <p className="text-zinc-500 text-sm mb-1">Unicorn Build Cost</p>
                       <p className="text-3xl font-mono text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                         ${Math.round(totalUnicornBurn).toLocaleString()}
                       </p>
                    </div>
                 </div>

                 <div className="mb-8 pb-8 border-b border-zinc-800">
                    <h4 className="text-white font-bold mb-4 flex items-center justify-between font-[family-name:var(--font-jetbrains)] border-l-2 border-red-500 pl-4">
                       The Coordination Tax
                       <span className="text-red-400 text-xs font-mono bg-red-950/30 px-3 py-1 rounded-full border border-red-900/50">-{coordinationTaxPct}% Velocity</span>
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                       With <strong>{teamSize} members</strong>, there are <strong>{communicationPaths} ongoing communication paths</strong> [N(N-1)/2]. 
                       Assuming just 1.5 hours lost per path, per week, to alignment and meetings, that is <strong className="text-red-400 font-mono">${Math.round(totalCoordinationTax).toLocaleString()}</strong> burned purely on talking about the code, not writing it.
                    </p>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-white font-bold text-xl mb-4 font-[family-name:var(--font-jetbrains)] border-l-2 border-indigo-500 pl-4">The Reality Check</h4>
                    
                    <div className="bg-zinc-900/50 rounded-xl p-4 flex justify-between items-center">
                       <span className="text-zinc-400">Lost Revenue Days</span>
                       <span className="font-mono text-2xl text-red-400">{lostRevenueDays} days</span>
                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-6">
                       <p className="text-zinc-400 text-sm mb-2">Assumed Opportunity Cost (at ${theoreticalMonthlyRevenue.toLocaleString()}/mo)</p>
                       <p className="text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 tracking-tight">
                         -${opportunityCost.toLocaleString()}
                       </p>
                       <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                         The Unicorn is financially superior even if they cost the exact same amount as a 5-person agency. Time dilation destroys valuations.
                       </p>
                    </div>
                 </div>

              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
