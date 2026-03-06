"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
        <div className="flex flex-col h-full border border-fuchsia-500/5 bg-fuchsia-500/5 overflow-hidden relative animate-pulse" style={{ minHeight: '150px' }}></div>
    );

    return (
        <Link href="/architect" className="block relative h-full transition-transform hover:-translate-y-1 duration-300 pointer-events-auto">
            <div className="flex flex-col h-full border border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 overflow-hidden relative" style={{ minHeight: '150px' }}>

                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="p-4 sm:p-5 flex-grow flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-fuchsia-400 leading-tight">
                                Skip the LLMs.
                            </h3>
                        </div>
                        <span className="flex h-2 w-2 mt-1">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-fuchsia-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                        </span>
                    </div>

                    <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
                        Building a <strong className="text-white">{intentData.name}</strong>?
                    </p>

                    <p className="text-xs text-white/50 mb-4 leading-relaxed">
                        The Discovery Engine found an optimized API stack that bypasses standard text reasoning limitations.
                    </p>

                    <div className="mt-auto pt-4 border-t border-fuchsia-500/10">
                        {intentData.bleeding_edge_wildcard && (
                            <div className="mb-3">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-500/80 mb-1.5 block">Wildcard Discovered</span>
                                <span className="text-xs font-mono text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-1 rounded inline-block">
                                    {intentData.bleeding_edge_wildcard.id}
                                </span>
                            </div>
                        )}
                        <span className="text-sm font-medium text-fuchsia-400 flex items-center gap-2 group">
                            View Blueprint <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
