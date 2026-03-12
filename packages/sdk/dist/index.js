import { z } from 'zod';
const RouteQuerySchema = z.object({
    intent: z.string().optional()
});
const ResolveQuerySchema = z.object({
    q: z.string()
});
export class IntelligenceRouter {
    apiKey;
    baseUrl;
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
    /**
     * Get the absolute best mathematically-verified model for a specific cognitive intent.
     * @param intent e.g., "coding", "drafting", "vision"
     */
    async getTopModel(intent = "all") {
        return this.fetchApi("/api/v1/route", { intent });
    }
    /**
     * Convert a messy human string into a bulletproof API gateway string with fallbacks.
     * @param q e.g., "claude opus" -> "anthropic/claude-3-opus:beta"
     */
    async resolve(q) {
        return this.fetchApi("/api/v1/resolve", { q });
    }
}
//# sourceMappingURL=index.js.map