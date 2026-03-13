"use client";

import React, { useState } from "react";
import { ShieldCheck, ArrowRight, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

export default function ValidatorGateway() {
    const [query, setQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRouting, setIsRouting] = useState(false);

    const handleValidate = () => {
        if (!query.trim()) return;
        
        setIsRouting(true);
        // Add a tiny bit of latency for the "value theater" / feeling of starting an engine
        setTimeout(() => {
            setIsRouting(false);
            const url = `/validate?idea=${encodeURIComponent(query)}`;
            window.open(url, '_blank');
        }, 600);
    };

    return (
        <div className={`relative w-full max-w-5xl mx-auto my-12 transition-all duration-500 rounded-2xl border ${isExpanded ? 'border-white/10' : 'border-indigo-500/30 hover:border-indigo-400/60 cursor-pointer'} overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] group`} style={{ animation: 'fadeIn 1s ease 0.6s backwards' }}>
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-black to-fuchsia-900/20 z-0 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'}`}></div>
            <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] z-0 pointer-events-none transition-transform duration-1000 ${isExpanded ? 'scale-100' : 'scale-50 animate-pulse'}`}></div>

            {!isExpanded ? (
                <div
                    className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between"
                    onClick={() => setIsExpanded(true)}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                            <ShieldCheck size={20} className="animate-pulse" weight="fill" />
                            <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping opacity-50"></div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">The 10x Validator</h3>
                            <p className="text-sm text-zinc-400">Before you build with models, validate your startup idea against our Executive Red Team.</p>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center text-indigo-400 text-sm font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                        <span>Initiate Reality Check</span>
                        <ArrowRight size={16} className="ml-2" />
                    </div>
                </div>
            ) : (
                <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center animate-fade-in-up">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        aria-label="Close Validator"
                    >
                        × Close
                    </button>

                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 pulse-border">
                        <ShieldCheck size={14} weight="bold" />
                        <span>The 10x Validator</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight tracking-tight">
                        What startup idea are you validating today?
                    </h2>
                    <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-2xl leading-relaxed">
                        Don't waste engineering hours building something nobody wants. Describe your application idea below. We'll triangulate the structural risks and growth vectors instantly.
                    </p>

                    <div className="w-full max-w-3xl relative mb-6">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. 'I want to build a B2B legal document analyzer that handles 100-page PDFs and cites specific contract clauses...'"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none min-h-[120px] shadow-inner transition-all duration-300"
                            disabled={isRouting}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleValidate();
                                }
                            }}
                        />
                        <button
                            onClick={handleValidate}
                            disabled={isRouting || !query.trim()}
                            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                            {isRouting ? (
                                <span className="animate-pulse font-bold tracking-wide">Initializing...</span>
                            ) : (
                                <>
                                    <span className="font-bold tracking-wide">Validate</span>
                                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" weight="bold" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Fear-Negating UX Text */}
                    <div className="w-full max-w-3xl flex items-center justify-center gap-3 text-xs sm:text-sm text-zinc-500 bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                        <MagnifyingGlass size={16} className="text-indigo-400" />
                        <span>
                            To prevent losing your place on the Directory, this will open the <strong className="text-zinc-300 font-medium">Validation Dashboard</strong> safely in a new tab.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
