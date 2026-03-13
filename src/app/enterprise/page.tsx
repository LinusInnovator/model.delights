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
    const metadata = sessionClaims?.metadata as Record<string, unknown>;
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
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Zero-Maintenance SOTA.</span>
                </h1>

                <p className="text-xl text-zinc-400 max-w-2xl mb-12">
                    Our routing engine detects new frontier models the millisecond they drop. We mathematically guarantee your profit margins and ensure your agent&apos;s intelligence never decays.
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
                    {isPro ? (
                        <a href="/enterprise/dashboard" className="px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all flex items-center justify-center">
                            Access Enterprise Dashboard &rarr;
                        </a>
                    ) : (
                        <CheckoutButton />
                    )}
                    <a href="#integration" className="px-8 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center">
                        Read the Docs
                    </a>
                </div>

                {/* Competitive Positioning: The Snell SDK vs OpenRouter Auto */}
                <div className="w-full text-left mt-8 mb-24 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center">White-Box Intelligence vs Black-Box Execution</h2>
                    <p className="text-zinc-400 text-center mb-12 text-lg">
                        Why pay for Snell when OpenRouter has a free `openrouter/auto` model? Because auto-routers are black boxes that spend your money invisibly. Snell is a mathematical pre-flight check.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* OpenRouter Auto */}
                        <div className="p-8 rounded-2xl bg-red-900/10 border border-red-500/20 flex flex-col items-start gap-4">
                            <h3 className="text-xl font-bold flex items-center text-red-400">
                                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                OpenRouter &apos;Auto&apos;
                            </h3>
                            <p className="text-zinc-400 leading-relaxed text-sm">
                                You set your model to `auto`. OpenRouter reads your prompt, guesses the complexity, picks a model secretly, runs the inference, and bills you. You have absolutely zero control over your profit margins.
                            </p>
                            <ul className="text-sm text-zinc-500 space-y-2 mt-4">
                                <li className="flex items-center"><span className="text-red-500 mr-2 text-lg">•</span> Black Box Execution</li>
                                <li className="flex items-center"><span className="text-red-500 mr-2 text-lg">•</span> No margin calculation</li>
                                <li className="flex items-center"><span className="text-red-500 mr-2 text-lg">•</span> Zero Fallback control</li>
                            </ul>
                        </div>

                        {/* Snell Router */}
                        <div className="p-8 rounded-2xl bg-blue-900/20 border border-blue-500/30 flex flex-col items-start gap-4">
                            <h3 className="text-xl font-bold flex items-center text-blue-400">
                                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Snell Enterprise SDK
                            </h3>
                            <p className="text-zinc-300 leading-relaxed text-sm">
                                You ask our API for the best model *before* running inference. We return the global flagship, the exact percentage of intelligence drop for a cheaper alternative, and the precise cost multiplier savings.
                            </p>
                            <ul className="text-sm text-zinc-400 space-y-2 mt-4 font-medium">
                                <li className="flex items-center"><span className="text-blue-500 mr-2 text-lg">✓</span> Mathematical Pre-Flight</li>
                                <li className="flex items-center"><span className="text-blue-500 mr-2 text-lg">✓</span> Deterministic ELO scaling</li>
                                <li className="flex items-center"><span className="text-blue-500 mr-2 text-lg">✓</span> Predictable Fallback Arrays</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* The Integration Section (So Smart It Hurts) */}
                <div id="integration" className="w-full text-left mt-12 scroll-mt-24">
                    <h2 className="text-3xl font-bold mb-4">Protect Your Margins. Instantly.</h2>
                    <p className="text-zinc-400 mb-8 max-w-3xl text-lg">
                        The B2B Value Router calculates a dynamic elastic band to guarantee extreme cost savings while finding the absolute smartest budget alternative to the global flagship.
                    </p>

                    <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="ml-4 text-xs font-mono text-zinc-500">app/api/route.ts</div>
                        </div>
                        <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
                            {/* eslint-disable react/jsx-no-comment-textnodes, react/no-unescaped-entities */}
                            <pre>
                                <span className="text-purple-400">import</span> {'{'} IntelligenceRouter {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@model-delights/snell'</span>;{'\n'}
                                <span className="text-purple-400">import</span> {'{'} generateText {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'ai'</span>;{'\n\n'}

                                <span className="text-zinc-500">// 1. Initialize the Zero-Maintenance Router</span>{'\n'}
                                <span className="text-blue-400">const</span> router = <span className="text-blue-400">new</span> <span className="text-yellow-200">IntelligenceRouter</span>({'{'} apiKey: process.env.GOD_KEY {'}'});{'\n\n'}

                                <span className="text-purple-400">export async function</span> <span className="text-blue-300">POST</span>(req) {'{\n'}
                                {'  '}<span className="text-blue-400">const</span> {'{'} tier, prompt {'}'} = <span className="text-blue-400">await</span> req.<span className="text-blue-300">json</span>();{'\n\n'}

                                {'  '}<span className="text-zinc-500">// 2. Query the entire global market simultaneously</span>{'\n'}
                                {'  '}<span className="text-blue-400">const</span> routing = <span className="text-blue-400">await</span> router.<span className="text-blue-300">getOptimalRouting</span>(<span className="text-green-400">'reasoning'</span>);{'\n\n'}

                                {'  '}<span className="text-zinc-500">// 3. Protect Unit Economics Dynamically</span>{'\n'}
                                {'  '}<span className="text-blue-400">let</span> modelId = routing.smart_value.model; <span className="text-zinc-500">// e.g. "12x cheaper for -4% ELO drop"</span>{'\n'}
                                {'  '}<span className="text-purple-400">if</span> (tier === <span className="text-green-400">'enterprise'</span>) {'{\n'}
                                {'    '}modelId = routing.flagship.model; <span className="text-zinc-500">// e.g. claude-opus-4.6</span>{'\n'}
                                {'  }'}{'\n\n'}

                                {'  '}<span className="text-blue-400">return await</span> <span className="text-blue-300">generateText</span>({'{'} model: modelId, prompt {'}'});{'\n'}
                                {'}'}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mt-24 text-left">

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6 border border-yellow-500/30">
                            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Zero-Maintenance SOTA</h3>
                        <p className="text-zinc-400 leading-relaxed relative z-10 text-sm">
                            When an Anthropic flagship drops, the engine instantly mathematically scores it. Your agents upgrade automatically, ensuring you always ship the world&apos;s smartest AI without writing a single line of code.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 border border-blue-500/30">
                            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">B2B Value Router</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Extreme costs require extreme precision. The B2B router uses variable Elastic Band filtering to guarantee budget tier models achieve massive savings (-60%) for only fractional Intelligence drops (-4%).
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-purple-500/30">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Wide Safety Nets</h3>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Never crash in production. If the engine&apos;s primary flagship model goes offline, the API natively returns an array of peer-level models spanning up to 100 ELO points of variance for instant failover.
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
