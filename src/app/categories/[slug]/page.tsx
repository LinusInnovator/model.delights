import { fetchModels } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

// ISR config: cache these pages for 5 mins
export const revalidate = 300;

const CategoryMap: Record<string, string> = {
    'top-tier': 'Top Tier',
    'coding-logic': 'Coding & Logic',
    'fictional': 'Fictional',
    'drafting': 'Drafting',
    'roleplay': 'Roleplay',
    'vision': 'Vision',
    'image-gen': 'Image Gen'
};

const CategoryDescriptions: Record<string, string> = {
    'top-tier': 'The absolute best-in-class foundation models. Unmatched reasoning, deep context ingestion, and frontier-level intelligence.',
    'coding-logic': 'Models fine-tuned or fundamentally strong at software engineering, debugging, and complex logical reasoning tasks.',
    'fictional': 'Creative powerhouses designed for storytelling, world-building, and generating highly imaginative fictional content.',
    'drafting': 'High-speed, cost-effective models perfect for generating first drafts, summarizing content, and rapid text generation.',
    'roleplay': 'Uncensored or highly aligned models specifically optimized for immersive character acting and persona-driven conversations.',
    'vision': 'Multimodal LLMs capable of seeing and reasoning about images, charts, handwriting, and visual data.',
    'image-gen': 'Diffusion architectures and AI models designed purely to generate pixel-perfect images from text descriptions.'
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const categoryName = CategoryMap[params.slug];

    if (!categoryName) return { title: "Category Not Found - model.delights" };

    return {
        title: `Best ${categoryName} AI Models & APIs | model.delights`,
        description: `Discover and compare the top ${categoryName} LLMs. Live API pricing, context limits, and Chatbot Arena ELO benchmarks for AI developers.`,
    };
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const categoryName = CategoryMap[params.slug];

    if (!categoryName) {
        notFound();
    }

    const { models, last_updated } = await fetchModels();
    
    // Server-side filtering & sorting
    const categoryModels = models
        .filter(m => m.use_cases.includes(categoryName))
        .sort((a, b) => (b.elo || 0) - (a.elo || 0)); // Sort by intelligence natively

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Top ${categoryName} AI Models`,
        "description": CategoryDescriptions[params.slug],
        "numberOfItems": categoryModels.length,
        "itemListElement": categoryModels.map((m, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://model.delights.pro/models/${m.id}`
        }))
    };

    const formatPrice = (p: number) => {
        if (p < 0) return 'Variable';
        if (p === 0) return 'Free';
        if (p < 0.001) return `$${p.toFixed(5)}`;
        if (p < 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
    };

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8" style={{ animation: 'fadeIn 0.6s ease' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header className="mb-12 text-center md:text-left">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-2 mb-8 transition-colors">
                    <span className="text-xl">&larr;</span> Back to Directory
                </Link>
                
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight mb-4">
                    The {categoryName} Leaderboard
                </h1>
                
                <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl">
                    {CategoryDescriptions[params.slug]}
                </p>
                <p className="text-zinc-600 text-sm mt-4">
                    Live database synced at {new Date(last_updated * 1000).toLocaleString()}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {categoryModels.map((model, idx) => {
                    const costMillion = model.pricing_per_1m.prompt + model.pricing_per_1m.completion;
                    const nameDisplay = model.name.replace('Anthropic: ', '').replace('OpenAI: ', '').replace('Meta: ', '').replace('Google: ', '');
                    const provider = model.id.split('/')[0] || 'Unknown';

                    return (
                        <Link 
                            key={model.id}
                            href={`/models/${model.id}`}
                            className="bg-zinc-900 border border-white/5 hover:border-cyan-500/50 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/20 group flex flex-col relative overflow-hidden"
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-0 right-0 bg-white/5 text-zinc-500 font-black text-xs px-3 py-1 rounded-bl-xl">
                                #{idx + 1}
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-tight line-clamp-1">
                                    {nameDisplay}
                                </h2>
                                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mt-1">
                                    {provider}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5 flex-grow">
                                <div className="bg-zinc-950/50 rounded-lg p-3 border border-white/5">
                                    <span className="block text-zinc-600 text-[10px] uppercase font-bold tracking-wider mb-1">Intelligence</span>
                                    <span className="text-lg font-black text-yellow-500">{model.elo || 'N/A'}</span>
                                </div>
                                <div className="bg-zinc-950/50 rounded-lg p-3 border border-white/5">
                                    <span className="block text-zinc-600 text-[10px] uppercase font-bold tracking-wider mb-1">API Cost/1M</span>
                                    <span className="text-lg font-black text-green-400">{costMillion === 0 ? 'FREE' : `$${costMillion.toFixed(2)}`}</span>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                                <span className="text-cyan-400 text-sm font-semibold group-hover:text-white transition-colors">
                                    View Full Profile &rarr;
                                </span>
                                <span className="text-zinc-500 text-xs">
                                    {new Intl.NumberFormat().format(model.context_length)} Context
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {categoryModels.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
                    <p className="text-zinc-400 text-lg">No models currently mapped directly to this category in the database.</p>
                </div>
            )}
            
        </div>
    );
}
