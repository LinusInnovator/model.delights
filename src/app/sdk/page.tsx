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
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            The White-Box mathematical pre-flight engine for enterprise AI architectures. 
            Stop hardcoding `gpt-4o`. Let our real-time LMSys ELO router inject the absolute highest performing, most cost-effective cognitive core specifically for your task intent.
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

        {/* Core Concepts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
             <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-emerald-400">01.</span> Dynamic Intent Resolution
             </h3>
             <p className="text-zinc-400 leading-relaxed text-sm mb-6">
               Pass intent categories like `coding`, `reasoning`, or `vision` directly to the router instead of static model IDs. Based on the 24-hour global market state, it returns the mathematically superior choice.
             </p>
             <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-300 border border-zinc-800">
                <span className="text-indigo-400">const</span> routing = <span className="text-indigo-400">await</span> router.<span className="text-emerald-400">getOptimalRouting</span>(<span className="text-amber-300">'reasoning'</span>);<br/><br/>
                <span className="text-zinc-500">// Returns: (Currently) 'google/gemini-2.0-pro-exp'</span><br/>
                <span className="text-white">routing.flagship.model</span>
             </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors group">
             <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-emerald-400">02.</span> Arbitrage Value Triggers
             </h3>
             <p className="text-zinc-400 leading-relaxed text-sm mb-6">
               When a flagship model is requested, the SDK simultaneously calculates alternative models operating near the same ELO tier but optimized for massive profit margins.
             </p>
             <div className="bg-black rounded-lg p-4 font-mono text-xs text-zinc-300 border border-zinc-800">
                <span className="text-indigo-400">if</span> (routing.smart_value) {'{\n'}
                <span className="text-zinc-500 ml-4">// Budget mode: Use Llama 3.1 70B instead.</span><br/>
                <span className="text-zinc-500 ml-4">// It represents a 95% discount for a 2% Intelligence drop.</span><br/>
                <span className="text-white ml-4">targetModel</span> = routing.smart_value.model;<br/>
                {'}'}
             </div>
          </div>
          
        </div>

      </main>
    </div>
  );
}
