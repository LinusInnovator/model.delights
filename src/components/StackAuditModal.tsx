"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingDown, ShieldCheck, ArrowRight, X, Copy, Check, Search } from 'lucide-react';
import { Model } from '@/lib/api';

export interface ModelProfile {
    id: string;
    name: string;
    promptPrice: number;     // per 1M
    completionPrice: number; // per 1M
    typicalRole: string;
    provider?: string;
}

// 2026 Modern Frontier Benchmarks (Fallback if live models are loading)
const DEFAULT_BENCHMARK_MODELS: ModelProfile[] = [
    { id: 'openai/gpt-5.6-luna-pro', name: 'OpenAI GPT-5.6 Luna Pro', promptPrice: 2.00, completionPrice: 12.00, typicalRole: 'Frontier Flagship', provider: 'openai' },
    { id: 'anthropic/claude-fable-5.1', name: 'Claude Fable 5.1', promptPrice: 10.00, completionPrice: 50.00, typicalRole: 'Frontier Reasoning', provider: 'anthropic' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', promptPrice: 3.00, completionPrice: 15.00, typicalRole: 'Coding & Agentic', provider: 'anthropic' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', promptPrice: 0.55, completionPrice: 2.19, typicalRole: 'Deep Reasoning', provider: 'deepseek' },
    { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o', promptPrice: 2.50, completionPrice: 10.00, typicalRole: 'General Flagship', provider: 'openai' },
    { id: 'google/gemini-3.8-flash', name: 'Gemini 3.8 Flash', promptPrice: 0.75, completionPrice: 3.75, typicalRole: 'Fast Multimodal', provider: 'google' },
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
    models?: Model[];
}

export function StackAuditModal({ isOpen, onClose, models = [] }: StackAuditModalProps) {
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [monthlyTokens, setMonthlyTokens] = useState<number>(50_000_000);
    const [cacheRate, setCacheRate] = useState<number>(50); // 50% cache hit rate
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Dynamically derive top frontier & popular models from the live matrix
    const dynamicBenchmarkModels = useMemo(() => {
        if (!models || models.length === 0) return DEFAULT_BENCHMARK_MODELS;

        // Filter out batch endpoints & free tiers
        const validModels = models.filter(m => !m.id.includes(':batch') && !m.id.includes('-batch'));

        // Target modern flagship identifiers
        const priorityPatterns = [
            /claude-fable-5/i,
            /claude-3\.7-sonnet/i,
            /claude-3\.5-sonnet/i,
            /gpt-5\.6-luna/i,
            /gpt-5\.5/i,
            /gpt-4o$/i,
            /deepseek-r1/i,
            /gemini-3\.8-flash/i,
            /gemini-2\.5-pro/i,
            /o3-mini/i,
            /o1$/i
        ];

        const matched: ModelProfile[] = [];
        for (const pattern of priorityPatterns) {
            const found = validModels.find(m => pattern.test(m.id) || pattern.test(m.name));
            if (found && !matched.some(x => x.id === found.id)) {
                matched.push({
                    id: found.id,
                    name: found.name || found.id,
                    promptPrice: found.pricing_per_1m?.prompt ?? 2.5,
                    completionPrice: found.pricing_per_1m?.completion ?? 10.0,
                    typicalRole: found.id.includes('r1') || found.id.includes('o1') || found.id.includes('o3') ? 'Deep Reasoning' : (found.id.includes('claude') ? 'Coding & Agentic' : 'Frontier Flagship'),
                    provider: found.id.split('/')[0]
                });
            }
        }

        if (matched.length >= 4) {
            return matched.slice(0, 6);
        }

        // Fallback: top models by ELO that have non-zero pricing
        const topByElo = [...validModels]
            .filter(m => (m.pricing_per_1m?.prompt || 0) + (m.pricing_per_1m?.completion || 0) > 1.0)
            .sort((a, b) => (b.elo || 0) - (a.elo || 0))
            .slice(0, 6)
            .map(m => ({
                id: m.id,
                name: m.name || m.id,
                promptPrice: m.pricing_per_1m.prompt,
                completionPrice: m.pricing_per_1m.completion,
                typicalRole: m.use_cases?.[0] || 'Frontier Flagship',
                provider: m.id.split('/')[0]
            }));

        return topByElo.length > 0 ? topByElo : DEFAULT_BENCHMARK_MODELS;
    }, [models]);

    // Active selected model
    const currentModel: ModelProfile = useMemo(() => {
        const activeId = selectedModelId || dynamicBenchmarkModels[0]?.id;
        
        // 1. Check in dynamic benchmarks
        const inBenchmarks = dynamicBenchmarkModels.find(m => m.id === activeId);
        if (inBenchmarks) return inBenchmarks;

        // 2. Check in all live models
        const inLive = (models || []).find(m => m.id === activeId);
        if (inLive) {
            return {
                id: inLive.id,
                name: inLive.name || inLive.id,
                promptPrice: inLive.pricing_per_1m?.prompt ?? 2.0,
                completionPrice: inLive.pricing_per_1m?.completion ?? 8.0,
                typicalRole: inLive.use_cases?.[0] || 'Custom Model',
                provider: inLive.id.split('/')[0]
            };
        }

        return dynamicBenchmarkModels[0] || DEFAULT_BENCHMARK_MODELS[0];
    }, [dynamicBenchmarkModels, models, selectedModelId]);

    // Filtered search results for searching 400+ models
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !models.length) return [];
        const q = searchQuery.toLowerCase().trim();
        return models
            .filter(m => !m.id.includes(':batch') && (m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)))
            .slice(0, 8);
    }, [models, searchQuery]);

    if (!isOpen) return null;

    // Workload breakdown: 75% input, 25% output
    const inputTokens = monthlyTokens * 0.75;
    const outputTokens = monthlyTokens * 0.25;

    // Current unrouted spend (no dynamic caching, static model selection)
    const currentMonthlySpend = ((inputTokens / 1_000_000) * currentModel.promptPrice) +
                                ((outputTokens / 1_000_000) * currentModel.completionPrice);

    // Snell Dynamic Routing:
    // Routes ~70% of standard tasks to smart-value models with prompt cache discount
    // Routes ~30% hard reasoning to flagship with caching
    const smartValueInputPrice = 0.075 * (1 - (cacheRate / 100) * 0.8);
    const smartValueOutputPrice = 0.30;
    const smartValuePortion = 0.70;

    const flagshipInputPrice = currentModel.promptPrice * (1 - (cacheRate / 100) * 0.5);
    const flagshipOutputPrice = currentModel.completionPrice;
    const flagshipPortion = 0.30;

    const snellMonthlySpend = (
        (((inputTokens * smartValuePortion) / 1_000_000) * smartValueInputPrice) +
        (((outputTokens * smartValuePortion) / 1_000_000) * smartValueOutputPrice) +
        (((inputTokens * flagshipPortion) / 1_000_000) * flagshipInputPrice) +
        (((outputTokens * flagshipPortion) / 1_000_000) * flagshipOutputPrice)
    );

    const monthlySavings = Math.max(0, currentMonthlySpend - snellMonthlySpend);
    const annualSavings = monthlySavings * 12;
    const savingsPercent = currentMonthlySpend > 0 ? Math.round((monthlySavings / currentMonthlySpend) * 100) : 0;

    const copyQuickSnippet = () => {
        const snippet = `from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://model.delights.pro/api/v1",\n    api_key=os.environ.get("SNELL_API_KEY")\n)\n\n# Autonomous dynamic routing with zero quality drop\nresponse = client.chat.completions.create(\n    model="snell/auto",\n    messages=[{"role": "user", "content": "Analyze system..."}]\n)`;
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
                        Find out how much your startup or engineering team burns by sending un-routed prompts to static flagship models.
                    </p>
                </div>

                {/* Step 1: Dynamic Model Selection */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#8a8f98]">
                            1. What is your primary model today?
                        </label>
                        <span className="text-[11px] text-[#27a644] font-mono">
                            Live 2026 Matrix
                        </span>
                    </div>

                    {/* Quick-select chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {dynamicBenchmarkModels.map(m => {
                            const isSelected = currentModel.id === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setSelectedModelId(m.id);
                                        setIsSearchOpen(false);
                                    }}
                                    className={`p-3 rounded-lg border text-left transition-all ${
                                        isSelected
                                            ? 'bg-[#18191a] border-[#5e6ad2] text-[#f7f8f8] ring-1 ring-[#5e6ad2]/30'
                                            : 'bg-[#141516] border-[#23252a] text-[#8a8f98] hover:border-[#34343a] hover:text-[#d0d6e0]'
                                    }`}
                                >
                                    <div className="text-xs font-medium leading-tight truncate">{m.name}</div>
                                    <div className="text-[10px] text-[#8a8f98] mt-1 font-mono">
                                        ${m.promptPrice.toFixed(2)} / ${m.completionPrice.toFixed(2)} per 1M
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search from 400+ Live Models Combobox */}
                    <div className="relative">
                        <div className="flex items-center gap-2 bg-[#141516] border border-[#23252a] rounded-lg px-3 py-2 focus-within:border-[#5e6ad2] transition-colors">
                            <Search size={14} className="text-[#8a8f98]" />
                            <input
                                type="text"
                                placeholder="Or search 420+ live models in our matrix (e.g. Llama, Mistral, Qwen)..."
                                value={searchQuery}
                                onFocus={() => setIsSearchOpen(true)}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                className="bg-transparent text-xs text-[#f7f8f8] placeholder-[#62666d] outline-none w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="text-[#8a8f98] hover:text-[#f7f8f8]">
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown Results */}
                        {isSearchOpen && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#141516] border border-[#23252a] rounded-lg shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#23252a]/40">
                                {searchResults.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedModelId(m.id);
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-full p-2.5 text-left hover:bg-[#18191a] transition-colors flex items-center justify-between gap-2"
                                    >
                                        <div className="truncate">
                                            <div className="text-xs font-medium text-[#f7f8f8] truncate">{m.name}</div>
                                            <div className="text-[10px] text-[#8a8f98] font-mono">{m.id}</div>
                                        </div>
                                        <div className="text-right text-[11px] font-mono text-[#27a644] whitespace-nowrap">
                                            ${(m.pricing_per_1m?.prompt || 0).toFixed(2)} / ${(m.pricing_per_1m?.completion || 0).toFixed(2)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
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
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-[#8a8f98]">Un-Routed Spend</span>
                                <span className="text-[9px] bg-[#23252a] text-[#8a8f98] px-1.5 py-0.5 rounded font-mono truncate max-w-[90px]">{currentModel.id.split('/')[1] || currentModel.id}</span>
                            </div>
                            <span className="text-2xl font-semibold text-[#f87171] font-mono tabular-nums">
                                ${Math.round(currentMonthlySpend).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-[#8a8f98] block mt-1">/ month</span>
                        </div>

                        <div className="bg-[#0f1011] border border-[#23252a] rounded-lg p-4">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#d0d6e0] block mb-1">With Snell Gateway</span>
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
                        <span>{copied ? 'Code Snippet Copied!' : 'Copy Drop-In Snippet'}</span>
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
