import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { getOptimalRoute } from '@/lib/routingEngine';

const createOpenRouter = (modelId: string) => {
    return createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
    })(modelId);
};

const PivotSchema = z.object({
    pivots: z.array(z.object({
        title: z.string().describe("A catchy 3-4 word title for this pivot direction (e.g., 'The Enterprise Arbitrage Pivot')."),
        description: z.string().describe("2-3 sentences explaining exactly why this structural pivot mathematically derisks the original idea and increases the execution score."),
        new_idea: z.string().describe("The fully rewritten 1-2 sentence idea incorporating this exact pivot. Must stand alone."),
        suggested_price: z.number().describe("A highly optimized numeric monthly price for this exact pivot (e.g. 5000)."),
        suggested_users: z.number().describe("A realistic number of paying users needed to reach scale at this new price point (e.g. 50).")
    })).length(3).describe("Exactly 3 distinct, mutually exclusive structural pivots.")
});

export const maxDuration = 60; // Extend Vercel timeout for LLM

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idea, ventureType, originalScore } = body;

        if (!idea) {
            return NextResponse.json({ error: "Missing idea string." }, { status: 400 });
        }

        const systemPrompt = `You are a Tier-1 Venture Studio Partner and Growth Architect.
Your founder just pitched an idea that scored a failing execution score of ${originalScore || 'low'} / 100 on the Triangulation Engine.
Your job is to look at their original premise and generate exactly 3 completely distinct structural pivots to mathematically fix their broken business model.

Original Idea: "${idea}"
Venture Type: ${ventureType || 'zero_to_one'}

Pivots MUST fall into one of these aggressive structural categories:
1. Wedge Pivot: Radically change the ICP (Ideal Customer Profile). E.g., B2C to high-ticket B2B.
2. Market Pivot: Change distribution. E.g., Don't sell the software, give it away and monetize the aggregate data.
3. Feature-to-Product Pivot: Take the hardest feature of their idea and make THAT the entire Enterprise product.

Do NOT give generic advice. Give them 3 new hardcoded business ideas based on their original premise.
Be ruthless, precise, and highly strategic.`;

        // Leverage internal routing engine to find the smartest, cheapest reasoning model
        const route = await getOptimalRoute({ intent: 'reasoning' });
        let optimalModelId = "openai/gpt-4o-mini"; 
        if (route) {
            optimalModelId = route.smart_value?.model || route.flagship.model;
            console.log(`[Idea Refiner] Pivoting idea via: ${optimalModelId}`);
        }
        
        const modelInstance = createOpenRouter(optimalModelId);

        const { object } = await generateObject({
            model: modelInstance,
            schema: PivotSchema,
            prompt: systemPrompt,
        });

        return NextResponse.json(object);

    } catch (e: unknown) {
        console.error("Pivot generation failed:", e);
        const errMessage = e instanceof Error ? (e as Error).message : "Failed to generate pivots.";
        return NextResponse.json({ error: errMessage }, { status: 500 });
    }
}
