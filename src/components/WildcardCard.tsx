"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';

export default function WildcardCard() {
    const [intentData, setIntentData] = useState<any>(null);

    useEffect(() => {
        const fetchWildcard = async () => {
            try {
                // Fetch catalog
                const catalogRes = await fetch('/api/v1/blueprint');
                const catalog = await catalogRes.json();

                if (catalog.available_intents && catalog.available_intents.length > 0) {
                    // Pick a random intent to promote
                    const randomIntent = catalog.available_intents[Math.floor(Math.random() * catalog.available_intents.length)];
                    const res = await fetch(`/api/v1/blueprint?intent=${randomIntent}`);
                    if (res.ok) {
                        setIntentData(await res.json());
                    }
                }
            } catch (error) {
                console.error("Failed to load wildcard promo", error);
            }
        };
        fetchWildcard();
    }, []);

    if (!intentData) return (
        <div className="flex flex-col h-full rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 overflow-hidden relative animate-pulse" style={{ minHeight: '350px' }}></div>
    );

    return (
        <Link href={`/super-architect?idea=${encodeURIComponent('I want to build a ' + intentData.name)}`} className="block relative h-full transition-transform hover:-translate-y-1 duration-300 pointer-events-auto group">
            <div className="model-card flex flex-col justify-between h-full border border-fuchsia-500/40 hover:border-fuchsia-500/80 bg-gradient-to-br from-[#12001A] to-[#1F002E] rounded-2xl overflow-hidden relative text-center pb-8 pt-10 px-6 sm:px-8 shadow-[0_0_20px_rgba(217,70,239,0.15)] group-hover:shadow-[0_10px_30px_rgba(217,70,239,0.3)] transition-all duration-500" style={{ minHeight: '350px' }}>
                
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform group-hover:scale-125 duration-700" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 mb-8 mt-2">
                    <span className="bg-gradient-to-r from-fuchsia-300 to-purple-300 text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.1em] shadow-[0_2px_15px_rgba(217,70,239,0.5)] inline-flex items-center">
                        <Sparkle weight="fill" className="mr-2" /> Wildcard Discovered
                    </span>
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-center mb-8">
                    <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-fuchsia-300 to-purple-300 text-transparent bg-clip-text leading-tight tracking-tight">
                        Skip the LLMs.
                    </h3>
                    <p className="text-zinc-300 text-base leading-relaxed max-w-[95%] mx-auto mb-2">
                        Building a <strong className="text-white font-bold">{intentData.name}</strong>?
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[90%] mx-auto">
                        The Discovery Engine found an optimized API stack that bypasses standard text reasoning limitations.
                    </p>
                </div>

                <div className="relative z-10 w-full mt-auto mb-2">
                    <div className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-[0_4px_20px_rgba(217,70,239,0.4)] group-hover:shadow-[0_6px_30px_rgba(217,70,239,0.6)] transition-all flex justify-center items-center gap-2 group-hover:-translate-y-1">
                        View Blueprint <ArrowRight weight="bold" size={18} />
                    </div>
                    {intentData.bleeding_edge_wildcard && (
                        <div className="mt-4 opacity-50 font-mono text-[10px] tracking-widest text-fuchsia-300 uppercase">
                            Node: {intentData.bleeding_edge_wildcard.id}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
