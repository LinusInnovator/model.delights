import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { supabase } from "@/lib/supabase";
import { getOptimalRoute } from "@/lib/routingEngine";

// Maximum duration for the Vercel Edge Function
export const maxDuration = 45;

const createModel = (modelId: string) => {
    if (process.env.OPENROUTER_API_KEY) {
        const openrouter = createOpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
        return openrouter(modelId);
    } else if (process.env.OPENAI_API_KEY) {
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        return openai(modelId.includes('/') ? modelId.split('/')[1] : modelId);
    } else {
        throw new Error("No OPENAI_API_KEY or OPENROUTER_API_KEY found to power the Generative Architect.");
    }
};

export async function POST(req: NextRequest) {
    try {
        // useCompletion hook sends data as { prompt: string } by default
        const { prompt, query, tier = 'standard' } = await req.json();
        
        const userIntent = prompt || query;

        if (!userIntent || typeof userIntent !== "string") {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const sanitizedQuery = userIntent.trim().substring(0, 1000);

        // --- INTERNAL DOGFOODING ---
        let optimalModelId = "openai/gpt-4o-mini"; // safety net
        
        if (tier === 'premium') {
            // Dynamically ask our B2B Value Router for the smartest reasoning model we can afford right now.
            const route = await getOptimalRoute('reasoning');
            if (route) {
                // Because this is an internal backend generator, we inherently favor the Smart Value (-60% cost)
                optimalModelId = route.smart_value?.model || route.flagship.model;
                console.log(`[Dogfood Premium] PRD Route: ${optimalModelId}`);
            }
        } else {
            console.log(`[Dogfood Standard] PRD Route: ${optimalModelId}`);
        }

        const model = createModel(optimalModelId);

        // Dynamically fetch the Kano components from the Supabase Data Lake
        let frameworkContext = "";
        try {
            if (supabase) {
                const { data: components, error } = await supabase
                    .from('kano_components')
                    .select('component_name, tier, description, tags');

                if (error) throw error;

                if (components && components.length > 0) {
                    // Group the components by tier for the LLM context window
                    const grouped = components.reduce((acc: any  , curr: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                        if (!acc[curr.tier]) acc[curr.tier] = [];
                        acc[curr.tier].push(`${curr.component_name}: ${curr.description}`);
                        return acc;
                    }, {});

                    frameworkContext = `
Here is the exact framework to follow and the technical AI components associated with each tier:
1. BASICS (Must-Haves):
${grouped['basics']?.join('\n') || 'Standard auth and edge deployment'}

2. PERFORMANCE (Satisfiers):
${grouped['performance']?.join('\n') || 'Low latency streaming and specialized routing'}

3. EXCITEMENT (Delighters):
${grouped['excitement']?.join('\n') || 'Proactive agents and predictive UI'}
`;
                }
            }
        } catch (dbError) {
            console.warn("Could not fetch Kano components from Supabase, falling back to generic framework.", dbError);
        }

        // If DB fetch fails or is empty, provide a strong generic fallback to prevent bad generation
        if (!frameworkContext) {
            frameworkContext = `
Categorize the technical AI features required for their product EXACTLY into these three headings based on the Delights.pro 3-Tier Psychological Framework:
1. Basics (Effortless Hygiene / Must-Haves - e.g. Auth, deterministic parsing)
2. Performance (Satisfiers / Linear Scalers - e.g. Sub-500ms latency, RAG)
3. Excitement (Delighters / The Magic - e.g. Generative Voice, Proactive Agents)
`;
        }

        const result = await streamText({
            model: model,
            system: `You are an elite Enterprise Solutions Architect. 
Your job is to translate a founder's raw startup idea into a mercilessly precise, human-readable Product Requirements Document (PRD).

SCALE & EXPANSION DIRECTIVE: Do not design an MVP. You are architecting a Series B SaaS platform. For every core feature the founder requests, you must autonomously extrapolate the downstream Enterprise requirements (e.g., Multi-tenant billing, API Webhook ecosystems, unified Analytics dashboards) necessary to support scaling this idea to 10,000 MAU. You must utilize Multi-Agent Orchestration.

BANNED WORDS: MVP, Basic, Simple, V1, Out-of-the-box. REQUIRED TONE: Enterprise-grade, Cognitive Architecture, Event-Driven, Multi-Tenant, Zero-Latency.

COMPONENT AMPLIFICATION RULE (KANO HYBRID): You MUST strictly use the "Delights.pro 3-Tier Psychological Framework" to structure the AI feature rollout. You must use the provided Database Components in the context list below as the absolute BEDROCK of your technical constraints. However, you are expected to aggressively hypothesize and expand upon the core business logic. Surround our native primitives with cutting-edge SaaS workflows specific to the founder's industry.

${frameworkContext}

Format this as a clean, highly technical markdown document. 
Start with a strict "Core User Journey" paragraph. 
Then define the "Strict Technical Constraints (Latency, Modalities)".
Then write the 3-tier feature breakdown. 

FORMATTING RULES:
- You MUST use beautiful, properly spaced Markdown.
- Use heavily bolded (**Text**) inline headers for individual technical components.
- Use explicit bullet points (- ) rather than long paragraphs for nested details.
- AVOID GIANT WALLS OF UNBROKEN TEXT. You MUST use hard double-line breaks (\\n\\n) between EVERY SINGLE paragraph, list item, section, and header. Create massive vertical negative space for readability.
- Never use a single newline (\\n). Always double it.
- Make it visual, rhythmic, and scan-able for an executive engineer.

DO NOT include timelines, sprint planning, or agile management fluff. It must read like an uncompromising, exhaustive engineering briefing. DO NOT arbitrarily limit your length. Write as much detail as necessary to construct a massive, multi-page Silicon Valley Series-B technical specification.`,
            prompt: `Translate this startup idea into a strict technical PRD:\n\n<intent>\n${sanitizedQuery}\n</intent>`,
        });

        return result.toTextStreamResponse({
            headers: {
                // Ensure streaming works through proxies/Vercel
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (e: unknown) {
        console.error("PRD Generation Error:", e);
        return NextResponse.json({ error: (e as Error).message || "Failed to stream PRD" }, { status: 500 });
    }
}
