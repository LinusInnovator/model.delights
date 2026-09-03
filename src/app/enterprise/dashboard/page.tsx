'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKey {
    id: string;
    name: string;
    api_key: string;
    created_at: string;
}

export default function EnterpriseDashboard() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/enterprise/keys');
            if (!res.ok) throw new Error('Failed to fetch keys');
            const data = await res.json();
            setKeys(data.keys || []);
            setIsPro(!!data.isPro);
        } catch (e: unknown) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch('/api/enterprise/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate key');
            
            setKeys([data.key, ...keys]);
            setIsPro(!!data.isPro);
            setNewKeyName('');
        } catch (e: unknown) {
            setError((e as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
        
        try {
            const res = await fetch(`/api/enterprise/keys?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to revoke key');
            setKeys(keys.filter(k => k.id !== id));
        } catch (e: unknown) {
            setError((e as Error).message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
            {/* Navigation */}
            <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
                <Link href="/" className="text-xl font-bold tracking-tight hover:text-cyan-400 transition-colors">
                    model.delights.pro
                </Link>
                <div className="flex space-x-6 text-sm font-medium text-zinc-400">
                    <Link href="/models" className="hover:text-white transition-colors">Model Matrix</Link>
                    <Link href="/enterprise" className="hover:text-white transition-colors">&larr; Enterprise Plans</Link>
                </div>
            </nav>

            <main className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-start text-left">
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Snell Router API Keys</h1>
                        <p className="text-zinc-400 text-base">Control Plane credentials for mathematical AI model routing.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isPro ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                👑 PRO ENTERPRISE &bull; Unlimited
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                ⚡ FREE TIER &bull; 10k Routes/mo
                            </span>
                        )}
                    </div>
                </div>

                {!isPro && (
                    <div className="w-full mb-8 p-5 bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>Unlock Unlimited Routing & Sub-Second Matrix</span>
                                <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">$99 / mo</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                                Free tier is capped at 10,000 routes/mo and 1 active key. Pro unlocks unlimited keys, team routing, sub-50ms outage bypass, and prompt cache prefix enforcement.
                            </p>
                        </div>
                        <Link 
                            href="/enterprise" 
                            className="shrink-0 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black font-semibold text-xs rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                            Upgrade to Pro &rarr;
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="w-full p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Generate New Key */}
                <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 mb-10 shadow-xl">
                    <h2 className="text-lg font-semibold mb-2">Generate New Snell API Key</h2>
                    <p className="text-xs text-zinc-400 mb-4">
                        {!isPro ? 'Free accounts can create 1 active key. Pass this key in your SDK or HTTP headers.' : 'Name your microservice or environment key.'}
                    </p>
                    <form onSubmit={handleGenerate} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="e.g. Staging App, Production Agent, Next.js Backend"
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            disabled={generating}
                            className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 text-sm"
                        >
                            {generating ? 'Generating...' : 'Create Key'}
                        </button>
                    </form>
                </div>

                {/* Key List */}
                <div className="w-full mb-12">
                    <h2 className="text-lg font-semibold mb-4">Active API Keys</h2>
                    {loading ? (
                        <div className="text-zinc-500 text-sm py-4">Loading your keys...</div>
                    ) : keys.length === 0 ? (
                        <div className="text-zinc-400 text-sm italic p-8 border border-dashed border-white/10 rounded-xl text-center bg-white/[0.02]">
                            No API keys generated yet. Enter a name above to create your free key and begin routing instantly.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {keys.map(key => (
                                <div key={key.id} className="w-full bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/10">
                                    <div>
                                        <div className="font-semibold text-white mb-1 flex items-center gap-2">
                                            <span>{key.name}</span>
                                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">ACTIVE</span>
                                        </div>
                                        <div className="text-xs text-zinc-500 font-mono">
                                            Created {new Date(key.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="bg-black border border-white/10 px-4 py-2 rounded-lg font-mono text-xs text-cyan-300 select-all overflow-x-auto flex-1 sm:max-w-xs truncate">
                                            {key.api_key}
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(key.api_key)}
                                            className="p-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                                            title="Copy API Key"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => handleRevoke(key.id)}
                                            className="p-2 border border-red-500/20 bg-red-500/5 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Revoke Key"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Start Integration Code */}
                <div className="w-full bg-zinc-950 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-white">1-Minute Quick Start</h2>
                        <span className="text-xs text-zinc-500 font-mono">npm install model-delights-snell</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-zinc-400 block mb-1">1. Add to your <code className="text-cyan-400">.env.local</code>:</span>
                            <pre className="bg-black border border-white/10 p-3 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto">
{keys.length > 0 ? `SNELL_API_KEY=${keys[0].api_key}\nOPENROUTER_API_KEY=sk-or-v1-...` : `SNELL_API_KEY=sk_snell_your_key_here\nOPENROUTER_API_KEY=sk-or-v1-...`}
                            </pre>
                        </div>

                        <div>
                            <span className="text-xs text-zinc-400 block mb-1">2. Run autonomous routing in your API route:</span>
                            <pre className="bg-black border border-white/10 p-3 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto">
{`import { IntelligenceRouter } from 'model-delights-snell';

const router = new IntelligenceRouter({ apiKey: process.env.SNELL_API_KEY });

// Execute prompt with automatic model selection & fallback cascade
const res = await router.execute({
    openrouterKey: process.env.OPENROUTER_API_KEY,
    messages: [{ role: 'user', content: 'Generate high-performance SQL query...' }],
    config: { intent: 'coding', policy: 'max_savings' }
});`}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
