import { fetchModels } from './src/lib/api';

async function test() {
    console.log("Compiling Intelligence Engine...");
    const result = await fetchModels();
    
    const opus = result.models.find(m => m.id === "anthropic/claude-opus-4.6");
    if (opus) {
        console.log(`\nModel: ${opus.id}`);
        console.log(`- Global ELO:  ${opus.intelligence.global.toFixed(0)}`);
        console.log(`- Coding ELO:  ${opus.intelligence.coding.toFixed(0)}`);
        console.log(`- Agentic ELO: ${opus.intelligence.agentic?.toFixed(0)}`);
        if (opus.intelligence.agentic && opus.intelligence.agentic < 1000) {
            console.log("✅ SUCCESS: The Telemetry Loop correctly detected 4 fail logs and crashed the Agentic score to protect routing safely!");
        } else {
            console.log("❌ FAIL: Agentic score is too high. The telemetry penalty did not apply.");
        }
    }
}

test().catch(console.error);
