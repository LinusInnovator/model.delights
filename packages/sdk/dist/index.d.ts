export interface RouteResponse {
    intent: string;
    recommended_model: string;
    fallback_array: string[];
    metadata: {
        name: string;
        elo: number;
        context_length: number;
    };
}
export interface ResolveResponse {
    query: string;
    exact_id: string;
    safe_fallback: string[];
    confidence: number;
    resolved_name: string;
}
export declare class IntelligenceRouter {
    private apiKey;
    private baseUrl;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
    });
    private fetchApi;
    /**
     * Get the absolute best mathematically-verified model for a specific cognitive intent.
     * @param intent e.g., "coding", "drafting", "vision"
     */
    getTopModel(intent?: string): Promise<RouteResponse>;
    /**
     * Convert a messy human string into a bulletproof API gateway string with fallbacks.
     * @param q e.g., "claude opus" -> "anthropic/claude-3-opus:beta"
     */
    resolve(q: string): Promise<ResolveResponse>;
}
//# sourceMappingURL=index.d.ts.map