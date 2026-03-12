import { NextResponse } from 'next/server';
import { fetchModels } from '@/lib/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const intent = searchParams.get('intent') || 'all';

    try {
        const data = await fetchModels();
        let models = data.models;

        // Filter by Use Case / Intent
        if (intent.toLowerCase() !== 'all') {
            const mappedIntent = mapIntent(intent).toLowerCase();
            console.log("[DEBUG API] Client requested:", intent, "Mapped to:", mappedIntent);
            
            if (mappedIntent !== 'all models') {
                models = models.filter(m => {
                    const hasIntent = m.use_cases && m.use_cases.some(uc => uc.toLowerCase() === mappedIntent);
                    if (m.id.includes('claude-3-5-sonnet')) console.log(`[DEBUG API] Checking Claude Sonnet Use Cases:`, m.use_cases, "Has Intent?", hasIntent);
                    return hasIntent;
                });
            }
        }

        if (models.length === 0) {
            return NextResponse.json({ error: 'No models found for the given intent' }, { status: 404 });
        }

        // Always sort by pure intelligence (Pure ELO) descending
        models.sort((a, b) => (b.elo || 0) - (a.elo || 0));

        const topModel = models[0];

        // Find safe fallback array (closest peers)
        const targetPrice = topModel.pricing_per_1m.prompt + topModel.pricing_per_1m.completion;
        const closestPeers = data.models.filter(m =>
            m.id !== topModel.id &&
            m.elo !== null &&
            m.context_length >= topModel.context_length &&
            Math.abs(m.elo - (topModel.elo as number)) <= 30 &&
            (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) <= (targetPrice * 1.50)
        ).sort((a, b) => Math.abs((a.elo as number) - (topModel.elo as number)) - Math.abs((b.elo as number) - (topModel.elo as number)));

        const fallback_array = [topModel.id];
        if (closestPeers.length > 0) fallback_array.push(closestPeers[0].id);

        return NextResponse.json({
            intent: intent,
            recommended_model: topModel.id,
            fallback_array: fallback_array,
            metadata: {
                name: topModel.name,
                elo: topModel.elo,
                context_length: topModel.context_length
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to route intent' }, { status: 500 });
    }
}

function mapIntent(intent: string): string {
    const i = intent.toLowerCase();
    
    // Original Intents
    if (i.includes('cod') || i.includes('logic') || i.includes('math')) return 'Coding & Logic';
    if (i.includes('fiction') || i.includes('story') || i.includes('complex')) return 'Fictional';
    if (i.includes('draft') || i.includes('fast') || i.includes('cheap')) return 'Drafting';
    if (i.includes('roleplay') || i.includes('uncensor')) return 'Roleplay';
    if (i.includes('vision') || i.includes('image')) return 'Vision';
    if (i.includes('top') || i.includes('flagship')) return 'Top Tier';
    
    // Phase 62 Expansion
    if (i.includes('reason') || i.includes('think') || i.includes('boardroom') || i.includes('plan')) return 'Reasoning';
    if (i.includes('classif') || i.includes('tag') || i.includes('sort') || i.includes('filter')) return 'Classification';
    if (i.includes('chat') || i.includes('conversation') || i.includes('support')) return 'Conversational';
    if (i.includes('agent') || i.includes('tool') || i.includes('strict') || i.includes('json') || i.includes('extract')) return 'Agentic';
    
    // Catch-all fail safe
    return 'All Models';
}
