import { NextResponse } from 'next/server';
import { getOptimalRoute } from '@/lib/routingEngine';

export async function GET(request: Request) {
    const expectedKey = process.env.INTERNAL_GOD_KEY;
    if (!expectedKey) {
        return NextResponse.json({ error: "Server Configuration Error: INTERNAL_GOD_KEY not set" }, { status: 500 });
    }
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
        return NextResponse.json({ error: "Unauthorized. Invalid or missing SDK God Key." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const intent = searchParams.get('intent') || 'all';
    const tokensParam = searchParams.get('tokens');
    const estimatedInputTokens = tokensParam ? parseInt(tokensParam, 10) : undefined;
    const capabilitiesParam = searchParams.get('capabilities');
    const capabilities = capabilitiesParam ? capabilitiesParam.split(',') : undefined;
    const policy = (searchParams.get('policy') as any) || 'balanced';

    try {
        const payload = await getOptimalRoute({ 
            intent, 
            estimatedInputTokens, 
            capabilities,
            policy 
        });

        if (!payload) {
            return NextResponse.json({ error: 'No models found for the given intent' }, { status: 404 });
        }

        return NextResponse.json(payload);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to route intent' }, { status: 500 });
    }
}
