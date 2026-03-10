import React from 'react';
import Link from 'next/link';
import CheckoutButton from './CheckoutButton';
import { auth } from '@clerk/nextjs/server';

export const metadata = {
    title: 'Enterprise AI Routing | model.delights.pro',
    description: 'The Autonomous 99.998% Uptime Intelligence Engine for B2B Agents.',
};

export default async function EnterprisePage() {
    const { sessionClaims } = await auth();
    const metadata = sessionClaims?.metadata as any;
    const isPro = metadata?.tier === 'PRO' || metadata?.has_ltd === true;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans flex flex-col items-center">

            {/* Navigation */}
            <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
                <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
                    model.delights.pro
                </Link>
                <div className="flex space-x-6 text-sm font-medium text-zinc-400">
                    <Link href="/architect" className="hover:text-white transition-colors">Architect</Link>
                    <Link href="/enterprise" className="text-white">Enterprise</Link>
                    <a href="#" className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                        Get API Key
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Intelligence Engine v2.0 Live</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                    Stop hardcoding <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600 line-through decoration-red-500/50">gpt-4o</span>.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Route via Autonomous Intelligence.</span>
                </h1>

                <p className="text-xl text-zinc-400 max-w-2xl mb-12">
                    The AI market moves too fast. Our rigorous Intelligence API tracks every capability unlock, ELO benchmark, and API price drop globally. We automatically route your agents to the smartest, cheapest model at 0ms latency.
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
                    {isPro ? (
                        <a href="#" className="px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center">
                            Access Enterprise Dashboard &rarr;
                        </a>
                    ) : (
                        <CheckoutButton />
                    )}
                    <a href="#integration" className="px-8 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center">
                        Read the Docs
                    </a>
                </div>

                {/* The Integration Section (So Smart It Hurts) */}
                <div id="integration" className="w-full text-left mt-12 scroll-mt-24">
                    <h2 className="text-3xl font-bold mb-4">The ultimate 99.998% integration.</h2>
                    <p className="text-zinc-400 mb-8 max-w-3xl text-lg">
                        We built our Node.js SDK to be bulletproof for enterprise scale. It features Zero-Latency Local Caching, Graceful Offline Persistence, and Autonomous Cascade Fallbacks if a cheap model hallucinates.
                    </p>

                    <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="ml-4 text-xs font-mono text-zinc-500">app/api/generate/route.ts</div>
                        </div>
                        <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
                            <pre>
                                <span className="text-purple-400">import</span> {'{'} IntelligenceRouter {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@model-delights/router'</span>;{'\n'}
                                <span className="text-purple-400">import</span> {'{'} generateText {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'ai'</span>;{'\n'}
                                <span className="text-purple-400">import</span> {'{'} openai {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@ai-sdk/openai'</span>;{'\n\n'}

                                <span className="text-zinc-500">// 1. Zero-Latency Caching: Fetches global DB and syncs silently every 5 mins</span>{'\n'}
                                <span className="text-blue-400">const</span> router = <span className="text-blue-400">new</span> <span className="text-yellow-200">IntelligenceRouter</span>({'{'} apiKey: process.env.DELIGHTS_KEY {'}'});{'\n'}
                                <span className="text-blue-400">await</span> router.<span className="text-blue-300">init</span>();{'\n\n'}

                                <span className="text-purple-400">export async function</span> <span className="text-blue-300">POST</span>(req) {'{\n'}
                                {'  '}<span className="text-zinc-500">// 2. The Bulletproof Execution Wrapper</span>{'\n'}
                                {'  '}<span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> router.<span className="text-blue-300">executeWithFailover</span>({'\n'}
                                {'    '}{'{'} {'\n'}
                                {'      '}intent: <span className="text-green-400">'coding'</span>, {'\n'}
                                {'      '}maxBudgetPer1M: <span className="text-orange-400">5.00</span>,{'\n'}
                                {'      '}fallback: <span className="text-green-400">'openai/gpt-4o-mini'</span> <span className="text-zinc-500">// Graceful Offline Persistence</span>{'\n'}
                                {'    '}{'}'},{'\n'}
                                {'    '}<span className="text-zinc-500">// The Execution Callback</span>{'\n'}
                                {'    '}<span className="text-blue-400">async</span> (modelId) ={'>'} {'{\n'}
                                {'      '}<span className="text-blue-400">return await</span> <span className="text-blue-300">generateText</span>({'{'} model: <span className="text-blue-300">openai</span>(modelId), prompt: req.body.prompt {'}'});{'\n'}
                                {'    '}{'}'},{'\n'}
                                {'    '}<span className="text-zinc-500">// Semantic Validator (The Array Fallback Trigger)</span>{'\n'}
                                {'    '}<span className="text-zinc-500">// If output lacks JSON, silently cascade to fallback array [1]</span>{'\n'}
                                {'    '}(result) ={'>'} result.text.<span className="text-blue-300">includes</span>(<span className="text-green-400">&quot;&#123;&quot;</span>){'\n'}
                                {'  '});{'\n\n'}
                                {'  '}<span className="text-blue-400">return</span> Response.<span className="text-blue-300">json</span>({'{'} data: response.text {'}'});{'\n'}
                                {'}'}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 text-left">

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/30">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Zero PII Architecture</h3>
                        <p className="text-zinc-400 leading-relaxed relative z-10 text-sm">
                            We act as the Control Plane, not the Data Plane. Your servers securely dial the LLMs directly using our cached logic. Your proprietary prompts and RAG data never touch our servers, requiring zero data privacy audits.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Zero-Latency Caching</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            We sync the mathematical intelligence graph directly into your servers memory. Routing calculations happen in 0.1ms locally without waiting on external HTTP requests.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Array Fallback Execution</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Never crash in production. If the engine recommends an ultra-cheap model that hallucinates your schema, our SDK instantly retries the next smartest model.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 border border-green-500/30">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Graceful Persistence</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Immune to network outages. If model.delights.pro ever goes down, your SDK seamlessly routes using the last known cache state or a provided static fallback.
                        </p>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/10 py-12 mt-auto">
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="text-sm font-bold text-zinc-500">model.delights.pro</div>
                    <div className="text-sm text-zinc-600">The Intelligence Engine for AI Routers.</div>
                </div>
            </footer>
        </div>
    );
}
