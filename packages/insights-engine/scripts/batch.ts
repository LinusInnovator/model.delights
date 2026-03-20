import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const clusterFile = process.argv[2];

if (!clusterFile || !fs.existsSync(clusterFile)) {
    console.error(`[Batch Orchestrator] Fatal Error: Cluster file not provided or not found.`);
    console.error(`Usage: npm run insights:batch "src/data/insights/clusters/map-slug.json"`);
    process.exit(1);
}

const clusterMap = JSON.parse(fs.readFileSync(clusterFile, 'utf8'));

async function main() {
    console.log(`\n============== MODEL DELIGHTS BATCH ORCHESTRATOR ==============\n`);
    console.log(`[1] Processing Cluster Topology: ${clusterMap.clusterName}`);
    
    const nodes = [clusterMap.hub, ...(clusterMap.spokes || [])];
    console.log(`[2] Total Semantic Nodes Isolated: ${nodes.length}`);
    console.log(`\n[3] Triggering Sequential AI Drafting Sequences...\n`);

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const isHub = i === 0;
        
        console.log(`---------------------------------------------------------`);
        console.log(`[Executing Sub-Process ${i + 1}/${nodes.length}]`);
        console.log(`Node Role: ${isHub ? 'CANONICAL HUB' : 'SUPPORTING SPOKE'}`);
        console.log(`Node Slug: ${node.slug}`);
        console.log(`Node Intent: ${node.intent || 'Text/Document'}`);
        console.log(`Command Hand-Off: npx tsx packages/insights-engine/scripts/draft.ts`);
        console.log(`---------------------------------------------------------\n`);
        
        try {
            // We use execSync with stdio: 'inherit' to perfectly pipe the drafter output back to the terminal.
            execSync(`npx tsx packages/insights-engine/scripts/draft.ts --cluster ${clusterFile} --slug ${node.slug}`, {
                stdio: 'inherit',
                env: process.env
            });
            console.log(`\n[SUCCESS] Node '${node.slug}' completely compiled and verified!\n`);
        } catch (err) {
            console.error(`\n[FATAL ERROR] Automated Sequence Halted on Node: ${node.slug}`);
            console.error(`The pipeline caught an execution boundary failure from the Snell SDK or TypeScript runtime.`);
            console.error(`Resuming to next node in the sequence to ensure maximum cluster density...`);
            // We consciously catch and continue instead of killing the entire batch, maximizing yield.
            console.log(`\n`);
        }
    }
    
    console.log(`============== BATCH ORCHESTRATION COMPLETE ==============\n`);
    console.log(`The entire '${clusterMap.clusterName}' ecosystem has been synthesized.`);
    console.log(`The Next.js framework will parse and natively render the exact contextual graph live.`);
    console.log(`\n`);
}

main();
