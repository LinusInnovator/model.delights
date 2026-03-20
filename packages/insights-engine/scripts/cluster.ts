import fs from 'fs';
import path from 'path';
import { IntelligenceRouter } from '../../sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const rootPath = process.cwd();
const contextPath = path.join(rootPath, 'business_context.json');
const clustersDir = path.join(rootPath, 'src/data/insights/clusters');

if (!fs.existsSync(contextPath)) {
    console.error("[Cluster Orchestrator] Fatal Error: business_context.json not found in root.");
    process.exit(1);
}

const businessContext = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
const topic = process.argv[2];

if (!topic) {
    console.error(`[Cluster Orchestrator] Please provide a macro topic.\nUsage: npm run insights:cluster "Open-Source LLM Economics"`);
    process.exit(1);
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const INTERNAL_GOD_KEY = process.env.INTERNAL_GOD_KEY || 'sk-development-mock-key';

if (!OPENROUTER_API_KEY) {
    console.error("[Cluster Orchestrator] Fatal Error: OPENROUTER_API_KEY must be in .env.local");
    process.exit(1);
}

const router = new IntelligenceRouter({ 
    apiKey: INTERNAL_GOD_KEY, 
    baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || 'https://model.delights.pro' 
});

const systemPrompt = [
  "You are the Lead SEO Content Strategist for " + businessContext.companyName + ".",
  "Your task is to architect a Hub-and-Spoke Interlinking Cluster map for the macro topic: '" + topic + "'.",
  "",
  "RULES FOR AIEO INTERLINKING:",
  "1. We need 1 comprehensive 'Hub' page and precisely 3 tightly scoped 'Spoke' pages.",
  "2. Anchor text must be deeply descriptive. Avoid 'click here'. Example good anchor: 'how to write extractable answer-first sections'.",
  "3. The Hub page links downward to all 3 Spokes.",
  "4. Each Spoke page MUST link upward back to the Hub page exactly once.",
  "",
  "CRITICAL JSON OUTPUT FORMAT:",
  "You must return ONLY perfectly valid JSON matching this exact structure:",
  "{",
  '  "clusterName": "slugified-macro-topic",',
  '  "hub": {',
  '     "slug": "hub-slug",',
  '     "title": "Hub Title",',
  '     "topicEntity": "High-level concept",',
  '     "intent": "Thought Leadership / Pillar Page",',
  '     "summary": "What the hub covers"',
  '  },',
  '  "spokes": [',
  '     {',
  '        "slug": "spoke-slug",',
  '        "title": "Spoke Title",',
  '        "topicEntity": "Specific Sub-concept",',
  '        "intent": "Answer / Glossary / Method",',
  '        "summary": "What the spoke covers",',
  '        "anchorToHub": "The descriptive anchor text the Spoke uses to link back to the Hub",',
  '        "hubAnchorToSpoke": "The descriptive anchor text the Hub uses to link downward to this Spoke"',
  '     }',
  '  ]',
  "}",
  "",
  "Respond with ONLY valid JSON. Start with { and end with }. Do not include markdown ticks."
].join("\n");

async function main() {
    console.log(`\n============== MODEL DELIGHTS CLUSTER MAPPING ==============\n`);
    console.log(`[1] Injecting Context: ${businessContext.companyName} | ${businessContext.productName}`);
    console.log(`[2] Architecting Hub-and-Spoke Map for: "${topic}"\n`);
    
    try {
        console.log(`[3] Handing off to the Snell SDK Execution Engine...`);
        const res = await router.execute({
            messages: [{ role: 'system', content: systemPrompt }],
            openrouterKey: OPENROUTER_API_KEY as string,
            config: {
                intent: 'logical_reasoning', // For structured mapping tasks
                policy: 'max_quality', // We want accurate orchestration mapping
                cached_payload: false
            }
        });

        const LLM_OUTPUT = (res.choices as any)[0].message.content.trim();
        const modelName = res._snell_telemetry ? (res._snell_telemetry as any).model_used : 'unknown';
        console.log(`[4] Received spatial schema via ${modelName}`);

        let jsonObject;
        try {
             let cleanJsonString = LLM_OUTPUT;
             if (cleanJsonString.startsWith("```json")) cleanJsonString = cleanJsonString.replace("```json", "");
             if (cleanJsonString.startsWith("```")) cleanJsonString = cleanJsonString.replace("```", "");
             if (cleanJsonString.endsWith("```")) cleanJsonString = cleanJsonString.slice(0, -3);
             cleanJsonString = cleanJsonString.trim();
             
             jsonObject = JSON.parse(cleanJsonString);
        } catch(e) {
            console.error(`[Fatal] Failed to parse output as strictly structured JSON. Check the LLM response.`);
            console.error(LLM_OUTPUT.substring(0, 500) + '...');
            process.exit(1);
        }

        const clusterId = jsonObject.clusterName || `cluster-${Date.now()}`;
        
        console.log(`[5] Writing perfectly mapped JSON schema into architecture...`);

        if (!fs.existsSync(clustersDir)) {
             fs.mkdirSync(clustersDir, { recursive: true });
        }

        const outPath = path.join(clustersDir, `map-${clusterId}.json`);
        fs.writeFileSync(outPath, JSON.stringify(jsonObject, null, 2), 'utf-8');

        console.log(`\n=========================================================\n`);
        console.log(`[SUCCESS] Autonomous Cluster Orchestrator completed!`);
        console.log(`Cluster map saved to: src/data/insights/clusters/map-${clusterId}.json`);
        console.log(`You can now feed this map into the Contextual Drafter engine!`);
        console.log(`=========================================================\n`);

    } catch(err) {
        console.error(`[Error] Execution failed.`, err);
    }
}

main();
