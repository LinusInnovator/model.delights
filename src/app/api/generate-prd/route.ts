import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import { getOptimalRoute } from '@/lib/routingEngine';

export const runtime = 'edge';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt, modelId, tier } = await req.json();

    let optimalModelId = modelId;
    if (!optimalModelId) {
        // The Super Architect MUST use world-class reasoning for generation, regardless of user tier. 
        // We explicitly bypass 'smart_value' budget routes and demand the absolute highest ELO 'flagship'.
        try {
            const route = await getOptimalRoute({ 
                intent: 'agentic', 
                policy: 'max_quality' 
            });
            if (route) {
                optimalModelId = route.flagship.model;
                // FAILSAFE: Next.js Edge UI requires streaming. o1 models do not support streaming 
                // and will timeout Vercel's 25s TTFB limit. We must intercept and downgrade to the best streaming model.
                if (optimalModelId.includes('o1') || optimalModelId.includes('o3')) {
                    console.warn(`[Architect Brain] Intercepted non-streaming model ${optimalModelId}. Forcing Sonnet 3.5 for streaming UI.`);
                    optimalModelId = 'anthropic/claude-3.5-sonnet';
                }
                console.log(`[Architect Brain] Dynamic PRD Routing engaged: Locked to Flagship ${optimalModelId}`);
            } else {
                optimalModelId = 'openai/gpt-4o';
            }
        } catch (e) {
            console.error("Failed to dynamically route PRD request:", e);
            optimalModelId = 'openai/gpt-4o';
        }
    }

    const systemPrompt = `You are the ultimate Principal AI Engineer and Systems Architect. Your job is to translate this founder's raw startup idea into a mercilessly precise, human-readable Product Requirements Document (PRD).

STRICT CONSTRAINTS:
1. Eradicate all generic CRUD web-app thinking! DO NOT give me basic "Users", "Interactions", and "Settings" SQL tables. This is an LLM-First application. You must think in terms of Embeddings, Vector Stores, Event Sourcing, and RAG architectures.
2. DO NOT use generic buzzwords ("Use NLU", "Train a neural network"). State the exact mechanistic reality: "Deploy an LLM-as-a-judge prompt to detect user satisfaction from interaction transcripts."
3. You are designing this PRD for a Singular Unicorn (a lone architect with an AI swarm). Do not mention teams, sprints, or agile.
4. The tone must be brutally concise, ultra-technical, unapologetic, and highly structured (Markdown).

OUTPUT FORMAT:
- Title: [Aggressive, 3-word codename]
- The Extraction Summary: 2 brutal sentences stripping away marketing jargon to state the raw technical reality.
- The AI Primitives (Database Schema): The exact PostgreSQL/pgvector tables or KV-stores required. (e.g. embeddings columns, LLM evals logs, user telemetry).
- The Cognitive Architecture: Define the exact AI loops. What is the semantic routing mechanism? Where are you using fast, cheap models (Drafting/Classification) versus expensive reasoning models (o1/opus)?
- The Autonomous Sequences: 
    - Sequence 1: The Core Ingestion (How does data enter the system without user friction?)
    - Sequence 2: The Agentic Loop (How does the AI process the data autonomously?)
    - Sequence 3: The Output Generation (How is the final value delivered?)`;

    const result = await streamText({
      model: openrouter(optimalModelId),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[GENERATE PRD ERROR]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
