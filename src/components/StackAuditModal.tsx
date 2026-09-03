"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingDown, ShieldCheck, ArrowRight, X, Copy, Check } from 'lucide-react';

interface ModelProfile {
    id: string;
    name: string;
    promptPrice: number;     // per 1M
    completionPrice: number; // per 1M
    typicalRole: string;
}

const BENCHMARK_MODELS: ModelProfile[] = [
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o', promptPrice: 2.50, completionPrice: 10.00, typicalRole: 'General Flagship' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', promptPrice: 3.00, completionPrice: 15.00, typicalRole: 'Agentic & Coding' },
    { id: 'openai/o1', name: 'OpenAI o1 (Full Reasoning)', promptPrice: 15.00, completionPrice: 60.00, typicalRole: 'Deep Reasoning' },
    { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', promptPrice: 15.00, completionPrice: 75.00, typicalRole: 'Heavy Analytical' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', promptPrice: 1.25, completionPrice: 5.00, typicalRole: 'Large Context' },
];

const VOLUME_PRESETS = [
    { label: '10M Tokens', tokens: 10_000_000, desc: 'Early MVP (~100 daily users)' },
    { label: '50M Tokens', tokens: 50_000_000, desc: 'Growing Startup (~1k daily users)' },
    { label: '250M Tokens', tokens: 250_000_000, desc: 'Scale-Up / Agentic Pipeline' },
    { label: '1 Billion Tokens', tokens: 1_000_000_000, desc: 'Enterprise High-Volume' },
];

interface StackAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StackAuditModal({ isOpen, onClose }: StackAuditModalProps) {
    const [selectedModelId, setSelectedModelId] = useState<string>('openai/gpt-4o');
    const [monthlyTokens, setMonthlyTokens] = useState<number>(50_000_000);
    const [cacheRate, setCacheRate] = useState<number>(50); // 50% cache hit rate
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const currentModel = BENCHMARK_MODELS.find(m => m.id === selectedModelId) || BENCHMARK_MODELS[0];

    // Workload breakdown: 75% input, 25% output
    const inputTokens = monthlyTokens * 0.75;
    const outputTokens = monthlyTokens * 0.25;

    // Current unrouted spend (no dynamic caching, static model selection)
    const currentMonthlySpend = ((inputTokens / 1_000_000) * currentModel.promptPrice) +
                                ((outputTokens / 1_000_000) * currentModel.completionPrice);

    // Snell Dynamic Routing:
    // Routes ~70% of standard tasks to smart-value models with 75% prompt cache discount (e.g. Gemini 2.5 Flash @ $0.075 input, $0.30 output)
    // Routes ~30% hard reasoning to flagship with caching
    const smartValueInputPrice = 0.075 * (1 - (cacheRate / 100) * 0.8);
    const smartValueOutputPrice = 0.30;
    const smartValuePortion = 0.70;

    const flagshipInputPrice = currentModel.promptPrice * (1 - (cacheRate / 100) * 0.5);
    const flagshipOutputPrice = currentModel.completionPrice;
    const flagshipPortion = 0.30;

    const snellMonthlySpend = (
        // Smart value 70%
        (((inputTokens * smartValuePortion) / 1_000_000) * smartValueInputPrice) +
        (((outputTokens * smartValuePortion) / 1_000_000) * smartValueOutputPrice) +
        // Flagship hard reasoning 30%
        (((inputTokens * flagshipPortion) / 1_000_000) * flagshipInputPrice) +
        (((outputTokens * flagshipPortion) / 1_000_000) * flagshipOutputPrice)
    );

    const monthlySavings = Math.max(0, currentMonthlySpend - snellMonthlySpend);
    const annualSavings = monthlySavings * 12;
    const savingsPercent = currentMonthlySpend > 0 ? Math.round((monthlySavings / currentMonthlySpend) * 100) : 0;

