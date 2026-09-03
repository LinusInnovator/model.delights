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
                <div className="w-full bg-[#0f1011] border border-[#23252a] rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                            <h2 className="text-base font-semibold text-[#f7f8f8]">1-Minute Zero-Code Drop-In</h2>
                            <p className="text-xs text-[#8a8f98] mt-0.5">Snell is 100% wire-compatible with the standard OpenAI SDK, LangChain, Vercel AI SDK, Cursor, and Cline.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] bg-[#141516] border border-[#23252a] text-[#27a644] px-2.5 py-1 rounded-full font-mono font-medium">
                                Base URL: https://model.delights.pro/api/v1
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Option 1: Python Drop-In */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#d0d6e0] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
                                    <span>Python (Official OpenAI SDK)</span>
                                </span>
                                <span className="text-[10px] text-[#8a8f98] font-mono">pip install openai</span>
                            </div>
                            <pre className="bg-[#010102] border border-[#23252a] p-4 rounded-xl text-xs font-mono text-[#d0d6e0] overflow-x-auto">
{`from openai import OpenAI

client = OpenAI(
    base_url="https://model.delights.pro/api/v1",
    api_key="${keys.length > 0 ? keys[0].api_key : 'sk_snell_your_key_here'}"
)

# Route dynamically via Snell ('snell/auto', 'snell/economy', or 'snell/intelligence')
response = client.chat.completions.create(
    model="snell/auto",
    messages=[{"role": "user", "content": "Analyze our system architecture..."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`}
                            </pre>
                        </div>

                        {/* Option 2: Node / TypeScript Drop-In */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#d0d6e0] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#27a644]" />
                                    <span>Node.js / TypeScript (Official OpenAI SDK)</span>
                                </span>
                                <span className="text-[10px] text-[#8a8f98] font-mono">npm install openai</span>
                            </div>
                            <pre className="bg-[#010102] border border-[#23252a] p-4 rounded-xl text-xs font-mono text-[#d0d6e0] overflow-x-auto">
{`import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://model.delights.pro/api/v1',
    apiKey: process.env.SNELL_API_KEY || '${keys.length > 0 ? keys[0].api_key : 'sk_snell_your_key_here'}'
});

const stream = await openai.chat.completions.create({
    model: 'snell/economy', // Cuts bill by 70-90% with automatic fallback
    messages: [{ role: 'user', content: 'Generate high-performance SQL schema...' }],
    stream: true
});

for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
}`}
                            </pre>
                        </div>

                        {/* Option 3: Cursor / Cline / .env Configuration */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#d0d6e0] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                                    <span>Cursor / Cline / Environment Variable Drop-In</span>
                                </span>
                                <span className="text-[10px] text-[#8a8f98] font-mono">.env / IDE Config</span>
                            </div>
                            <pre className="bg-[#010102] border border-[#23252a] p-4 rounded-xl text-xs font-mono text-[#d0d6e0] overflow-x-auto">
{`# In your .env or Cursor OpenAI Base URL settings:
OPENAI_BASE_URL="https://model.delights.pro/api/v1"
OPENAI_API_KEY="${keys.length > 0 ? keys[0].api_key : 'sk_snell_your_key_here'}"

# Model IDs to use in your prompts or IDE model picker:
# - snell/auto         (Balanced intelligence + price router)
# - snell/economy      (Maximum savings, 70-90% cheaper)
# - snell/intelligence (Top frontier models: DeepSeek-R1, Claude 3.5 Sonnet)`}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
