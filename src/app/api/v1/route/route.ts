import { NextResponse } from 'next/server';
import { getOptimalRoute } from '@/lib/routingEngine';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ 
            error: "Unauthorized. Please provide your Snell API Key via Authorization: Bearer sk_snell_... (get a free key at https://model.delights.pro/enterprise/dashboard)." 
        }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const internalGodKey = process.env.INTERNAL_GOD_KEY;

    let isAuthorized = false;

    // 1. Internal System Bypass
    if (internalGodKey && token === internalGodKey) {
        isAuthorized = true;
    } 
    // 2. User API Key Validation
    else if (token.startsWith("sk_snell_")) {
        if (supabase) {
            const { data, error } = await supabase
                .from('snell_api_keys')
                .select('id, user_id')
                .eq('api_key', token)
                .maybeSingle();

            if (data && !error) {
                isAuthorized = true;
            }
        }
    }

    if (!isAuthorized) {
        return NextResponse.json({ 
            error: "Unauthorized. Invalid or revoked Snell API Key. Visit https://model.delights.pro/enterprise/dashboard to manage your keys." 
        }, { status: 401 });
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
