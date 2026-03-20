import fs from 'fs';
import path from 'path';
import { IntelligenceRouter } from '../../sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const rootPath = process.cwd();
const contextPath = path.join(rootPath, 'business_context.json');
const insightsDataDir = path.join(rootPath, 'src/data/insights');

if (!fs.existsSync(contextPath)) {
    console.error("[Insights Drafter] Fatal Error: business_context.json not found in root.");
    process.exit(1);
}

const businessContext = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
const topic = process.argv[2];

if (!topic) {
    console.error(`[Insights Drafter] Please provide a topic.`);
    process.exit(1);
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const INTERNAL_GOD_KEY = process.env.INTERNAL_GOD_KEY || 'sk-development-mock-key';

if (!OPENROUTER_API_KEY) {
    console.error("[Insights Drafter] Fatal Error: OPENROUTER_API_KEY must be in .env.local");
    process.exit(1);
}

const router = new IntelligenceRouter({ 
    apiKey: INTERNAL_GOD_KEY, 
    baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || 'https://model.delights.pro' 
});

const systemPrompt = [
  "You are the Autonomous Content Architect for " + businessContext.companyName + ".",
  "Your objective is to draft a heavily structured JSON payload for an article about '" + topic + "'.",
  "The article must strictly align with the 2026 AI Search Principles (Extractability, Fact-Driven, E-E-A-T).",
  "",
  "Context provided by the business:",
  "Product: " + businessContext.productName,
  "Audience: " + businessContext.primaryAudience,
  "Value Prop: " + businessContext.valueProposition,
  "Brand Voice: " + businessContext.brandVoice,
  "Advantage: " + businessContext.competitiveAdvantage.join(" | "),
  "",
  "AIEO & SEO STRUCTURAL MANDATES:",
  "- Philosophy: 'Be as short as possible, but never shorter than the proof required.'",
  "- Word Counts: Simple fact/answer queries (400-900 words), Comparisons/Decision layers (800-1400 words), Expert/Method guides (1500-2500 words).",
  "- Do NOT standardize exactly one length. Let the topic dictate the length. Avoid 2,000+ words on a 300-word topic.",
  "- Narrative flow MUST follow this rule:",
  "  1. 40-80 word direct answer at the top (mapped seamlessly to primaryAnswer)",
  "  2. Short, punchy explanation section",
  "  3. Bullets / Tables / Frameworks (mapped to extractableAssets)",
  "  4. Proof, examples, or evidence (mapped to evidenceLog)",
  "  5. FAQs, edge cases, caveats (mapped to limitations)",
  "  6. Action step or next decision",
  "- Avoid delayed intros. Modularize complex ideas instead of creating 4000-word unreadable blobs.",
  "",
  "You MUST formulate the JSON precisely matching the TypeScript ContentObject interface.",
  "",
  "CRITICAL JSON RULES:",
  "1. Return strictly an object formatted exactly like:",
  "{",
  '  "id": "slug-name",',
  '  "slug": "slug-name",',
  '  "topicEntity": "High-level concept",',
  '  "lastVerifiedDate": "e.g., March 2026",',
  '  "datePublished": "e.g., March 2026",',
  '  "readTimeMin": 5,',
  '  "author": { "name": "Platform Team", "credentials": "..." },',
  '  "primaryAnswer": { "question": "...", "summary": "..." },',
  '  "extractableAssets": {',
  '     "comparisonTable": { "title": "...", "columns": ["A", "B"], "rows": [["X","Y"], ["Z","W"]] },',
  '     "expertQuote": { "text": "...", "author": "..." }',
  '  },',
  '  "evidenceLog": {',
  '     "evidence-1": { "id": "evidence-1", "type": "benchmark", "content": "...", "sourceLabel": "..." }',
  '  },',
  '  "limitations": [ "Limitation 1", "Limitation 2" ],',
  '  "title": { "beginner": "...", "technical": "...", "executive": "..." },',
  '  "subtitle": { "beginner": "...", "technical": "...", "executive": "..." },',
  '  "narrativeBlocks": [',
  '     { "id": "p1", "type": "p", "content": { "beginner": "...", "technical": "...", "executive": "..." }, "evidenceId": "evidence-1" },',
  '     { "id": "h2-1", "type": "h2", "content": { "beginner": "...", "technical": "...", "executive": "..." } }',
  '  ]',
  "}",
  '2. Ensure you have proper type ("p", "h2", "callout") for narrativeBlocks.',
  "3. Keep the content deeply structured. Focus heavily on 'technical' and 'executive' depth.",
  "",
  "Respond with ONLY valid JSON. No markdown syntax, no markdown codeblocks, just the JSON string starting with { and ending with }."
].join("\n");


async function main() {
    console.log(`\n============== MODEL DELIGHTS INSIGHTS ==============\n`);
    console.log(`[1] Injecting Context: ${businessContext.companyName} | ${businessContext.productName}`);
    console.log(`[2] Delegating formulation for Topic: "${topic}"\n`);
    
    try {
        console.log(`[3] Handing off to the Snell SDK Execution Engine...`);
        const res = await router.execute({
            messages: [{ role: 'system', content: systemPrompt }],
            openrouterKey: OPENROUTER_API_KEY as string,
            config: {
                intent: 'text_heavy', 
                policy: 'max_quality',
                cached_payload: false
            }
        });

        const LLM_OUTPUT = (res.choices as any)[0].message.content.trim();
        const modelName = res._snell_telemetry ? (res._snell_telemetry as any).model_used : 'unknown';
        console.log(`[4] Received response via ${modelName}`);

        let jsonObject;
        try {
             let cleanJsonString = LLM_OUTPUT;
             if (cleanJsonString.startsWith("```json")) {
                 cleanJsonString = cleanJsonString.replace("```json", "");
             }
             if (cleanJsonString.startsWith("```")) {
                 cleanJsonString = cleanJsonString.replace("```", "");
             }
             if (cleanJsonString.endsWith("```")) {
                 cleanJsonString = cleanJsonString.slice(0, -3);
             }
             cleanJsonString = cleanJsonString.trim();
             
             jsonObject = JSON.parse(cleanJsonString);
        } catch(e) {
            console.error(`[Fatal] Failed to parse output as strictly structured JSON. Check the LLM response.`);
            console.error(LLM_OUTPUT.substring(0, 500) + '...');
            process.exit(1);
        }

        const targetSlug = jsonObject.slug || `generated-article-${Date.now()}`;
        
        console.log(`[5] Writing perfectly formatted TypeScript file into architecture...`);

        const fileContent = [
            "import { ContentObject } from '@model-delights/insights-engine';",
            "",
            `export const article_${targetSlug.replace(/-/g, '_')} : ContentObject = ${JSON.stringify(jsonObject, null, 2)};`
        ].join("\n");

        if (!fs.existsSync(insightsDataDir)) {
             fs.mkdirSync(insightsDataDir, { recursive: true });
        }

        const outPath = path.join(insightsDataDir, `${targetSlug}.ts`);
        fs.writeFileSync(outPath, fileContent, 'utf-8');

        console.log(`\n=========================================================\n`);
        console.log(`[SUCCESS] Autonomous Drafter completed successfully!`);
        console.log(`Article written to: src/data/insights/${targetSlug}.ts`);
        console.log(`The Next.js framework will now instantly render this live on the Insights hub.`);
        console.log(`=========================================================\n`);

    } catch(err) {
        console.error(`[Error] Execution failed.`, err);
    }
}

main();
