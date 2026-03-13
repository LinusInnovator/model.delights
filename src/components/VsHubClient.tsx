"use client";

import React, { useState } from 'react';
import { Model } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowsLeftRight, Lightning } from '@phosphor-icons/react';
import Link from 'next/link';

export default function VsHubClient({ models }: { models: Model[] }) {
    const router = useRouter();
    
    // Sort models primarily by ELO to show best models first in the dropdowns
    const sortedModels = [...models].sort((a, b) => (b.elo || 0) - (a.elo || 0));

    // Default to the flagship battle
    const [modelA, setModelA] = useState(sortedModels.find(m => m.id === 'openai/gpt-4o')?.id || sortedModels[0]?.id || '');
    const [modelB, setModelB] = useState(sortedModels.find(m => m.id === 'anthropic/claude-3.5-sonnet')?.id || sortedModels[1]?.id || '');

    const handleCompare = () => {
        if (!modelA || !modelB) return;
        const slugA = encodeURIComponent(modelA.replaceAll('/', '__'));
        const slugB = encodeURIComponent(modelB.replaceAll('/', '__'));
        router.push(`/vs/${slugA}/${slugB}`);
    };

    const handleSwap = () => {
        const temp = modelA;
        setModelA(modelB);
        setModelB(temp);
    };

    // Pre-computed popular battles
    const popularBattles = [
        { a: 'openai/o1', b: 'openai/gpt-4o', title: 'The OpenAI Flagships', desc: 'Reasoning vs Speed' },
        { a: 'anthropic/claude-3.5-sonnet', b: 'openai/gpt-4o', title: 'The Heavyweights', desc: 'The defining battle of the current generation' },
        { a: 'meta-llama/llama-3.1-405b-instruct', b: 'openai/gpt-4o', title: 'Open vs Closed', desc: 'The largest open-weights model takes on the king' },
        { a: 'google/gemini-1.5-pro', b: 'anthropic/claude-3.5-sonnet', title: 'The Context Kings', desc: 'Massive context windows go head-to-head' },
        { a: 'openai/gpt-4o-mini', b: 'anthropic/claude-3-haiku', title: 'The Speed Demons', desc: 'Fast, cheap, and capable drafting models' },
        { a: 'mistralai/mixtral-8x22b-instruct', b: 'meta-llama/llama-3-70b-instruct', title: 'The Open Source Mid-Weights', desc: 'Highly efficient self-hostable models' }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 pb-20">
            
            {/* The Engine Selector */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col items-center shadow-2xl">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full opacity-50 pointer-events-none"></div>

                <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-4 tracking-tight relative z-10">
                    The Setup
                </h2>
                <p className="text-zinc-400 text-center text-lg max-w-xl mx-auto mb-10 relative z-10">
                    Select any two models from the intelligence directory to pit them head-to-head on pricing, context, and capabilities.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl relative z-10">
                    
                    {/* Model A Selector */}
                    <div className="w-full flex-1 flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2">Challenger A</label>
                        <div className="relative">
                            <select 
                                value={modelA} 
                                onChange={(e) => setModelA(e.target.value)}
                                className="w-full appearance-none bg-zinc-950 border border-zinc-700/50 hover:border-cyan-500/50 focus:border-cyan-500 text-white text-lg font-semibold rounded-2xl py-5 pl-5 pr-12 outline-none transition-all shadow-inner focus:ring-4 focus:ring-cyan-500/10"
                            >
                                {sortedModels.map(m => (
                                    <option key={`a-${m.id}`} value={m.id}>
                                        {m.name} {m.elo ? `(ELO: ${m.elo})` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <button 
                        onClick={handleSwap}
                        className="mt-6 p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-white/5 active:scale-95 group"
                        title="Swap models"
                    >
                        <ArrowsLeftRight weight="bold" size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>

                    {/* Model B Selector */}
                    <div className="w-full flex-1 flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 text-right md:text-left">Challenger B</label>
                        <div className="relative">
                            <select 
                                value={modelB} 
                                onChange={(e) => setModelB(e.target.value)}
                                className="w-full appearance-none bg-zinc-950 border border-zinc-700/50 hover:border-purple-500/50 focus:border-purple-500 text-white text-lg font-semibold rounded-2xl py-5 pl-5 pr-12 outline-none transition-all shadow-inner focus:ring-4 focus:ring-purple-500/10"
                            >
                                {sortedModels.map(m => (
                                    <option key={`b-${m.id}`} value={m.id}>
                                        {m.name} {m.elo ? `(ELO: ${m.elo})` : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                ▼
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-10 relative z-10 w-full max-w-sm">
                    <button 
                        onClick={handleCompare}
                        className="w-full p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 pb-1 via-blue-500 to-purple-500 shadow-[0_0_30px_rgba(0,255,255,0.2)] hover:shadow-[0_0_50px_rgba(0,255,255,0.4)] transition-all hover:-translate-y-1 active:scale-[0.98] group"
                    >
                        <div className="w-full bg-zinc-950 group-hover:bg-zinc-900 transition-colors rounded-2xl py-4 flex items-center justify-center gap-3">
                            <Lightning weight="fill" className="text-cyan-400 group-hover:text-yellow-400 transition-colors" size={24} />
                            <span className="text-white font-bold text-lg tracking-wide uppercase">Ignite Comparison</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Trending Battles Grid */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2">
                    <h3 className="text-2xl font-bold text-white">Trending Battles</h3>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularBattles.map((battle, idx) => {
                        const slugA = encodeURIComponent(battle.a.replaceAll('/', '__'));
                        const slugB = encodeURIComponent(battle.b.replaceAll('/', '__'));
                        
                        // Find the actual names for display if available, fallback to short IDs
                        const getShortName = (id: string) => {
                            const m = models.find(mod => mod.id === id);
                            if (m && m.name) return m.name.replace('Anthropic: ', '').replace('OpenAI: ', '').replace('Meta: ', '').replace('Google: ', '');
                            return id.split('/').pop() || id;
                        };

                        const nameA = getShortName(battle.a);
                        const nameB = getShortName(battle.b);

                        return (
                            <Link 
                                href={`/vs/${slugA}/${slugB}`} 
                                key={idx}
                                className="bg-zinc-900 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10 flex flex-col gap-4 group"
                            >
                                <div className="flex flex-col">
                                    <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{battle.title}</h4>
                                    <p className="text-zinc-500 text-sm font-medium">{battle.desc}</p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                    <span className="text-zinc-300 font-semibold text-sm truncate max-w-[40%]">{nameA}</span>
                                    <span className="text-zinc-600 text-xs font-black italic px-2">VS</span>
                                    <span className="text-zinc-300 font-semibold text-sm text-right truncate max-w-[40%]">{nameB}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
