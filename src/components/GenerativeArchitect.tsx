"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, ArrowRight, CheckCircle2, Loader2, Circle } from "lucide-react";
import BlueprintCard from "./BlueprintCard";
import CheckoutButton from "../app/enterprise/CheckoutButton";
import DownloadBlueprintButton from "./DownloadBlueprintButton";

export default function GenerativeArchitect() {
    const [query, setQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadingPhrases = [
        "Deconstructing intent semantics...",
        "Topological mapping of available compute...",
        "Validating heuristic safety guardrails...",
        "Initializing cross-regional ELO weighting...",
        "Injecting dynamic price-arbitrage logic...",
        "Constructing deterministic fallback mesh...",
        "Securing zero-latency protocol channels...",
        "Compiling final routing matrix..."
    ];

    useEffect(() => {
        if (!isGenerating) {
            setLoadingStep(0);
            return;
        }

        const interval = setInterval(() => {
            setLoadingStep((prev) => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
        }, 700);

        return () => clearInterval(interval);
    }, [isGenerating]);

    const handleGenerate = async () => {
        if (!query.trim()) return;

        setIsGenerating(true);
        setError(null);
        setResult(null);
        setLoadingStep(0);
        setIsFinalizing(false);

        try {
            const apiPromise = fetch("/api/generate-blueprint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            }).then(async (res) => {
                if (!res.ok) throw new Error("Failed to generate architecture.");
                return res.json();
            });

            // Enforce a minimum animation duration of ~5.6 seconds (8 phrases * 700ms)
            const minTimePromise = new Promise(resolve => setTimeout(resolve, loadingPhrases.length * 700));

            const [data] = await Promise.all([apiPromise, minTimePromise]);

            // Enter gratifying lock-in state
            setIsFinalizing(true);
            await new Promise(resolve => setTimeout(resolve, 1500));

            setResult(data.blueprint);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsGenerating(false);
            setIsFinalizing(false);
        }
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
                            <Sparkles size={20} className="animate-pulse" />
                            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-50"></div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">The Generative Architect</h3>
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
                        <Sparkles size={14} />
                        <span>The Generative Architect</span>
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
                            disabled={isGenerating || isFinalizing}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGenerate();
                                }
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || isFinalizing || !query.trim()}
                            className="absolute bottom-4 right-4 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isGenerating || isFinalizing ? (
                                <Terminal size={20} className="animate-pulse" />
                            ) : (
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            )}
                        </button>
                    </div>

                    {(isGenerating || isFinalizing) && (
                        <div className="w-full max-w-3xl mt-4 p-6 bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-4 shadow-inner min-h-[100px] overflow-hidden transition-all duration-500">
                            {isFinalizing ? (
                                <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm sm:text-base uppercase tracking-widest animate-pulse transition-all duration-500" style={{ animation: 'fadeIn 0.5s ease backwards' }}>
                                    <CheckCircle2 size={24} className="drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                                    <span className="font-bold">Architecture Lock-in Confirmed</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 text-cyan-400 font-mono text-xs sm:text-sm uppercase tracking-widest w-full justify-center">
                                    <Loader2 size={20} className="animate-spin text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] min-w-[20px]" />
                                    <div className="relative h-6 flex items-center w-full max-w-md">
                                        <span key={loadingStep} className="absolute inset-x-0 text-center animate-fade-in-up drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] text-zinc-200">
                                            {loadingPhrases[loadingStep]}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-400 text-sm font-mono bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30">
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

                            <div className="flex flex-col items-center gap-4 bg-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-white/10 w-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[80px] z-0 pointer-events-none"></div>
                                <h3 className="text-xl font-bold relative z-10 z-[1] leading-tight text-center">
                                    Instantly Deploy this <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Zero-Latency Architecture</span>
                                </h3>
                                <p className="text-zinc-400 text-sm text-center max-w-md relative z-[1]">
                                    Stop duct-taping APIs together. Deploy the 0ms Intelligence Engine to automatically handle routing, fallbacks, and multi-provider billing for this exact stack.
                                </p>

                                <div className="relative z-[1] mt-2 mb-2 hover:scale-105 transition-transform duration-300">
                                    <CheckoutButton />
                                </div>
                                <div className="relative z-[1] mt-2 w-full flex justify-center">
                                    <DownloadBlueprintButton blueprint={result} />
                                </div>

                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono relative z-[1] mt-4">
                                    Custom Node.js Array Included
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
