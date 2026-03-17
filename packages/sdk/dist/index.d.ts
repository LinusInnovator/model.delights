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
    cached_payload?: boolean;
}
export type TelemetryOutcome = 'success' | 'failed_schema' | 'failed_timeout' | 'failed_hallucination' | 'failed_context_limit' | 'user_rejected';
export interface TelemetryPayload {
    model: string;
    intent: string;
    outcome: TelemetryOutcome;
    latency_ms?: number;
    ttft_ms?: number;
}
export interface ExecuteOptions {
    /** Standard incoming message array */
    messages: {
        role: string;
        content: string;
    }[];
    /** Provide your raw OpenRouter key here. We DO NOT intercept or log this. */
    openrouterKey: string;
    /** The configuration for the Mathematical Routing Engine */
    config?: RouteConfig;
    /** Standard JSON schema tools */
    tools?: Record<string, unknown>[];
    /** If provided, we will pass this structured output schema to the provider */
    response_format?: {
        type: 'json_object';
    } | Record<string, unknown>;
    /** Optional site URL for OpenRouter rankings */
    httpReferer?: string;
    /** Optional site Name for OpenRouter rankings */
    xTitle?: string;
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
    /**
     * ZERO-KNOWLEDGE LOGGING
     * Reports an anonymous execution outcome to the central Mathematical Matrix.
     * This builds the protective moat by mathematically degrading models that fail real-world tasks.
     *
     * NEVER SEND PROMPTS, PIIS, OR RESPONSES THROUGH THIS PIPELINE.
     */
    reportTelemetry(telemetry: TelemetryPayload): Promise<void>;
    /**
     * UNIVERSAL EXECUTION WRAPPER (Phase 4 DX)
     *
     * Autonomously calculates the optimal route, structures the OpenRouter payload,
     * executes the fetch locally using the user's API keys (Control Plane Privacy),
     * and handles silent fallbacks if the primary model fails or hallucinates.
     */
    execute(options: ExecuteOptions): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=index.d.ts.map