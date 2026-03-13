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
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/enterprise/keys');
            if (!res.ok) throw new Error('Failed to fetch keys');
            const data = await res.json();
            setKeys(data.keys);
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
        alert('API Key copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
            {/* Navigation */}
            <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
                <Link href="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
                    model.delights.pro
                </Link>
                <div className="flex space-x-6 text-sm font-medium text-zinc-400">
                    <Link href="/enterprise" className="hover:text-white transition-colors">&larr; Back to Enterprise</Link>
                </div>
            </nav>

            <main className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-start text-left">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">API Keys</h1>
                    <p className="text-zinc-400 text-lg">Manage your secure B2B Snell Router credentials.</p>
                </div>

                {error && (
                    <div className="w-full p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Generate New Key */}
                <div className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 mb-12 shadow-xl">
                    <h2 className="text-lg font-semibold mb-4">Generate New Secret Key</h2>
                    <form onSubmit={handleGenerate} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="e.g. Production Sub-Agent"
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            disabled={generating}
                            className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            {generating ? 'Generating...' : 'Create Key'}
                        </button>
                    </form>
                </div>

                {/* Key List */}
                <div className="w-full">
                    <h2 className="text-lg font-semibold mb-6">Active Keys</h2>
                    {loading ? (
                        <div className="text-zinc-500">Loading your keys...</div>
                    ) : keys.length === 0 ? (
                        <div className="text-zinc-500 italic p-8 border border-dashed border-white/10 rounded-xl text-center">
                            No API keys generated yet. Create one above to begin securely querying the Gateway.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {keys.map(key => (
                                <div key={key.id} className="w-full bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/10">
                                    <div>
                                        <div className="font-semibold text-white mb-1">{key.name}</div>
                                        <div className="text-xs text-zinc-500 font-mono">
                                            Created {new Date(key.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="bg-black border border-white/10 px-4 py-2 rounded-lg font-mono text-sm text-blue-300 select-all overflow-x-auto flex-1 sm:max-w-xs truncate">
                                            {key.api_key}
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(key.api_key)}
                                            className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
                                            title="Copy to clipboard"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => handleRevoke(key.id)}
                                            className="p-2 border border-red-500/20 bg-red-500/5 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Revoke Key"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
