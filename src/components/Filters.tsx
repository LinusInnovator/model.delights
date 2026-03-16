"use client";

import React, { useState, useEffect } from "react";

export const USE_CASES = [
    { id: 'all', label: 'All Use Cases', icon: 'ph-infinity' },
    { id: 'Top Tier', label: 'Top Tier', icon: 'ph-star' },
    { id: 'Coding & Logic', label: 'Coding & Logic', icon: 'ph-code' },
    { id: 'Fictional', label: 'Fictional', icon: 'ph-pen-nib' },
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
                    <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
                    <input
                        type="text"
                        placeholder="Search models... (e.g., Llama, GPT-4, Coding)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 229, 255, 0.1)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div className="sort-wrap">
                    <label htmlFor="sortSelect" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Sort by:
                    </label>
                    <select
                        id="sortSelect"
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                    >
                        <option value="elo-desc">Pure ELO (Highest Intelligence)</option>
                        <option value="value-desc">Value Score (Smartest for Cheapest)</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="context-desc">Context Length (High to Low)</option>
                        <option value="age-desc">Age (Newer first)</option>
                        <option value="name-asc">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className="modality-matrix" style={{ display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {MODALITIES.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => setActiveModality(mod.id)}
                        style={{
                            background: activeModality === mod.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            color: activeModality === mod.id ? '#000' : '#fff',
                            border: '1px solid',
                            borderColor: activeModality === mod.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: activeModality === mod.id ? 600 : 400,
                            transition: 'all 0.2s ease',
                            fontSize: '0.9rem'
                        }}
                        onMouseEnter={e => {
                            if (activeModality !== mod.id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={e => {
                            if (activeModality !== mod.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
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
