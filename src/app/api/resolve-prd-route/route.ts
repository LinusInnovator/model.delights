import { NextResponse } from 'next/server';
import { getOptimalRoute } from '@/lib/routingEngine';

export async function POST(req: Request) {
  try {
    const { idea, strategy } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Missing idea' }, { status: 400 });
    }

    // Map the UI routing strategy to the internal routing engine policies
    // 'ultra' = Max Quality (Raw ELO)
    // 'smart' = Balanced (High ELO but strict value/cost pruning)
    const policy = strategy === 'ultra' ? 'max_quality' : 'balanced';

    // We assume the final PRD output will be long, so we ask for models with high capabilities
    const route = await getOptimalRoute({
      intent: 'Reasoning', // Force high-level architectural reasoning
      capabilities: ['code'], // Must be able to output strict JSON/architecture constraints if needed
      estimatedInputTokens: idea.length / 4 + 1000, // Idea + massive system prompt
      policy
    });

    if (route && route.flagship) {
      return NextResponse.json({ model: route.flagship.model });
    } else {
      // Fallback
      return NextResponse.json({ model: 'anthropic/claude-3.5-sonnet:beta' });
    }

  } catch (error) {
    console.error('[RESOLVE PRD ROUTE ERROR]', error);
    return NextResponse.json({ error: 'Failed to resolve PRD routing' }, { status: 500 });
  }
}
