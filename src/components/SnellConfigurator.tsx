"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SnellNodeConfig, ExportModal } from './ExportModal';
import { RoutingResponse } from '@/lib/routingEngine';

const DUMMY_MODELS = [
    'openai/gpt-4o', 'google/gemini-1.5-pro', 'anthropic/claude-3-haiku', 
    'meta-llama/llama-3-70b', 'openai/gpt-4o-mini', 'mistralai/mixtral-8x7b'
];

function LiveSimulationCard({ node }: { node: SnellNodeConfig }) {
    const [status, setStatus] = useState<'idle' | 'simulating' | 'locked' | 'error'>('idle');
    const [simText, setSimText] = useState('Awaiting simulation...');
    const [result, setResult] = useState<RoutingResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const runSimulation = async () => {
        setStatus('simulating');
        setResult(null);
        let ticks = 0;

        // Slot machine effect
        const interval = setInterval(() => {
            setSimText(DUMMY_MODELS[Math.floor(Math.random() * DUMMY_MODELS.length)]);
            ticks++;
        }, 80);

        try {
            const res = await fetch('/api/simulate-route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(node)
            });

            const data = await res.json();
            
            clearInterval(interval);
            
            if (!res.ok) {
                setStatus('error');
                setErrorMessage(data.error || 'Simulation failed');
                return;
            }

            // Ensure the slot machine runs for at least a second for dramatic effect
            if (ticks < 12) {
                await new Promise(r => setTimeout(r, (12 - ticks) * 80));
            }

            setResult(data);
            setStatus('locked');
        } catch (e: any) {
            clearInterval(interval);
            setStatus('error');
            setErrorMessage(e.message);
        }
    };

    // Auto-run simulation when node config changes significantly (debounced could be better, but simple is fine for demo)
    // We will bind a button instead so it feels more tactile.
    
    return (
        <div className="bg-black border border-white/10 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Glow when locked */}
            {status === 'locked' && (
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-green-500/10 blur-[80px] pointer-events-none rounded-full" />
            )}
            
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-white/90">Live Mathematical Proof</h4>
                    <p className="text-xs text-white/50 mt-1">Simulates Snell SDK routing on your exact logic.</p>
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={status === 'simulating'}
                    className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-white/90 disabled:opacity-50 transition flex items-center gap-2"
                >
                    {status === 'simulating' ? (
                        <><span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" /> Scanning Market</>
                    ) : 'Run Simulation'}
                </button>
            </div>

            <div className="bg-[#111] p-4 rounded-lg font-mono min-h-[140px] flex flex-col justify-center border border-white/5">
                {status === 'idle' && (
                    <div className="text-white/30 text-center text-sm">
                        Waiting for variables...
                    </div>
                )}
                {status === 'simulating' && (
                    <div className="text-center">
                        <div className="text-primary text-lg animate-pulse">{simText}</div>
                        <div className="text-white/40 text-xs mt-2 uppercase tracking-widest">Evaluating ROI Vectors...</div>
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-red-400 text-center text-sm">
                        Simulation Error: {errorMessage}
                    </div>
                )}
                {status === 'locked' && result && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs text-white/50 uppercase">Flagship Route</span>
                            <span className="text-sm text-white font-medium">{result.flagship.model}</span>
                        </div>
                        
                        {result.smart_value ? (
                            <div className="bg-green-500/10 -mx-4 px-4 py-3 border-y border-green-500/20">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-green-400 uppercase font-bold tracking-tight">Smart Alternative</span>
                                    <span className="text-sm text-green-300 font-medium">{result.smart_value.model}</span>
                                </div>
                                <div className="text-xs text-green-400/80">
                                    {result.smart_value.financial_tradeoff}
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-white/40 text-center py-2 px-2 bg-[#111] rounded border border-white/5">
                                {node.policy === 'max_savings'
                                    ? "✓ Flagship is already the absolute lowest-cost capable model market-wide."
                                    : "No budget alternative found within an acceptable intelligence drop."}
                            </div>
                        )}
                        
                        <div className="text-[10px] text-white/30 text-right mt-1">
                            Snapshot timestamp: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


function NodeEditor({ node, updateNode, removeNode }: { node: SnellNodeConfig, updateNode: (n: SnellNodeConfig) => void, removeNode: () => void }) {
    
    const toggleCapability = (cap: string) => {
        if (node.capabilities.includes(cap)) {
            updateNode({ ...node, capabilities: node.capabilities.filter(c => c !== cap) });
        } else {
            updateNode({ ...node, capabilities: [...node.capabilities, cap] });
        }
    };

    return (
        <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden mb-6 flex flex-col md:flex-row">
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <input 
                        type="text" 
                        value={node.id} 
                        onChange={(e) => updateNode({ ...node, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="bg-transparent text-xl font-bold text-white outline-none border-b border-transparent hover:border-white/20 focus:border-primary w-full max-w-[200px]"
                        placeholder="node_id"
                    />
                    <button onClick={removeNode} className="text-red-400/50 hover:text-red-400 text-sm">Remove</button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Primary Intent</label>
                        <select 
                            value={node.intent} 
                            onChange={(e) => updateNode({...node, intent: e.target.value})}
                            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        >
                            <option value="coding">Coding & Logic</option>
                            <option value="reasoning">Deep Reasoning (C-Suite logic)</option>
                            <option value="drafting">Drafting (Fast Output)</option>
                            <option value="classification">Classification / Extraction</option>
                            <option value="conversational">General Conversation</option>
                            <option value="agentic">Strict Agentic (JSON)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Routing Policy</label>
                        <select 
                            value={node.policy} 
                            onChange={(e) => updateNode({...node, policy: e.target.value})}
                            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                        >
                            <option value="balanced">Balanced (Recommended)</option>
                            <option value="max_quality">Max Quality (Ignore price)</option>
                            <option value="max_savings">Max Savings</option>
                            <option value="low_latency">Low Latency</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Est. Input Window (Tokens)</label>
                        <input 
                            type="range" 
                            min="0" max="2000000" step="10000"
                            value={node.estimatedInputTokens}
                            onChange={(e) => updateNode({...node, estimatedInputTokens: parseInt(e.target.value)})}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-white/40 mt-1">
                            <span>0</span>
                            <span className="text-primary font-mono">{node.estimatedInputTokens.toLocaleString()}</span>
                            <span>2M+</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Required Core Modalities</label>
                        <div className="flex flex-wrap gap-2">
                            {['text', 'image', 'audio', 'video', 'json', 'tools'].map(cap => (
                                <button 
                                    key={cap}
                                    onClick={() => toggleCapability(cap)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 border ${
                                        node.capabilities.includes(cap) 
                                            ? 'bg-white text-black border-white' 
                                            : 'bg-[#111] text-white/60 border-white/10 hover:border-white/30'
                                    }`}
                                >
                                    {node.capabilities.includes(cap) && <span className="block w-1.5 h-1.5 rounded-full bg-black"></span>}
                                    {cap}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 md:max-w-[400px] bg-[#111]/50 p-6 flex flex-col justify-center">
                <LiveSimulationCard node={node} />
            </div>
        </div>
    );
}


export function SnellConfigurator() {
    const [nodes, setNodes] = useState<SnellNodeConfig[]>([]);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('snell_nodes_config');
        if (saved) {
            try { 
                setNodes(JSON.parse(saved)); 
            } catch (e) {
                // ignore
            }
        } 
        
        if (!saved || nodes.length === 0) {
            setNodes([{
                id: 'extraction_worker',
                intent: 'agentic',
                estimatedInputTokens: 15000,
                policy: 'max_savings',
                capabilities: ['text'],
                cached_payload: false
            }]);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('snell_nodes_config', JSON.stringify(nodes));
        }
    }, [nodes, isLoaded]);

    const addNode = () => {
        setNodes([
            ...nodes, 
            {
                id: `node_0${nodes.length + 1}`,
                intent: 'coding',
                estimatedInputTokens: 2000,
                policy: 'balanced',
                capabilities: ['text'],
                cached_payload: false
            }
        ]);
    };

    const updateNode = (index: number, updated: SnellNodeConfig) => {
        const newNodes = [...nodes];
        newNodes[index] = updated;
        setNodes(newNodes);
    };

    const removeNode = (index: number) => {
        const newNodes = [...nodes];
        newNodes.splice(index, 1);
        setNodes(newNodes);
    };

    if (!isLoaded) return null;

    return (
        <div className="max-w-6xl mx-auto w-full pb-32">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">White-Box Routing <span className="text-primary italic">Matrix</span></h2>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Don&apos;t hardcode expensive model strings. Define your architectural constraints visually, prove the ROI in real-time, and export a drop-in configuration file for the Snell SDK. 
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">Ready for production?</p>
                        <p className="text-xs text-white/50">Drop perfectly typed rules to your repo</p>
                    </div>
                    <button 
                        onClick={() => setIsExportOpen(true)}
                        className="bg-primary text-black px-6 py-3 rounded-lg font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all flex items-center gap-2"
                    >
                        Export Configs <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </div>
            </div>

            <div className="space-y-6 relative">
                {/* Connecting Line behind nodes (aesthetic) */}
                <div className="absolute left-6 md:left-[350px] top-10 bottom-10 w-px bg-gradient-to-b from-primary/30 to-transparent -z-10 hidden sm:block"></div>

                {nodes.map((n, i) => (
                    <NodeEditor 
                        key={i} 
                        node={n} 
                        updateNode={(u) => updateNode(i, u)} 
                        removeNode={() => removeNode(i)} 
                    />
                ))}

                <button 
                    onClick={addNode}
                    className="w-full py-6 border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex items-center justify-center gap-3 text-white/60 hover:text-white transition-all font-medium mt-8"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Routing Node
                </button>
            </div>

            <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} nodes={nodes} />
        </div>
    );
}

