import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const runtime = 'edge';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { prompt, modelId } = await req.json();

    if (!modelId) {
      return new Response('Missing modelId', { status: 400 });
    }

    const systemPrompt = `You are the ultimate Super Architect. Your job is to translate this founder's raw startup idea into a mercilessly precise, human-readable Product Requirements Document (PRD).

STRICT CONSTRAINTS:
1. You are designing this PRD for a Singular Unicorn (a lone architect with an AI swarm), NOT a bloated Agile team. 
2. DO NOT include timelines, sprint planning, Jira stories, or agile management fluff. Agents do not care about time. They care about SEQUENCE.
3. Organize the technical roadmap strictly by "Sequences" (e.g., Sequence 1: Data Primitives, Sequence 2: Intelligence Routing, Sequence 3: Autonomous Deployment).
4. Outline the exact data models (Postgres schema/JSON).
5. Specify the exact AI capabilities required (e.g., Reasoning, Embeddings, Edge Functions) and how context caching will keep API margins high.
6. The tone must be brutally concise, ultra-technical, unapologetic, and highly structured (Markdown).

OUTPUT FORMAT:
- Title: [Aggressive, 3-word codename]
- The Extraction Summary: 2 brutal sentences stripping away marketing jargon to state the raw technical reality.
- The Primitives: The exact tables, columns, and relationships required to store state.
- The Intelligence Layer: Which AI components are needed and how latency will be mitigated.
- The Autonomous Sequences: 
    - Sequence 1: ...
    - Sequence 2: ...
    - Sequence 3: ...`;

    const result = await streamText({
      model: openrouter(modelId),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[GENERATE PRD ERROR]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
