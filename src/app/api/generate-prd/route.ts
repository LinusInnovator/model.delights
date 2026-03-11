import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

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

DO NOT include timelines, sprint planning, or agile management fluff—this is for an autonomous AI infrastructure factory, not human engineers.

Focus strictly on:
1. Core User Journey
2. Strict Technical Constraints (Latency, Throughput, Modalities)
3. The precise AI capabilities needed (Extraction, Reasoning, Image Gen, etc.)
4. The exact data passing between the distinct systems.

Format this as a clean, highly technical markdown document using proper headings, lists, and bold text. It must read like an uncompromising engineering briefing. Keep it punchy and dense. Maximum 400 words.`,
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
