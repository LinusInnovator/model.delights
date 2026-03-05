"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Model, FetchResult } from '@/lib/api';
import Filters, { USE_CASES } from './Filters';
import dynamic from 'next/dynamic';
import ModelCard from './ModelCard';
import PromoCard from './PromoCard';

const ParetoChart = dynamic(() => import('./ParetoChart'), { ssr: false });

export default function Directory({ initialData }: { initialData: FetchResult }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('value-desc');
    const [activeUseCase, setActiveUseCase] = useState('all');

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
    }, [initialData.models, searchQuery, sortMode, activeUseCase]);

    // Format last updated
    const lastUpdatedStr = initialData.last_updated
        ? new Date(initialData.last_updated * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'Never';

    // Helper to find alternatives (Bulletproof Fallback API)
    const findAlternativesArray = (model: Model) => {
        if (!model.elo) return [model.id];

        const targetPrice = model.pricing_per_1m.prompt + model.pricing_per_1m.completion;

        // 1. Find Closest Peer (Uptime & Intelligence focus)
        // Must have same/better context, ELO within +/- 30, and price can be up to 20% more expensive
        const closestPeers = initialData.models.filter(m =>
            m.id !== model.id &&
            m.elo !== null &&
            m.context_length >= model.context_length &&
            Math.abs(m.elo - (model.elo as number)) <= 30 &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) <= (targetPrice * 1.20)
        ).sort((a, b) => {
            // Sort by closest ELO difference to target
            return Math.abs((a.elo as number) - (model.elo as number)) - Math.abs((b.elo as number) - (model.elo as number));
        });

        // 2. Find Frugal Fallback (Cost focus)
        // Must have same/better context, ELO within -30 points, and MUST be cheaper
        const frugalOptions = initialData.models.filter(m =>
            m.id !== model.id &&
            m.elo !== null &&
            m.context_length >= model.context_length &&
            m.elo >= ((model.elo as number) - 30) &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) < targetPrice
        ).sort((a, b) => b.value_score - a.value_score);

        const buildArray: string[] = [model.id];

        // Ensure we don't accidentally push the exact same fallback model twice
        if (closestPeers.length > 0) {
            buildArray.push(closestPeers[0].id);
        }

        if (frugalOptions.length > 0) {
            const bestFrugal = frugalOptions[0].id;
            if (!buildArray.includes(bestFrugal)) {
                buildArray.push(bestFrugal);
            }
        }

        return buildArray;
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.6, marginBottom: '25px', background: 'rgba(255, 255, 255, 0.03)', padding: '15px 20px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Understanding the ELO Score:</strong> The Performance (ELO) metric indicates a model's true reasoning capability. It is aggregated from large-scale, crowdsourced blind A/B tests (such as Chatbot Arena) alongside proprietary heuristics. A higher ELO means the model is empirically proven to provide smarter, more accurate, and better-structured responses to complex human prompts.
                    </p>
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

            <Filters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortMode={sortMode}
                setSortMode={setSortMode}
                activeUseCase={activeUseCase}
                setActiveUseCase={setActiveUseCase}
                totalModels={filteredModels.length}
                lastUpdated={lastUpdatedStr}
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
                            <ModelCard
                                model={m}
                                alternativesArray={findAlternativesArray(m)}
                                simPromptMs={simPromptMs}
                                simOutputMs={simOutputMs}
                                simReqs={simReqs}
                            />
                        </React.Fragment>
                    ))}
                </div>
            )}

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
