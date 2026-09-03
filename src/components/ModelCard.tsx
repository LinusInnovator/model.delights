"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Model } from '@/lib/api';
import CodeSnippetModal from './CodeSnippetModal';

interface ModelCardProps {
    model: Model;
    fallbackModels: Model[];
    cheaperModels: Model[];
    simPromptMs: number;
    simOutputMs: number;
    simReqs: number;
    cacheHitRate?: number;
    reasoningMultiplier?: number;
    isPinned?: boolean;
    onTogglePin?: (id: string) => void;
}

export default function ModelCard({
    model,
    fallbackModels,
    cheaperModels,
    simPromptMs,
    simOutputMs,
    simReqs,
    cacheHitRate = 0.5,
    reasoningMultiplier = 1,
    isPinned = false,
    onTogglePin
}: ModelCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAlts, setShowAlts] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [copiedFallback, setCopiedFallback] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);

    const provider = model.id.split('/')[0] || 'Unknown';
    const nameDisplay = model.name || model.id;

    const arch = model.architecture?.modality || "Text -> Text";

    const calcCost = () => {
        if (model.pricing_per_1m.prompt < 0 || model.pricing_per_1m.completion < 0) return 'Variable';
        const pTokens = simPromptMs / 1000000;
        let oTokens = simOutputMs / 1000000;

        // Factor in reasoning overhead if this is a reasoning model
        if (model.operational_specs?.is_reasoning && reasoningMultiplier > 1) {
            oTokens *= reasoningMultiplier;
        }

        // Factor in prompt caching discount
        const cachedPrice = model.pricing_per_1m.prompt_cached ?? model.pricing_per_1m.prompt;
        const effectivePromptPrice = (1 - cacheHitRate) * model.pricing_per_1m.prompt + cacheHitRate * cachedPrice;

        const pCost = pTokens * effectivePromptPrice * simReqs;
        const oCost = oTokens * model.pricing_per_1m.completion * simReqs;
        const total = pCost + oCost;
        if (total === 0) return 'Free';
        return `$${total.toFixed(2)}`;
    };

    const formatPrice = (p: number) => {
        if (p < 0) return 'Variable';
        if (p === 0) return 'Free';
        if (p < 0.001) return `$${p.toFixed(5)}`;
        if (p < 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
    };

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(model.id).then(() => {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        });
    };

    const hasCachedDiscount = model.pricing_per_1m.prompt_cached !== undefined &&
                              model.pricing_per_1m.prompt_cached < model.pricing_per_1m.prompt;

    return (
        <>
            <div
                id={model.id}
                className={`model-card ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => setIsFlipped(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
            >
                <div className="card-inner">
                    <div className="card-front">
                        {/* Header with Title and Pin Button */}
                        <div className="model-header" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '8px' }}>
                                <div className="model-title" style={{ flex: 1 }}>{nameDisplay}</div>
                                
                                {/* Pin to Compare Checkbox */}
                                {onTogglePin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePin(model.id);
                                        }}
                                        title={isPinned ? "Remove from comparison" : "Pin to compare"}
                                        style={{
                                            background: isPinned ? 'var(--surface-3)' : 'var(--surface-2)',
                                            border: '1px solid',
                                            borderColor: isPinned ? 'var(--primary)' : 'var(--hairline)',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            color: isPinned ? '#ffffff' : 'var(--ink-subtle)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <i className={`ph ${isPinned ? 'ph-check-square' : 'ph-plus-square'}`}></i>
                                        {isPinned ? 'Pinned' : 'Compare'}
                                    </button>
                                )}
                            </div>

                            {/* Rich Badges Wrap */}
                            <div className="badges-wrap" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {model.gateway === 'fal.ai' ? (
                                    <span className="gateway-badge fal" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <i className="ph-fill ph-lightning" style={{ color: '#ec4899' }}></i> Fal.ai
                                    </span>
                                ) : (
                                    <span className="gateway-badge or" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <i className="ph-fill ph-intersect" style={{ color: 'var(--primary)' }}></i> OpenRouter
                                    </span>
                                )}
                                
                                {model.elo && (
                                    <span className="elo-badge" style={{ background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                        ★ ELO: {model.elo}
                                    </span>
                                )}

                                {/* Benchmark: Aider Coding Pass Rate */}
                                {model.benchmarks?.aider_pass_1 && (
                                    <span style={{ background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                                        <i className="ph ph-code" style={{ color: 'var(--primary)' }}></i> Aider: {model.benchmarks.aider_pass_1}%
                                    </span>
                                )}

                                {/* Benchmark: BFCL Tool Use Score */}
                                {model.benchmarks?.bfcl_score && (
                                    <span style={{ background: 'var(--surface-2)', color: 'var(--semantic-success)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                                        <i className="ph ph-wrench"></i> BFCL: {model.benchmarks.bfcl_score}
                                    </span>
                                )}

                                {/* Reasoning Indicator */}
                                {model.operational_specs?.is_reasoning && (
                                    <span style={{ background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🧠 Deep Reasoner
                                    </span>
                                )}

                                {/* Free Tier Badge */}
                                {model.operational_specs?.is_free && (
                                    <span style={{ background: 'var(--surface-2)', color: 'var(--semantic-success)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600 }}>
                                        Free Tier
                                    </span>
                                )}
                                
                                {(model.modality_type && model.modality_type !== 'text') && (
                                    <span className="modality-badge" style={{ background: 'var(--surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase' }}>
                                        {model.modality_type}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="model-desc">{model.description || "No description provided."}</div>

                        {/* Operational Specs Grid */}
                        <div className="specs">
                            <div className="spec-row">
                                <span className="spec-label">Provider</span>
                                <span className="spec-value" style={{ textTransform: 'capitalize' }}>{provider}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Context Limit</span>
                                <span className="spec-value">{model.context_length ? new Intl.NumberFormat().format(model.context_length) : 'Unknown'} tokens</span>
                            </div>
                            {model.operational_specs?.max_output_tokens ? (
                                <div className="spec-row">
                                    <span className="spec-label">Max Completion</span>
                                    <span className="spec-value" style={{ color: '#38bdf8', fontWeight: 600 }}>
                                        {new Intl.NumberFormat().format(model.operational_specs.max_output_tokens)} tokens
                                    </span>
                                </div>
                            ) : (
                                <div className="spec-row">
                                    <span className="spec-label">Modality</span>
                                    <span className="spec-value">{arch}</span>
                                </div>
                            )}
                            {model.operational_specs?.supports_json_schema && (
                                <div className="spec-row">
                                    <span className="spec-label">Structured JSON</span>
                                    <span className="spec-value" style={{ color: '#34d399', fontWeight: 600 }}>
                                        <i className="ph ph-check-circle"></i> Strict Schema
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Pricing Grid with Prompt Caching */}
                        <div className="pricing">
                            <div className="price-item">
                                <div className="price-val" style={{ color: 'var(--ink)' }}>{formatPrice(model.pricing_per_1m.prompt)}</div>
                                <div className="price-label">Input / 1M</div>
                                {hasCachedDiscount && (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--semantic-success)', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', fontFamily: 'var(--font-mono)' }}>
                                        <span>{formatPrice(model.pricing_per_1m.prompt_cached!)}</span>
                                        <span style={{ background: 'var(--surface-3)', border: '1px solid var(--hairline)', padding: '1px 4px', borderRadius: '4px' }}>
                                            {model.prompt_cache_discount_pct}% off
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="price-item">
                                <div className="price-val" style={{ color: 'var(--ink)' }}>{formatPrice(model.pricing_per_1m.completion)}</div>
                                <div className="price-label">Output / 1M</div>
                                {model.operational_specs?.is_reasoning && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--ink-subtle)', marginTop: '2px' }}>
                                        + thinking tokens
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Simulated Cost */}
                        <div className="simulated-cost">
                            <div className="sim-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Est. Monthly Bill</span>
                                {cacheHitRate > 0 && hasCachedDiscount && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--semantic-success)', fontWeight: 600 }}>
                                        ({Math.round(cacheHitRate * 100)}% cached)
                                    </span>
                                )}
                            </div>
                            <div className="sim-val">{calcCost()}</div>
                        </div>

                        <button
                            className="btn-alternatives"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAlts(!showAlts);
                            }}
                        >
                            Find Cheaper Alternatives
                        </button>

                        {showAlts && (
                            <div className="alternatives-container active">
                                {cheaperModels.length === 0 ? (
                                    <div className="alt-item">
                                        <span className="alt-name" style={{ color: 'var(--text-secondary)' }}>No direct cheaper alternatives found.</span>
                                    </div>
                                ) : (
                                    cheaperModels.map(a => {
                                        const currentCostM = model.pricing_per_1m.prompt + model.pricing_per_1m.completion;
                                        const altCostM = a.pricing_per_1m.prompt + a.pricing_per_1m.completion;
                                        const savedPct = Math.round((1 - (altCostM / currentCostM)) * 100);

                                        const slugA = encodeURIComponent(model.id.replace(/\//g, "__"));
                                        const slugB = encodeURIComponent(a.id.replace(/\//g, "__"));

                                        return (
                                            <div key={a.id} className="alt-item" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <span className="alt-name" style={{ fontWeight: 600 }}>{a.name || a.id.split('/')[1]}</span>
                                                    <span className="alt-save">{savedPct}% Cheaper</span>
                                                </div>
                                                <Link
                                                    href={`/vs/${slugA}/${slugB}`}
                                                    className="btn-action secondary"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', marginBottom: 0 }}
                                                >
                                                    <i className="ph ph-scales"></i> Compare
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Back of Card: Integration Hub */}
                    <div className="card-back" onClick={(e) => e.stopPropagation()}>
                        <div className="hub-title">
                            <i className="ph ph-cube-transparent" style={{ color: 'var(--primary)' }}></i> Integration Hub
                        </div>
                        <div className="hub-links">
                            {/* 1-Click Code Snippet Button */}
                            <button
                                className="hub-link-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCodeModal(true);
                                }}
                                style={{
                                    background: 'var(--primary)',
                                    borderColor: 'var(--primary)',
                                    color: '#ffffff',
                                    fontWeight: 500
                                }}
                            >
                                <i className="ph ph-code"></i> 1-Click SDK Integration Code
                            </button>

                            <Link href={`/models/${model.id}`} className="hub-link-btn" style={{ background: 'var(--surface-2)', borderColor: 'var(--hairline)', color: 'var(--ink)' }}>
                                <i className="ph ph-trend-up"></i> Full Model Profile
                            </Link>
                            <button
                                className="hub-link-btn copy-model-btn"
                                onClick={handleCopyId}
                                style={copiedId ? { color: 'var(--semantic-success)', borderColor: 'var(--semantic-success)' } : {}}
                            >
                                {copiedId ? <><i className="ph ph-check"></i> Copied!</> : <><i className="ph ph-copy"></i> Copy Model ID</>}
                            </button>
                            
                            {model.gateway === 'fal.ai' ? (
                                <a href={`https://fal.ai/models/${model.id}`} target="_blank" className="hub-link-btn" rel="noreferrer">
                                    <i className="ph ph-book-open"></i> Fal.ai Documentation
                                </a>
                            ) : (
                                <a href={`https://openrouter.ai/models/${model.id}`} target="_blank" className="hub-link-btn" rel="noreferrer">
                                    <i className="ph ph-book-open"></i> OpenRouter Specs
                                </a>
                            )}

                            <a href={`https://huggingface.co/search/full-text?q=${encodeURIComponent(nameDisplay)}&type=model`} target="_blank" className="hub-link-btn" rel="noreferrer">
                                <i className="ph ph-magnifying-glass"></i> HuggingFace Search
                            </a>
                        </div>

                        <button
                            className="btn-fallback-code fallback-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                const fallbackIds = fallbackModels.map(m => m.id);
                                navigator.clipboard.writeText(JSON.stringify(fallbackIds)).then(() => {
                                    setCopiedFallback(true);
                                    setTimeout(() => setCopiedFallback(false), 2000);
                                });
                            }}
                            style={copiedFallback ? { background: 'rgba(76, 175, 80, 0.2)', borderColor: '#4CAF50' } : {}}
                        >
                            {copiedFallback ? <><i className="ph ph-check"></i> Copied!</> : <><i className="ph ph-code"></i> Copy Bulletproof Fallback Array</>}
                        </button>
                        <button
                            className="btn-flip-back"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(false);
                            }}
                        >
                            <i className="ph ph-arrow-u-up-left"></i> Flip Back
                        </button>
                    </div>
                </div>
            </div>

            {/* Render 1-Click Code Modal */}
            {showCodeModal && (
                <CodeSnippetModal
                    model={model}
                    fallbackModels={fallbackModels}
                    onClose={() => setShowCodeModal(false)}
                />
            )}
        </>
    );
}
