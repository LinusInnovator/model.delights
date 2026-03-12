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

        const flagship = models[0];
        const flagshipCost1M = flagship.pricing_per_1m.prompt + flagship.pricing_per_1m.completion;

        // --- Calculate Smart Value ---
        // 1. Find all models within 100 ELO points of the Flagship
        const highCapabilitySubset = models.filter(m =>
            m.id !== flagship.id &&
            m.elo !== null &&
            flagship.elo !== null &&
            ((flagship.elo as number) - (m.elo as number)) <= 100
        );

        // 2. Sort that subset by absolute lowest price
        highCapabilitySubset.sort((a, b) => {
            const costA = a.pricing_per_1m.prompt + a.pricing_per_1m.completion;
            const costB = b.pricing_per_1m.prompt + b.pricing_per_1m.completion;
            return costA - costB;
        });

        let smartValue = null;
        let financialTradeoff = "No cheaper alternatives found within 100 ELO points.";

        if (highCapabilitySubset.length > 0) {
            const potentialValue = highCapabilitySubset[0];
            const valueCost1M = potentialValue.pricing_per_1m.prompt + potentialValue.pricing_per_1m.completion;

            // Only assign as "Smart Value" if it is actually cheaper than the flagship
            if (valueCost1M < flagshipCost1M) {
                smartValue = potentialValue;
                
                // Calculate tradeoff metrics for the payload
                const costMultiplier = (flagshipCost1M / (valueCost1M || 0.0001)).toFixed(1);
                const eloDrop = (((flagship.elo as number) - (smartValue.elo as number)) / (flagship.elo as number) * 100).toFixed(1);
                financialTradeoff = `${costMultiplier}x cheaper for -${eloDrop}% intelligence drop`;
            }
        }

        // --- Calculate Safety Fallback Array (Widen to 100 points) ---
        const closestPeers = data.models.filter(m =>
            m.id !== flagship.id &&
            m.elo !== null &&
            flagship.elo !== null &&
            m.context_length >= flagship.context_length &&
            Math.abs(m.elo - (flagship.elo as number)) <= 100 // Widened from 30 to 100 to support anomalies like Opus 4.6
        ).sort((a, b) => Math.abs((a.elo as number) - (flagship.elo as number)) - Math.abs((b.elo as number) - (flagship.elo as number)));

        const fallback_array = [flagship.id];
        if (smartValue) fallback_array.push(smartValue.id); // The smart value is always a fantastic fallback
        if (closestPeers.length > 0 && !fallback_array.includes(closestPeers[0].id)) {
            fallback_array.push(closestPeers[0].id);
        }

        // --- Construct Bifurcated Payload ---
        return NextResponse.json({
            intent: intent,
            flagship: {
                model: flagship.id,
                elo: flagship.elo,
                cost_per_1m: flagshipCost1M,
                name: flagship.name,
                context_length: flagship.context_length
            },
            ...(smartValue && {
                smart_value: {
                    model: smartValue.id,
                    elo: smartValue.elo,
                    cost_per_1m: (smartValue.pricing_per_1m.prompt + smartValue.pricing_per_1m.completion),
                    name: smartValue.name,
                    financial_tradeoff: financialTradeoff,
                    context_length: smartValue.context_length
                }
            }),
            fallback_array: fallback_array
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
