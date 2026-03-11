import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import prdFramework from "@/lib/prd_framework_db.json";

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
        const { query } = await req.json();

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
        }

        const sanitizedQuery = query.trim().substring(0, 1000);

        const model = createModel();

        const result = await streamText({
            model: model,
            system: `You are an elite, technical AI Product Manager. 
Your job is to translate a founder's raw startup idea into a mercilessly precise, human-readable Product Requirements Document (PRD).

CRITICAL DIRECTIVE: You MUST strictly use the "Delights.pro 3-Tier Psychological Framework" to structure the AI feature rollout. 

Here is the exact framework to follow and the technical AI components associated with each tier:
${JSON.stringify(prdFramework.tiers, null, 2)}

Analyze the founder's idea and extract the specific AI features required for their product, categorizing them EXACTLY into these three headings:
1. Basics (Effortless Hygiene / Must-Haves)
2. Performance (Satisfiers / Linear Scalers)
3. Excitement (Delighters / The Magic)

Format this as a clean, highly technical markdown document. 
Start with a strict "Core User Journey" paragraph. 
Then define the "Strict Technical Constraints (Latency, Modalities)".
Then write the 3-tier feature breakdown. 

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
