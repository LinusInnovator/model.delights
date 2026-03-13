"use client";

import React, { useState } from 'react';
import { Copy, Key, CheckCircle } from '@phosphor-icons/react';

export interface ModelNode {
    provider: string;
    id: string;
    rationale?: string;
    fallbacks?: { id: string; provider: string }[];
}

export interface BlueprintData {
    name: string;
    stack: Record<string, ModelNode>;
    estimated_cost_per_interaction: string;
    bleeding_edge_wildcard?: ModelNode;
    [key: string]: unknown;
}

interface BlueprintCardProps {
    intent: string;
    blueprint: BlueprintData;
}

export default function BlueprintCard({ intent, blueprint }: BlueprintCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedContent, setCopiedContent] = useState<string | null>(null);

    const getEnvKeyForProvider = (provider: string) => {
        const p = provider.toLowerCase();
        if (p.includes('openrouter')) return 'OPENROUTER_API_KEY';
        if (p.includes('fal')) return 'FAL_KEY';
        if (p.includes('cartesia')) return 'CARTESIA_API_KEY';
        if (p.includes('volcano')) return 'VOLCANO_API_KEY';
        if (p.includes('elevenlabs')) return 'ELEVENLABS_API_KEY';
        if (p.includes('aws') || p.includes('bedrock')) return 'AWS_ACCESS_KEY_ID';

        // Handle fully dynamic providers discovered via the Metarouter
        const cleanProvider = provider.toUpperCase().replace('_AI', '').replace('-', '_');
        return `${cleanProvider}_API_KEY`;
    };

    const getProviderColor = (provider: string) => {
        const p = provider.toLowerCase();
        if (p.includes('openrouter')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (p.includes('fal')) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        if (p.includes('volcano')) return 'bg-zinc-800 text-zinc-300 border-zinc-700/50';
        if (p.includes('cartesia') || p.includes('eleven')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    };

    const formatProviderName = (provider: string) => {
        const p = provider.toLowerCase();
        if (p === 'aws' || p.includes('bedrock')) return 'AWS Bedrock';
        if (p === 'openrouter') return 'OpenRouter';
        if (p === 'elevenlabs') return 'ElevenLabs';
        if (p === 'fal') return 'Fal.ai';
        if (p === 'volcano') return 'Volcano Engine';

        // Dynamically style generic names, e.g. "fireworks_ai" -> "Fireworks Ai", "together_ai" -> "Together Ai"
        return p
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const handleCopyEnv = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Find all unique providers in the stack including fallbacks
        const providers = new Set<string>();
        Object.values(blueprint.stack).forEach(node => {
            providers.add(node.provider);
            if (node.fallbacks) {
                node.fallbacks.forEach(f => providers.add(f.provider));
            }
        });
        if (blueprint.bleeding_edge_wildcard) {
            providers.add(blueprint.bleeding_edge_wildcard.provider);
        }

        const envLines = Array.from(providers).map(p => `${getEnvKeyForProvider(p)}=your_key_here`);
        const header = `# Model Delights Blueprint: ${blueprint.name}\n`;
        const envContent = header + envLines.join('\n');

        navigator.clipboard.writeText(envContent);
        setCopiedContent('env');
        setTimeout(() => setCopiedContent(null), 2000);
    };

    return (
        <div
            className="flex flex-col relative transition-all duration-300 ease-out border border-white/5 bg-transparent overflow-hidden"
            style={{ minHeight: isExpanded ? 'auto' : '150px' }}
        >
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-md -z-10" />

            <div className="p-4 sm:p-5 flex-grow flex flex-col pointer-events-auto cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start mb-2 pointer-events-none">
                    <h3 className="font-semibold text-lg sm:text-lg tracking-tight leading-tight text-white pr-4">
                        {blueprint.name}
                    </h3>
                    <span className="text-xs font-mono text-zinc-500 whitespace-nowrap bg-black/20 px-2 py-1 rounded">
                        {blueprint.estimated_cost_per_interaction}
                    </span>
                </div>

                <p className="text-sm text-zinc-400 mb-4 uppercase tracking-widest text-[10px] pointer-events-none">
                    Intent: {intent}
                </p>

                <div className="flex-grow flex items-end pointer-events-none">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {Object.keys(blueprint.stack).map(nodeKey => {
                            const p = blueprint.stack[nodeKey].provider;
                            return (
                                <span key={nodeKey} className={`text-xs px-2 py-1 rounded-sm border pointer-events-auto flex items-center gap-1 ${getProviderColor(p)}`}>
                                    <Key size={10} className="opacity-50" />
                                    <span className="opacity-60 mr-1">{nodeKey}</span>
                                    {formatProviderName(p)}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Expanded Stack Details */}
            {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-white/5 bg-black/20 pointer-events-auto flex flex-col gap-4">
                    {/* Standard Stack */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Optimized Stack</h4>
                            <button
                                onClick={handleCopyEnv}
                                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-sm transition-colors border border-white/5 font-mono"
                            >
                                {copiedContent === 'env' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                                {copiedContent === 'env' ? 'Copied .env' : 'Copy Required .env'}
                            </button>
                        </div>
                        {Object.entries(blueprint.stack).map(([nodeKey, node]) => (
                            <div key={nodeKey} className="bg-white/5 p-3 rounded-sm border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono text-zinc-400">{nodeKey}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Primary</span>
                                            <span className="text-xs font-mono text-white/80">{node.id}</span>
                                        </div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-mono ${getProviderColor(node.provider)}`}>
                                            requires: {getEnvKeyForProvider(node.provider)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 mb-3">{node.rationale}</p>

                                {node.fallbacks && node.fallbacks.length > 0 && (
                                    <div className="border-t border-white/5 pt-2 mt-2 flex flex-col gap-1.5">
                                        {node.fallbacks.map((fb, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-black/20 p-1.5 rounded-sm hover:bg-white/5 transition-colors">
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                                                    Fallback {idx + 1}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-zinc-400">{fb.id}</span>
                                                    <span className={`text-[8px] px-1 py-0.5 rounded-sm border font-mono ${getProviderColor(fb.provider)}`}>
                                                        {getEnvKeyForProvider(fb.provider)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Bleeding Edge Wildcard */}
                    {blueprint.bleeding_edge_wildcard && (
                        <div className="mt-2 p-4 rounded-sm border border-fuchsia-500/20 bg-fuchsia-500/5">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-400 mb-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                Discovery Engine Wildcard
                            </h4>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-fuchsia-300/60">alternative</span>
                                <span className="text-xs font-mono text-fuchsia-200 break-all ml-2 text-right">{blueprint.bleeding_edge_wildcard.id}</span>
                            </div>
                            <p className="text-xs text-fuchsia-300/80 mt-2">{blueprint.bleeding_edge_wildcard.rationale}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
