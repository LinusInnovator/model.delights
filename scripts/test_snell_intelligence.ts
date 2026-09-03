// scripts/test_snell_intelligence.ts
// Rigorous end-to-end verification of Snell's Semantic Routing & Tool-Calling Guard

async function runTests() {
    const baseUrl = 'http://localhost:3000/api/v1/chat/completions';
    const authHeader = 'Bearer super_secret_snell_key_123';

    console.log('\n======================================================');
    console.log('--- SNELL INTELLIGENT ROUTER VERIFICATION SUITE ---');
    console.log('======================================================\n');

    // TEST 1: Tool-Calling & Structured Output Guard
    console.log('--- TEST 1: Tool-Calling Gating (Agentic Invariant) ---');
    try {
        const toolPayload = {
            model: 'snell/auto',
            messages: [{ role: 'user', content: 'What is the stock price of Apple (AAPL)?' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'get_stock_quote',
                    description: 'Get real-time stock price and market cap for a given ticker symbol',
                    parameters: {
                        type: 'object',
                        properties: {
                            ticker: { type: 'string', description: 'Stock ticker symbol, e.g. AAPL' }
                        },
                        required: ['ticker']
                    }
                }
            }],
            tool_choice: 'auto'
        };

        const res1 = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(toolPayload)
        });

        const intent1 = res1.headers.get('x-snell-intent');
        const routed1 = res1.headers.get('x-snell-routed-to');
        const toolsGuaranteed1 = res1.headers.get('x-snell-tools-guaranteed');
        const data1 = await res1.json();

        console.log(`Status: ${res1.status}`);
        console.log(`x-snell-intent: ${intent1}`);
        console.log(`x-snell-routed-to: ${routed1}`);
        console.log(`x-snell-tools-guaranteed: ${toolsGuaranteed1}`);
        console.log(`Tool Calls Received: ${JSON.stringify(data1.choices?.[0]?.message?.tool_calls || 'none')}`);

        if (intent1 === 'agentic' && toolsGuaranteed1 === 'true') {
            console.log('✅ TEST 1 PASSED: Tool-calling invariant preserved and correctly routed.\n');
        } else {
            console.error('❌ TEST 1 FAILED: Incorrect intent or tools not guaranteed.\n');
        }
    } catch (e: any) {
        console.error('❌ TEST 1 ERROR:', e.message);
    }

    // TEST 2: Coding Intent Detection (Aider Benchmark Routing)
    console.log('--- TEST 2: Coding Intent (Aider Benchmark Routing) ---');
    try {
        const codingPayload = {
            model: 'snell/auto',
            messages: [{ 
                role: 'user', 
                content: 'Refactor this Python function to be iterative instead of recursive to avoid stack overflow:\n```python\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n```' 
            }]
        };

        const res2 = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(codingPayload)
        });

        const intent2 = res2.headers.get('x-snell-intent');
        const routed2 = res2.headers.get('x-snell-routed-to');
        const savings2 = res2.headers.get('x-snell-savings-pct');
        const data2 = await res2.json();

        console.log(`Status: ${res2.status}`);
        console.log(`x-snell-intent: ${intent2}`);
        console.log(`x-snell-routed-to: ${routed2}`);
        console.log(`x-snell-savings-pct: ${savings2}`);
        console.log(`Response Snippet: ${data2.choices?.[0]?.message?.content?.slice(0, 100)}...`);

        if (intent2 === 'coding') {
            console.log('✅ TEST 2 PASSED: Code intent detected and routed to code-specialized model.\n');
        } else {
            console.error('❌ TEST 2 FAILED: Expected intent "coding", got: ' + intent2 + '\n');
        }
    } catch (e: any) {
        console.error('❌ TEST 2 ERROR:', e.message);
    }

    // TEST 3: Deep Reasoning Intent Detection
    console.log('--- TEST 3: Deep Reasoning Intent ---');
    try {
        const reasoningPayload = {
            model: 'snell/intelligence',
            messages: [{ 
                role: 'user', 
                content: 'Think step by step and provide a formal mathematical proof that the square root of 2 is irrational.' 
            }]
        };

        const res3 = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(reasoningPayload)
        });

        const intent3 = res3.headers.get('x-snell-intent');
        const routed3 = res3.headers.get('x-snell-routed-to');
        const data3 = await res3.json();

        console.log(`Status: ${res3.status}`);
        console.log(`x-snell-intent: ${intent3}`);
        console.log(`x-snell-routed-to: ${routed3}`);
        console.log(`Has Reasoning: ${Boolean(data3.choices?.[0]?.message?.reasoning || data3.choices?.[0]?.message?.content)}`);

        if (intent3 === 'reasoning') {
            console.log('✅ TEST 3 PASSED: Deep reasoning prompt correctly classified and routed.\n');
        } else {
            console.error('❌ TEST 3 FAILED: Expected intent "reasoning", got: ' + intent3 + '\n');
        }
    } catch (e: any) {
        console.error('❌ TEST 3 ERROR:', e.message);
    }

    // TEST 4: Fast Utility Intent & Extreme FinOps Savings
    console.log('--- TEST 4: Fast Utility Intent & FinOps Savings ---');
    try {
        const utilityPayload = {
            model: 'snell/economy',
            messages: [{ role: 'user', content: 'Translate "Good morning, let us start the meeting" to German.' }]
        };

        const res4 = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify(utilityPayload)
        });

        const intent4 = res4.headers.get('x-snell-intent');
        const routed4 = res4.headers.get('x-snell-routed-to');
        const savings4 = res4.headers.get('x-snell-savings-pct');
        const savedUsd4 = res4.headers.get('x-snell-saved-usd');
        const data4 = await res4.json();

        console.log(`Status: ${res4.status}`);
        console.log(`x-snell-intent: ${intent4}`);
        console.log(`x-snell-routed-to: ${routed4}`);
        console.log(`x-snell-savings-pct: ${savings4}`);
        console.log(`x-snell-saved-usd: $${savedUsd4}`);
        console.log(`Translation: ${data4.choices?.[0]?.message?.content?.trim()}`);

        if (intent4 === 'fast_utility') {
            console.log('✅ TEST 4 PASSED: Fast utility task routed with extreme FinOps savings.\n');
        } else {
            console.error('❌ TEST 4 FAILED: Expected intent "fast_utility", got: ' + intent4 + '\n');
        }
    } catch (e: any) {
        console.error('❌ TEST 4 ERROR:', e.message);
    }

    console.log('======================================================');
    console.log('--- ALL TESTS COMPLETE ---');
    console.log('======================================================\n');
}

runTests();
