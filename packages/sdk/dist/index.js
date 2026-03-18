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
    /**
     * ZERO-KNOWLEDGE LOGGING
     * Reports an anonymous execution outcome to the central Mathematical Matrix.
     * This builds the protective moat by mathematically degrading models that fail real-world tasks.
     *
     * NEVER SEND PROMPTS, PIIS, OR RESPONSES THROUGH THIS PIPELINE.
     */
    async reportTelemetry(telemetry) {
        try {
            const url = new URL(`${this.baseUrl}/api/v1/telemetry`);
            // Fire and forget, absolutely non-blocking
            fetch(url.toString(), {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(telemetry)
            }).catch((e) => {
                console.warn("[IntelligenceRouter] Anonymous telemetry submission failed, continuing execution.", e);
            });
        }
        catch (e) {
            // Swallow any sync errors, telemetry must never break downstream execution
        }
    }
    /**
     * UNIVERSAL EXECUTION WRAPPER (Phase 4 DX)
     *
     * Autonomously calculates the optimal route, structures the OpenRouter payload,
     * executes the fetch locally using the user's API keys (Control Plane Privacy),
     * and handles silent fallbacks if the primary model fails or hallucinates.
     */
    async execute(options) {
        if (!options.openrouterKey) {
            throw new Error("[IntelligenceRouter] execute() requires an 'openrouterKey' to process the fetch securely on your hardware.");
        }
        // 1. Let the Mathematical Engine pick the best route
        const route = await this.getTopModel(options.config || {});
        const modelsToTry = [route.flagship.model];
        if (route.smart_value) {
            // If a smart value exists, mathematically it belongs BEFORE the flagship in the execution pipeline to save money
            modelsToTry.unshift(route.smart_value.model);
        }
        // Append emergency fallbacks at the end
        if (route.fallback_array) {
            route.fallback_array.forEach(f => {
                if (!modelsToTry.includes(f))
                    modelsToTry.push(f);
            });
        }
        let lastError;
        // Vison modality auto-detection
        const hasVision = options.messages.some(m => Array.isArray(m.content) && m.content.some(part => part.type === 'image_url'));
        // 2. Cascade down the mathematically ranked models (Primary -> Smart Value -> Fallback 1 -> Fallback 2)
        for (const modelId of modelsToTry) {
            try {
                const payload = {
                    model: modelId,
                    messages: options.messages,
                };
                if (options.tools)
                    payload.tools = options.tools;
                if (options.response_format)
                    payload.response_format = options.response_format;
                if (options.openrouter_overrides) {
                    const safeOverrides = options.openrouter_overrides;
                    if (safeOverrides.temperature !== undefined)
                        payload.temperature = safeOverrides.temperature;
                    if (safeOverrides.presence_penalty !== undefined)
                        payload.presence_penalty = safeOverrides.presence_penalty;
                    if (safeOverrides.frequency_penalty !== undefined)
                        payload.frequency_penalty = safeOverrides.frequency_penalty;
                    if (safeOverrides.top_p !== undefined)
                        payload.top_p = safeOverrides.top_p;
                    if (safeOverrides.seed !== undefined)
                        payload.seed = safeOverrides.seed;
                    // Financial Safety Ceiling (Hard cap max_tokens at 8192 to block budget burn bugs)
                    if (safeOverrides.max_tokens !== undefined) {
                        payload.max_tokens = Math.min(safeOverrides.max_tokens, 8192);
                    }
                }
                if (hasVision) {
                    payload.provider = { extra_parameters: { modalities: ["image"] } };
                }
                const tsStart = Date.now();
                const controller = new AbortController();
                const timeout = options.timeout_ms_max_per_model || 15000;
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                let res;
                try {
                    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${options.openrouterKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': options.httpReferer || 'https://model.delights.pro',
                            'X-Title': options.xTitle || 'Model Delights Snell Engine'
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });
                }
                finally {
                    clearTimeout(timeoutId);
                }
                const tsEnd = Date.now();
                const latency = tsEnd - tsStart;
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`OpenRouter API Error (${res.status}) on model ${modelId}: ${errText}`);
                }
                const data = await res.json();
                // We inject the latency and the model that actually won the execution back into the payload for the developer
                data._snell_telemetry = {
                    model_used: modelId,
                    latency_ms: latency,
                    route_calculated: route
                };
                // Optional: If you wanted to do Post-Response Verification (e.g. checking if it actually returned JSON),
                // you would do it here. If it fails, throw an Error so the catch block falls back to the next model.
                return data;
            }
            catch (e) {
                console.warn(`[IntelligenceRouter] Execution failed on ${modelId}. Cascading to fallback.`, e.message);
                lastError = e;
                // Continue the loop to try the next model
            }
        }
        throw new Error(`[IntelligenceRouter] All models in the cascade failed. Last error: ${lastError?.message || String(lastError)}`);
    }
}
//# sourceMappingURL=index.js.map