import { getOptimalRoute } from './src/lib/routingEngine';

async function run() {
    console.log("--- Testing Default Global Intent ---");
    const defaultRoute = await getOptimalRoute('all');
    console.log("- Flagship:", defaultRoute?.flagship.name, "ELO:", defaultRoute?.flagship.elo, "Context:", defaultRoute?.flagship.context_length);
    console.log("- Smart Value:", defaultRoute?.smart_value?.name, "ELO:", defaultRoute?.smart_value?.elo, "Context:", defaultRoute?.smart_value?.context_length);

    console.log("\n--- Testing High Token Payload (150k) ---");
    // Llama 3.1 8B Instruct has 128k context. If the failsafe works, it MUST be filtered out mathematically.
    // Claude 3.5 Sonnet has 200k, so it should survive.
    const largePayloadRoute = await getOptimalRoute('coding', 150000);
    console.log(`With 150k tokens:`);
    console.log("- Flagship:", largePayloadRoute?.flagship.name, "Context:", largePayloadRoute?.flagship.context_length);
    console.log("- Smart Value:", largePayloadRoute?.smart_value?.name, "Context:", largePayloadRoute?.smart_value?.context_length);

    console.log("\n--- Testing Extreme Token Payload (800k) ---");
    // Claude 3.5 Sonnet only has 200k. If we feed it 800k tokens, the matrix MUST reject Claude entirely.
    // Only massive-context models like Gemini Flash (1M) or Gemini Pro (2M) should survive the pre-flight check.
    const extremePayloadRoute = await getOptimalRoute('all', 800000);
    console.log(`With 800k tokens:`);
    console.log("- Flagship:", extremePayloadRoute?.flagship.name, "Context:", extremePayloadRoute?.flagship.context_length);
    console.log("- Smart Value:", extremePayloadRoute?.smart_value?.name, "Context:", extremePayloadRoute?.smart_value?.context_length);
}

run().catch(console.error);
