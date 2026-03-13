"use client";

import React, { useEffect, useState, useRef } from 'react';

interface PromoData {
    id: string;
    title: string;
    description: string;
    url: string;
    ctaText: string;
    badgeText?: string;
}

export default function PromoCard() {
    const [promo, setPromo] = useState<PromoData | null>(null);
    const [loading, setLoading] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);
    const hasViewed = useRef(false);

    useEffect(() => {
        fetch('/api/promotions')
            .then(res => res.json())
            .then(data => {
                if (data.promo) {
                    setPromo(data.promo);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const trackEvent = (eventType: 'view' | 'hover' | 'click') => {
        if (!promo) return;
        fetch('/api/promotions/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promoId: promo.id, eventType })
        }).catch(err => console.error('Failed to track promo event:', err));
    };

    useEffect(() => {
        if (!promo || !cardRef.current || hasViewed.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasViewed.current) {
                hasViewed.current = true;
                trackEvent('view');
                observer.disconnect();
            }
        }, { threshold: 0.5 }); // Fire view event when 50% of the card is visible

        observer.observe(cardRef.current);

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [promo]);

    if (loading || !promo) return null;

    return (
        <div
            ref={cardRef}
            className="model-card promo-card-wrapper"
            style={{ cursor: 'pointer' }}
            onClick={() => {
                trackEvent('click');
                window.open(promo.url, '_blank');
            }}
            onMouseEnter={() => trackEvent('hover')}
        >
            <div className="card-inner promo-inner">
                <div className="card-front promo-front">
                    <div className="promo-badge-container">
                        <span className="promo-badge">
                            <i className="ph ph-sparkle" style={{ marginRight: '4px' }}></i>
                            {promo.badgeText || "Featured Gem"}
                        </span>
                    </div>

                    <div className="promo-content">
                        <h3 className="promo-title gradient-text">{promo.title}</h3>
                        <p className="promo-desc">{promo.description}</p>
                    </div>

                    <div className="promo-cta-container">
                        <a
                            href={promo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-action primary promo-cta"
                            onClick={e => {
                                e.stopPropagation();
                                trackEvent('click');
                            }}
                        >
                            {promo.ctaText} <i className="ph ph-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
