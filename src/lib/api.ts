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

            // Fictional Writing (Complex/larger models)
            if (m_id.includes('claude-3') || m_id.includes('gemini-1.5-pro') || m_id.includes('opus') || m_id.includes('gpt-4') || m_id.includes('wizardlm') || m_id.includes('llama-3.1-70b') || m_id.includes('llama-3.1-405b') || m_id.includes('llama-3-70b')) {
                use_cases.push('Fictional Writing');
            }

            // Quick Drafting (Fast/cheap models)
            if (m_id.includes('flash') || m_id.includes('haiku') || m_id.includes('mini') || m_id.includes('8b') || m_id.includes('llama-3-8b')) {
                use_cases.push('Quick Drafting');
            }

            // Vision
            const arch = m.architecture || {};
            const modalities = arch.modality ? arch.modality.toLowerCase() : "";
            if (desc.includes('vision') || m_id.includes('vision') || modalities.includes('image')) {
                use_cases.push('Vision');
            }

            // Top Tier / Premium (Mathematical heuristic driven by Aider Coding ELO)
            // A proxy ELO > 1350 roughly correlates to a >65% pass rate on the Polyglot benchmark.
            // This organically identifies true frontier models (o1, claude-3.7-sonnet, deepseek-reasoner)
            // without hardcoding their lineages or version numbers.
            if (codingElo && codingElo > 1350) {
                use_cases.push('Top Tier');
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

        return {
            models,
            last_updated: Math.floor(Date.now() / 1000)
        };
    } catch (error) {
        console.error("Error fetching models:", error);
        return { models: [], last_updated: 0 };
    }
}