    const copyQuickSnippet = () => {
        const snippet = `import { IntelligenceRouter } from 'model-delights-snell';\n\nconst router = new IntelligenceRouter({ apiKey: process.env.SNELL_API_KEY });\n\n// Autonomous dynamic routing with zero quality drop\nconst res = await router.execute({\n    openrouterKey: process.env.OPENROUTER_API_KEY,\n    messages: [{ role: 'user', content: prompt }],\n    config: { intent: 'agentic', policy: 'max_savings' }\n});`;
        navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-[#0f1011] border border-[#23252a] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-left">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-lg bg-[#141516] hover:bg-[#18191a] border border-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141516] border border-[#23252a] text-[#27a644] text-xs font-medium uppercase tracking-wider mb-3">
                        <Sparkles size={13} />
                        <span>Instant Stack FinOps Audit</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#f7f8f8] tracking-tight">
                        Calculate Your Model Overpayment
                    </h2>
                    <p className="text-sm text-[#8a8f98] mt-1.5">
                        Find out how much your startup or team is burning by sending un-routed requests to generic flagship models.
                    </p>
                </div>

                {/* Step 1: Model Selection */}
                <div className="mb-6">
                    <label className="text-xs font-medium uppercase tracking-wider text-[#8a8f98] block mb-2">
                        1. What is your primary model today?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BENCHMARK_MODELS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedModelId(m.id)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    selectedModelId === m.id
                                        ? 'bg-[#18191a] border-[#5e6ad2] text-[#f7f8f8]'
                                        : 'bg-[#141516] border-[#23252a] text-[#8a8f98] hover:border-[#34343a] hover:text-[#d0d6e0]'
                                }`}
                            >
                                <div className="text-xs font-medium leading-tight">{m.name}</div>
                                <div className="text-[10px] text-[#8a8f98] mt-1 font-mono">${m.promptPrice}/${m.completionPrice} per 1M</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Volume Selection */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#8a8f98]">
                            2. Monthly Token Inference Volume
                        </label>
                        <span className="text-xs font-mono font-medium text-[#5e6ad2]">
                            {(monthlyTokens / 1_000_000).toLocaleString()}M tokens/mo
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {VOLUME_PRESETS.map(p => (
                            <button
                                key={p.tokens}
                                onClick={() => setMonthlyTokens(p.tokens)}
                                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                                    monthlyTokens === p.tokens
                                        ? 'bg-[#18191a] text-[#f7f8f8] border-[#5e6ad2]'
                                        : 'bg-[#141516] border-[#23252a] text-[#8a8f98] hover:border-[#34343a] hover:text-[#d0d6e0]'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Prompt Cache Hit Slider */}
                    <div className="bg-[#141516] border border-[#23252a] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-xs font-medium text-[#d0d6e0] block">Prompt Prefix Cache Hit Rate</span>
                            <span className="text-[10px] text-[#8a8f98]">Repeated system prompts, RAG search context, tools schema</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-48">
                            <input 
                                type="range" 
                                min="0" 
                                max="80" 
                                step="5"
                                value={cacheRate}
                                onChange={(e) => setCacheRate(Number(e.target.value))}
                                className="w-full accent-[#5e6ad2] h-1.5 bg-[#18191a] rounded-lg cursor-pointer"
                            />
                            <span className="text-xs font-mono font-medium text-[#27a644] w-10 text-right">{cacheRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Audit Results Card */}
                <div className="bg-[#141516] border border-[#23252a] rounded-xl p-5 sm:p-6 mb-6 shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#0f1011] border border-[#23252a] rounded-lg p-4">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#8a8f98] block mb-1">Current Un-Routed Cost</span>
                            <span className="text-2xl font-semibold text-[#f87171] font-mono tabular-nums">
                                ${Math.round(currentMonthlySpend).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[#8a8f98] block mt-1">/ month</span>
                        </div>

                        <div className="bg-[#0f1011] border border-[#23252a] rounded-lg p-4">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#d0d6e0] block mb-1">With Snell Dynamic Route</span>
                            <span className="text-2xl font-semibold text-[#27a644] font-mono tabular-nums">
                                ${Math.round(snellMonthlySpend).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[#8a8f98] block mt-1">/ month</span>
                        </div>

                        <div className="bg-[#18191a] border border-[#23252a] rounded-lg p-4 flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 text-[#27a644] font-medium text-xs uppercase tracking-wider mb-1">
                                <TrendingDown size={14} />
                                <span>{savingsPercent}% Immediate Savings</span>
                            </div>
                            <span className="text-3xl font-bold text-[#f7f8f8] font-mono tabular-nums">
                                +${Math.round(annualSavings).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#27a644] font-medium block mt-0.5">Retained Profit / Year</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#8a8f98] pt-3 border-t border-[#23252a]">
                        <div className="flex items-center gap-1.5 text-[#27a644]">
                            <ShieldCheck size={14} />
                            <span>Zero Quality Compromise: 100% ELO parity maintained</span>
                        </div>
                        <div>&bull;</div>
                        <div>
                            Sub-50ms automatic failover included
                        </div>
                    </div>
                </div>

                {/* Conversion CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <button
                        onClick={copyQuickSnippet}
                        className="px-4 py-2.5 rounded-lg border border-[#23252a] hover:border-[#34343a] bg-[#141516] text-[#d0d6e0] hover:text-[#f7f8f8] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        {copied ? <Check size={14} className="text-[#27a644]" /> : <Copy size={14} />}
                        <span>{copied ? 'Code Snippet Copied!' : 'Copy Drop-In Middleware'}</span>
                    </button>

                    <Link
                        href="/enterprise/dashboard"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg bg-[#5e6ad2] hover:bg-[#828fff] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <span>Claim Free Snell API Key & Cut Costs</span>
                        <ArrowRight size={15} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
