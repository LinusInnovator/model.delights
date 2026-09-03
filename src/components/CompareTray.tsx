"use client";

import React, { useState } from 'react';
import { Model } from '@/lib/api';
import Link from 'next/link';

interface CompareTrayProps {
    selectedModels: Model[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

export default function CompareTray({ selectedModels, onRemove, onClear }: CompareTrayProps) {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    if (selectedModels.length === 0) return null;

    const formatPrice = (p: number) => {
        if (p < 0) return 'Variable';
        if (p === 0) return 'Free';
        if (p < 0.001) return `$${p.toFixed(5)}`;
        if (p < 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
    };

    return (
        <>
            {/* Floating Bottom Dock */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9000,
                background: 'var(--surface-1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: '9999px',
                padding: '8px 16px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                maxWidth: '92vw',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        background: 'var(--surface-3)',
                        color: 'var(--ink)',
                        border: '1px solid var(--hairline-strong)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px'
                    }}>
                        {selectedModels.length}/4
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', display: 'none', whiteSpace: 'nowrap' }} className="compare-text-desktop">
                        Models Pinned
                    </span>
                </div>

                {/* Selected Model Chips */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '420px', padding: '2px 0' }}>
                    {selectedModels.map(m => (
                        <div
                            key={m.id}
                            style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--hairline)',
                                borderRadius: '9999px',
                                padding: '3px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                color: 'var(--ink)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span>{m.name || m.id.split('/')[1]}</span>
                            <button
                                onClick={() => onRemove(m.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--ink-subtle)',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={onClear}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--ink-subtle)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '6px 8px'
                        }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsOverlayOpen(true)}
                        style={{
                            background: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            color: '#ffffff',
                            padding: '7px 16px',
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                    >
                        <i className="ph ph-scales"></i> Compare Now
                    </button>
                </div>
            </div>

            {/* Side-by-Side Comparison Overlay Modal */}
            {isOverlayOpen && (
                <div
                    onClick={() => setIsOverlayOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--surface-1)',
                            border: '1px solid var(--hairline-strong)',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '1100px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 28px',
                            borderBottom: '1px solid var(--hairline)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--surface-1)'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em' }}>
                                    <i className="ph ph-scales" style={{ color: 'var(--primary)' }}></i>
                                    Side-by-Side Model Intelligence Matrix
                                </h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.825rem', color: 'var(--ink-subtle)' }}>
                                    Comparing {selectedModels.length} selected architecture{selectedModels.length > 1 ? 's' : ''} across economics, benchmarks, and operational SLAs
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {selectedModels.length === 2 && (
                                    <Link
                                        href={`/vs/${encodeURIComponent(selectedModels[0].id.replace(/\//g, '__'))}/${encodeURIComponent(selectedModels[1].id.replace(/\//g, '__'))}`}
                                        style={{
                                            background: 'var(--surface-2)',
                                            color: 'var(--ink)',
                                            border: '1px solid var(--hairline-strong)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <i className="ph ph-arrows-left-right"></i> Open Dedicated Duel Page
                                    </Link>
                                )}
                                <button
                                    onClick={() => setIsOverlayOpen(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: '#fff',
                                        fontSize: '1.2rem',
                                        borderRadius: '10px',
                                        padding: '4px 10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div style={{ overflowX: 'auto', padding: '24px', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.08)', width: '220px' }}>
                                            Dimension
                                        </th>
                                        {selectedModels.map(m => (
                                            <th key={m.id} style={{ padding: '12px 16px', color: '#fff', fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span>{m.name || m.id.split('/')[1]}</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>{m.id.split('/')[0]}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Overall ELO */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            <i className="ph ph-trophy" style={{ color: '#ffd700', marginRight: '6px' }}></i> LMSYS Arena ELO
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', fontWeight: 700, color: '#ffd700', fontSize: '1.05rem' }}>
                                                {m.elo || 'Unranked'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Aider Coding */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            <i className="ph ph-code" style={{ color: '#38bdf8', marginRight: '6px' }}></i> Aider Coding Pass@1
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', color: '#38bdf8', fontWeight: 600 }}>
                                                {m.benchmarks?.aider_pass_1 ? `${m.benchmarks.aider_pass_1}%` : '—'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* BFCL Tool-Use */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            <i className="ph ph-wrench" style={{ color: '#34d399', marginRight: '6px' }}></i> BFCL Agentic Score
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', color: '#34d399', fontWeight: 600 }}>
                                                {m.benchmarks?.bfcl_score ? `${m.benchmarks.bfcl_score}` : '—'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Reasoning Type */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            <i className="ph ph-brain" style={{ color: '#c084fc', marginRight: '6px' }}></i> Architecture Type
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px' }}>
                                                {m.operational_specs?.is_reasoning ? (
                                                    <span style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        🧠 Deep Reasoner (Test-Time)
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        Standard Fast Decoder
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Input Price */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Standard Input / 1M
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', fontWeight: 600, color: '#fff' }}>
                                                {formatPrice(m.pricing_per_1m.prompt)}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Cached Input Price */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Cached Input / 1M
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px' }}>
                                                {m.pricing_per_1m.prompt_cached !== undefined && m.pricing_per_1m.prompt_cached < m.pricing_per_1m.prompt ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: '#00e5ff', fontWeight: 700 }}>{formatPrice(m.pricing_per_1m.prompt_cached)}</span>
                                                        <span style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                                            {m.prompt_cache_discount_pct}% OFF
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Same as input</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Output Price */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Output / 1M
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', fontWeight: 600, color: '#fff' }}>
                                                {formatPrice(m.pricing_per_1m.completion)}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Context Window */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Context Length
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', color: '#e2e8f0' }}>
                                                {m.context_length ? new Intl.NumberFormat().format(m.context_length) : 'Unknown'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Max Output Limit */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Max Output Tokens
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px', color: '#e2e8f0' }}>
                                                {m.operational_specs?.max_output_tokens ? new Intl.NumberFormat().format(m.operational_specs.max_output_tokens) : 'Standard (4k-8k)'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Structured Output & Tools */}
                                    <tr>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            Contract Guarantees
                                        </td>
                                        {selectedModels.map(m => (
                                            <td key={m.id} style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {m.operational_specs?.supports_tools && (
                                                        <span style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                            🛠️ Tools
                                                        </span>
                                                    )}
                                                    {m.operational_specs?.supports_json_schema && (
                                                        <span style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600 }}>
                                                            📋 Strict JSON
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
