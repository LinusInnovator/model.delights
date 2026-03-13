import fsPromises from 'fs/promises';
import path from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Note: To run this standalone script cleanly without fully booting Next.js,
// we'll hit the OpenRouter API directly but we'll use the logic from our routingEngine manually
// Actually, let's just use the fetch API to hit OpenRouter if we can't easily import the Next.js fetch.
// Our `routingEngine.ts` uses relative paths `import { fetchModels } from './api';` which might rely on Next.js absolute path aliases or fetch.
// For simplicity in a standalone script, we'll manually fetch the OpenRouter market here to recreate the `drafting` intent routing.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error("Missing OPENROUTER_API_KEY in environment.");
    process.exit(1);
}

const INDUSTRIES = [
    // Core Tech
    "B2B SaaS", "Consumer Social", "Hardware & Healthcare", "Marketplaces", "Developer Tools",
    // Enterprise & B2B
    "FinTech", "InsurTech", "PropTech", "LegalTech", "GovTech",
    "HR Tech", "Enterprise Cybersecurity", "Supply Chain & Logistics", "Data Observability", "DevSecOps",
    // Applied AI & Frontier
    "AI Infrastructure", "Robotics", "SpaceTech", "Biotech", "Climate Tech",
    "AgriTech", "CleanTech", "Web3 Infrastructure", "Open Source Software",
    // Consumer & Social
    "Creator Economy", "E-commerce Infrastructure", "DTC Brands", "Gaming", "TravelTech",
    "Wearables", "PetTech", "ConTech (Construction)", "Fitness Tech", "Aging & ElderCare Tech",
    // specialized Verticals
    "HealthTech", "Mental Health Tech", "EdTech", "FoodTech", "RetailTech",
    "SportsTech", "EventTech", "MusicTech", "BeautyTech", "FashionTech",
    "WealthTech", "MarTech (Marketing)", "AdTech", "SalesTech", "No-Code/Low-Code Tools"
];

// Zod Schema for AIEO / SEO Content
const AieoSchema = z.object({
    slug: z.string().describe("The URL-friendly slug based on the industry name, e.g., 'b2b-saas-ideas'."),
    title: z.string().describe("The SEO-optimized H1 Title, e.g. 'How to Validate a B2B SaaS Startup Idea'."),
    executiveBLUF: z.string().describe("The Top-Line Executive Summary. Dense, factual, zero-fluff minimum 200 character summary for SearchGPT/Perplexity consumption."),
    failureRatesTable: z.array(z.object({
        reason: z.string(),
        percentage: z.string()
    })).describe("A data table analyzing 3 to 5 primary causes of startup failure in this specific industry."),
    acquisitionCostsTable: z.array(z.object({
        channel: z.string(),
        estimated_cac: z.string()
    })).describe("A data table outlining 3 to 4 typical customer acquisition channels and median costs (CAC) for this industry."),
    coreTension: z.string().describe("One sentence summarizing the absolute hardest execution risk about building in this industry."),
    suggestedIdeaToValidate: z.string().describe("A fully formed, pre-filled, highly specific startup idea to inject into the interactive Validator tool specific to this industry."),
});

const openRouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
});

async function findBestDraftingModel() {
    console.log("Fetching global LLM market data for 'drafting' intent...");
    const res = await fetch("https://openrouter.ai/api/v1/models");
    const data = await res.json();
    
    // Simple heuristic for scripting: Find Gemini 1.5 Flash or Pro
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidate = data.data.find((m: any) => m.id.includes("gemini-1.5-flash") || m.id.includes("gemini-2.0-flash"));
    const modelId = candidate ? candidate.id : "google/gemini-2.0-flash-lite-preview-02-05:free";
    
    console.log(`✅ Selected Model: ${modelId}`);
    return modelId;
}

async function main() {
    const modelId = await findBestDraftingModel();
    const model = openRouter(modelId);

    const outDir = path.join(process.cwd(), 'src/content/validate-seo');
    await fsPromises.mkdir(outDir, { recursive: true });

    console.log(`\n🚀 Generating ${INDUSTRIES.length} Programmatic AIEO Pages...\n`);

    for (const industry of INDUSTRIES) {
        console.log(`Generating content for: ${industry}`);
        
        try {
            const { object } = await generateObject({
                model,
                schema: AieoSchema,
                prompt: `You are an elite SEO Content Architect and Venture Capital Analyst.
Generate a structured, hyper-factual, zero-fluff landing page data payload for the ${industry} industry.
This payload will be used programmatically to generate a beautiful, highly-ranked landing page for founders looking to validate their ${industry} startup ideas.
Ensure the 'executiveBLUF' reads like a dense Wikipedia intro designed for AI extraction (Perplexity).
Ensure the 'suggestedIdeaToValidate' is a creative, specific, and realistic dummy idea that a founder might actually type.`
            });

            console.log(`   └─ Validated Schema. Writing to ${object.slug}.json`);
            
            const filePath = path.join(outDir, `${object.slug}.json`);
            await fsPromises.writeFile(filePath, JSON.stringify({ industry, ...object }, null, 2), 'utf-8');
            
        } catch(e) {
            console.error(`❌ Failed to generate for ${industry}: `, e);
        }
    }
    
    console.log(`\n🎉 Generation Complete! Content saved to src/content/validate-seo/`);
}

main();
