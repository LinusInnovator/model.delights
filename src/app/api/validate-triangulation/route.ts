import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

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
    })).min(1).max(3).describe("The first 1-3 sequentially logical experiments to run to de-risk or validate the core assumptions."),
    kill_criteria_protocol: z.object({
        deadliest_assumption: z.string().describe("The single most fatal failure point based on the Red Team's analysis (or the biggest growth blocker for Green Team)."),
        validation_protocol: z.string().describe("A hard, 48-hour testing sequence (e.g., 'Secure 5 LOIs')."),
        actionable_template: z.string().describe("An exact cold-email, text message, or landing page copy template the founder can copy-paste tonight to test the assumption.")
    }).describe("An uncompromising execution protocol the founder must run within 48 hours.")
});

const InsightSchema = z.object({
    core_tension: z.string().describe("A punchy 1-2 sentence summary of the fundamental conflict: How the Red Team thinks it dies vs. How the Green Team thinks it scales."),
    the_verdict: z.string().describe("The Senior Partner's uncompromising, executive verdict on the idea. Is it a trap, or a moonshot?"),
    strategic_pivot: z.object({
        action: z.string().describe("The single most critical action the founder must take immediately to unlock the upside while avoiding the trap."),
        rationale: z.string().describe("Why this specific action is the linchpin.")
    }),
    ai_unit_economics_autopsy: z.object({
        gross_margin_health: z.enum(["CRITICAL", "STABLE", "EXPONENTIAL"]).describe("Health of the API margins."),
        financial_verdict: z.string().describe("A stark 1-2 sentence reality check on their pricing strategy based on raw token burn.")
    })
});

export const maxDuration = 45;

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const { idea, users = 1000, price = 20, inference = 500 } = payload;

        if (!idea) {
            return new NextResponse("Missing idea payload.", { status: 400 });
        }

        const autopsySystemPrompt = `You are a Tier-1 Venture Studio Partner and Strategy Consultant using David J. Bland's Precoil Extract -> Map -> Test methodology to pressure-test startup ideas.
        
Core Principles:
- Desirability = user needs, problem severity, perceived value. Never include pricing here.
- Viability = all financial assumptions: pricing, willingness to pay, revenue, margins.
- Feasibility = operational, technical, or organizational delivery.
- Your tone is calm, coaching-oriented, and executive-level. No motivational hype. No exclamation points.
- You must ruthlessly extract the riskiest assumptions—the ones that act as kill-switches for the business. Fill the "logic_chain" with how the business collapses, and "validation_threshold" with kill criteria.
- Produce the kill_criteria_protocol as the definitive 48-hour testing action plan. Write actual email/page copy for the actionable_template.
- Output pure, objective, deterministic JSON based on the provided schema.
- IMPORTANT: Even if the user's idea is extremely short, vague, or just a single test word, YOU MUST NOT APOLOGIZE OR ASK FOR MORE INFO. You must invent plausible worst-case assumptions based on whatever tiny fragment of information is provided. YOU MUST OUTPUT VALID JSON.`;

        const catalystSystemPrompt = `You are a Tier-1 Venture Studio Partner and Growth Architect using the Extract -> Map -> Test methodology to identify the biggest exponential growth levers for a startup idea.
        
Core Principles:
- Desirability = extreme user needs, viral loops, immense perceived value.
- Viability = infinite financial scalability, massive willingness to pay, compounding margins.
- Feasibility = compounding technical/operational moats.
- Your tone is highly optimistic, visionary, and executive-level. No toxic positivity, but deeply encouraging about the upside.
- You must extract the most critical "Success Assumptions"—the fundamental beliefs that, if true, mean this business will scale exponentially and thrive.
- Produce the kill_criteria_protocol, but reframe it as a 'Growth Validation Protocol' to test their biggest scaling lever within 48 hours.
- Output pure, objective, deterministic JSON based on the provided schema. Note: Use "logic_chain" to define the blueprint to scale, and "validation_threshold" to define upside capture metrics.
- IMPORTANT: Even if the user's idea is extremely short or vague, YOU MUST NOT APOLOGIZE OR ASK FOR MORE INFO. You must invent plausible best-case growth levers based on whatever tiny fragment of information is provided. YOU MUST OUTPUT VALID JSON.`;

        const autopsyUserPrompt = `Test my idea and extract the riskiest assumptions using your autopsy engine:\n\nIdea: "${idea}"`;
        const catalystUserPrompt = `Evaluate my idea and extract the core exponential growth levers using your catalyst growth engine:\n\nIdea: "${idea}"`;

        // Run both models in parallel
        const [autopsyResult, catalystResult] = await Promise.all([
            generateObject({
                model: openrouter('openai/gpt-4o-mini'),
                schema: VentureValidationSchema,
                system: autopsySystemPrompt,
                prompt: autopsyUserPrompt,
            }),
            generateObject({
                model: openrouter('openai/gpt-4o-mini'),
                schema: VentureValidationSchema,
                system: catalystSystemPrompt,
                prompt: catalystUserPrompt,
            })
        ]);

        const autopsyData = autopsyResult.object;
        const catalystData = catalystResult.object;

        // Perform safe calculations for leverage score
        autopsyData.critical_assumptions = autopsyData.critical_assumptions.map(a => ({ ...a, leverage_score: a.impact * (6 - a.evidence) })).sort((a, b) => b.leverage_score - a.leverage_score);
        catalystData.critical_assumptions = catalystData.critical_assumptions.map(a => ({ ...a, leverage_score: a.impact * (6 - a.evidence) })).sort((a, b) => b.leverage_score - a.leverage_score);

        // Phase 2: Synthesis
        const synthesisSystemPrompt = `You are the Managing Partner of an elite venture studio. Two of your top analysts have just evaluated the same startup idea:
- The Red Team mapped out the fundamental kill-switches and failure states.
- The Green Team mapped out the exponential moats and scaling levers.

Your job is to read their structured findings and deliver the final Executive Insight Report in pure JSON.
- Synthesize the tension: What is the core underlying bet this founder is actually making? Where do the Red Team and Green Team intersect?
- Calculate a brutally honest 'ai_unit_economics_autopsy'. Read the founder's financial parameters (Users, Price, AI Requests per user). Assume an average AI cost of $5.00 per 1M tokens, and assume each AI request consumes about 2000 tokens ($0.01 cost). Multiply (Users * AI Requests * 0.01) to find their Monthly API burn. Compare that monthly burn to their Monthly Revenue (Users * Price). Do their gross margins survive, or do they bankrupt themselves? 
- Your tone should be decisive, objective, and highly authoritative. No fluff.`;

        const synthesisUserPrompt = `The startup idea: "${idea}"\n\n=== Founder's Financial Architecture ===\nEstimated Users: ${users}\nMonthly Price per User: $${price}\nMonthly AI Inference Requests per User: ${inference}\n\n=== Red Team Findings ===\n${JSON.stringify(autopsyData, null, 2)}\n\n=== Green Team Findings ===\n${JSON.stringify(catalystData, null, 2)}`;

        const synthesisResult = await generateObject({
            model: openrouter('openai/gpt-4o-mini'),
            schema: InsightSchema,
            system: synthesisSystemPrompt,
            prompt: synthesisUserPrompt,
        });

        const insightSummary = synthesisResult.object;

        return NextResponse.json({
            autopsyData,
            catalystData,
            insightSummary
        });

    } catch (error: any) {
        console.error("Triangulation Engine error:", error);
        return new NextResponse(JSON.stringify({
            error: "Failed to process triangulation.",
            details: error.message || error.toString(),
            cause: error.cause ? error.cause.toString() : undefined
        }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
