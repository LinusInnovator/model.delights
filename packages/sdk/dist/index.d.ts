import { z } from 'zod';
export declare const RouteQuerySchema: z.ZodObject<{
    intent: z.ZodOptional<z.ZodString>;
    estimatedInputTokens: z.ZodOptional<z.ZodNumber>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    policy: z.ZodOptional<z.ZodEnum<["max_quality", "balanced", "max_savings", "low_latency", "high_reliability"]>>;
}, "strip", z.ZodTypeAny, {
    intent?: string | undefined;
    estimatedInputTokens?: number | undefined;
    capabilities?: string[] | undefined;
    policy?: "max_quality" | "balanced" | "max_savings" | "low_latency" | "high_reliability" | undefined;
}, {
    intent?: string | undefined;
    estimatedInputTokens?: number | undefined;
    capabilities?: string[] | undefined;
    policy?: "max_quality" | "balanced" | "max_savings" | "low_latency" | "high_reliability" | undefined;
}>;
export declare const ResolveQuerySchema: z.ZodObject<{
    q: z.ZodString;
}, "strip", z.ZodTypeAny, {
    q: string;
}, {
    q: string;
}>;
export interface RouteObj {
    model: string;
    elo: number | null;
    cost_per_1m: number;
    name: string;
    financial_tradeoff?: string;
    context_length?: number;
}
export interface RouteResponse {
    intent: string;
    flagship: RouteObj;
    smart_value?: RouteObj;
    fallback_array: string[];
}
export interface ResolveResponse {
    query: string;
    exact_id: string;
    safe_fallback: string[];
    confidence: number;
    resolved_name: string;
}
export type RoutingPolicy = 'max_quality' | 'balanced' | 'max_savings' | 'low_latency' | 'high_reliability';
export interface RouteConfig {
    intent?: string;
    estimatedInputTokens?: number;
    capabilities?: string[];
    policy?: RoutingPolicy;
}
export declare class IntelligenceRouter {
    private apiKey;
    private baseUrl;
    private _routeCache;
    private _resolveCache;
    private readonly CACHE_TTL_MS;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
    });
    private fetchApi;
    private getOfflineManifest;
    /**
     * Get the absolute best mathematically-verified model for a specific cognitive intent.
     * Utilizes local RAM caching to achieve absolute 0ms resolution times.
     * @param configOrIntent A configuration object with policy/capabilities, or a legacy intent string
     * @param legacyEstimatedTokens Optional fallback context window if using legacy string parameter
     */
    getTopModel(configOrIntent?: string | RouteConfig, legacyEstimatedTokens?: number): Promise<RouteResponse>;
    /**
     * Convert a messy human string into a bulletproof API gateway string with fallbacks.
     * Utilizes local RAM caching to achieve absolute 0ms resolution times.
     * @param q e.g., "claude opus" -> "anthropic/claude-3-opus:beta"
     */
    resolve(q: string): Promise<ResolveResponse>;
}
//# sourceMappingURL=index.d.ts.map