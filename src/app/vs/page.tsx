import { fetchModels } from "@/lib/api";
import React from "react";
import Link from "next/link";
import VsHubClient from "@/components/VsHubClient";

// ISR config: cache these pages for 5 mins
export const revalidate = 300;

export const metadata = {
    title: "The VS Engine | Compare LLMs side-by-side | model.delights",
    description: "Pit any two Large Language Models against each other. Instantly compare API costs, context windows, and Chatbot Arena ELO intelligence scores to find the optimal deployment model.",
};

export default async function VsLandingPage() {
    // Fetch all models server-side
    const { models, last_updated } = await fetchModels();

    return (
        <div className="container" style={{ animation: 'fadeIn 1s ease 0.3s backwards' }}>
            <header style={{ marginBottom: '40px' }}>
                <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <i className="ph ph-arrow-left"></i> Back to Directory
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="gradient-text m-0" style={{ fontSize: '3.5rem', lineHeight: '1.2' }}>
                        The VS Engine
                    </h1>
                    <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full relative -top-3">
                        Beta
                    </span>
                </div>
                <p className="subtitle" style={{ marginTop: '10px' }}>
                    The ultimate head-to-head LLM evaluator for AI Developers. Synced at {new Date(last_updated * 1000).toLocaleTimeString()}.
                </p>
            </header>

            <VsHubClient models={models} />
        </div>
    );
}
