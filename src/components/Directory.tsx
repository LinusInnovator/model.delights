"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Model, FetchResult } from '@/lib/api';
import Filters from './Filters';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ModelCard from './ModelCard';
import PromoCard from './PromoCard';
import WildcardCard from './WildcardCard';
import ValidatorGateway from './ValidatorGateway';
import CompareTray from './CompareTray';
import { StackAuditModal } from './StackAuditModal';

const ParetoChart = dynamic(() => import('./ParetoChart'), { ssr: false });

export default function Directory({ initialData }: { initialData: FetchResult }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('elo-desc');
    const [activeUseCase, setActiveUseCase] = useState('all');
    const [activeModality, setActiveModality] = useState('text'); // Default to text for standard router capabilities
    const [isEloExpanded, setIsEloExpanded] = useState(false);

    // Advanced 2026 FinOps Task Presets
    const PRESETS = {
        'Agentic Code': { prompt: 15000, output: 2000, reqs: 1000, cache: 0.75, reasoning: 3.5 },
        'RAG Search': { prompt: 30000, output: 800, reqs: 10000, cache: 0.85, reasoning: 1 },
        'Chatbot': { prompt: 1500, output: 300, reqs: 50000, cache: 0.20, reasoning: 1 },
        'Start-up': { prompt: 1000, output: 500, reqs: 50000, cache: 0.50, reasoning: 1 },
        'Scale-up': { prompt: 2000, output: 1000, reqs: 500000, cache: 0.50, reasoning: 1 },
        'Viral': { prompt: 2500, output: 1000, reqs: 5000000, cache: 0.50, reasoning: 1 }
    };

    const [simPromptMs, setSimPromptMs] = useState(PRESETS['Start-up'].prompt);
    const [simOutputMs, setSimOutputMs] = useState(PRESETS['Start-up'].output);
    const [simReqs, setSimReqs] = useState(PRESETS['Start-up'].reqs);
    const [cacheHitRate, setCacheHitRate] = useState(0.50); // 50% cached default
    const [reasoningMultiplier, setReasoningMultiplier] = useState(1); // 1x normal, 3.5x extended, 6x deep

    const [budgetInput, setBudgetInput] = useState('');
    const [maxBudget, setMaxBudget] = useState<number | null>(null);

    const [isChartExpanded, setIsChartExpanded] = useState(true);
    const [showSurfaceUp, setShowSurfaceUp] = useState(false);

    // Multi-Model Pin-to-Compare State
    const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    const handleTogglePin = (id: string) => {
        setSelectedCompareIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(x => x !== id);
            }
            if (prev.length >= 4) {
                alert("You can compare up to 4 models simultaneously. Remove a model to add another.");
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleRemoveCompare = (id: string) => {
        setSelectedCompareIds(prev => prev.filter(x => x !== id));
    };

    const handleClearCompare = () => {
        setSelectedCompareIds([]);
    };

    const selectedCompareModels = useMemo(() => {
        return initialData.models.filter(m => selectedCompareIds.includes(m.id));
    }, [initialData.models, selectedCompareIds]);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past roughly the top sections + ~5 rows of cards
            if (window.scrollY > 1200) {
                setShowSurfaceUp(true);
            } else {
                setShowSurfaceUp(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredModels = useMemo(() => {
        let result = initialData.models;

        // Modality Filter
        if (activeModality !== 'all') {
            result = result.filter(m => m.modality_type === activeModality);
        }

        // Use Case Filter
        if (activeUseCase !== 'all') {
            result = result.filter(m => m.use_cases.includes(activeUseCase));
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.id.toLowerCase().includes(q) ||
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.description && m.description.toLowerCase().includes(q))
            );
        }

        // Budget Filter
        if (maxBudget !== null) {
            result = result.filter(m => {
                if (m.pricing_per_1m.prompt < 0 || m.pricing_per_1m.completion < 0) return false;
                const pTokens = simPromptMs / 1000000;
                let oTokens = simOutputMs / 1000000;
                if (m.operational_specs?.is_reasoning && reasoningMultiplier > 1) {
                    oTokens *= reasoningMultiplier;
                }

                const cachedPrice = m.pricing_per_1m.prompt_cached ?? m.pricing_per_1m.prompt;
                const effectivePrompt = (1 - cacheHitRate) * m.pricing_per_1m.prompt + cacheHitRate * cachedPrice;

                const pCost = pTokens * effectivePrompt * simReqs;
                const oCost = oTokens * m.pricing_per_1m.completion * simReqs;
                return (pCost + oCost) <= maxBudget;
            });
        }

        // Sort
        result.sort((a, b) => {
            const pA = a.pricing_per_1m.prompt;
            const pB = b.pricing_per_1m.prompt;
            const cA = a.context_length || 0;
            const cB = b.context_length || 0;
            const nameA = a.name || a.id;
            const nameB = b.name || b.id;
            const vA = a.value_score || 0;
            const vB = b.value_score || 0;
            const ageA = a.created || 0;
            const ageB = b.created || 0;

            switch (sortMode) {
                case 'elo-desc': return (b.elo || 0) - (a.elo || 0);
                case 'value-desc': return vB - vA;
                case 'aider-desc': return (b.benchmarks?.aider_pass_1 || 0) - (a.benchmarks?.aider_pass_1 || 0);
                case 'bfcl-desc': return (b.benchmarks?.bfcl_score || 0) - (a.benchmarks?.bfcl_score || 0);
                case 'cache-desc': return (b.prompt_cache_discount_pct || 0) - (a.prompt_cache_discount_pct || 0);
                case 'max-out-desc': return (b.operational_specs?.max_output_tokens || 0) - (a.operational_specs?.max_output_tokens || 0);
                case 'price-asc': return pA - pB;
                case 'price-desc': return pB - pA;
                case 'context-desc': return cB - cA;
                case 'age-desc': return ageB - ageA;
                case 'name-asc': return nameA.localeCompare(nameB);
                default: return 0;
            }
        });

        return result;
    }, [initialData.models, searchQuery, sortMode, activeUseCase, activeModality, maxBudget, simPromptMs, simOutputMs, simReqs, cacheHitRate, reasoningMultiplier]);

    // Format last updated
    const lastUpdatedTimestamp = initialData.last_updated
        ? initialData.last_updated * 1000
        : null;

    // Helper to find alternatives (Bulletproof Fallback & Cheaper Alts)
    const getModelRelations = (model: Model) => {
        if (!model.elo) return { fallbackModels: [model], cheaperModels: [] };

        const targetPrice = model.pricing_per_1m.prompt + model.pricing_per_1m.completion;

        // 1. Find Closest Peer (Uptime & Intelligence focus)
        const closestPeers = initialData.models.filter(m =>
            m.id !== model.id &&
            m.elo !== null &&
            m.context_length >= model.context_length &&
            Math.abs(m.elo - (model.elo as number)) <= 30 &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) <= (targetPrice * 1.20)
        ).sort((a, b) => Math.abs((a.elo as number) - (model.elo as number)) - Math.abs((b.elo as number) - (model.elo as number)));

        // 2. Find Frugal Fallback (Cost focus)
        const frugalOptions = initialData.models.filter(m =>
            m.id !== model.id &&
            m.elo !== null &&
            m.context_length >= model.context_length &&
            m.elo >= (model.elo as number) - 80 &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) < (targetPrice * 0.70)
        ).sort((a, b) => (a.pricing_per_1m.prompt + a.pricing_per_1m.completion) - (b.pricing_per_1m.prompt + b.pricing_per_1m.completion));

        const buildArray: Model[] = [model];
        if (closestPeers.length > 0) {
            buildArray.push(closestPeers[0]);
        }

        if (frugalOptions.length > 0) {
            const bestFrugal = frugalOptions[0];
            if (!buildArray.find(m => m.id === bestFrugal.id)) {
                buildArray.push(bestFrugal);
            }
        }

        // Top 2 cheaper models for the VS comparisons
        const cheaperModels = frugalOptions.slice(0, 2);

        return { fallbackModels: buildArray, cheaperModels };
    };

    return (
        <div className="container" style={{ animation: 'fadeIn 0.5s ease 0.1s backwards' }}>
            <div className="top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px', flexWrap: 'wrap' }}>
                <header className="home-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="model.delights logo"
                            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--hairline)' }}
                        />
                        <h1 style={{ margin: 0, color: 'var(--ink)', letterSpacing: '-0.035em', fontWeight: 600 }}>model.delights</h1>
                    </div>
                    <p className="subtitle" style={{ marginBottom: '14px', marginTop: '8px' }}>The intelligent API routing matrix for AI engineers and developers.</p>
                    
                    <div style={{ marginBottom: '18px' }}>
                        <button
                            onClick={() => setIsAuditModalOpen(true)}
                            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#141516] hover:bg-[#18191a] border border-[#23252a] hover:border-[#34343a] text-[#f7f8f8] text-xs font-medium transition-all cursor-pointer group"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#27a644]" />
                            <span className="text-[#f7f8f8] font-medium">Stack Overpayment Audit</span>
                            <span className="text-[11px] text-[#8a8f98] group-hover:text-[#d0d6e0] font-mono">Calculate Waste &rarr;</span>
                        </button>
                    </div>

                    <div style={{ color: 'var(--ink-subtle)', fontSize: '0.875rem', maxWidth: '750px', lineHeight: 1.6, marginBottom: '20px', background: 'var(--surface-1)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--hairline)' }}>
                        <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>Understanding the ELO Score:</strong> The Performance (ELO) metric indicates a model&apos;s true reasoning capability.
                        {!isEloExpanded && (
                            <span
                                onClick={() => setIsEloExpanded(true)}
                                style={{ color: 'var(--primary-hover)', cursor: 'pointer', marginLeft: '6px', fontSize: '0.8rem' }}
                            >
                                [Read More]
                            </span>
                        )}
                        {isEloExpanded && (
                            <span style={{ display: 'inline' }}>
                                It is aggregated from large-scale, crowdsourced blind A/B tests (such as Chatbot Arena) alongside proprietary heuristics. A higher ELO means the model is empirically proven to provide smarter, more accurate, and better-structured responses to complex human prompts.
                                <span
                                    onClick={() => setIsEloExpanded(false)}
                                    style={{ color: 'var(--primary-hover)', cursor: 'pointer', marginLeft: '6px', fontSize: '0.8rem', display: 'inline-block' }}
                                >
                                    [Hide]
                                </span>
                            </span>
                        )}
                    </div>
                </header>

                {/* FinOps Workload Cost Simulator */}
                {(activeModality === 'text' || activeModality === 'all') && (
                    <div className="simulator-panel home-simulator" style={{ maxWidth: '640px' }}>
                    <div className="simulator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Workload FinOps Simulator</h2>
                            <p style={{ fontSize: '0.825rem', color: 'var(--ink-subtle)', margin: 0 }}>Simulate true cost with prompt caching discounts & reasoning overhead.</p>
                        </div>
                        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '9999px', padding: '2px', border: '1px solid var(--hairline)', flexWrap: 'wrap', gap: '2px' }}>
                            {Object.keys(PRESETS).map(key => {
                                const preset = PRESETS[key as keyof typeof PRESETS];
                                const isActive = simPromptMs === preset.prompt &&
                                    simOutputMs === preset.output &&
                                    simReqs === preset.reqs;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSimPromptMs(preset.prompt);
                                            setSimOutputMs(preset.output);
                                            setSimReqs(preset.reqs);
                                            setCacheHitRate(preset.cache);
                                            setReasoningMultiplier(preset.reasoning);
                                        }}
                                        style={{
                                            background: isActive ? 'var(--surface-3)' : 'transparent',
                                            color: isActive ? 'var(--ink)' : 'var(--ink-subtle)',
                                            border: isActive ? '1px solid var(--hairline-strong)' : '1px solid transparent',
                                            padding: '3px 9px',
                                            borderRadius: '9999px',
                                            fontSize: '0.72rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            whiteSpace: 'nowrap',
                                            fontWeight: isActive ? 600 : 400
                                        }}
                                    >
                                        {key}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="simulator-controls">
                        <div className="input-group">
                            <label>Input Tokens / Req</label>
                            <input
                                type="number"
                                value={simPromptMs}
                                onChange={e => setSimPromptMs(Number(e.target.value) || 0)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Output Tokens / Req</label>
                            <input
                                type="number"
                                value={simOutputMs}
                                onChange={e => setSimOutputMs(Number(e.target.value) || 0)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Requests / Month</label>
                            <input
                                type="number"
                                value={simReqs}
                                onChange={e => setSimReqs(Number(e.target.value) || 0)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Max Budget ($)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    placeholder="e.g. 50"
                                    value={budgetInput}
                                    onChange={e => {
                                        setBudgetInput(e.target.value);
                                        if (e.target.value === '') setMaxBudget(null);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            setMaxBudget(budgetInput ? Number(budgetInput) : null);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => setMaxBudget(budgetInput ? Number(budgetInput) : null)}
                                    style={{
                                        padding: '0 14px',
                                        borderRadius: '6px',
                                        background: 'var(--primary)',
                                        color: '#ffffff',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                                >
                                    Set
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced FinOps Sliders: Prompt Cache & Reasoning Overhead */}
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--hairline)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        {/* Prompt Cache Hit Rate Slider */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--ink-subtle)', fontWeight: 500 }}>
                                    <i className="ph ph-lightning" style={{ color: 'var(--semantic-success)' }}></i> Prompt Cache Hit Rate
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--semantic-success)', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--hairline)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                                    {Math.round(cacheHitRate * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="0.90"
                                step="0.05"
                                value={cacheHitRate}
                                onChange={e => setCacheHitRate(parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--ink-subtle)', marginTop: '2px' }}>
                                <span>0% (Cold)</span>
                                <span>50% (Standard RAG)</span>
                                <span>90% (Agents)</span>
                            </div>
                        </div>

                        {/* Reasoning Multiplier Segmented Control */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--ink-subtle)', fontWeight: 500 }}>
                                    <i className="ph ph-brain" style={{ color: 'var(--primary)' }}></i> Reasoning Multiplier
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--ink)', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--hairline)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                                    {reasoningMultiplier}x thinking
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-2)', borderRadius: '6px', padding: '2px', border: '1px solid var(--hairline)' }}>
                                {[
                                    { val: 1, label: '1x Normal' },
                                    { val: 3.5, label: '3.5x Ext.' },
                                    { val: 6, label: '6x Deep' }
                                ].map(item => (
                                    <button
                                        key={item.val}
                                        onClick={() => setReasoningMultiplier(item.val)}
                                        style={{
                                            flex: 1,
                                            background: reasoningMultiplier === item.val ? 'var(--surface-3)' : 'transparent',
                                            color: reasoningMultiplier === item.val ? 'var(--ink)' : 'var(--ink-subtle)',
                                            border: reasoningMultiplier === item.val ? '1px solid var(--hairline-strong)' : '1px solid transparent',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: reasoningMultiplier === item.val ? 600 : 400,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--ink-subtle)', marginTop: '4px' }}>
                                Multiplies output tokens for thinking models
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            <div style={{ width: '100%', marginBottom: '40px' }}>
                <ValidatorGateway />
            </div>

            <Filters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortMode={sortMode}
                setSortMode={setSortMode}
                activeUseCase={activeUseCase}
                setActiveUseCase={setActiveUseCase}
                activeModality={activeModality}
                setActiveModality={setActiveModality}
                totalModels={filteredModels.length}
                lastUpdated={lastUpdatedTimestamp}
            />

            {(activeModality === 'text' || activeModality === 'all') && (
                <ParetoChart
                    models={filteredModels}
                    isExpanded={isChartExpanded}
                    onToggleExpand={() => setIsChartExpanded(!isChartExpanded)}
                />
            )}

            {filteredModels.length === 0 ? (
                <div className="empty-state">
                    <i className="ph ph-warning-circle"></i>
                    <p>No models match your current filters. Try relaxing your search criteria or budget constraints.</p>
                </div>
            ) : (
                <div className="grid-container">
                    {filteredModels.map((m, idx) => (
                        <React.Fragment key={m.id}>
                            {idx === 4 && (
                                <PromoCard />
                            )}
                            {idx === 11 && (
                                <WildcardCard />
                            )}
                            <ModelCard
                                model={m}
                                fallbackModels={getModelRelations(m).fallbackModels}
                                cheaperModels={getModelRelations(m).cheaperModels}
                                simPromptMs={simPromptMs}
                                simOutputMs={simOutputMs}
                                simReqs={simReqs}
                                cacheHitRate={cacheHitRate}
                                reasoningMultiplier={reasoningMultiplier}
                                isPinned={selectedCompareIds.includes(m.id)}
                                onTogglePin={handleTogglePin}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Compare Tray Sticky Dock */}
            <CompareTray
                selectedModels={selectedCompareModels}
                onRemove={handleRemoveCompare}
                onClear={handleClearCompare}
            />

            {/* SEO internal linking matrix for Category Hubs */}
            <div className="mt-20 mb-10 w-full bg-zinc-900/40 border border-white/5 p-8 rounded-3xl" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="text-2xl font-bold text-white mb-2">Explore LLM Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/categories/top-tier" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Top Tier Models</span>
                        <span className="text-zinc-500 text-xs">Unmatched reasoning</span>
                    </Link>
                    <Link href="/categories/coding-logic" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Coding & Logic</span>
                        <span className="text-zinc-500 text-xs">Software engineering</span>
                    </Link>
                    <Link href="/categories/vision" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Vision Models</span>
                        <span className="text-zinc-500 text-xs">Multimodal analytics</span>
                    </Link>
                    <Link href="/categories/drafting" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Drafting</span>
                        <span className="text-zinc-500 text-xs">Fast text generation</span>
                    </Link>
                    <Link href="/categories/roleplay" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Roleplay</span>
                        <span className="text-zinc-500 text-xs">Uncensored persona chat</span>
                    </Link>
                    <Link href="/categories/fictional" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Fictional</span>
                        <span className="text-zinc-500 text-xs">Storytelling & creative</span>
                    </Link>
                    <Link href="/categories/image-gen" className="p-4 bg-zinc-950 hover:bg-zinc-800 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-white font-bold group-hover:text-cyan-400">Image Gen</span>
                        <span className="text-zinc-500 text-xs">Diffusion architecture</span>
                    </Link>
                    <Link href="/vs" className="p-4 bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl transition-all flex flex-col gap-1 group">
                        <span className="text-cyan-400 font-bold group-hover:text-cyan-300">The VS Engine</span>
                        <span className="text-cyan-500/70 text-xs">Compare models head-to-head</span>
                    </Link>
                </div>
            </div>

            <button
                className={`surface-up-btn ${showSurfaceUp ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <i className="ph ph-arrow-up"></i> Surface Up
            </button>

            {/* Stack Overpayment Audit FinOps Modal */}
            <StackAuditModal 
                isOpen={isAuditModalOpen} 
                onClose={() => setIsAuditModalOpen(false)} 
            />
        </div>
    );
}
