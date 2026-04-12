import { NextRequest, NextResponse } from "next/server";
import { getOptimalRoute, RouteConfig } from "@/lib/routingEngine";
import { z } from "zod";
import { Redis } from '@upstash/redis';

export const maxDuration = 30; // 30s limit for Vercel Hobby

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const simulateSchema = z.object({
    intent: z.string().trim().max(100, "Intent is too long, max 100 characters").default('all'),
    estimatedInputTokens: z.number().min(0, "Tokens cannot be negative").max(3000000, "Exceeds max supported tokens").default(0),
    capabilities: z.array(z.string().max(20)).max(10).default([]),
    policy: z.enum(['max_quality', 'balanced', 'max_savings', 'low_latency', 'high_reliability']).default('balanced'),
    cached_payload: z.boolean().default(false)
});

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        let shouldRateLimit = false;

        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });
                
                const pipeline = redis.pipeline();
                pipeline.incr(`rate_limit_simulate_${ip}`);
                pipeline.expire(`rate_limit_simulate_${ip}`, 60, "NX");
                
                const results = await pipeline.exec();
                if ((results[0] as number) > 20) {
                    shouldRateLimit = true;
                }
            } catch (error) {
                console.warn("Redis fallback triggered in simulate-route.");
            }
        }

        if (!shouldRateLimit && (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
            const now = Date.now();
            const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
            if (now - rateData.timestamp > 60000) {
                rateData.count = 0;
                rateData.timestamp = now;
            }
            if (rateData.count >= 20) {
                shouldRateLimit = true;
            } else {
                rateData.count++;
                rateLimitMap.set(ip, rateData);
            }
        }

        if (shouldRateLimit) {
             return NextResponse.json({ error: "Too many route simulations. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        
        const parseResult = simulateSchema.safeParse(body);
        if (!parseResult.success) {
             return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 });
        }
        
        // Map frontend JSON into RouteConfig for the engine
        const config: RouteConfig = parseResult.data as RouteConfig;

        const result = await getOptimalRoute(config);

        if (!result) {
            return NextResponse.json({ error: "No suitable models found for these constraints." }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (e: unknown) {
        console.error("simulate-route API Error:", e);
        return NextResponse.json({ error: (e as Error).message || "Internal Engine Error" }, { status: 500 });
    }
}
