import { NextResponse } from 'next/server';
import data from '@/lib/blueprints_db.json';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const intent = searchParams.get('intent');

    try {
        if (!data || !data.intents) {
            return NextResponse.json({ error: 'Blueprints database corruption detected.' }, { status: 503 });
        }

        if (!intent) {
            // Return catalog of available intents
            return NextResponse.json({
                message: "Welcome to the Blueprint Architect API. Provide an ?intent= query parameter.",
                available_intents: Object.keys(data.intents),
                last_updated: data.last_updated
            });
        }

        const keysParam = searchParams.get('keys');
        const availableKeys = keysParam ? keysParam.toLowerCase().split(',') : ['openrouter', 'fal', 'aws', 'cartesia'];
        const isOpenRouterOnly = availableKeys.length === 1 && availableKeys[0] === 'openrouter';

        const blueprint = (data.intents as Record<string, any>)[intent.toLowerCase()];

        if (!blueprint) {
            return NextResponse.json({
                error: 'Intent not matched. Available intents are listed in the catalog.',
                available_intents: Object.keys(data.intents)
            }, { status: 404 });
        }

        // Dynamic Provider Constraints Logging
        console.log(`[Architect API] Requested ${intent} with keys: ${availableKeys.join(',')}`);

        let targetStack = blueprint.stack;

        if (isOpenRouterOnly) {
            if (blueprint.stack_openrouter_only) {
                targetStack = blueprint.stack_openrouter_only;
            } else {
                return NextResponse.json({
                    error: `Constraint Failed. The blueprint '${blueprint.name}' requires modalities (like image or video generation) that are not fully available via OpenRouter alone.`,
                    required_keys: ['openrouter', 'fal'],
                    message: "Please add a FAL_KEY or equivalent to bypass this constraint."
                }, { status: 400 });
            }
        }

        return NextResponse.json({
            intent: intent,
            name: blueprint.name,
            constraint_mode: isOpenRouterOnly ? "openrouter_only" : "unrestrained",
            stack: targetStack,
            estimated_cost_per_interaction: blueprint.estimated_cost_per_interaction,
            bleeding_edge_wildcard: blueprint.bleeding_edge_wildcard,
            last_updated: data.last_updated
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
