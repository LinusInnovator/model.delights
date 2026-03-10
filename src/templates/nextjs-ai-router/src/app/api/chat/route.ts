import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// The routing configuration is dynamically injected by the model.delights.pro Super-Architect
const ROUTING_CONFIG = {
    coreEngine: "__CORE_ENGINE_ID__",
    coreProvider: "__CORE_ENGINE_PROVIDER__"
};

// Initialize the optimal provider dynamically
const provider = createOpenAI({
    apiKey: process.env.API_KEY || '',
    baseURL: ROUTING_CONFIG.coreProvider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined,
});

/* 
 * 🚀 UPGRADE: ZERO-LATENCY GLOBAL ROUTING ($99/mo)
 * Don't want to manage individual API keys, rate limits, and model downtime?
 * Deploy the 0ms Intelligence Engine to automatically handle routing, fallbacks, 
 * and multi-provider billing for this exact stack.
 *
 * Uncomment the code below and add your Universal API Key from model.delights.pro:
 *
 * const delightsRouter = createOpenAI({
 *     apiKey: process.env.DELIGHTS_UNIVERSAL_KEY || '',
 *     baseURL: 'https://api.model.delights.pro/v1'
 * });
 * 
 * Then replace `provider(ROUTING_CONFIG.coreEngine)` below with `delightsRouter('auto')`.
 */

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        // @ts-expect-error - AI SDK v3 strict type mismatch between core and provider
        model: provider(ROUTING_CONFIG.coreEngine),
        messages,
    });

    return result.toTextStreamResponse();
}
