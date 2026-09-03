"use client";

import React, { useState, useEffect } from "react";

export const USE_CASES = [
    { id: 'all', label: 'All Models', icon: 'ph-infinity' },
    { id: 'Top Tier', label: 'Top Tier', icon: 'ph-star' },
    { id: 'Coding & Logic', label: 'Coding & Logic', icon: 'ph-code' },
    { id: 'Agentic', label: 'Agentic & Tools', icon: 'ph-wrench' },
    { id: 'Reasoning', label: 'Deep Reasoning', icon: 'ph-brain' },
    { id: 'Free Tier', label: 'Free Models', icon: 'ph-gift' },
    { id: 'Drafting', label: 'Drafting', icon: 'ph-lightning' },
    { id: 'Roleplay', label: 'Roleplay', icon: 'ph-mask-happy' },
    { id: 'Vision', label: 'Vision', icon: 'ph-eye' }
];

export const MODALITIES = [
    { id: 'all', label: 'All Media', icon: 'ph-circles-four' },
    { id: 'text', label: 'Text & Code', icon: 'ph-text-t' },
    { id: 'image', label: 'Images', icon: 'ph-image' },
    { id: 'video', label: 'Video', icon: 'ph-video-camera' },
    { id: 'audio', label: 'Audio & Voice', icon: 'ph-speaker-high' }
];

interface FiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    sortMode: string;
    setSortMode: (val: string) => void;
    activeUseCase: string;
    setActiveUseCase: (val: string) => void;
    activeModality: string;
    setActiveModality: (val: string) => void;
    totalModels: number;
    lastUpdated: number | null;
}

function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
}

export default function Filters({
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    activeUseCase,
    setActiveUseCase,
    activeModality,
    setActiveModality,
    totalModels,
    lastUpdated
}: FiltersProps) {
    const [relativeTime, setRelativeTime] = useState<string>("syncing...");

    useEffect(() => {
        if (!lastUpdated) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRelativeTime("Unknown");
            return;
        }

        const updateTime = () => setRelativeTime(getRelativeTime(lastUpdated));
        updateTime(); // Initial update

        // Update the relative time every 60 seconds
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    return (
        <>
            <div className="controls">
                <div className="search-wrap" style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                    <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-subtle)' }}></i>
                    <input
                        type="text"
                        placeholder="Search models... (e.g., Llama, GPT-4, Coding, Reasoning)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            background: 'var(--surface-1)',
                            border: '1px solid var(--hairline)',
                            borderRadius: '8px',
                            color: 'var(--ink)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.boxShadow = '0 0 0 1px var(--primary)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'var(--hairline)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div className="sort-wrap">
                    <label htmlFor="sortSelect" style={{ color: 'var(--ink-subtle)', fontSize: '0.85rem', fontWeight: 500 }}>
                        Sort by:
                    </label>
                    <select
                        id="sortSelect"
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                    >
                        <option value="elo-desc">Pure ELO (Highest Intelligence)</option>
                        <option value="value-desc">Value Score (Smartest for Cheapest)</option>
                        <option value="aider-desc">Aider Coding Score (Highest First)</option>
                        <option value="bfcl-desc">BFCL Agentic Score (Highest First)</option>
                        <option value="cache-desc">Prompt Cache Discount % (Highest First)</option>
                        <option value="max-out-desc">Max Output Tokens (Highest First)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="context-desc">Context Length (High to Low)</option>
                        <option value="age-desc">Age (Newer first)</option>
                        <option value="name-asc">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className="modality-matrix" style={{ display: 'flex', gap: '8px', marginTop: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {MODALITIES.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => setActiveModality(mod.id)}
                        style={{
                            background: activeModality === mod.id ? 'var(--surface-3)' : 'var(--surface-1)',
                            color: activeModality === mod.id ? 'var(--ink)' : 'var(--ink-subtle)',
                            border: '1px solid',
                            borderColor: activeModality === mod.id ? 'var(--hairline-strong)' : 'var(--hairline)',
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: activeModality === mod.id ? 600 : 400,
                            transition: 'all 0.15s ease',
                            fontSize: '0.825rem'
                        }}
                        onMouseEnter={e => {
                            if (activeModality !== mod.id) {
                                e.currentTarget.style.background = 'var(--surface-2)';
                                e.currentTarget.style.color = 'var(--ink)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (activeModality !== mod.id) {
                                e.currentTarget.style.background = 'var(--surface-1)';
                                e.currentTarget.style.color = 'var(--ink-subtle)';
                            }
                        }}
                    >
                        <i className={`ph ${mod.icon}`}></i> {mod.label}
                    </button>
                ))}
            </div>

            <div className="controls-top-row">
                <div className="use-case-matrix">
                    {USE_CASES.map(uc => (
                        <div
                            key={uc.id}
                            className={`use-case-puck ${activeUseCase === uc.id ? 'active' : ''}`}
                            onClick={() => setActiveUseCase(uc.id)}
                        >
                            <i className={`ph ${uc.icon}`}></i> {uc.label}
                        </div>
                    ))}
                </div>

                <div className="micro-stats">
                    <div className="micro-stat" title={`Database: ${totalModels} Models`}>
                        <i className="ph ph-database"></i> <span>{totalModels} Models</span>
                    </div>
                    <div className="micro-stat" title={`Synced: ${lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}`} suppressHydrationWarning>
                        <i className="ph ph-clock-counter-clockwise"></i> <span id="lastUpdatedVal" suppressHydrationWarning>{relativeTime}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
