import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { supabase } from "@/lib/supabase";

// Maximum duration for the Vercel Edge Function
export const maxDuration = 45;

const createModel = () => {
    if (process.env.OPENROUTER_API_KEY) {
        const openrouter = createOpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
        // We use a high-intelligence, fast model like GPT-4o-mini via OpenRouter
        return openrouter("openai/gpt-4o-mini");
    } else if (process.env.OPENAI_API_KEY) {
        const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        return openai("gpt-4o-mini");
    } else {
        throw new Error("No OPENAI_API_KEY or OPENROUTER_API_KEY found to power the Generative Architect.");
    }
};

export async function POST(req: NextRequest) {
    try {
        // useCompletion hook sends data as { prompt: string } by default
        const { prompt, query } = await req.json();
        
        const userIntent = prompt || query;

        if (!userIntent || typeof userIntent !== "string") {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const sanitizedQuery = userIntent.trim().substring(0, 1000);

        const model = createModel();

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
                    const grouped = components.reduce((acc: any, curr: any) => {
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
            system: `You are an elite, technical AI Product Manager. 
Your job is to translate a founder's raw startup idea into a mercilessly precise, human-readable Product Requirements Document (PRD).

CRITICAL DIRECTIVE: You MUST strictly use the "Delights.pro 3-Tier Psychological Framework" to structure the AI feature rollout. You may ONLY construct your infrastructure recommendations using the Exact Components provided in the context list below. Do not invent or hallucinate technical components outside of this list unless absolutely necessary.

${frameworkContext}

Format this as a clean, highly technical markdown document. 
Start with a strict "Core User Journey" paragraph. 
Then define the "Strict Technical Constraints (Latency, Modalities)".
Then write the 3-tier feature breakdown. 

FORMATTING RULES:
- You MUST use beautiful, properly spaced Markdown.
- Use heavily bolded (**Text**) inline headers for individual technical components.
- Use explicit bullet points (- ) rather than long paragraphs for nested details.
- AVOID GIANT WALLS OF UNBROKEN TEXT. You MUST use hard line breaks (\\n\\n) between sections and headers to create negative space.
- Make it visual, rhythmic, and scan-able for an executive engineer.

DO NOT include timelines, sprint planning, or agile management fluff. It must read like an uncompromising engineering briefing. Keep it punchy and dense. Maximum 500 words.`,
            prompt: `Translate this startup idea into a strict technical PRD:\n\n<intent>\n${sanitizedQuery}\n</intent>`,
        });

        return result.toTextStreamResponse({
            headers: {
                // Ensure streaming works through proxies/Vercel
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (e: any) {
        console.error("PRD Generation Error:", e);
        return NextResponse.json({ error: e.message || "Failed to stream PRD" }, { status: 500 });
    }
}
