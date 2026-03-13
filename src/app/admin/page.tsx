"use client";

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import '../components.css'; // Leverage existing global styles

interface PromoStat {
    id: string;
    company: string;
    status: string;
    views: number;
    hovers: number;
    clicks: number;
    ctr: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<PromoStat[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [drafts, setDrafts] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.stats) setStats(data.stats);
                setLoadingStats(false);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load telemetry stats.");
                setLoadingStats(false);
            });
    }, []);

    const handleGenerateOutreach = async () => {
        if (stats.length === 0) return;
        setGenerating(true);
        setError(null);

        // Grab top performer
        const topPerformer = stats[0];

        try {
            const res = await fetch('/api/admin/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topPerformer, allStats: stats })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate outreach");

            setDrafts(data.drafts);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <main className="main-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Partnership CMS</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Automatic Money Machine: Telemetry & Proactive Outreach</p>
                </div>
                <Link href="/" className="btn-action secondary">
                    <i className="ph ph-arrow-left"></i> Back to Site
                </Link>
            </div>

            {error && (
                <div style={{ padding: '15px 20px', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '12px', color: '#ff6b6b', marginBottom: '30px' }}>
                    <i className="ph ph-warning-circle" style={{ marginRight: '8px' }}></i> {error}
                </div>
            )}

            <div className="simulator-panel" style={{ marginBottom: '40px' }}>
                <div className="simulator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Live Sponsor Telemetry</h2>
                        <p>Real-time performance of native grid gems.</p>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    {loadingStats ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent)' }}><i className="ph ph-spinner ph-spin" style={{ fontSize: '2rem' }}></i></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '15px 10px' }}>Sponsor</th>
                                    <th style={{ padding: '15px 10px' }}>Status</th>
                                    <th style={{ padding: '15px 10px' }}>Impressions</th>
                                    <th style={{ padding: '15px 10px' }}>Hovers</th>
                                    <th style={{ padding: '15px 10px' }}>Clicks</th>
                                    <th style={{ padding: '15px 10px' }}>CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((stat, idx) => (
                                    <tr key={stat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx === 0 ? 'rgba(212, 175, 55, 0.05)' : 'transparent' }}>
                                        <td style={{ padding: '15px 10px', fontWeight: 600 }}>
                                            {idx === 0 && <i className="ph ph-crown" style={{ color: '#d4af37', marginRight: '8px' }}></i>}
                                            {stat.company}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{ padding: '4px 10px', background: stat.status === 'active' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(150, 150, 150, 0.15)', color: stat.status === 'active' ? '#4CAF50' : '#888', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                {stat.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>{stat.views}</td>
                                        <td style={{ padding: '15px 10px' }}>{stat.hovers}</td>
                                        <td style={{ padding: '15px 10px' }}>{stat.clicks}</td>
                                        <td style={{ padding: '15px 10px', color: idx === 0 ? '#d4af37' : 'var(--text)' }}><strong>{stat.ctr}%</strong></td>
                                    </tr>
                                ))}
                                {stats.length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No telemetry data found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="simulator-panel" style={{ background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(0, 0, 0, 0.2))', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                <div className="simulator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 style={{ background: 'linear-gradient(90deg, #f3e5ab, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Proactive Outreach Engine
                        </h2>
                        <p>Generate highly-personalized B2B cold emails using live ROI stats.</p>
                    </div>
                    <button
                        className="btn-action primary"
                        style={{ background: 'linear-gradient(90deg, #d4af37, #b58d22)', color: '#000', border: 'none', fontWeight: 700 }}
                        onClick={handleGenerateOutreach}
                        disabled={generating || stats.length === 0 || stats[0]?.views === 0}
                    >
                        {generating ? (
                            <><i className="ph ph-spinner ph-spin"></i> Brainstorming Leads...</>
                        ) : (
                            <><i className="ph ph-magic-wand"></i> Generate Leads Emails</>
                        )}
                    </button>
                </div>

                {drafts && (
                    <div style={{ marginTop: '30px', padding: '30px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="markdown-content" style={{ lineHeight: '1.6' }}>
                            <ReactMarkdown>{drafts}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
