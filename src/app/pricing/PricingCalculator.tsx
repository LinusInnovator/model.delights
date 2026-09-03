'use client';

import React, { useState } from 'react';

const BENCHMARKS = [
    { id: 'claude-fable', name: 'Anthropic: Claude Fable 5.1', prompt: 10.0, completion: 50.0 },
    { id: 'gpt-5.5-pro', name: 'OpenAI: GPT-5.5 Pro', prompt: 30.0, completion: 180.0 },
    { id: 'gpt-4o', name: 'OpenAI: GPT-4o', prompt: 2.50, completion: 10.00 },
    { id: 'deepseek-r1', name: 'DeepSeek: R1', prompt: 0.50, completion: 2.15 },
];

export default function PricingCalculator() {
    const [monthlyTokensMillions, setMonthlyTokensMillions] = useState<number>(50);
    const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('claude-fable');

    const selectedModel = BENCHMARKS.find(b => b.id === selectedBenchmarkId) || BENCHMARKS[0];

    // Compute costs based on standard 3:1 input-to-output ratio
    const promptTokens = (monthlyTokensMillions * 1_000_000) * 0.75;
    const completionTokens = (monthlyTokensMillions * 1_000_000) * 0.25;

    const unroutedCost = Math.round(
        (promptTokens / 1_000_000) * selectedModel.prompt +
        (completionTokens / 1_000_000) * selectedModel.completion
    );

    // Snell intelligently routes ~75% of volume to fast utilities ($0.35/1M blend)
    // and keeps 25% on flagships, yielding an average of ~72% savings
    const snellComputeCost = Math.round(unroutedCost * 0.28);
    const planCost = monthlyTokensMillions <= 50 ? 49 : 249;
    const totalSnellSpend = snellComputeCost + planCost;
    const netSavingsMonthly = Math.max(0, unroutedCost - totalSnellSpend);
    const netSavingsYearly = netSavingsMonthly * 12;
    const roiMultiplier = Math.round(netSavingsMonthly / planCost);

    return (
        <div className="w-full max-w-4xl mx-auto rounded-2xl bg-[#0e1013] border border-white/[0.08] p-7 md:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Left Controls */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                            1. What model are you un-routed on today?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {BENCHMARKS.map(b => (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedBenchmarkId(b.id)}
                                    className={`text-left p-3 rounded-lg text-xs font-medium border transition-all ${
                                        selectedBenchmarkId === b.id
                                            ? 'bg-violet-600/10 border-violet-500/60 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                                            : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                                    }`}
                                >
                                    <div className="font-semibold truncate">{b.name}</div>
                                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">${b.prompt} / ${b.completion} per 1M</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                                2. Monthly Inference Volume
                            </label>
                            <span className="text-xs font-bold text-violet-400 font-mono">
                                {monthlyTokensMillions}M tokens / month
                            </span>
                        </div>
                        <input 
                            type="range"
                            min="5"
                            max="500"
                            step="5"
                            value={monthlyTokensMillions}
                            onChange={(e) => setMonthlyTokensMillions(Number(e.target.value))}
                            className="w-full accent-violet-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                            <span>5M (Hacker)</span>
                            <span>50M (Pro)</span>
                            <span>250M</span>
                            <span>500M (Scale)</span>
                        </div>
                    </div>
                </div>

                {/* Right Results Breakdown */}
                <div className="rounded-xl bg-[#08090a] border border-white/[0.06] p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs pb-3 border-b border-white/[0.06]">
                            <span className="text-zinc-400">Current Un-Routed Monthly Bill</span>
                            <span className="font-mono text-red-400 font-semibold line-through decoration-red-500/50">
                                ${unroutedCost.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-3 border-b border-white/[0.06]">
                            <span className="text-zinc-400">With Snell Semantic Routing</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                                ${snellComputeCost.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-xs pb-3 border-b border-white/[0.06]">
                            <span className="text-zinc-400">Snell Plan Subscription</span>
                            <span className="font-mono text-zinc-300 font-semibold">
                                +${planCost}/mo ({monthlyTokensMillions <= 50 ? 'Pro' : 'Scale'})
                            </span>
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-white/[0.08]">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">
                                Net Retained Profit / Month
                            </span>
                            <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">
                                +${netSavingsMonthly.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-400">
                            <span>Retained Profit / Year</span>
                            <span className="font-mono text-white font-medium">
                                +${netSavingsYearly.toLocaleString()} / year
                            </span>
                        </div>
                        <div className="mt-3 text-[11px] text-zinc-500 font-mono text-right">
                            Immediate ROI: <span className="text-violet-400 font-bold">{roiMultiplier}x payback</span> on subscription
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
