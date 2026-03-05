"use client";

import React from 'react';

interface PromoCardProps {
    title: string;
    description: string;
    url: string;
    ctaText: string;
    badgeText?: string;
}

export default function PromoCard({
    title,
    description,
    url,
    ctaText,
    badgeText = "Featured Gem"
}: PromoCardProps) {
    return (
        <div className="model-card promo-card-wrapper" style={{ cursor: 'pointer' }} onClick={() => window.open(url, '_blank')}>
            <div className="card-inner promo-inner">
                <div className="card-front promo-front">
                    <div className="promo-badge-container">
                        <span className="promo-badge">
                            <i className="ph ph-sparkle" style={{ marginRight: '4px' }}></i>
                            {badgeText}
                        </span>
                    </div>

                    <div className="promo-content">
                        <h3 className="promo-title gradient-text">{title}</h3>
                        <p className="promo-desc">{description}</p>
                    </div>

                    <div className="promo-cta-container">
                        <a href={url} target="_blank" rel="noreferrer" className="btn-action primary promo-cta" onClick={e => e.stopPropagation()}>
                            {ctaText} <i className="ph ph-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
