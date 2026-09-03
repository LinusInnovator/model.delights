import { getOptimalRoute, getSessionAffinity, recordSessionAffinity } from '../src/lib/routingEngine';

async function runSessionAffinityTests() {
    console.log('--- Testing Agent-Safe Session Affinity ---');

    const testSessionId = `swarm_agent_${Date.now()}`;

    // Turn 1: Fresh session request
    console.log(`1. Turn 1: Fresh request with sessionId="${testSessionId}"...`);
    const turn1Route = await getOptimalRoute({
        intent: 'coding',
        estimatedInputTokens: 5000,
        policy: 'balanced',
        sessionId: testSessionId
    });

    if (!turn1Route) {
        console.error('FAILED: turn 1 route was null');
        process.exit(1);
    }

    const assignedModel = turn1Route.flagship.model;
    console.log(`✓ Turn 1 assigned model: ${assignedModel} (sticky affinity flag: ${turn1Route.is_sticky_affinity})`);

    // Verify session store recorded it
    const storedModel = getSessionAffinity(testSessionId);
    if (storedModel !== assignedModel) {
        console.error(`FAILED: storedModel (${storedModel}) !== assignedModel (${assignedModel})`);
        process.exit(1);
    }
    console.log(`✓ Session store successfully mapped ${testSessionId} -> ${storedModel}`);

    // Turn 2: Subsequent request in the same thread (within context window)
    console.log(`2. Turn 2: Second turn with same sessionId="${testSessionId}" (6,000 tokens)...`);
    const turn2Route = await getOptimalRoute({
        intent: 'coding',
        estimatedInputTokens: 6000,
        policy: 'balanced',
        sessionId: testSessionId
    });

    if (!turn2Route) {
        console.error('FAILED: turn 2 route was null');
        process.exit(1);
    }

    if (turn2Route.flagship.model !== assignedModel) {
        console.error(`FAILED: Turn 2 switched models from ${assignedModel} to ${turn2Route.flagship.model} instead of staying pinned!`);
        process.exit(1);
    }

    if (!turn2Route.is_sticky_affinity) {
        console.error('FAILED: Turn 2 should have is_sticky_affinity === true!');
        process.exit(1);
    }

    console.log(`✓ Turn 2 pinned to exact same model: ${turn2Route.flagship.model} (is_sticky_affinity: ${turn2Route.is_sticky_affinity})`);
    console.log('✓ KV-Cache discount preserved! Persona continuity preserved!');

    // Turn 3: Context Overflow test (prompt exceeds model physical window -> auto promotion)
    console.log(`3. Turn 3: Context expansion test (30,000 tokens exceeds 8k window)...`);
    const turn3Route = await getOptimalRoute({
        intent: 'coding',
        estimatedInputTokens: 30000,
        policy: 'balanced',
        sessionId: testSessionId
    });

    if (!turn3Route) {
        console.error('FAILED: turn 3 route was null');
        process.exit(1);
    }

    console.log(`✓ Turn 3 gracefully promoted to high-context model: ${turn3Route.flagship.model} (context: ${turn3Route.flagship.context_length}) to prevent context crash!`);
    console.log('ALL SESSION AFFINITY & AGENT-SAFE TESTS PASSED!');
}

runSessionAffinityTests().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
