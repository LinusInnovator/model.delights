"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkle, Terminal, ArrowRight, CheckCircle, Spinner, FileText, Copy } from "@phosphor-icons/react";
import { useCompletion } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import BlueprintCard, { BlueprintData } from "./BlueprintCard";

import DownloadBlueprintButton from "./DownloadBlueprintButton";
import DownloadAgentButton from "./DownloadAgentButton";
import TerminalSizzle from "./TerminalSizzle";
import ArbitragePremiumCTA from "./ArbitragePremiumCTA";

export default function GenerativeArchitectPaid() {
    const searchParams = useSearchParams();
    const initialIdea = searchParams.get("idea") || "";
    const pivot = searchParams.get("pivot") || "";

    const [query, setQuery] = useState(initialIdea);
    
    // UI Flow State
    const [appState, setAppState] = useState<'input' | 'streaming_prd' | 'prd_review' | 'generating_arch' | 'email_capture' | 'finished'>('input');
    const [result, setResult] = useState<BlueprintData | null>(null);
    const [blueprintPayload, setBlueprintPayload] = useState<{ blueprint: BlueprintData; tier: "SIMPLE" | "MEDIUM" | "MEGA" } | null>(null);
    const [hasUnlocked, setHasUnlocked] = useState(false);
    
    // Autoclip Lead Capture State
    const [email, setEmail] = useState('');
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    
    // Legacy generation state for sizzle component compatibility
    const [tier, setTier] = useState<"SIMPLE" | "MEDIUM" | "MEGA" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(!!initialIdea);
    const [hasCopied, setHasCopied] = useState(false);
    
    // Upsell state logic
    const [currentTier, setCurrentTier] = useState<'standard' | 'premium'>('standard');
    const [autoSynthesize, setAutoSynthesize] = useState(false);

    // Stripe Redirect Interceptor Hook
    useEffect(() => {
        const urlTier = searchParams.get("tier");
        if (urlTier === 'premium') {
            const cachedQuery = localStorage.getItem('pending_arbitrage_query');
            if (cachedQuery) {
                // User has successfully returned from Stripe.
                setIsExpanded(true);
                setQuery(cachedQuery);
                setAutoSynthesize(true);
                
                // Clear the cache to prevent duplicate triggers on reload
                localStorage.removeItem('pending_arbitrage_query');
                
                // We use a slight timeout to ensure React state renders the expanded view first
                setTimeout(() => {
                    // Trigger the premium run natively 
                    // (we emulate the button click by directly invoking the handler)
                    // Note: Cannot directly pass 'premium' if we don't have access to the function 
                    // definition inside this hook natively, but we can set the state flag.
                    setCurrentTier('premium');
                }, 500);
            }
        }
    }, [searchParams]);

    // Separate effect to trigger the execution once currentTier is set by the interceptor
    useEffect(() => {
        if (currentTier === 'premium' && query && appState === 'input' && autoSynthesize) {
            handleGeneratePRD('premium');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTier, query, appState, autoSynthesize]);

    const { completion: prdText, complete: generatePrd } = useCompletion({
        api: '/api/generate-prd',
        streamProtocol: 'text',
        onFinish: () => {
            setAppState('prd_review');
        },
        onError: (e: Error) => {
            setError(e.message || "Failed to generate PRD");
            setAppState('input');
        }
    });

    useEffect(() => {
        if (hasUnlocked && blueprintPayload && appState === 'generating_arch') {
            setResult(blueprintPayload.blueprint);
            setTier(blueprintPayload.tier || "SIMPLE");
            setAppState('finished');
        }
    }, [hasUnlocked, blueprintPayload, appState]);

    useEffect(() => {
        if (appState === 'prd_review' && autoSynthesize) {
            setAutoSynthesize(false);
            handleSynthesizeArchitecture(currentTier);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState, autoSynthesize, currentTier]);

    const handleCopyPRD = async () => {
        if (!prdText) return;
        try {
            await navigator.clipboard.writeText(prdText);
            setHasCopied(true);
            setTimeout(() => setHasCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy PRD to clipboard:", err);
        }
    };

    const handleGeneratePRD = async (overrideTier?: 'standard' | 'premium') => {
        if (!query.trim()) return;

        const targetTier = overrideTier || 'standard';
        setCurrentTier(targetTier);
        setAppState('streaming_prd');
        setError(null);
        setResult(null);
        setTier(null);
        setBlueprintPayload(null);
        setHasUnlocked(false);
        
        // Pass the query to the PRD generator with tier selection
        generatePrd(query, { body: { tier: targetTier } });
    };

    const handleSynthesizeArchitecture = async (overrideTier?: 'standard' | 'premium') => {
        if (!prdText) return;

        const targetTier = overrideTier || currentTier;
        setAppState('generating_arch');
        setError(null);

        // Background Fetch
        try {
            const finalQuery = pivot
                ? `Executive Validation Command: The Senior Partner has dictated that this architecture MUST specifically prioritize: [${pivot}].\n\n=== PRODUCT REQUIREMENTS DOCUMENT ===\n${prdText}`
                : `=== PRODUCT REQUIREMENTS DOCUMENT ===\n${prdText}`;

            fetch("/api/generate-blueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: finalQuery, tier: targetTier })
            }).then(async (res) => {
                if (!res.ok) throw new Error("Failed to generate architecture.");
                const data = await res.json();
                setBlueprintPayload(data);
            }).catch(err => {
                console.error("Blueprint synthesis error:", err);
                setError(err.message || "An unexpected error occurred.");
                setAppState('prd_review'); // Fall back to allow retry
            });

            // The Autoclip intercept
            // TESTING OVERRIDE: Skip email capture and instantly finalize the blueprint
            setTimeout(() => {
                setHasUnlocked(true);
                setAppState('generating_arch');
            }, 1000);

        } catch (err: unknown) {
            setError((err as Error).message || "An unexpected error occurred.");
            setAppState('prd_review');
        }
    };

    const handleUnlockBlueprint = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!email.trim() || !email.includes('@')) {
             setError("Please enter a valid email to unlock the blueprint.");
             setTimeout(() => setError(null), 3000);
             return;
        }

        setIsSubmittingEmail(true);
        try {
            await fetch('/api/capture-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, query: initialIdea || query })
            });
        } catch (err) {
            console.error("Lead capture error", err);
        }
        setIsSubmittingEmail(false);
        setHasUnlocked(true);
        setAppState('generating_arch');
    };

    return (
        <div className={`relative w-full max-w-5xl mx-auto my-12 transition-all duration-500 rounded-2xl border ${isExpanded ? 'border-white/10' : 'border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer'} overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.3)] group`} style={{ animation: 'fadeIn 1s ease 0.6s backwards' }}>
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-cyan-900/20 z-0 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}></div>
            <div className={`absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] z-0 pointer-events-none transition-transform duration-1000 ${isExpanded ? 'scale-100' : 'scale-50 animate-pulse'}`}></div>

            {!isExpanded ? (
                <div
                    className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                            <Sparkle size={20} className="animate-pulse" />
                            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-50"></div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">The Super-Architect Factory</h3>
                            <p className="text-sm text-zinc-400">Describe your startup idea. Instantly generate your mathematical zero-latency routing API.</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center text-cyan-400 text-sm font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        <span>Open Architect</span>
                        <ArrowRight size={16} className="ml-2" />
                    </div>
                </div>
            ) : (
                <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center animate-fade-in-up">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        aria-label="Close Generative Architect"
                    >
                        × Close
                    </button>

                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 pulse-border">
                        <Sparkle size={14} />
                        <span>The Super-Architect Factory</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight tracking-tight">
                        What are you trying to build?
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-2xl">
                        Describe your application or startup idea. Our Intelligence Engine will instantly generate a mathematically perfect, zero-latency API architecture across the entire global AI ecosystem.
                    </p>

                    <div className="w-full max-w-3xl relative mb-6">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. 'I want to build a B2B legal document analyzer that handles 100-page PDFs and cites specific contract clauses...'"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none min-h-[120px] shadow-inner transition-all duration-300"
                            disabled={appState !== 'input'}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGeneratePRD('standard');
                                }
                            }}
                        />
                        {appState === 'input' && (
                        <button
                            onClick={() => handleGeneratePRD('standard')}
                            disabled={!query.trim()}
                            className="absolute bottom-4 right-4 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center font-bold text-sm tracking-wide"
                        >
                            <span>Draft PRD</span>
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" weight="bold" />
                        </button>
                        )}
                    </div>

                    {/* PRD Streaming & Review Window */}
                    {(appState === 'streaming_prd' || appState === 'prd_review' || (appState === 'finished' && prdText)) && (
                        <div className="w-full max-w-3xl mt-2 mb-8 flex flex-col items-center animate-fade-in-up">
                            <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
                                <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono tracking-widest uppercase">
                                        <FileText size={16} className="text-cyan-500" />
                                        <span>Product Requirements Document</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {appState === 'streaming_prd' && <Spinner size={16} className="text-cyan-500 animate-spin" />}
                                        {appState === 'prd_review' && (
                                            <>
                                                <button
                                                    onClick={handleCopyPRD}
                                                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-black/40 hover:bg-zinc-800 px-2.5 py-1.5 rounded-md border border-zinc-700/50 transition-all duration-200"
                                                    title="Copy PRD"
                                                >
                                                    {hasCopied ? (
                                                        <CheckCircle size={14} className="text-emerald-500" weight="bold" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                    <span className={hasCopied ? "text-emerald-500" : ""}>{hasCopied ? 'Copied' : 'Copy'}</span>
                                                </button>
                                                <CheckCircle size={16} className="text-emerald-500 hidden sm:block" weight="fill" />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 text-left prose prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-a:text-cyan-400 prose-p:mb-6 prose-li:mb-2 prose-ul:mb-6 leading-relaxed max-w-none max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {prdText ? (
                                        <ReactMarkdown>{prdText}</ReactMarkdown>
                                    ) : (
                                        <div className="flex items-center gap-3 text-zinc-500 italic">
                                            <span className="animate-pulse">Analyzing founder intent and drafting technical constraints...</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Gradient Fade out for long text */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
                            </div>

                            {appState === 'prd_review' && (
                                <button
                                    onClick={() => handleSynthesizeArchitecture()}
                                    className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl transition-transform duration-300 hover:scale-[1.02] flex items-center font-bold text-base shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] group"
                                >
                                    <Sparkle size={20} className="mr-3 text-cyan-200 animate-pulse" />
                                    <span>Approve PRD & Synthesize Architecture</span>
                                    <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" weight="bold" />
                                </button>
                            )}
                        </div>
                    )}

                    {(appState === 'generating_arch' || appState === 'email_capture') && (
                        <div className="w-full max-w-3xl mt-4 p-6 bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-4 shadow-inner min-h-[100px] overflow-hidden transition-all duration-500 relative">
                            <div className={`flex flex-col items-center w-full transition-all duration-700 ${appState === 'email_capture' ? 'blur-md opacity-40 select-none scale-95' : ''}`}>
                                <TerminalSizzle isComplete={false} />
                            </div>

                            {appState === 'email_capture' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center animate-fade-in-up">
                                    <div className="bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl w-[90%] sm:w-[500px] shadow-2xl flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                                            <Sparkle size={24} className="text-cyan-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Your Architecture is Ready.</h3>
                                        <p className="text-sm text-zinc-400 mb-6">
                                            Enter your email to unlock the final JSON blueprint, access the full technical diagram, and receive our weekly CTO teardowns.
                                        </p>
                                        <form onSubmit={handleUnlockBlueprint} className="w-full flex flex-col gap-3">
                                            <input 
                                                type="email" 
                                                placeholder="founder@unicorn.com" 
                                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingEmail || !email.trim()}
                                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                                            >
                                                {isSubmittingEmail ? <Spinner size={20} className="animate-spin" /> : 'Unlock Blueprint'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-400 text-sm font-mono bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30 relative z-20">
                            Error: {error}
                        </div>
                    )}

                    {result && (
                        <div className="w-full max-w-4xl mt-12 flex flex-col items-center animate-fade-in-up">
                            <div className="w-full text-left mb-6 flex items-center gap-2 text-cyan-400">
                                <div className="h-px bg-cyan-500/30 flex-1"></div>
                                <span className="uppercase tracking-widest text-xs font-bold">Optimized Architecture Generated</span>
                                <div className="h-px bg-cyan-500/30 flex-1"></div>
                            </div>

                            {/* We reuse the BlueprintCard to display the custom payload */}
                            <div className="w-full mb-8 text-left">
                                <BlueprintCard intent="custom_generated" blueprint={result} />
                            </div>

                            {currentTier === 'standard' && (
                                <ArbitragePremiumCTA 
                                    queryText={query}
                                />
                            )}

                            <div className="w-full mb-12 text-left bg-gradient-to-br from-zinc-900/80 to-black p-8 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkle size={20} className="text-cyan-400" />
                                    Architectural Breakdown
                                </h4>
                                <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                                    <p>
                                        Our Intelligence Engine has mathematically mapped your intent into a highly-optimized micro-service topology. By isolating the distinct components, this architecture prevents model bloat and explicitly bypasses expensive generalized models in favor of cheap, hyper-specialized extraction steps.
                                    </p>
                                    <p>
                                        The <span className="font-mono text-cyan-400">Custom Blueprint</span> above provides the absolute minimal set of functional nodes required to build your system at scale, aligning each responsibility with the numerically highest <strong className="text-white">ELO</strong> models currently available across all global cloud providers.
                                    </p>
                                </div>
                            </div>

                            {/* TESTING OVERRIDE: Temporarily disabled the $499 Fractional CTO Upsell for MEGA tier. We just show the standard download button blocks for QA testing. */}
                            {true && (
                                <div className="flex flex-col items-center gap-4 bg-zinc-900/80 p-6 sm:p-8 rounded-2xl border border-cyan-500/20 w-full relative overflow-hidden mb-8 shadow-[0_0_30px_rgba(0,229,255,0.05)] text-center group transition-colors hover:bg-black/60">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] z-0 pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-500"></div>
                                    <h3 className="text-xl font-bold relative z-10 leading-tight flex items-center gap-2 group-hover:-translate-y-1 transition-transform">
                                        <Terminal className="text-cyan-400" weight="bold" /> Ready to Deploy this Architecture?
                                    </h3>
                                    <p className="text-zinc-400 text-sm max-w-md relative z-10 group-hover:-translate-y-1 transition-transform">
                                        {tier === 'MEDIUM'
                                            ? "The Golden Boilerplate provides the entire API orchestration layer for this system. You will only need to wire your custom backend and UI components yourself."
                                            : "Get a fully-configured Next.js App Router Next.js codebase with this exact architecture pre-wired out of the box."}
                                    </p>

                                    <div className="relative z-10 w-full flex flex-col items-center mt-2 group-hover:scale-105 transition-transform duration-300">
                                        <DownloadBlueprintButton blueprint={result} />
                                        <span className="text-zinc-500 font-bold block pt-4 pb-1 text-[10px] italic tracking-widest uppercase opacity-70">
                                            — OR —
                                        </span>
                                        <DownloadAgentButton blueprint={result} prdText={prdText} />
                                    </div>
                                    <span className="mt-4 text-[10px] text-zinc-500 uppercase tracking-widest font-mono relative z-10">
                                        Test Mode: Free Bypass Active
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
