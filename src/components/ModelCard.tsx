"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Model } from '@/lib/api';

interface ModelCardProps {
    model: Model;
    fallbackModels: Model[];
    cheaperModels: Model[];
    simPromptMs: number;
    simOutputMs: number;
    simReqs: number;
}

export default function ModelCard({
    model,
    fallbackModels,
    cheaperModels,
    simPromptMs,
    simOutputMs,
    simReqs
}: ModelCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAlts, setShowAlts] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [copiedFallback, setCopiedFallback] = useState(false);

    const provider = model.id.split('/')[0] || 'Unknown';
    const nameDisplay = model.name || model.id;

    const arch = model.architecture?.modality || "Text -> Text";

    const calcCost = () => {
        if (model.pricing_per_1m.prompt < 0 || model.pricing_per_1m.completion < 0) return 'Variable';
        const pTokens = simPromptMs / 1000000;
        const oTokens = simOutputMs / 1000000;
        const pCost = pTokens * model.pricing_per_1m.prompt * simReqs;
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

    return (
        <div
            id={model.id}
            className={`model-card ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(true)}
            style={{ cursor: 'pointer' }}
        >
            <div className="card-inner">
                <div className="card-front">
                    <div className="model-header">
                        <div className="model-title">{nameDisplay}</div>
                        <div className="badges-wrap" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {model.gateway === 'fal.ai' ? (
                                <span className="gateway-badge fal" style={{ background: 'rgba(255, 51, 153, 0.15)', color: '#ff3399', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="ph-fill ph-lightning"></i> Fal.ai
                                </span>
                            ) : (
                                <span className="gateway-badge or" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="ph-fill ph-intersect"></i> OpenRouter
                                </span>
                            )}
                            
                            {model.elo && (
                                <span className="elo-badge" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    ELO: {model.elo}
                                </span>
                            )}
                            
                            {(model.modality_type && model.modality_type !== 'text') && (
                                <span className="modality-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {model.modality_type}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="model-desc">{model.description || "No description provided."}</div>

                    <div className="specs">
                        <div className="spec-row">
                            <span className="spec-label">Provider</span>
                            <span className="spec-value" style={{ textTransform: 'capitalize' }}>{provider}</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Context</span>
                            <span className="spec-value">{model.context_length ? new Intl.NumberFormat().format(model.context_length) : 'Unknown'} tokens</span>
                        </div>
                        <div className="spec-row">
                            <span className="spec-label">Modality</span>
                            <span className="spec-value">{arch}</span>
                        </div>
                    </div>

                    <div className="pricing">
                        <div className="price-item">
                            <div className="price-val">{formatPrice(model.pricing_per_1m.prompt)}</div>
                            <div className="price-label">Input / 1M</div>
                        </div>
                        <div className="price-item">
                            <div className="price-val">{formatPrice(model.pricing_per_1m.completion)}</div>
                            <div className="price-label">Output / 1M</div>
                        </div>
                    </div>

                    <div className="simulated-cost">
                        <div className="sim-label">Est. Monthly Bill</div>
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

                <div className="card-back" onClick={(e) => e.stopPropagation()}>
                    <div className="hub-title">
                        <i className="ph ph-cube-transparent" style={{ color: 'var(--accent)' }}></i> Integration Hub
                    </div>
                    <div className="hub-links">
                        <Link href={`/models/${model.id}`} className="hub-link-btn" style={{ background: 'rgba(0, 229, 255, 0.1)', borderColor: 'rgba(0, 229, 255, 0.3)', color: '#00e5ff' }}>
                            <i className="ph ph-trend-up"></i> Full Model Profile
                        </Link>
                        <button
                            className="hub-link-btn copy-model-btn"
                            onClick={handleCopyId}
                            style={copiedId ? { color: '#00e5ff', borderColor: '#00e5ff' } : {}}
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
    );
}
