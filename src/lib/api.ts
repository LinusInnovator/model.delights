import fs from 'fs';
import path from 'path';

export interface ModelHealth {
    status: string;
    ttft?: number;
}

export interface ModelPricing {
    prompt: number;
    completion: number;
}

export interface ModelArchitecture {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
}

export interface Model {
    id: string;
    name: string;
    description: string;
    context_length: number;
    created: number;
    pricing: Record<string, string>;
    pricing_per_1m: ModelPricing;
    health?: ModelHealth;
    architecture?: ModelArchitecture;
    use_cases: string[];
    elo: number | null;
    value_score: number;
}

export interface FetchResult {
    models: Model[];
    last_updated: number;
}

export async function fetchModels(): Promise<FetchResult> {
    try {
        let codingEloMap: Record<string, number> = {};
        try {
            const dataPath = path.join(process.cwd(), 'src/data/coding_elo.json');
            if (fs.existsSync(dataPath)) {
                codingEloMap = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            }
        } catch (e) {
            console.error("Failed to load coding ELO data", e);
        }

        const res = await fetch("https://openrouter.ai/api/v1/models", {
            next: { revalidate: 300 } // Force ISR caching for 5 minutes
        });

        if (!res.ok) {
            throw new Error("Failed to fetch models from OpenRouter");
        }

        const json = await res.json();
        const rawModels: any[] = json.data || [];

        // Calculate heuristic ELO map inline (port from fetch_elo.py)
        const eloMap: Record<string, number> = {};
        rawModels.forEach((m, index) => {
            let proxy_elo = 1100;

            if (index < 10) proxy_elo += 150;
            else if (index < 30) proxy_elo += 80;
            else if (index < 100) proxy_elo += 40;

            const context = m.context_length || 8000;
            if (context > 100000) proxy_elo += 50;
            else if (context > 32000) proxy_elo += 20;

            if (m.id.includes("gpt-4") || m.id.includes("claude-3") || m.id.includes("gemini-1.5")) {
                proxy_elo += 30;
            }
            eloMap[m.id] = Math.round(proxy_elo);
        });

        const models: Model[] = rawModels.map((m) => {
            const use_cases: string[] = [];
            const m_id = (m.id || "").toLowerCase();
            const desc = (m.description || "").toLowerCase();
            const name = (m.name || "").toLowerCase();

            // Coding & Logic
            const codingElo = codingEloMap[m.id];
            if (codingElo || m_id.includes('coder') || m_id.includes('math') || name.includes('coder') || name.includes('math')) {
                use_cases.push('Coding & Logic');
            }

            // Roleplay
            if (desc.includes('roleplay') || desc.includes('uncensored') || m_id.includes('roleplay') || m_id.includes('uncensored')) {
                use_cases.push('Roleplay');
            }

            // Fictional (Complex/larger models)
            if (m_id.includes('claude-3') || m_id.includes('claude-4') || m_id.includes('sonnet') || m_id.includes('gemini-1.5-pro') || m_id.includes('gemini-3') || m_id.includes('opus') || m_id.includes('gpt-4') || m_id.includes('gpt-5') || m_id.includes('wizardlm') || m_id.includes('llama-3.1-70b') || m_id.includes('llama-3.1-405b') || m_id.includes('llama-3-70b')) {
                use_cases.push('Fictional');
            }

            // Drafting (Fast/cheap models)
            if (m_id.includes('flash') || m_id.includes('haiku') || m_id.includes('mini') || m_id.includes('8b') || m_id.includes('llama-3-8b')) {
                use_cases.push('Drafting');
            }

            // Vision
            const arch = m.architecture || {};
            const modalities = arch.modality ? arch.modality.toLowerCase() : "";
            if (desc.includes('vision') || m_id.includes('vision') || modalities.includes('text,image->text')) {
                use_cases.push('Vision');
            }

            // Image Gen
            if (m_id.includes('dall-e') || m_id.includes('flux') || m_id.includes('stable-diffusion') || m_id.includes('ideogram') || m_id.includes('midjourney') || m_id.includes('recraft')) {
                use_cases.push('Image Gen');
            }

            // Calculate 1M pricing
            const pricing_per_1m: ModelPricing = { prompt: 0.0, completion: 0.0 };
            if (m.pricing) {
                if (!isNaN(parseFloat(m.pricing.prompt))) {
                    pricing_per_1m.prompt = parseFloat(m.pricing.prompt) * 1000000;
                }
                if (!isNaN(parseFloat(m.pricing.completion))) {
                    pricing_per_1m.completion = parseFloat(m.pricing.completion) * 1000000;
                }
            }

            const total_price_1m = pricing_per_1m.prompt + pricing_per_1m.completion;
            const originalElo = eloMap[m.id] || null;
            let elo = originalElo;
            if (codingElo && originalElo) {
                elo = Math.max(codingElo, originalElo);
            } else if (codingElo) {
                elo = codingElo;
            }

            let value_score = 0;
            if (elo) {
                if (total_price_1m > 0) {
                    value_score = elo / total_price_1m;
                } else {
                    value_score = 999999;
                }
            }

            return {
                ...m,
                use_cases,
                pricing_per_1m,
                elo,
                value_score
            };
        });

        // Second pass: Dynamic 'Top Tier' detection without hardcoding versions
        const TOP_PROVIDERS = ['openai', 'anthropic', 'google', 'deepseek', 'x-ai', 'mistral'];
        const smallKeywords = ['mini', 'flash', 'haiku', 'lite', '8b'];

        TOP_PROVIDERS.forEach(provider => {
            const providerModels = models.filter(m => m.id.startsWith(provider + '/'));
            const flagshipCandidates = providerModels.filter(m => !smallKeywords.some(kw => m.id.includes(kw)));

            if (flagshipCandidates.length > 0) {
                // Sort by created timestamp descending
                flagshipCandidates.sort((a, b) => (b.created || 0) - (a.created || 0));

                // Add Top Tier to the most recent 2 flagship models from this provider
                for (let i = 0; i < Math.min(2, flagshipCandidates.length); i++) {
                    if (!flagshipCandidates[i].use_cases.includes('Top Tier')) {
                        flagshipCandidates[i].use_cases.push('Top Tier');
                    }
                    flagshipCandidates[i].elo = (flagshipCandidates[i].elo || 1200) + 150; // Boost ELO for latest flagships
                }
            }
        });

        // Add Top Tier for existing high codingElo models
        models.forEach(m => {
            const codingElo = codingEloMap[m.id];
            if (codingElo && codingElo > 1350 && !m.use_cases.includes('Top Tier')) {
                m.use_cases.push('Top Tier');
            }
        });

        return {
            models,
            last_updated: Math.floor(Date.now() / 1000)
        };
    } catch (error) {
        console.error("Error fetching models:", error);
        return { models: [], last_updated: 0 };
    }
}
