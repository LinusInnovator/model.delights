import { fetchModels } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import Script from "next/script";
import ComparisonChart from "@/components/ComparisonChartWrapper";
import ArbitrageUpsell from "@/components/ArbitrageUpsell";

// ISR config: cache these pages for 5 mins
export const revalidate = 300;

// Generate SEO Metadata for every potential VS route natively
export async function generateMetadata(props: { params: Promise<{ modelA: string; modelB: string }> }) {
    const params = await props.params;
    const decodeSlug = (slug: string) => decodeURIComponent(slug).replace("__", "/");
    const idA = decodeSlug(params.modelA);
    const idB = decodeSlug(params.modelB);

    const { models } = await fetchModels();
    const modelA = models.find((m) => m.id === idA);
    const modelB = models.find((m) => m.id === idB);

    if (!modelA || !modelB) return { title: "Comparison Not Found - model.delights" };

    return {
        title: `${modelA.name} vs ${modelB.name} Pricing & API Performance | model.delights`,
        description: `Compare ${modelA.name} vs ${modelB.name}. Deep breakdown of API pricing, Chatbot Arena ELO scores, and context windows to help AI developers and prompt engineers find the smartest, most cost-effective LLM.`,
    };
}

export default async function VsPage(props: { params: Promise<{ modelA: string; modelB: string }> }) {
    const params = await props.params;
    const decodeSlug = (slug: string) => decodeURIComponent(slug).replace("__", "/");

    const idA = decodeSlug(params.modelA);
    const idB = decodeSlug(params.modelB);

    const { models, last_updated } = await fetchModels();

    const modelA = models.find((m) => m.id === idA);
    const modelB = models.find((m) => m.id === idB);

    if (!modelA || !modelB) {
        notFound();
    }

    const formatPrice = (p: number) => {
        if (p < 0) return 'Variable';
        if (p === 0) return 'Free';
        if (p < 0.001) return `$${p.toFixed(5)}`;
        if (p < 0.01) return `$${p.toFixed(4)}`;
        return `$${p.toFixed(2)}`;
    };

    const getWinner = (a: number, b: number, lowerIsBetter: boolean = false) => {
        if (a === b) return "Tie";
        if (lowerIsBetter) return a < b ? modelA.name : modelB.name;
        return a > b ? modelA.name : modelB.name;
    };

    const costAMillion = modelA.pricing_per_1m.prompt + modelA.pricing_per_1m.completion;
    const costBMillion = modelB.pricing_per_1m.prompt + modelB.pricing_per_1m.completion;
    const eloA = modelA.elo || 0;
    const eloB = modelB.elo || 0;

    const isA_cheaper = costAMillion < costBMillion;
    const cheaperModel = isA_cheaper ? modelA : modelB;
    const expensiveModel = isA_cheaper ? modelB : modelA;
    const cheapCost = isA_cheaper ? costAMillion : costBMillion;
    const expCost = isA_cheaper ? costBMillion : costAMillion;

    const isA_smarter = eloA > eloB;
    const smarterModel = isA_smarter ? modelA : modelB;

    let cheaperPercentage = 0;
    if (expCost > 0) {
        cheaperPercentage = Math.round((1 - (cheapCost / expCost)) * 100);
    }

    // JSON-LD Structured Data for Google Rich Snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `${modelA.name} vs ${modelB.name}`,
        "applicationCategory": "DeveloperApplication",
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": cheapCost.toFixed(4),
            "highPrice": expCost.toFixed(4),
            "priceCurrency": "USD"
        }
    };

    // Find some related alternatives
    const relatedModels = models
        .filter(m => m.id !== modelA.id && m.id !== modelB.id && m.elo && m.elo >= Math.max(0, eloA - 100))
        .sort((a, b) => (b.value_score || 0) - (a.value_score || 0))
        .slice(0, 4);

    return (
        <div className="container" style={{ animation: 'fadeIn 1s ease 0.3s backwards' }}>
            <Script
                id={`json-ld-vs-${modelA.id}-${modelB.id}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <header style={{ marginBottom: '40px' }}>
                <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <i className="ph ph-arrow-left"></i> Back to Value Frontier
                </Link>
                <h1 className="gradient-text" style={{ fontSize: '3rem' }}>
                    {modelA.name} <span style={{ color: 'var(--text-secondary)', fontSize: '2rem' }}>vs</span> {modelB.name}
                </h1>
                <p className="subtitle">
                    Head-to-head API cost, context, and performance comparison. Synced at {new Date(last_updated * 1000).toLocaleTimeString()}.
                </p>
            </header>

            <div className="simulator-panel" style={{ marginBottom: '30px', padding: '30px', maxWidth: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '15px' }}>Executive Summary</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '15px' }}>
                    When evaluating <strong>{modelA.name}</strong> against <strong>{modelB.name}</strong>, the pricing structure is a key differentiator.
                    {cheaperPercentage > 0 ? (
                        <span> <strong>{cheaperModel.name}</strong> is approximately <strong>{cheaperPercentage}% more cost-effective</strong> per 1 million tokens overall. {cheapCost === 0 && "In fact, it is currently available for free inference, though developers should be mindful of potential rate limits or stability changes common with zero-cost or preview tiers."}</span>
                    ) : (
                        <span> Both models are remarkably similar in API costs.</span>
                    )}
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                    However, when looking at raw reasoning capabilities, <strong>{smarterModel.name}</strong> leads with a statistical ELO score of <strong>{Math.max(eloA, eloB)}</strong>.
                    For tasks involving complex logic, coding, or instruction-following, developers might prefer {smarterModel.name}{smarterModel.pricing_per_1m.prompt + smarterModel.pricing_per_1m.completion > 0 ? ", provided their budget allows for the API burn rate." : ", which is especially appealing given its zero-cost tier."}
                </p>
            </div>

            {/* The Dynamic Stripe Upsell Hook */}
            {cheaperPercentage >= 10 ? (
                <ArbitrageUpsell
                    modelAName={cheaperModel.name}
                    modelBName={expensiveModel.name}
                    cheaperPercentage={cheaperPercentage}
                    worseModelName={expensiveModel.name}
                />
            ) : null}

            {/* 2. Visual Scatter Plot specifically highlighting these two */}
            <ComparisonChart modelA={modelA} modelB={modelB} allModels={models} />

            {/* 3. The Classic Data Table */}
            <div className="simulator-panel" style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Raw Technical comparison</h2>
                <div className="vs-table-wrapper">
                    <div className="vs-table" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr 1fr', gap: '20px', alignItems: 'center' }}>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 600 }}>Metric</div>
                        <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#00e5ff' }}>{modelA.name}</div>
                        <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#7000ff' }}>{modelB.name}</div>

                        {/* ELO Row */}
                        <div style={{ color: 'var(--text-secondary)' }}>Performance (ELO)</div>
                        <div style={{ textAlign: 'center', color: getWinner(eloA, eloB) === modelA.name ? '#00e5ff' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(eloA, eloB) === modelA.name ? 800 : 400 }}>
                            {eloA || "N/A"}
                        </div>
                        <div style={{ textAlign: 'center', color: getWinner(eloA, eloB) === modelB.name ? '#00e5ff' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(eloA, eloB) === modelB.name ? 800 : 400 }}>
                            {eloB || "N/A"}
                        </div>

                        {/* Prompt Cost Row */}
                        <div style={{ color: 'var(--text-secondary)' }}>Input Cost / 1M</div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.pricing_per_1m.prompt, modelB.pricing_per_1m.prompt, true) === modelA.name ? '#4CAF50' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.pricing_per_1m.prompt, modelB.pricing_per_1m.prompt, true) === modelA.name ? 800 : 400 }}>
                            {formatPrice(modelA.pricing_per_1m.prompt)}
                        </div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.pricing_per_1m.prompt, modelB.pricing_per_1m.prompt, true) === modelB.name ? '#4CAF50' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.pricing_per_1m.prompt, modelB.pricing_per_1m.prompt, true) === modelB.name ? 800 : 400 }}>
                            {formatPrice(modelB.pricing_per_1m.prompt)}
                        </div>

                        {/* Completion Cost Row */}
                        <div style={{ color: 'var(--text-secondary)' }}>Output Cost / 1M</div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.pricing_per_1m.completion, modelB.pricing_per_1m.completion, true) === modelA.name ? '#4CAF50' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.pricing_per_1m.completion, modelB.pricing_per_1m.completion, true) === modelA.name ? 800 : 400 }}>
                            {formatPrice(modelA.pricing_per_1m.completion)}
                        </div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.pricing_per_1m.completion, modelB.pricing_per_1m.completion, true) === modelB.name ? '#4CAF50' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.pricing_per_1m.completion, modelB.pricing_per_1m.completion, true) === modelB.name ? 800 : 400 }}>
                            {formatPrice(modelB.pricing_per_1m.completion)}
                        </div>

                        {/* Context Window Row */}
                        <div style={{ color: 'var(--text-secondary)' }}>Context Window</div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.context_length, modelB.context_length) === modelA.name ? '#fff' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.context_length, modelB.context_length) === modelA.name ? 800 : 400 }}>
                            {new Intl.NumberFormat().format(modelA.context_length)} tokens
                        </div>
                        <div style={{ textAlign: 'center', color: getWinner(modelA.context_length, modelB.context_length) === modelB.name ? '#fff' : 'var(--text-primary)', fontSize: '1.2rem', fontWeight: getWinner(modelA.context_length, modelB.context_length) === modelB.name ? 800 : 400 }}>
                            {new Intl.NumberFormat().format(modelB.context_length)} tokens
                        </div>

                    </div>
                </div>

                <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Verdict</h3>
                    <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        If you are looking for pure performance and capability, <strong>{getWinner(eloA, eloB)}</strong> is statistically superior.
                        However, if API burn rate is the primary concern, <strong>{getWinner(costAMillion, costBMillion, true)}</strong> wins out aggressively in pricing.
                    </p>
                </div>

            </div>

            {/* 4. Frequently Asked Questions (Google Scrapes this) */}
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '20px' }}>People Also Ask</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '8px' }}>Is {modelA.name} cheaper than {modelB.name}?</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isA_cheaper
                            ? `Yes. ${modelA.name} is cheaper for both input and output generation compared to ${modelB.name}. Exploring alternatives often yields cost reductions.`
                            : `No. ${modelB.name} is the more cost-effective model, operating at a lower price point per 1 million tokens.`}
                    </p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--accent)', fontSize: '1.1rem', marginBottom: '8px' }}>Which model has the larger context window?</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {modelA.context_length === modelB.context_length
                            ? `Both models offer an identical context window of ${new Intl.NumberFormat().format(modelA.context_length)} tokens.`
                            : `The ${getWinner(modelA.context_length, modelB.context_length)} model has the advantage in memory, offering a massive ${new Intl.NumberFormat().format(Math.max(modelA.context_length, modelB.context_length))} token limit for document ingestion.`}
                    </p>
                </div>
            </div>

            {/* 5. The Internal Linking Matrix (Keeps bots crawling) */}
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '20px' }}>Related Comparisons</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '60px' }}>
                {relatedModels.map(rm => {
                    const slugA = encodeURIComponent(modelA.id.replace(/\//g, "__"));
                    const slugB = encodeURIComponent(rm.id.replace(/\//g, "__"));
                    return (
                        <Link
                            key={rm.id}
                            href={`/vs/${slugA}/${slugB}`}
                            style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            Compare {modelA.name} vs <strong>{rm.name || rm.id}</strong>
                        </Link>
                    )
                })}
            </div>

        </div>
    );
}
