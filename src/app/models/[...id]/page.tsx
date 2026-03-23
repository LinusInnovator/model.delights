import { fetchModels } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import Script from "next/script";

// ISR config: cache these pages for 5 mins
export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ id: string[] }> }) {
    const params = await props.params;
    const modelId = params.id.join('/');

    const { models } = await fetchModels();
    const model = models.find((m) => m.id === modelId);

    if (!model) return { title: "Model Not Found - model.delights" };

    return {
        title: `${model.name} API Pricing, ELO & Benchmarks | model.delights`,
        description: `Detailed analysis of ${model.name}. Compare prompt costs, completion costs, context window limits, and LMSYS Chatbot Arena ELO intelligence scores for AI developers.`,
    };
}

export default async function ModelProfilePage(props: { params: Promise<{ id: string[] }> }) {
    const params = await props.params;
    const modelId = params.id.join('/');

    const { models, last_updated } = await fetchModels();
    const model = models.find((m) => m.id === modelId);

    if (!model) {
        notFound();
    }

    const formatPrice = (p: number) => {
        if (p < 0) return 'Variable';
        if (p === 0) return 'Free';
        if (p < 0.001) return `$${p.toFixed(5)}`;
        if (p < 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
    };

    const costMillion = model.pricing_per_1m.prompt + model.pricing_per_1m.completion;
    
    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": model.name,
        "applicationCategory": "DeveloperApplication",
        "description": model.description || `Language model by ${params.id[0]}`,
        "offers": {
            "@type": "Offer",
            "price": costMillion.toFixed(4),
            "priceCurrency": "USD"
        }
    };

    // Find direct peers in the same ELO / Pricing bracket for comparison links
    const relatedModels = models
        .filter(m => m.id !== model.id && m.elo && Math.abs(m.elo - (model.elo || 0)) < 100)
        .sort((a, b) => Math.abs((a.elo || 0) - (model.elo || 0)) - Math.abs((b.elo || 0) - (model.elo || 0)))
        .slice(0, 6);

    const nameDisplay = model.name.replace('Anthropic: ', '').replace('OpenAI: ', '').replace('Meta: ', '').replace('Google: ', '');

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8" style={{ animation: 'fadeIn 0.6s ease' }}>
            <Script
                id={`json-ld-model-${model.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header className="mb-12">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-2 mb-8 transition-colors">
                    <span className="text-xl">&larr;</span> Back to Directory
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight">
                                {nameDisplay}
                            </h1>
                        </div>
                        <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl">
                            {params.id[0].toUpperCase()} Developer Architecture Profile
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <a href={`https://openrouter.ai/models/${model.id}`} target="_blank" rel="noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-colors border border-white/10 flex items-center gap-2">
                            OpenRouter <span className="text-zinc-500 font-normal">↗</span>
                        </a>
                        <a href={`https://huggingface.co/search/full-text?q=${encodeURIComponent(nameDisplay)}&type=model`} target="_blank" rel="noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-colors border border-white/10 flex items-center gap-2">
                            HuggingFace <span className="text-zinc-500 font-normal">↗</span>
                        </a>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Stat Cards */}
                <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Intelligence (ELO)</span>
                    <span className="text-4xl font-black text-cyan-400">{model.elo || 'N/A'}</span>
                    <span className="text-zinc-600 text-xs mt-2">Chatbot Arena Verified</span>
                </div>
                <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Max Context</span>
                    <span className="text-4xl font-black text-white">{new Intl.NumberFormat().format(model.context_length)}</span>
                    <span className="text-zinc-600 text-xs mt-2">Tokens</span>
                </div>
                <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">API Cost / 1M</span>
                    <span className="text-4xl font-black text-green-400">{costMillion === 0 ? 'FREE' : `$${costMillion.toFixed(2)}`}</span>
                    <span className="text-zinc-600 text-xs mt-2">Blended Prompt + Completion</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Model Capabilities</h2>
                    <ul className="flex flex-wrap gap-2 mb-8">
                        {model.use_cases.map(uc => (
                            <li key={uc} className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-md text-sm font-semibold">
                                {uc}
                            </li>
                        ))}
                    </ul>

                    {model.description && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 text-zinc-300 leading-relaxed text-sm md:text-base">
                            {model.description}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Granular Pricing Matrix</h2>
                    <div className="bg-zinc-900 flex flex-col rounded-2xl overflow-hidden border border-white/5">
                        <div className="flex justify-between p-5 border-b border-white/5 items-center">
                            <span className="text-zinc-400 font-medium tracking-wide">Input Tokens (Prompt)</span>
                            <span className="text-xl font-bold text-white">{formatPrice(model.pricing_per_1m.prompt)} <span className="text-zinc-600 text-sm font-normal">/ 1M</span></span>
                        </div>
                        <div className="flex justify-between p-5 items-center">
                            <span className="text-zinc-400 font-medium tracking-wide">Output Tokens (Completion)</span>
                            <span className="text-xl font-bold text-white">{formatPrice(model.pricing_per_1m.completion)} <span className="text-zinc-600 text-sm font-normal">/ 1M</span></span>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-600 text-right mt-3 italic">Pricing data via OpenRouter. Sync: {new Date(last_updated * 1000).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Internal Interlinking for SEO */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Evaluate Competitors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedModels.map(rm => {
                        // The model we are comparing to (rm) might have slashes in its ID
                        const slugA = encodeURIComponent(model.id.replace(/\//g, "__"));
                        const slugB = encodeURIComponent(rm.id.replace(/\//g, "__"));
                        
                        return (
                            <Link 
                                key={rm.id} 
                                href={`/vs/${slugA}/${slugB}`}
                                className="bg-zinc-900 border border-white/5 hover:border-cyan-500/30 rounded-xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 group"
                            >
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">VS Engine Matchup</span>
                                <span className="text-white font-semibold text-lg leading-tight group-hover:text-cyan-400 transition-colors">
                                    {nameDisplay} vs {rm.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>

        </div>
    );
}
