import { NextResponse } from 'next/server';
import { fetchModels } from '@/lib/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter q is required (e.g. ?q=claude opus)' }, { status: 400 });
    }

    try {
        const data = await fetchModels();
        const models = data.models;

        const qSplit = query.toLowerCase().split(/\s+/);

        // Score each model exactly against the hallucinated human query
        const scoredModels = models.map(m => {
            let score = 0;
            const searchString = `${m.id} ${m.name || ''} ${m.description || ''}`.toLowerCase();

            qSplit.forEach(term => {
                if (searchString.includes(term)) {
                    score += 10;
                    // Exact ID substring match gets massive bonus
                    if (m.id.toLowerCase().includes(term)) {
                        score += 20;
                    }
                }
            });

            return { ...m, matchScore: score };
        });

        // Filter out zero scores and sort by match score, then by pure ELO as a tie-breaker
        const results = scoredModels
            .filter(m => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore || (b.elo || 0) - (a.elo || 0));

        if (results.length === 0) {
            return NextResponse.json({ error: 'Could not resolve query to any known model' }, { status: 404 });
        }

        const bestMatch = results[0];

        // Find a highly capable safe fallback (context match, ELO match) just like the main directory
        const closestPeers = data.models.filter(m =>
            m.id !== bestMatch.id &&
            m.elo !== null &&
            m.context_length >= bestMatch.context_length &&
            Math.abs(m.elo - (bestMatch.elo as number)) <= 40
        ).sort((a, b) => Math.abs((a.elo as number) - (bestMatch.elo as number)) - Math.abs((b.elo as number) - (bestMatch.elo as number)));

        const safe_fallback = [bestMatch.id];
        if (closestPeers.length > 0) safe_fallback.push(closestPeers[0].id);

        return NextResponse.json({
            query: query,
            exact_id: bestMatch.id,
            safe_fallback: safe_fallback,
            confidence: bestMatch.matchScore,
            resolved_name: bestMatch.name
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to resolve model query' }, { status: 500 });
    }
}
