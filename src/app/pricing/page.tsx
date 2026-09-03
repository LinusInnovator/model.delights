import React from 'react';
import Link from 'next/link';
import CheckoutButton from '../enterprise/CheckoutButton';
import PricingCalculator from './PricingCalculator';

export const metadata = {
    title: 'Pricing & Plans | model.delights',
    description: 'Predictable FinOps for Autonomous AI Agents. Save 70% to 94% on model compute with zero memory loss and zero quality degradation.',
    alternates: {
        canonical: 'https://model.delights.pro/pricing',
    },
    openGraph: {
        title: 'Predictable Pricing for Autonomous AI Agents | model.delights',
        description: 'Drop our single URL into your stack. Snell cuts 70% to 94% of your inference bill with certified tool-calling invariants and session cache preservation.',
        url: 'https://model.delights.pro/pricing',
        type: 'website',
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "How fast is the routing latency?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Snell runs a zero-network in-memory AST classifier that resolves optimal routing and capability validation in under 0.3 milliseconds. The proxy introduces effectively zero overhead to your inference stream."
            }
        },
        {
            "@type": "Question",
            "name": "Do I bring my own API keys (BYOK)?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. You can either pass your own OpenRouter / Provider keys or use Snell's unified managed keys. Your keys remain strictly encrypted in your environment and are never stored or inspected."
            }
        },
        {
            "@type": "Question",
            "name": "What happens if my token usage exceeds the plan limit?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your application is never throttled or cut off. On the Pro plan, extra volume is billed at a transparent $0.05 per 1 million tokens routed, billed at the end of the monthly cycle."
            }
        },
        {
            "@type": "Question",
            "name": "How difficult is migration?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "It takes 90 seconds. Change one environment variable in your codebase: OPENAI_BASE_URL=\"https://model.delights.pro/api/v1\" and set your model to \"snell/auto\"."
            }
        }
    ]
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] selection:bg-violet-500/30 font-sans flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* Top Navigation */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-white/[0.08] sticky top-0 z-40 bg-[#08090a]/80 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                    <span>model.delights</span>
                </Link>
                <div className="flex items-center space-x-6 text-sm font-medium text-zinc-400">
                    <Link href="/models" className="hover:text-white transition-colors">Models</Link>
                    <Link href="/architect" className="hover:text-white transition-colors">Architect</Link>
                    <Link href="/pricing" className="text-white">Pricing</Link>
                    <Link href="/models" className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-zinc-200 transition-colors">
                        Launch Matrix
                    </Link>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 flex flex-col items-center">
                {/* Header Badge & Hero */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-300 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Self-Funding FinOps Engine &bull; Zero Quality Compromise</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center max-w-3xl mb-5 leading-tight">
                    Predictable pricing for <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-500">
                        Autonomous AI Agents.
                    </span>
                </h1>

                <p className="text-zinc-400 text-base md:text-lg text-center max-w-2xl mb-14 leading-relaxed">
                    Drop our single URL into your stack. Snell cuts 70% to 94% of your inference bill with certified tool-calling invariants and session cache preservation.
                </p>

                {/* 3-Tier Pricing Cards */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                    {/* Hacker Tier */}
                    <div className="rounded-xl bg-[#0e1013] border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/20 transition-all">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Hacker</h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Free Forever</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-6 min-h-[32px]">
                                Perfect for prototypes, indie side projects, and local agent development.
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-6">
                                <span className="text-4xl font-extrabold text-white">$0</span>
                                <span className="text-zinc-400 text-sm">/ month</span>
                            </div>

                            <div className="border-t border-white/[0.06] pt-6 mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">Includes</p>
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>5M tokens / month</strong> routed</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>1 Active Project API Key</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Full 420+ Live Model Matrix</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Community Failover Cascade</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Link 
                            href="/models"
                            className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm text-center transition-colors border border-white/[0.06]"
                        >
                            Start Free with cURL &rarr;
                        </Link>
                    </div>

                    {/* Pro Tier (MOST POPULAR) */}
                    <div className="rounded-xl bg-[#111317] border-2 border-violet-500/50 p-7 flex flex-col justify-between relative shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-400 transition-all">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-violet-600 text-white text-[11px] font-bold tracking-wide uppercase">
                            Most Popular &bull; High ROI
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Pro</h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">Self-Funding</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-6 min-h-[32px]">
                                For production apps, autonomous agents, and teams spending $200–$5k/mo on LLMs.
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-4xl font-extrabold text-white">$49</span>
                                <span className="text-zinc-400 text-sm">/ month</span>
                            </div>
                            <p className="text-[11px] text-emerald-400 font-mono mb-6">
                                +$0.05 / 1M tokens overage (never throttled)
                            </p>

                            <div className="border-t border-white/[0.06] pt-6 mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">Everything in Hacker, plus:</p>
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>50M tokens / month</strong> included</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>Semantic AST Classifier</strong> (Coding & Logic)</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>BFCL Agentic Invariant Guard</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>Session Affinity (`x-session-id`)</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Prompt Caching Discount Capture (up to 90%)</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Live FinOps Savings Ticker</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <CheckoutButton 
                            plan="pro"
                            label="Deploy Pro — $49/mo" 
                            className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm text-center transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                        />
                    </div>

                    {/* Scale Tier */}
                    <div className="rounded-xl bg-[#0e1013] border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/20 transition-all">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-white">Scale &amp; Swarms</h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">High Throughput</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-6 min-h-[32px]">
                                For high-volume multi-agent swarms, RAG pipelines, and enterprise automation.
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-4xl font-extrabold text-white">$249</span>
                                <span className="text-zinc-400 text-sm">/ month</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono mb-6">
                                +$0.04 / 1M tokens volume overage
                            </p>

                            <div className="border-t border-white/[0.06] pt-6 mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">Everything in Pro, plus:</p>
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>300M tokens / month</strong> included</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span><strong>Sub-20ms Edge Routing</strong> Gateway</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Custom Provider Policies (EU-only, Ban Provider)</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Custom Multi-Tier Fallback Cascades</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Zero-Knowledge SOC2-Ready Logs &amp; Webhooks</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>Priority Slack/Discord Channel Bridge</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <CheckoutButton 
                            plan="scale"
                            label="Get Scale — $249/mo" 
                            className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm text-center transition-colors border border-white/[0.08]"
                        />
                    </div>
                </div>

                {/* THE AGENT-SAFE GUARANTEE DEEP-DIVE */}
                <div className="w-full rounded-2xl bg-[#0e1013] border border-white/[0.08] p-8 md:p-12 mb-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="max-w-3xl mb-10">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-4">
                            ENGINEERING GUARANTEE
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
                            Why Autonomous Agents Never &ldquo;Forget&rdquo; on Snell.
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                            Engineers often ask: <em>&ldquo;If you route prompts to different models, won&apos;t my agent forget its context or bust its prompt cache?&rdquo;</em> Here is the architectural guarantee that keeps agent state 100% coherent:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl bg-[#08090a] border border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                                01
                            </div>
                            <h4 className="text-base font-semibold text-white mb-2">Session Affinity (Sticky Thread)</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Pass <code className="text-violet-300 font-mono">-H &ldquo;x-session-id: agent_123&rdquo;</code>. Snell pins the continuous multi-turn thread to the same model, preserving up to 90% provider prompt-caching discounts and eliminating persona drift.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-[#08090a] border border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                                02
                            </div>
                            <h4 className="text-base font-semibold text-white mb-2">Sub-Agent Leaf Routing</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                80% of agent compute is spent on isolated sub-tasks (grepping code, parsing JSON, summarizing tools). Snell routes these leaf calls to sub-cent utility models ($0.07/1M) without touching the parent agent context.
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-[#08090a] border border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                                03
                            </div>
                            <h4 className="text-base font-semibold text-white mb-2">BFCL Tool Schema Invariant</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                When a request contains <code className="text-blue-300 font-mono">tools</code> or strict JSON schema, Snell strictly gates execution. It will never route to models with BFCL &lt; 60, guaranteeing zero schema argument hallucination.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive ROI Calculator */}
                <div className="w-full mb-24">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3">Calculate Your Exact Net ROI</h2>
                        <p className="text-zinc-400 text-sm">See how much profit Snell puts back into your business every month.</p>
                    </div>
                    <PricingCalculator />
                </div>

                {/* FAQ Section */}
                <div className="w-full max-w-3xl mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-[#0e1013] border border-white/[0.06]">
                            <h4 className="text-sm font-semibold text-white mb-2">How fast is the routing latency?</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Snell runs a zero-network in-memory AST classifier that resolves optimal routing and capability validation in under <strong>0.3 milliseconds</strong>. The proxy introduces effectively zero overhead to your inference stream.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-[#0e1013] border border-white/[0.06]">
                            <h4 className="text-sm font-semibold text-white mb-2">Do I bring my own API keys (BYOK)?</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Yes. You can either pass your own OpenRouter / Provider keys or use Snell&apos;s unified managed keys. Your keys remain strictly encrypted in your environment and are never stored or inspected.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-[#0e1013] border border-white/[0.06]">
                            <h4 className="text-sm font-semibold text-white mb-2">What happens if my token usage exceeds the plan limit?</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Your application is <strong>never throttled or cut off</strong>. On the Pro plan, extra volume is billed at a transparent $0.05 per 1 million tokens routed, billed at the end of the monthly cycle.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-[#0e1013] border border-white/[0.06]">
                            <h4 className="text-sm font-semibold text-white mb-2">How difficult is migration?</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                It takes 90 seconds. Change one environment variable in your codebase: <br />
                                <code className="text-emerald-400 font-mono text-[11px]">OPENAI_BASE_URL=&quot;https://model.delights.pro/api/v1&quot;</code> and set your model to <code className="text-emerald-400 font-mono text-[11px]">&quot;snell/auto&quot;</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-white/[0.08] py-8 text-center text-xs text-zinc-500">
                <p>&copy; 2026 Model Delights / Snell Engine. Built for the Autonomous Architect.</p>
            </footer>
        </div>
    );
}
