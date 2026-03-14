import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Based on the Model.Delights Triangulated Insight Protocol
// Enhanced with Start-Up Autopsy tracking
const VentureValidationSchema = z.object({
    pattern_match: z.object({
        historical_pattern: z.string().describe("A famous startup failure OR success this idea conceptually resembles (e.g., Quibi, Uber, Web3 tools)."),
        rationale: z.string().describe("1-2 sentences explaining why the patterns match."),
    }),
    critical_assumptions: z.array(z.object({
        category: z.enum(["Desirability", "Viability", "Feasibility"]).describe("Desirability = User needs; Viability = Financials; Feasibility = Technical/Operational"),
        assumption: z.string().describe("Must start with 'I believe...'"),
        impact: z.number().min(1).max(5).describe("Impact scale 1-5"),
        evidence: z.number().min(1).max(5).describe("Evidence scale 1-5 (1=Opinion, 5=Actual payment)"),
        leverage_score: z.number().describe("Calculated purely as an internal metric: Impact * (6 - Evidence)"),
        rationale: z.string().describe("Why this matters and what happens if it is right or wrong.")
    })).length(5).describe("Strictly extract the top 5 core assumptions across DVF."),
    logic_chain: z.array(z.string()).length(5).describe("A 5-step explicit logic chain showing how the idea unfolds (either collapsing or scaling)."),
    experiment_sequence: z.array(z.object({
        assumption_tested: z.string().describe("The exact assumption text being tested here."),
        experiment_type: z.string().describe("e.g., Customer Interview, Smoke Test, Concierge Test"),
        setup: z.string().describe("A concise 1-sentence instruction on how to run this test/validation."),
        metric: z.string().describe("What exactly are you measuring?"),
        validation_threshold: z.string().describe("The specific metric threshold that proves or disproves the assumption (e.g., 'If fewer than 10% of users...').")
    })).min(1).max(3).describe("The first 1-3 sequentially logical experiments to run to de-risk or validate the core assumptions.")
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const { idea, mode = 'autopsy' } = await req.json();

        if (!idea) {
            return new NextResponse("Missing idea payload.", { status: 400 });
        }

        const autopsySystemPrompt = `You are a Tier-1 Venture Studio Partner and Strategy Consultant using the Model.Delights Triangulated Insight Protocol to pressure-test startup ideas.
        
Core Principles:
- Desirability = user needs, problem severity, perceived value. Never include pricing here.
- Viability = all financial assumptions: pricing, willingness to pay, revenue, margins.
- Feasibility = operational, technical, or organizational delivery.
- Your tone is calm, coaching-oriented, and executive-level. No motivational hype. No exclamation points.
- You must ruthlessly extract the riskiest assumptions—the ones that act as kill-switches for the business. Fill the "logic_chain" with how the business collapses, and "validation_threshold" with kill criteria.
- Output pure, objective, deterministic JSON based on the provided schema.
- IMPORTANT: Even if the user's idea is extremely short, vague, or just a single test word, YOU MUST NOT APOLOGIZE OR ASK FOR MORE INFO. You must invent plausible worst-case assumptions based on whatever tiny fragment of information is provided. YOU MUST OUTPUT VALID JSON.`;

        const catalystSystemPrompt = `You are a Tier-1 Venture Studio Partner and Growth Architect using the Model.Delights Triangulated Insight Protocol to identify the biggest exponential growth levers for a startup idea.
        
Core Principles:
- Desirability = extreme user needs, viral loops, immense perceived value.
- Viability = infinite financial scalability, massive willingness to pay, compounding margins.
- Feasibility = compounding technical/operational moats.
- Your tone is highly optimistic, visionary, and executive-level. No toxic positivity, but deeply encouraging about the upside.
- You must extract the most critical "Success Assumptions"—the fundamental beliefs that, if true, mean this business will scale exponentially and thrive.
- Output pure, objective, deterministic JSON based on the provided schema. Note: Use "logic_chain" to define the blueprint to scale, and "validation_threshold" to define upside capture metrics.
- IMPORTANT: Even if the user's idea is extremely short or vague, YOU MUST NOT APOLOGIZE OR ASK FOR MORE INFO. You must invent plausible best-case growth levers based on whatever tiny fragment of information is provided. YOU MUST OUTPUT VALID JSON.`;

        const systemPrompt = mode === 'catalyst' ? catalystSystemPrompt : autopsySystemPrompt;

        const userPrompt = mode === 'catalyst'
            ? `Evaluate my idea and extract the core exponential growth levers using your catalyst growth engine:\n\nIdea: "${idea}"`
            : `Test my idea and extract the riskiest assumptions using your autopsy engine:\n\nIdea: "${idea}"`;

        // Use GPT-4o-mini to guarantee 100% bulletproof JSON Schema Structured Outputs natively.
        const { object } = await generateObject({
            model: openrouter('openai/gpt-4o-mini'),
            schema: VentureValidationSchema,
            system: systemPrompt,
            prompt: userPrompt,
        });

        // Enforce math calculations to be perfectly safe, although LLM should do it
        object.critical_assumptions = object.critical_assumptions.map(a => ({
            ...a,
            leverage_score: a.impact * (6 - a.evidence)
        }));

        // Sort descending by highest impact
        object.critical_assumptions.sort((a, b) => b.leverage_score - a.leverage_score);

        return NextResponse.json(object);

    } catch (error: unknown) {
        console.error("Autopsy Engine error:", error);
        return new NextResponse(JSON.stringify({
            error: "Failed to process validation.",
            details: (error as Error).message || (error as any).toString(),
            cause: (error as any).cause ? (error as any).cause.toString() : undefined
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
