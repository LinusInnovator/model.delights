"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BlueprintCard from '@/components/BlueprintCard';

export default function ArchitectPage() {
    const [blueprints, setBlueprints] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                // First fetch the catalog to get all intents
                const catalogRes = await fetch('/api/v1/blueprint');
                const catalog = await catalogRes.json();

                if (catalog.available_intents) {
                    const fetchedBlueprints: any = {};
                    // Fetch each intent specifically to get its full stack payload
                    for (const intent of catalog.available_intents) {
                        const res = await fetch(`/api/v1/blueprint?intent=${intent}`);
                        if (res.ok) {
                            fetchedBlueprints[intent] = await res.json();
                        }
                    }
                    setBlueprints(fetchedBlueprints);
                }
            } catch (error) {
                console.error("Failed to load blueprints", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlueprints();
    }, []);

    return (
        <main className="min-h-screen p-4 sm:p-8 md:p-12 max-w-7xl mx-auto flex flex-col font-sans -mt-4 sm:mt-0 relative overflow-hidden">
            <header className="mb-4 sm:mb-8 md:mb-12 pointer-events-none relative z-10 flex justify-between items-center">
                <Link href="/" className="pointer-events-auto">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl tracking-tighter cursor-pointer" style={{ color: '#FFFFFF', letterSpacing: '-0.04em', fontWeight: 600 }}>
                        model.delights<span className="text-fuchsia-500 font-normal">/architect</span>
                    </h1>
                </Link>
                <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors pointer-events-auto border border-white/10 px-4 py-2 rounded-sm bg-black/50">
                    &larr; Back to Single Models
                </Link>
            </header>

            <div className="mb-8 md:mb-12 border-l border-fuchsia-500/40 pl-4 py-1 z-10 relative pointer-events-none">
                <p className="text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                    <strong className="text-white font-medium">The Discovery Engine Blueprint.</strong> These are fully optimized, multi-modal application stacks across OpenRouter, Fal, Replicate, and others. We supply the intelligence map so you can run the leanest architecture possible without middleware lock-in.
                </p>
            </div>

            <div className="flex-grow z-10 relative">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max pointer-events-none">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white/5 h-[150px] border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-max pointer-events-none">
                        {blueprints && Object.keys(blueprints).map(intent => (
                            <div key={intent} className="pointer-events-auto">
                                <BlueprintCard intent={intent} blueprint={blueprints[intent]} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="mt-8 sm:mt-12 md:mt-16 text-xs text-zinc-600 font-mono tracking-tight pointer-events-none z-10 relative flex justify-between items-center pb-4 border-t border-white/5 pt-4">
                <p>AUTOMAGIC_DISCOVERY_ENGINE // v1.1.0</p>
            </footer>
        </main>
    );
}
