"use client";
import 'hammerjs';

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

interface ComparisonChartProps {
    modelA: Model;
    modelB: Model;
    allModels: Model[];
}

export default function ComparisonChart({ modelA, modelB, allModels }: ComparisonChartProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chartRef = useRef<ChartJS<"scatter", any, unknown>>(null);

    // Filter models that have ELO and valid pricing > 0 to plot on log scale
    const chartDataPoints = allModels.filter(m => m.elo && m.pricing_per_1m);

    // Create 3 datasets: Model A, Model B, Background Models
    const createPoint = (m: Model) => {
        const cost = m.pricing_per_1m.prompt + m.pricing_per_1m.completion;
        return {
            x: cost > 0.0001 ? cost : 0.0001, // Avoid 0 on log scale
            y: m.elo as number,
            name: m.name || m.id,
            isFree: cost === 0,
            id: m.id
        };
    };

    const ptA = createPoint(modelA);
    const ptB = createPoint(modelB);

    const backgroundModels = chartDataPoints
        .filter(m => m.id !== modelA.id && m.id !== modelB.id)
        .map(createPoint);

    const chartData = {
        datasets: [
            {
                label: modelA.name || modelA.id,
                data: [ptA],
                backgroundColor: '#00e5ff',
                borderColor: '#fff',
                borderWidth: 2,
                pointRadius: 10,
                pointHoverRadius: 12
            },
            {
                label: modelB.name || modelB.id,
                data: [ptB],
                backgroundColor: '#7000ff',
                borderColor: '#fff',
                borderWidth: 2,
                pointRadius: 10,
                pointHoverRadius: 12
            },
            {
                label: 'Other Models',
                data: backgroundModels,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 4
            }
        ]
    };

     
    const chartOptions: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, labels: { color: '#fff' } },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: undefined, // ensure no command/ctrl key is needed
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
                     
                    label: function (context: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
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
        }
    };

    return (
        <div className="simulator-panel" style={{ maxWidth: '100%', marginBottom: '30px' }}>
            <div className="simulator-header chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="ph ph-chart-scatter" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}></i>
                    <h2 style={{ margin: 0 }}>Market Placement</h2>
                </div>
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
            </div>

            <div style={{ width: '100%', height: '400px', position: 'relative', marginTop: '20px' }}>
                <Scatter ref={chartRef} data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
