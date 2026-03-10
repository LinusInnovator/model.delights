import React, { Suspense } from 'react';
import { Metadata } from 'next';
import GenerativeArchitectPaid from '@/components/GenerativeArchitectPaid';
import LiveIntelligenceStats from '@/components/LiveIntelligenceStats';
import { Sparkle, Terminal, Code, Lightning } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
    title: 'The Super-Architect Factory | model.delights.pro',
    description: 'Instantly generate and download a production-ready Next.js App Router codebase pre-wired with the optimal zero-latency AI routing architecture.',
};

export default function SuperArchitectPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            <main className="container mx-auto px-4 py-16 xl:py-24 max-w-7xl">
                <div className="w-full flex flex-col items-center justify-center text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                        <Code size={16} />
                        <span>The CTO Factory</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Stop Writing <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">Boilerplate.</span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed mb-12">
                        Describe your product intent. Our Intelligence Engine <LiveIntelligenceStats /> will calculate the optimal architecture and instantly compile a{' '}
                        <strong className="text-white">Next.js 14 App Router</strong> codebase for you to download.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left md:items-stretch">
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2">
                                <Sparkle className="text-cyan-400" size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-white">Mathematically Perfect</h3>
                            <p className="text-zinc-400 text-sm">Bypasses expensive generalized models. Automatically routes isolated tasks to the highest ELO specialized models globally.</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                                <Lightning className="text-purple-400" size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-white">Pre-Configured Setup</h3>
                            <p className="text-zinc-400 text-sm">Download a pristine Next.js repository with Tailwind CSS, Vercel AI SDK, and your custom routing constraints injected via AST.</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                <Terminal className="text-blue-400" size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-white">Ready to Deploy</h3>
                            <p className="text-zinc-400 text-sm">Run 'npm install' and strictly copy your API keys from the generated .env template. You are ready to ship to Vercel instantly.</p>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-5xl mx-auto relative z-10">
                    <Suspense fallback={<div className="text-zinc-500 text-center animate-pulse py-12">Booting Intelligence Engine...</div>}>
                        <GenerativeArchitectPaid />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
