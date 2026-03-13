"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Model, FetchResult } from '@/lib/api';
import Filters, { USE_CASES } from './Filters';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ModelCard from './ModelCard';
import PromoCard from './PromoCard';
import WildcardCard from './WildcardCard';
import ValidatorGateway from './ValidatorGateway';

const ParetoChart = dynamic(() => import('./ParetoChart'), { ssr: false });

export default function Directory({ initialData }: { initialData: FetchResult }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('elo-desc');
    const [activeUseCase, setActiveUseCase] = useState('all');
    const [isEloExpanded, setIsEloExpanded] = useState(false);

    const PRESETS = {
        'Start-up': { prompt: 1000, output: 500, reqs: 50000 },
        'Scale-up': { prompt: 2000, output: 1000, reqs: 500000 },
        'Viral': { prompt: 2500, output: 1000, reqs: 5000000 }
    };

    const [simPromptMs, setSimPromptMs] = useState(PRESETS['Start-up'].prompt);
    const [simOutputMs, setSimOutputMs] = useState(PRESETS['Start-up'].output);
    const [simReqs, setSimReqs] = useState(PRESETS['Start-up'].reqs);

    const [budgetInput, setBudgetInput] = useState('');
    const [maxBudget, setMaxBudget] = useState<number | null>(null);

    const [isChartExpanded, setIsChartExpanded] = useState(true);
    const [showSurfaceUp, setShowSurfaceUp] = useState(false);

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
                const oTokens = simOutputMs / 1000000;
                const pCost = pTokens * m.pricing_per_1m.prompt * simReqs;
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
                case 'price-asc': return pA - pB;
                case 'price-desc': return pB - pA;
                case 'context-desc': return cB - cA;
                case 'age-desc': return ageB - ageA;
                case 'name-asc': return nameA.localeCompare(nameB);
                default: return 0;
            }
        });

        return result;
    }, [initialData.models, searchQuery, sortMode, activeUseCase, maxBudget, simPromptMs, simOutputMs, simReqs]);

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
            m.elo >= ((model.elo as number) - 30) &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) < targetPrice
        ).sort((a, b) => b.value_score - a.value_score);

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
        <div className="container" style={{ animation: 'fadeIn 1s ease 0.3s backwards' }}>
            <div className="top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px', flexWrap: 'wrap' }}>
                <header className="home-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src="/logo.png"
                            alt="model.delights logo"
                            style={{ width: '40px', height: '40px', borderRadius: '8px', boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)' }}
                        />
                        <h1 style={{ margin: 0, color: '#FFFFFF', letterSpacing: '-0.04em', fontWeight: 600 }}>model.delights</h1>
                    </div>
                    <p className="subtitle" style={{ marginBottom: '15px', marginTop: '10px' }}>The intelligent API routing matrix for AI engineers and developers.</p>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.6, marginBottom: '25px', background: 'rgba(255, 255, 255, 0.03)', padding: '15px 20px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Understanding the ELO Score:</strong> The Performance (ELO) metric indicates a model's true reasoning capability.
                        {!isEloExpanded && (
                            <span
                                onClick={() => setIsEloExpanded(true)}
                                style={{ color: 'var(--accent)', cursor: 'pointer', marginLeft: '8px', fontSize: '0.85rem' }}
                            >
                                [Read More]
                            </span>
                        )}
                        {isEloExpanded && (
                            <span style={{ display: 'inline' }}>
                                It is aggregated from large-scale, crowdsourced blind A/B tests (such as Chatbot Arena) alongside proprietary heuristics. A higher ELO means the model is empirically proven to provide smarter, more accurate, and better-structured responses to complex human prompts.
                                <span
                                    onClick={() => setIsEloExpanded(false)}
                                    style={{ color: 'var(--accent)', cursor: 'pointer', marginLeft: '8px', fontSize: '0.85rem', display: 'inline-block' }}
                                >
                                    [Hide]
                                </span>
                            </span>
                        )}
                    </div>
                </header>

                {/* Keeping Simulator for parity */}
                <div className="simulator-panel home-simulator">
                    <div className="simulator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2>Cost Simulator</h2>
                            <p>Estimate your monthly bill across the entire industry instantly.</p>
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '3px', border: '1px solid rgba(255,255,255,0.05)', marginLeft: '10px' }}>
                            {Object.keys(PRESETS).map(key => {
                                const isActive = simPromptMs === PRESETS[key as keyof typeof PRESETS].prompt &&
                                    simOutputMs === PRESETS[key as keyof typeof PRESETS].output &&
                                    simReqs === PRESETS[key as keyof typeof PRESETS].reqs;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setSimPromptMs(PRESETS[key as keyof typeof PRESETS].prompt);
                                            setSimOutputMs(PRESETS[key as keyof typeof PRESETS].output);
                                            setSimReqs(PRESETS[key as keyof typeof PRESETS].reqs);
                                        }}
                                        style={{
                                            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: isActive ? '#fff' : 'var(--text-secondary)',
                                            border: 'none',
                                            padding: '4px 14px',
                                            borderRadius: '16px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            whiteSpace: 'nowrap',
                                            fontWeight: isActive ? 600 : 400
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
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
                                        padding: '0 15px',
                                        borderRadius: '8px',
                                        background: 'var(--accent)',
                                        color: '#000',
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Set
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
                totalModels={filteredModels.length}
                lastUpdated={lastUpdatedTimestamp}
            />

            <ParetoChart
                models={filteredModels}
                isExpanded={isChartExpanded}
                onToggleExpand={() => setIsChartExpanded(!isChartExpanded)}
            />

            {filteredModels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                    No models found matching your criteria...
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
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}

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
        </div>
    );
}
