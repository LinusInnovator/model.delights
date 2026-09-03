import { NextResponse } from 'next/server';
import { fetchModels } from '@/lib/api';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 minutes cache

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET() {
    try {
        const { models } = await fetchModels();

        // Virtual Snell Models
        const virtualModels = [
            {
                id: 'snell/auto',
                object: 'model',
                created: 1740000000,
                owned_by: 'snell',
                permission: [],
                root: 'snell/auto',
                parent: null,
                description: 'Snell Intelligent Router: Dynamically routes to the optimal model based on intent, context size, and quality floor.'
            },
            {
                id: 'snell/economy',
                object: 'model',
                created: 1740000000,
                owned_by: 'snell',
                permission: [],
                root: 'snell/economy',
                parent: null,
                description: 'Snell Economy Router: Prioritizes ultra-low cost high-performance models (70-90% savings).'
            },
            {
                id: 'snell/intelligence',
                object: 'model',
                created: 1740000000,
                owned_by: 'snell',
                permission: [],
                root: 'snell/intelligence',
                parent: null,
                description: 'Snell Intelligence Router: Prioritizes top frontier reasoning models (1350+ ELO).'
            }
        ];

        // Map live catalog to OpenAI model objects
        const catalogModels = (models || []).slice(0, 100).map(m => ({
            id: m.id,
            object: 'model',
            created: m.created || 1740000000,
            owned_by: m.gateway || m.id.split('/')[0] || 'openrouter',
            permission: [],
            root: m.id,
            parent: null,
            context_window: m.context_length || 128000,
            elo: m.elo || null,
            pricing: m.pricing_per_1m
        }));

        const responseData = {
            object: 'list',
            data: [...virtualModels, ...catalogModels]
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });

    } catch (err: any) {
        return NextResponse.json({
            error: {
                message: 'Failed to retrieve models catalog.',
                type: 'server_error',
                code: 'internal_error'
            }
        }, { status: 500 });
    }
}
