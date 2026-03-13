import { z } from 'zod';

export const RouteQuerySchema = z.object({
  intent: z.string().optional()
});

export const ResolveQuerySchema = z.object({
  q: z.string()
});

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

export class IntelligenceRouter {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    if (!config.apiKey) {
      throw new Error("IntelligenceRouter requires an apiKey (e.g., INTERNAL_GOD_KEY)");
    }
    this.apiKey = config.apiKey;
    // Default to the production URL, allow overriding for local dev
    this.baseUrl = config.baseUrl || "https://model.delights.pro";
  }

  private async fetchApi<T>(endpoint: string, params: Record<string, string>): Promise<T> {
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

    return response.json() as Promise<T>;
  }

  /**
   * Get the absolute best mathematically-verified model for a specific cognitive intent.
   * @param intent e.g., "coding", "drafting", "vision"
   */
  async getTopModel(intent: string = "all"): Promise<RouteResponse> {
    return this.fetchApi<RouteResponse>("/api/v1/route", { intent });
  }

  /**
   * Convert a messy human string into a bulletproof API gateway string with fallbacks.
   * @param q e.g., "claude opus" -> "anthropic/claude-3-opus:beta"
   */
  async resolve(q: string): Promise<ResolveResponse> {
    return this.fetchApi<ResolveResponse>("/api/v1/resolve", { q });
  }
}
