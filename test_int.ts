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
    
    console.log("\n--- Test 6: Context Caching Economics ---");
    console.log("  A RAG dev is passing a massive document repeatedly. We should see Anthropic models dominate the 'Smart Value' category due to prompt_cached discounts.");
    const test6 = await getOptimalRoute({ intent: 'document', policy: 'balanced', cached_payload: true });
    console.log("- Cache-Optimized Flagship:", test6?.flagship?.name, "Cache Cost/1M:", test6?.flagship?.cost_per_1m);
    console.log("- Cache-Optimized Smart Value:", test6?.smart_value?.name, "Cache Cost/1M:", test6?.smart_value?.cost_per_1m);

    console.log("\n--- Test 7: Zero-Knowledge Telemetry Pipeline ---");
    console.log("  Simulating a catastrophic execution failure (Hallucination) from a downstream app.");
    
    // Test the actual SDK method, so we import IntelligenceRouter
    const { IntelligenceRouter } = await import('./packages/sdk/index');
    const sdkRouter = new IntelligenceRouter({ apiKey: process.env.INTERNAL_GOD_KEY || 'test_internal_god_key', baseUrl: "http://localhost:3000" });
    
    await sdkRouter.reportTelemetry({
        model: test1?.flagship?.model || 'unknown',
        intent: 'fictional',
        outcome: 'failed_hallucination',
        latency_ms: 12050
    });
    
    console.log("- Telemetry ping fired asynchronously. Check src/data/telemetry_db.jsonl on the server!");
    
    // Give the async fetch 1 second before node kills the script
    await new Promise(r => setTimeout(r, 1000));
}

run().catch(console.error);
