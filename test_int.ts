import { getOptimalRoute } from './src/lib/routingEngine';

async function run() {
    console.log("=== THE ADAPTIVE DECISION SYSTEM TEST SUITE ===");

    console.log("\n--- Test 1: Baseline Fictional Storyteller (Balanced Policy) ---");
    const test1 = await getOptimalRoute({ intent: 'fictional', policy: 'balanced' });
    console.log("- Flagship:", test1?.flagship?.name, "Cost:", test1?.flagship?.cost_per_1m);
    console.log("- Smart Value:", test1?.smart_value?.name, "Cost:", test1?.smart_value?.cost_per_1m);

    console.log("\n--- Test 2: Maximum Savings Storyteller ---");
    // This MUST reject expensive models and aggressively pick the absolute cheapest capable model
    const test2 = await getOptimalRoute({ intent: 'fictional', policy: 'max_savings' });
    console.log("- Flagship (Savings Mode):", test2?.flagship?.name, "Cost:", test2?.flagship?.cost_per_1m);

    console.log("\n--- Test 3: Maximum Quality Coder ---");
    // This MUST ignore cost completely and pick the absolute smartest coding model (likely Claude 3.5 Sonnet or OpenAI o1/o3)
    const test3 = await getOptimalRoute({ intent: 'coding', policy: 'max_quality' });
    console.log("- Ultimate Coder:", test3?.flagship?.name, "Cost:", test3?.flagship?.cost_per_1m);

    console.log("\n--- Test 4: Extreme Payload Threat (Economic Fit Test) ---");
    // Attempting to push 800,000 tokens through with Balanced policy. This will cost >$1, so it should be severely penalized.
    const test4 = await getOptimalRoute({ intent: 'reasoning', estimatedInputTokens: 800000, policy: 'balanced' });
    console.log("- Filter survivor:", test4?.flagship?.name, "Context Size:", test4?.flagship?.context_length);

    console.log("\n--- Test 5: Capability Gating (Image Output Needed) ---");
    // Demanding an image output capability. The routing matrix MUST reject all pure text models!
    const test5 = await getOptimalRoute({ intent: 'all', capabilities: ['image'], policy: 'max_quality' });
    if (!test5) {
        console.log("- Results: No models found matching the capability array.");
    } else {
         console.log("- Visual Model:", test5?.flagship?.name);
    }
}

run().catch(console.error);
