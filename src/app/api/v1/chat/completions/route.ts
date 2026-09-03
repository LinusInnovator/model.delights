import { NextResponse } from 'next/server';
import { getOptimalRoute, RoutingPolicy } from '@/lib/routingEngine';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-snell-policy, x-snell-intent, x-title, http-referer',
        },
    });
}

export async function POST(request: Request) {
    // 1. Dual Authentication: INTERNAL_GOD_KEY vs Supabase sk_snell_...
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({
            error: {
                message: 'Unauthorized. Missing Bearer token. Please provide your Snell API key (e.g. sk_snell_...) or INTERNAL_GOD_KEY.',
                type: 'invalid_request_error',
                code: 'unauthorized'
            }
        }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const internalGodKey = process.env.INTERNAL_GOD_KEY;
    let isAuthorized = false;

    if (internalGodKey && token === internalGodKey) {
        isAuthorized = true;
    } else if (token.startsWith('sk_snell_')) {
        if (supabase) {
            const { data, error } = await supabase
                .from('snell_api_keys')
                .select('id, user_id, tier, status')
                .eq('api_key', token)
                .maybeSingle();

            if (data && !error && data.status !== 'revoked') {
                isAuthorized = true;
            }
        }
    }

    if (!isAuthorized) {
        return NextResponse.json({
            error: {
                message: 'Unauthorized. Invalid or revoked Snell API Key. Claim a free key at https://model.delights.pro/enterprise/dashboard',
                type: 'invalid_request_error',
                code: 'invalid_api_key'
            }
        }, { status: 401 });
    }

    // 2. Parse OpenAI-compatible request payload
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({
            error: {
                message: 'Invalid JSON request body.',
                type: 'invalid_request_error',
                code: 'bad_request'
            }
        }, { status: 400 });
    }

    const requestedModel = body.model || 'snell/auto';
    const isStreaming = Boolean(body.stream);
    const messages = body.messages || [];

    // Calculate prompt tokens heuristic for routing context window fit
    const totalChars = JSON.stringify(messages).length;
    const estimatedInputTokens = Math.max(1, Math.round(totalChars / 4));

    // 3. Resolve Model via Snell Dynamic Routing or Direct Pass-through
    let targetModel = requestedModel;
    let fallbackCascade: string[] = [];
    let policy: RoutingPolicy = 'balanced';
    let routedBySnell = false;

    if (requestedModel.startsWith('snell/') || requestedModel === 'auto') {
        routedBySnell = true;
        const sub = requestedModel.replace(/^snell\//, '').toLowerCase();
        if (sub === 'economy' || sub === 'savings') {
            policy = 'max_savings';
        } else if (sub === 'intelligence' || sub === 'quality' || sub === 'pro') {
            policy = 'max_quality';
        } else {
            policy = 'balanced';
        }

        // Custom override via header if client desires
        const customPolicyHeader = request.headers.get('x-snell-policy');
        if (customPolicyHeader && ['balanced', 'max_savings', 'max_quality', 'low_latency'].includes(customPolicyHeader)) {
            policy = customPolicyHeader as RoutingPolicy;
        }

        try {
            const optimalRoute = await getOptimalRoute({
                intent: 'all',
                estimatedInputTokens,
                policy
            });

            if (optimalRoute) {
                if (policy === 'max_savings' && optimalRoute.smart_value) {
                    targetModel = optimalRoute.smart_value.model;
                } else {
                    targetModel = optimalRoute.flagship.model;
                }
                fallbackCascade = optimalRoute.fallback_array || [];
            } else {
                targetModel = 'deepseek/deepseek-chat';
                fallbackCascade = ['google/gemini-2.5-flash', 'openai/gpt-4o-mini'];
            }
        } catch {
            targetModel = 'deepseek/deepseek-chat';
            fallbackCascade = ['google/gemini-2.5-flash', 'openai/gpt-4o-mini'];
        }
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
        return NextResponse.json({
            error: {
                message: 'Snell upstream provider configuration error. OPENROUTER_API_KEY is not configured.',
                type: 'server_error',
                code: 'upstream_misconfigured'
            }
        }, { status: 500 });
    }

    // 4. Upstream Execution with Failover Cascade
    const modelsToAttempt = [targetModel, ...fallbackCascade.filter(m => m !== targetModel)];
    let lastError: any = null;

    for (let i = 0; i < Math.min(modelsToAttempt.length, 3); i++) {
        const attemptModel = modelsToAttempt[i];
        const upstreamPayload = {
            ...body,
            model: attemptModel
        };

        try {
            const upstreamResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterApiKey}`,
                    'HTTP-Referer': 'https://model.delights.pro',
                    'X-Title': 'model.delights',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(upstreamPayload)
            });

            // If success (200)
            if (upstreamResponse.ok) {
                const responseHeaders = new Headers();
                responseHeaders.set('Access-Control-Allow-Origin', '*');
                responseHeaders.set('x-snell-routed-to', attemptModel);
                responseHeaders.set('x-snell-requested-model', requestedModel);
                responseHeaders.set('x-snell-attempt', String(i + 1));
                if (routedBySnell) {
                    responseHeaders.set('x-snell-policy', policy);
                }

                // A. Streaming Mode: Return raw SSE pipeline
                if (isStreaming) {
                    responseHeaders.set('Content-Type', 'text/event-stream');
                    responseHeaders.set('Cache-Control', 'no-cache');
                    responseHeaders.set('Connection', 'keep-alive');

                    return new Response(upstreamResponse.body, {
                        status: 200,
                        headers: responseHeaders
                    });
                }

                // B. Non-Streaming Mode: Return JSON
                const responseData = await upstreamResponse.json();
                if (requestedModel.startsWith('snell/')) {
                    responseData.model = requestedModel;
                }
                
                responseHeaders.set('Content-Type', 'application/json');
                return new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: responseHeaders
                });
            }

            // Upstream returned an error (rate limit, outage, model unavailable)
            const errData = await upstreamResponse.json().catch(() => ({}));
            lastError = errData;
            console.warn(`[Snell Router] Model ${attemptModel} returned ${upstreamResponse.status}. Attempting next fallback...`, errData);

        } catch (err: any) {
            lastError = { message: err.message };
            console.warn(`[Snell Router] Network error calling ${attemptModel}:`, err);
        }
    }

    // All attempts failed
    return NextResponse.json({
        error: {
            message: `All routed providers failed to respond. Last error: ${lastError?.error?.message || lastError?.message || 'Upstream provider unavailable'}`,
            type: 'upstream_error',
            code: 'service_unavailable'
        }
    }, { status: 502 });
}
