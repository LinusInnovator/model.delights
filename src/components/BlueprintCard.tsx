"use client";

import React, { useState } from 'react';

interface ModelNode {
    provider: string;
    id: string;
    rationale?: string;
}

interface BlueprintData {
    name: string;
    stack: Record<string, ModelNode>;
    estimated_cost_per_interaction: string;
    bleeding_edge_wildcard?: ModelNode;
}

interface BlueprintCardProps {
    intent: string;
    blueprint: BlueprintData;
}

export default function BlueprintCard({ intent, blueprint }: BlueprintCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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
                        {Object.keys(blueprint.stack).map(nodeKey => (
                            <span key={nodeKey} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-zinc-300 pointer-events-auto">
                                <span className="text-zinc-500 mr-2">{nodeKey}</span>
                                {blueprint.stack[nodeKey].provider}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expanded Stack Details */}
            {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-white/5 bg-black/20 pointer-events-auto flex flex-col gap-4">
                    {/* Standard Stack */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Optimized Stack</h4>
                        {Object.entries(blueprint.stack).map(([nodeKey, node]) => (
                            <div key={nodeKey} className="bg-white/5 p-3 rounded-sm border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-mono text-zinc-400">{nodeKey}</span>
                                    <span className="text-xs font-mono text-white/80">{node.id}</span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-2">{node.rationale}</p>
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
