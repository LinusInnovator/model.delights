import React from 'react';
import Link from 'next/link';

export default function SDKPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 font-sans pb-40">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-6 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-950">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight leading-none text-zinc-100 flex flex-col">
            model
            <span className="text-emerald-400 font-serif italic text-[0.8em]">delights.pro/sdk</span>
          </span>
        </div>
        
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Exit
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-6">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
             V1.0.0 RELEASE
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Universal Intelligence <br className="hidden md:block"/>
            <span className="text-emerald-500 font-serif italic font-light">Routing SDK.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-6">
            The White-Box mathematical pre-flight engine built specifically for <span className="text-white font-semibold">Singular Unicorns</span> and Autonomous Agent Swarms. 
          </p>
          <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
            Stop hardcoding `gpt-4o`. Break the coordination tax of traditional agile teams. Let our real-time LMSys ELO router inject the absolute highest performing, most cost-effective cognitive core specifically for your task intent—enabling you to ship sub-platforms in exactly 2 days.
          </p>
        </div>

        {/* Installation Terminal */}
        <div className="w-full bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl mb-16">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
             <div className="w-3 h-3 rounded-full bg-rose-500" />
             <div className="w-3 h-3 rounded-full bg-amber-500" />
             <div className="w-3 h-3 rounded-full bg-emerald-500" />
             <span className="ml-4 text-xs font-mono text-zinc-500">terminal — ~</span>
          </div>
          <div className="p-8 pb-10">
             <p className="font-mono text-emerald-400 mb-2"># Install via public NPM registry</p>
             <p className="font-mono text-xl text-white">
                <span className="text-rose-400">npm</span> install model-delights-snell
             </p>
          </div>
        </div>

        {/* SDK Editions Grid */}
        <div className="mb-24">
           <h2 className="text-3xl font-bold mb-10 text-center">Select Your Engine Version</h2>
           <div className="grid md:grid-cols-3 gap-6">
              
              {/* Community Version */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-zinc-700 transition-colors">
                 <div className="mb-6">
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Community <span className="text-zinc-500 font-mono text-sm tracking-normal">v1.x</span></h3>
                    <p className="text-sm text-zinc-400">The open-source routing core. Perfect for indie hackers, prototyping, and solo validation.</p>
                 </div>
                 <div className="font-mono text-sm text-zinc-300 bg-black border border-zinc-800 rounded-lg p-3 mb-8">
                    npm i model-delights-snell
                 </div>
                 <ul className="flex-1 space-y-4 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Dynamic Intent Resolution.</strong> Route prompts by category (e.g. `coding`) instead of hardcoded model IDs.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Baseline ELO Matrix.</strong> Access standard daily Chatbot Arena snapshot evaluations.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Universal Execution Vehicle.</strong> Autonomous wrapper handling 429 rate-limit fallback cascades natively.</div>
                    </li>
                 </ul>
                 <button className="w-full mt-8 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors">
                    Read Global Docs
                 </button>
              </div>

              {/* Pro Version */}
              <div className="bg-zinc-900 border border-purple-500/50 rounded-3xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(168,85,247,0.1)] hover:border-purple-400 transition-colors transform md:-translate-y-4">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">The Builder's Choice</div>
                 <div className="mb-6">
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Pro: Primary <span className="text-purple-400 font-mono text-sm tracking-normal">v2.x</span></h3>
                    <p className="text-sm text-zinc-400">Yield exponential efficiency. Built for Singular Unicorns and autonomous agent swarms optimized for runway.</p>
                 </div>
                 <div className="font-mono text-sm text-purple-200 bg-purple-950/30 border border-purple-900/50 rounded-lg p-3 mb-8">
                    Requires: OR_API_KEY
                 </div>
                 <ul className="flex-1 space-y-4 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Margin Arbitrage Triggers.</strong> Automatically substitutes flagship models with budget variants (e.g. Llama 3.1 70B) within a 2% intelligence deviation window to capture 95% API margin savings.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Context-Caching.</strong> Live mechanical calculations for native Anthropic/Google caching to drop heavy RAG costs by 80%.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Hyper-Velocity Routing.</strong> Eradicates agile coordination tax, shrinking 11-day sub-platform builds down to 2-day pivots.</div>
                    </li>
                 </ul>
                 <a href="/architect" className="w-full text-center mt-8 py-3 rounded-xl bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-500 transition-colors">
                    Access Pro Package
                 </a>
              </div>

              {/* Enterprise Version */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-emerald-500/50 transition-colors">
                 <div className="mb-6">
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Enterprise <span className="text-emerald-500 font-mono text-sm tracking-normal">v3.x</span></h3>
                    <p className="text-sm text-zinc-400">Absolute maximum intelligence. For institutional AI labs and life-or-death zero-latency financial operations.</p>
                 </div>
                 <div className="font-mono text-sm text-emerald-200 bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3 mb-8">
                    Contact Engineering Server
                 </div>
                 <ul className="flex-1 space-y-4 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Strict ELO Topology.</strong> Forces the absolute highest-scoring reasoning model on earth for every prompt, completely bypassing margin/cost routing.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Zero-Knowledge Architecture.</strong> Strict multi-tenant compliance with isolated control planes. System prompts never traverse the routing payload.</div>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                       <div><strong className="text-white">Private Telemetry Clusters.</strong> Dedicated data lakes intercepting error cascades and semantic drift.</div>
                    </li>
                 </ul>
                 <a href="/enterprise" className="w-full text-center mt-8 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors">
                    Explore Enterprise
                 </a>
              </div>

           </div>
        </div>

      </main>
    </div>
  );
}
