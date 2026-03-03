"use client";

import React, { useState, useMemo } from 'react';
import { Model, FetchResult } from '@/lib/api';
import Filters, { USE_CASES } from './Filters';
import ParetoChart from './ParetoChart';
import ModelCard from './ModelCard';

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

    const [isChartExpanded, setIsChartExpanded] = useState(true);

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

    // Helper to find alternatives
    const findAlternatives = (model: Model) => {
        if (!model.elo) return [];

        const possibleAlts = initialData.models.filter(m =>
            m.id !== model.id &&
            m.elo !== null &&
            m.elo >= (model.elo as number - 20) &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) < (model.pricing_per_1m.prompt + model.pricing_per_1m.completion)
        );

        return possibleAlts
            .sort((a, b) => b.value_score - a.value_score)
            .slice(0, 2);
    };

    return (
        <div className="container" style={{ animation: 'fadeIn 1s ease 0.3s backwards' }}>
            <div className="top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px', flexWrap: 'wrap' }}>
                <header style={{ flex: '1 1 420px', maxWidth: '550px' }}>
                    <h1 className="gradient-text">model.delights</h1>
                    <p className="subtitle" style={{ marginBottom: '15px' }}>Real-time Performance vs. Price matrix for LLM APIs.</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.6, marginBottom: '25px', background: 'rgba(255, 255, 255, 0.03)', padding: '15px 20px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Understanding the ELO Score:</strong> The Performance (ELO) metric indicates a model's true reasoning capability. It is aggregated from large-scale, crowdsourced blind A/B tests (such as Chatbot Arena) alongside proprietary heuristics. A higher ELO means the model is empirically proven to provide smarter, more accurate, and better-structured responses to complex human prompts.
                    </p>
                </header>

                {/* Keeping Simulator for parity */}
                <div className="simulator-panel" style={{ flex: '1 1 480px', margin: 0 }}>
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
                    {filteredModels.map(m => (
                        <ModelCard
                            key={m.id}
                            model={m}
                            alternatives={findAlternatives(m)}
                            simPromptMs={simPromptMs}
                            simOutputMs={simOutputMs}
                            simReqs={simReqs}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
