import fs from 'fs';
import path from 'path';
import { IntelligenceRouter } from '../../sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const rootPath = process.cwd();
const configPath = path.join(rootPath, 'insights.config.json');

let baseOutDir = path.join(rootPath, 'src/data/insights');
if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.queueDir) baseOutDir = path.join(rootPath, config.queueDir);
}

let topic = "";
let clusterFile = "";
let nodeSlug = "";
let tenantId = "model-delights";

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--cluster') clusterFile = process.argv[i+1];
    if (process.argv[i] === '--slug') nodeSlug = process.argv[i+1];
    if (process.argv[i] === '--tenant') tenantId = process.argv[i+1];
}

const contextPath = path.join(rootPath, '../seo-delights/tenants', `${tenantId}.json`);
const fallbackContextPath = path.join(rootPath, 'business_context.json');

let businessContext;
if (fs.existsSync(contextPath)) {
    businessContext = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
} else if (fs.existsSync(fallbackContextPath)) {
    console.warn(`[Insights Drafter Warning] Tenant '${tenantId}' not found. Reverting to legacy business_context.json.`);
    businessContext = JSON.parse(fs.readFileSync(fallbackContextPath, 'utf8'));
} else {
    console.error(`[Insights Drafter] Fatal Error: No contextual config mapped for tenant '${tenantId}'.`);
    process.exit(1);
}

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--cluster') clusterFile = process.argv[i+1];
    if (process.argv[i] === '--slug') nodeSlug = process.argv[i+1];
}

if (!clusterFile && process.argv.length > 2 && !process.argv[2].startsWith('--')) {
    topic = process.argv[2];
}

if (!topic && (!clusterFile || !nodeSlug)) {
    console.error(`[Insights Drafter] Usage: npm run insights:draft "Your Topic"`);
    console.error(`                   OR npm run insights:draft --tenant [tenant] --cluster [file] --slug [slug]`);
    process.exit(1);
}

let clusterContextStr = "";
let isHub = false;

if (clusterFile && nodeSlug) {
    if (!fs.existsSync(clusterFile)) {
        console.error(`[Insights Drafter] Fatal Error: Cluster file not found: ${clusterFile}`);
        process.exit(1);
    }
    const clusterMap = JSON.parse(fs.readFileSync(clusterFile, 'utf8'));
    
    const hub = clusterMap.hub;
    const spokes = clusterMap.spokes || [];
    
    if (hub.slug === nodeSlug) {
        isHub = true;
        topic = hub.title;
        clusterContextStr = `You are writing the HUB PAGE for the SEO cluster '${clusterMap.clusterName}'.\n` +
            `You MUST weave exact-match contextual internal links downward to your Supporting Spokes. ` +
            `Map these into the 'internalLinks' JSON array natively.\n` + 
            `Target Spokes:\n` +
            spokes.map((s:any) => `- Slug: ${s.slug} | Title: ${s.title} | Required Anchor Text to use organically in body: "${s.hubAnchorToSpoke}" | Relationship: child-spoke`).join("\n");
    } else {
        const spoke = spokes.find((s:any) => s.slug === nodeSlug);
        if (!spoke) {
            console.error(`[Insights Drafter] Fatal: Node slug '${nodeSlug}' not found in cluster map.`);
            process.exit(1);
        }
        topic = spoke.title;
        clusterContextStr = `You are writing a SUPPORTING SPOKE PAGE for the SEO cluster '${clusterMap.clusterName}'.\n` +
            `You MUST weave an exact-match contextual internal link UPWARD to your Parent Hub. ` +
            `Map this into the 'internalLinks' JSON array natively.\n` +
            `- Parent Hub Slug: ${hub.slug} | Title: ${hub.title} | Required Anchor Text to use organically in body: "${spoke.anchorToHub}" | Relationship: parent-hub\n`;
    }
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
  clusterContextStr ? `\n--- CLUSTER CONTEXT ---\n${clusterContextStr}\n-----------------------\n` : "",
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
  '  "heroImagePrompt": "A highly detailed, cinematic abstract vector illustration prompt for Flux...",',
  '  "narrativeBlocks": [',
  '     { "id": "p1", "type": "p", "content": { "beginner": "...", "technical": "...", "executive": "..." }, "evidenceId": "evidence-1" },',
  '     { "id": "h2-1", "type": "h2", "content": { "beginner": "...", "technical": "...", "executive": "..." } }',
  '  ],',
  '  "internalLinks": [',
  '     { "targetSlug": "slug", "targetTitle": "Title", "anchorText": "anchor", "relationship": "parent-hub" }',
  '  ]',
  "}",
  '2. Ensure you have proper type ("p", "h2", "callout") for narrativeBlocks.',
  "3. Keep the content deeply structured. Focus heavily on 'technical' and 'executive' depth.",
  "4. You MUST include 'heroImagePrompt' in the JSON. This is an explicit prompt for a FLUX image generator representing the topic. It MUST explicitly end with the brand mandate: 'Dark-mode UX/UI style with vibrant emerald green and zinc accents. Corporate tech style. NO TEXT. NO WORDS. NO LETTERS.'",
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

        const targetSlug = nodeSlug || jsonObject.slug || `generated-article-${Date.now()}`;
        
        // --- PHASE 6: ON-BRAND AUTO-IMAGE GENERATION (FLUX) ---
        console.log(`[5] Engineering Brand Guidelines into Flux-Schnell Payload...`);
        const abstractPrompt = jsonObject.heroImagePrompt || `A minimalist, highly cinematic 8k abstract vector illustration of ${jsonObject.topicEntity || topic}. Dark-mode UX/UI style with vibrant emerald green and zinc accents. Corporate tech style. NO TEXT. NO WORDS. NO LETTERS.`;
        
        try {
            const heroData = await router.generateImage({ prompt: abstractPrompt });
            jsonObject.heroImage = {
                url: heroData.url,
                alt: `Vector illustration depicting ${jsonObject.topicEntity || topic}`
            };
            console.log(` - Extracted Flux Snapshot URL: ${heroData.url}`);
        } catch (imgErr) {
            console.warn(` - [Image Warning] Failed to reach image gateway. Attempting text-only node fallback.`);
        }
        // ------------------------------------------------------

        console.log(`[6] Writing perfectly formatted TypeScript file into architecture...`);

        const fileContent = [
            "import { ContentObject } from '@model-delights/insights-engine';",
            "",
            `export const article_${targetSlug.replace(/-/g, '_')} : ContentObject = ${JSON.stringify(jsonObject, null, 2)};`
        ].join("\n");

        let outDir = baseOutDir;
        if (clusterFile && fs.existsSync(clusterFile)) {
             const clusterMap = JSON.parse(fs.readFileSync(clusterFile, 'utf8'));
             outDir = path.join(outDir, clusterMap.clusterName);
        }

        if (!fs.existsSync(outDir)) {
             fs.mkdirSync(outDir, { recursive: true });
        }

        const outPath = path.join(outDir, `${targetSlug}.ts`);
        fs.writeFileSync(outPath, fileContent, 'utf-8');

        console.log(`\n=========================================================\n`);
        console.log(`[SUCCESS] Autonomous Drafter completed successfully!`);
        console.log(`Article safely buffered into the Offline Queue: ${outPath}`);
        console.log(`The 'insights:publish' pacemaker script handles ultimate deployment syncing.`);
        console.log(`=========================================================\n`);

    } catch(err) {
        console.error(`[Error] Execution failed.`, err);
    }
}

main();
