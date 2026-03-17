import { z } from 'zod';
export const RouteQuerySchema = z.object({
    intent: z.string().optional(),
    estimatedInputTokens: z.number().optional(),
    capabilities: z.array(z.string()).optional(),
    policy: z.enum(['max_quality', 'balanced', 'max_savings', 'low_latency', 'high_reliability']).optional()
});
export const ResolveQuerySchema = z.object({
    q: z.string()
});
export class IntelligenceRouter {
    apiKey;
    baseUrl;
    // Local RAM Caches to eliminate the double-hop latency tax
    _routeCache = new Map();
    _resolveCache = new Map();
    CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
    constructor(config) {
        if (!config.apiKey) {
            throw new Error("IntelligenceRouter requires an apiKey (e.g., INTERNAL_GOD_KEY)");
        }
        this.apiKey = config.apiKey;
        // Default to the production URL, allow overriding for local dev
        this.baseUrl = config.baseUrl || "https://model.delights.pro";
    }
    async fetchApi(endpoint, params) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.append(key, params[key]);
            }
        });
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`IntelligenceRouter API Error [${response.status}]: ${errorData.error || response.statusText}`);
        }
        return response.json();
    }
    getOfflineManifest(intent, estimatedInputTokens) {
        const intentLower = intent.toLowerCase();
        // Default high-context fallback models
        const flagshipContext = 200000;
        const smartValueContext = 1000000;
        const fallback = {
            intent: intent,
            flagship: {
                model: "anthropic/claude-3.5-sonnet",
                elo: 1250,
                cost_per_1m: 15.0,
                name: "Claude 3.5 Sonnet (Offline Fallback)",
                context_length: flagshipContext
            },
            smart_value: {
                model: "google/gemini-flash-1.5-8b",
                elo: 1150,
                cost_per_1m: 0.15,
                name: "Gemini 1.5 Flash 8B (Offline Fallback)",
                financial_tradeoff: "Emergency Fallback: High Speed Draft Mode",
                context_length: smartValueContext
            },
            fallback_array: ["anthropic/claude-3.5-sonnet", "google/gemini-flash-1.5-8b", "openai/gpt-4o-mini"]
        };
        // Remove smart_value if payload is absurdly huge for it, which is rare for 1M tokens but mathematically correct
        if (estimatedInputTokens && estimatedInputTokens > smartValueContext) {
            delete fallback.smart_value;
        }
        if (intentLower.includes('cod') || intentLower.includes('logic')) {
            // Llama 3.1 8B only supports 128k context, failsafe if payload is larger
            if (!estimatedInputTokens || estimatedInputTokens <= 128000) {
                fallback.smart_value.model = "meta-llama/llama-3.1-8b-instruct";
                fallback.smart_value.name = "Llama 3.1 8B Instruct (Offline Fallback)";
            }
        }
        else if (intentLower.includes('vision') || intentLower.includes('image')) {
            fallback.flagship.model = "openai/gpt-4o";
            fallback.flagship.name = "GPT-4o (Offline Fallback)";
            fallback.smart_value.model = "openai/gpt-4o-mini";
            fallback.smart_value.name = "GPT-4o Mini (Offline Fallback)";
        }
        return fallback;
    }
    /**
     * Get the absolute best mathematically-verified model for a specific cognitive intent.
     * Utilizes local RAM caching to achieve absolute 0ms resolution times.
     * @param configOrIntent A configuration object with policy/capabilities, or a legacy intent string
     * @param legacyEstimatedTokens Optional fallback context window if using legacy string parameter
     */
    async getTopModel(configOrIntent = "all", legacyEstimatedTokens) {
        let config;
        if (typeof configOrIntent === 'string') {
            config = { intent: configOrIntent };
            if (legacyEstimatedTokens !== undefined) {
                config.estimatedInputTokens = legacyEstimatedTokens;
            }
        }
        else {
            config = configOrIntent;
        }
        const { intent = 'all', estimatedInputTokens, capabilities = [], policy = 'balanced' } = config;
        const now = Date.now();
        // Construct robust cache key including new policy parameters
        const cacheKey = [
            intent.toLowerCase(),
            estimatedInputTokens?.toString() || '',
            capabilities.join(','),
            policy
        ].join('_');
        const cached = this._routeCache.get(cacheKey);
        // 1. Check local in-memory TTL cache (0ms latency target)
        if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
            return cached.data;
        }
        // 2. Fetch fresh data from API Gateway
        try {
            const params = { intent, policy };
            if (estimatedInputTokens) {
                params.tokens = estimatedInputTokens.toString();
            }
            if (capabilities.length > 0) {
                params.capabilities = capabilities.join(',');
            }
            const data = await this.fetchApi("/api/v1/route", params);
            if (data) {
                this._routeCache.set(cacheKey, { data, timestamp: now });
                return data;
            }
        }
        catch (e) {
            console.warn(`[IntelligenceRouter] Failed to fetch fresh route for "${intent}". Using offline manifest.`, e);
        }
        // 3. Fail gracefully via compiled Offline Manifest if network is down
        const fallback = this.getOfflineManifest(intent, estimatedInputTokens);
        // Only temporarily cache the fallback for a short burst (60 seconds) so we try to recover network soon
        this._routeCache.set(cacheKey, { data: fallback, timestamp: now - this.CACHE_TTL_MS + 60000 });
        return fallback;
    }
    /**
     * Convert a messy human string into a bulletproof API gateway string with fallbacks.
     * Utilizes local RAM caching to achieve absolute 0ms resolution times.
     * @param q e.g., "claude opus" -> "anthropic/claude-3-opus:beta"
     */
    async resolve(q) {
        const now = Date.now();
        const cacheKey = q.toLowerCase().trim();
        const cached = this._resolveCache.get(cacheKey);
        if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
            return cached.data;
        }
        const data = await this.fetchApi("/api/v1/resolve", { q });
        if (data) {
            this._resolveCache.set(cacheKey, { data, timestamp: now });
        }
        return data;
    }
}
//# sourceMappingURL=index.js.map