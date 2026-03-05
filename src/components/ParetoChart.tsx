"use client";

import React, { useRef } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    LogarithmicScale,
    ScatterController
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Scatter } from 'react-chartjs-2';
import { Model } from '@/lib/api';

ChartJS.register(
    LinearScale,
    LogarithmicScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    ScatterController,
    zoomPlugin
);

ChartJS.defaults.color = '#9ba1a6';
ChartJS.defaults.font.family = "'Inter', sans-serif";

interface ParetoChartProps {
    models: Model[];
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export default function ParetoChart({ models, isExpanded, onToggleExpand }: ParetoChartProps) {
    const chartRef = useRef<ChartJS<"scatter", any, unknown>>(null);

    // Filter models that have ELO and valid pricing > 0 to plot on log scale
    let chartDataPoints = models.filter(m => m.elo && m.pricing_per_1m);

    const mappedData = chartDataPoints.map(m => {
        const cost = m.pricing_per_1m.prompt + m.pricing_per_1m.completion;
        return {
            x: cost > 0.0001 ? cost : 0.0001, // Avoid 0 on log scale
            y: m.elo as number,
            name: m.name || m.id,
            isFree: cost === 0,
            id: m.id
        };
    });

    const chartData = {
        datasets: [{
            label: 'Models',
            data: mappedData,
            backgroundColor: 'rgba(0, 229, 255, 0.6)',
            borderColor: '#00e5ff',
            borderWidth: 1,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                limits: {
                    x: { min: 'original', max: 'original' },
                    y: { min: 'original', max: 'original' }
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                }
            },
            tooltip: {
                backgroundColor: 'rgba(13, 15, 20, 0.9)',
                titleColor: '#00e5ff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        const pt = context.raw;
                        const costStr = pt.isFree ? 'Free' : '$' + (pt.x > 0.0001 ? pt.x.toFixed(4) : 0) + ' / 1M';
                        return pt.name + ' | ' + costStr + ' | ELO: ' + pt.y;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'logarithmic',
                title: { display: true, text: 'Price per 1M Tokens ($) (Log Scale)' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                title: { display: true, text: 'ELO Score' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        },
        onClick: (e: any, activeElements: any[], chart: any) => {
            if (activeElements.length > 0) {
                const datasetIndex = activeElements[0].datasetIndex;
                const dataIndex = activeElements[0].index;
                const dataPoint = chart.data.datasets[datasetIndex].data[dataIndex];

                const card = document.getElementById(dataPoint.id);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.transition = 'box-shadow 0.3s ease';
                    card.style.boxShadow = '0 0 30px #00e5ff';
                    setTimeout(() => {
                        card.style.boxShadow = '';
                    }, 2000);
                }
            }
        }
    };

    if (mappedData.length === 0) return null;

    return (
        <div className="simulator-panel" style={{ maxWidth: '100%', marginBottom: '30px' }}>
            <div
                className="simulator-header chart-header-row"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={onToggleExpand}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ph ph-chart-scatter" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}></i>
                    <h2 style={{ margin: 0 }}>Value Frontier (Price vs. ELO)</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isExpanded && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (chartRef.current) {
                                    chartRef.current.resetZoom();
                                }
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'var(--foreground)',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2sease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            <i className="ph ph-arrows-out-simple"></i> Reset
                        </button>
                    )}
                    <i className={`ph ph-caret-${isExpanded ? 'up' : 'down'}`} style={{ color: 'var(--text-secondary)' }}></i>
                </div>
            </div>

            {isExpanded && (
                <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                    <Scatter ref={chartRef} data={chartData} options={chartOptions} />
                </div>
            )}
        </div>
    );
}
