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
