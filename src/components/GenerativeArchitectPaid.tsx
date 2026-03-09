"use client";

import React, { useState, useEffect } from "react";
import { Sparkle, Terminal, ArrowRight, CheckCircle, Spinner, Circle } from "@phosphor-icons/react";
import BlueprintCard from "./BlueprintCard";
import CheckoutButton from "../app/enterprise/CheckoutButton";
import DownloadBlueprintButton from "./DownloadBlueprintButton";
import TerminalSizzle from "./TerminalSizzle";

export default function GenerativeArchitectPaid() {
    const [query, setQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [tier, setTier] = useState<"SIMPLE" | "MEDIUM" | "MEGA" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isGenerating) {
            setLoadingStep(0);
        }
    }, [isGenerating]);

    const handleGenerate = async () => {
        if (!query.trim()) return;

        setIsGenerating(true);
        setError(null);
        setResult(null);
        setTier(null);
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

            // Enforce a minimum animation duration of ~6.5 seconds to match the terminal sizzle
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 6700));

            const [data] = await Promise.all([apiPromise, minTimePromise]);

            // Enter gratifying lock-in state
            setIsFinalizing(true);
            await new Promise(resolve => setTimeout(resolve, 1500));

            setResult(data.blueprint);
            setTier(data.tier || "SIMPLE");
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
                                <Terminal size={20} className="animate-pulse" weight="bold" />
                            ) : (
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" weight="bold" />
                            )}
                        </button>
                    </div>

                    {(isGenerating || isFinalizing) && (
                        <div className="w-full max-w-3xl mt-4 p-6 bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-4 shadow-inner min-h-[100px] overflow-hidden transition-all duration-500">
                            {isFinalizing ? (
                                <div className="flex flex-col items-center w-full">
                                    <TerminalSizzle isComplete={true} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full">
                                    <TerminalSizzle isComplete={false} />
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

                            {tier === 'MEGA' ? (
                                <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-black to-zinc-900 p-8 sm:p-10 rounded-2xl border border-orange-500/30 w-full relative overflow-hidden mb-8 shadow-[0_0_40px_rgba(249,115,22,0.1)] text-center">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>
                                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                        <span>Mega-Scale System Detected</span>
                                    </div>
                                    <h3 className="text-2xl font-bold relative z-10 leading-tight">
                                        This Architecture Requires <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Custom Infra</span>.
                                    </h3>
                                    <p className="text-zinc-400 text-sm max-w-xl mx-auto relative z-10 leading-relaxed">
                                        Your specifications outline an enterprise-scale distributed system. A standard Next.js monolithic boilerplate will severely bottleneck your workload. Do not try to duct-tape this together.
                                    </p>
                                    <p className="text-zinc-300 text-sm max-w-xl mx-auto relative z-10 mb-2">
                                        Let's discuss proper event-buses, vector scaling, and multi-tenant isolation.
                                    </p>

                                    <div className="relative z-10 w-full max-w-sm mt-4">
                                        <button className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl flex items-center justify-center transition-colors">
                                            Book Fractional CTO Deep Dive ($499)
                                        </button>
                                        <span className="block text-center text-xs text-zinc-500 mt-3 font-mono">1 Hour Consultation • Capacity Strictly Limited</span>
                                    </div>
                                </div>
                            ) : (
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

                                    <div className="relative z-10 w-full flex justify-center mt-2 group-hover:scale-105 transition-transform duration-300">
                                        <DownloadBlueprintButton blueprint={result} />
                                    </div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono relative z-10">
                                        One-time $49 Download
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
