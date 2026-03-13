'use client';

import React from 'react';
import CheckoutButton from '@/app/enterprise/CheckoutButton';
import { TrendDown, Lightning } from '@phosphor-icons/react';

interface ArbitrageUpsellProps {
    modelAName: string;
    modelBName: string;
    cheaperPercentage: number;
    worseModelName: string;
}

export default function ArbitrageUpsell({ modelBName, cheaperPercentage, worseModelName }: ArbitrageUpsellProps) {
    if (cheaperPercentage < 10) return null; // Only show if arbitrage is significant

    return (
        <div className="relative overflow-hidden w-full max-w-4xl mx-auto my-8 rounded-2xl border border-white/10" style={{ animation: 'fadeIn 1s ease 0.6s backwards' }}>
            {/* The Neon Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

            <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Value Proposition */}
                <div className="flex-1 text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <TrendDown size={14} />
                        <span>Arbitrage Alert</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight tracking-tight">
                        You are losing <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-fuchsia-400 font-extrabold">{cheaperPercentage}%</span><br />
                        per million tokens by hardcoding {worseModelName}.
                    </h3>

                    <p className="text-zinc-400 text-sm sm:text-base mb-6 leading-relaxed max-w-md">
                        Stop guessing exactly which model to route to. Deploy the <strong className="text-zinc-200">0ms Intelligence Engine</strong> to automatically arbitrage this {cheaperPercentage}% gap in your production environment instantly.
                    </p>

                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-black/40 px-3 py-2 rounded-lg border border-white/5 inline-flex">
                        <Lightning size={12} className="text-yellow-500" />
                        <span>{cheaperPercentage}% Instant Profit Margin Recovery</span>
                    </div>
                </div>

                {/* The Frictionless Conversion Endpoint */}
                <div className="w-full md:w-auto flex flex-col items-center">
                    {/* Reuse the exact same button from the Enterprise flow */}
                    <div className="hover:scale-105 transition-transform duration-300">
                        <CheckoutButton />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1 font-mono uppercase tracking-widest">
                        Node.js Enterprise SDK included
                    </span>
                </div>

            </div>
        </div>
    );
}
