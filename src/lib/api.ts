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
    gateway?: string;
    modality_type?: string;
}

export interface FetchResult {
    models: Model[];
    last_updated: number;
}

export async function fetchModels(): Promise<FetchResult> {
    try {
        let lmsysEloMap: Record<string, number> = {};
        let dumpData: any = null;
        try {
            const dataPath = path.join(process.cwd(), 'src/data/lmsys_elo.json');
            if (fs.existsSync(dataPath)) {
                lmsysEloMap = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            }
            const dumpPath = path.join(process.cwd(), 'src/data/intelligence_dump.json');
            if (fs.existsSync(dumpPath)) {
                dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
            }
        } catch (e) {
            console.error("Failed to load local data files", e);
        }

        const res = await fetch("https://openrouter.ai/api/v1/models", {
            cache: 'no-store'
        });

        if (!res.ok) {
            throw new Error("Failed to fetch models from OpenRouter");
        }

        const json = await res.json();
        const rawModels: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] = json.data || [];

        // --- SDK INTELLIGENCE: Calculate the Floating Baseline ---
        // Prevents the engine from rotting by calculating dynamic ELO medians from the global leaderboard
        const allKnownElos = Object.values(lmsysEloMap).map(Number).filter(v => !isNaN(v)).sort((a, b) => b - a);
        let dynamicFlagshipBaseline = 1300; // Safe mathematical defaults
        let dynamicHighTierBaseline = 1200;
        let dynamicFastBaseline = 1150;

        if (allKnownElos.length >= 20) {
            // Median of Top 10 = Current Flagship Benchmark
            const top10 = allKnownElos.slice(0, 10);
            dynamicFlagshipBaseline = top10[Math.floor(top10.length / 2)] + 25; // +25 release hype bump for new models

            // Median of Rank 10-25 = High Tier Benchmark
            const next15 = allKnownElos.slice(10, 25);
            dynamicHighTierBaseline = next15[Math.floor(next15.length / 2)];

            // Median of Rank 25-50 = Fast/Drafting Benchmark
            const next25 = allKnownElos.slice(25, 50);
            dynamicFastBaseline = next25[Math.floor(next25.length / 2)];
        }

        const models: Model[] = rawModels.map((m) => {
            const use_cases: string[] = [];
            const m_id = (m.id || "").toLowerCase();
            const desc = (m.description || "").toLowerCase();
            const name = (m.name || "").toLowerCase();

            // Coding & Logic
            if (m_id.includes('coder') || m_id.includes('math') || name.includes('coder') || name.includes('math') || m_id.includes('gpt-4') || m_id.includes('gpt-5') || m_id.includes('o1') || m_id.includes('o3') || m_id.includes('claude-3') || m_id.includes('llama-3.1-70b') || m_id.includes('llama-3.1-405b')) {
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

            // Reasoning (Deep Logic / O-Series / Top Tier)
            if (m_id.includes('o1') || m_id.includes('o3') || m_id.includes('sonnet') || m_id.includes('opus') || m_id.includes('reason') || m_id.includes('r1') || m_id.includes('grok')) {
                use_cases.push('Reasoning');
            }

            // Drafting (Fast/cheap models)
            if (m_id.includes('flash') || m_id.includes('haiku') || m_id.includes('mini') || m_id.includes('8b') || m_id.includes('llama-3-8b')) {
                use_cases.push('Drafting');
            }

            // Classification / Tagging (Fast Extraction)
            if (m_id.includes('flash') || m_id.includes('haiku') || m_id.includes('mini') || m_id.includes('8b') || m_id.includes('llama-3-8b') || name.includes('instruct')) {
                use_cases.push('Classification');
            }

            // Conversational / Chat
            if (m_id.includes('claude-3') || m_id.includes('gpt-4') || m_id.includes('gemini') || m_id.includes('llama-3') || m_id.includes('mixtral')) {
                use_cases.push('Conversational');
            }

            // Agentic / Tool-Use (JSON/Strict outputs)
            if (m_id.includes('gpt-4o') || m_id.includes('sonnet') || m_id.includes('opus') || m_id.includes('gemini-1.5-pro') || m_id.includes('o1') || m_id.includes('o3')) {
                use_cases.push('Agentic');
            }

            // Vision
            const arch = m.architecture || {};
            const modalities = arch.modality ? arch.modality.toLowerCase() : "";
            if (desc.includes('vision') || m_id.includes('vision') || modalities.includes('text,image->text')) {
                use_cases.push('Vision');
            }

            // Image Gen
            if (m_id.includes('-image') || m_id.includes('dall-e') || m_id.includes('flux') || m_id.includes('stable-diffusion') || modalities.includes('->image') || modalities.includes('-> text,image')) {
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

            // Assign LMSYS score. If missing, assign a conservative baseline so it sorts below proven gems
            let elo = lmsysEloMap[m.id];

            if (!elo) {
                // Zero-Maintenance Dynamic ELO Engine powered by The Floating Baseline
                const nameAndId = `${m_id} ${name}`.toLowerCase();

                // Phase 1: String Taxonomy Matcher (Flagship Keywords)
                if (nameAndId.match(/opus|gpt-?5|gpt-?4|gemini-?3|gemini-?2|o1|o3|405b|72b/)) {
                    elo = dynamicFlagshipBaseline; 
                } else if (nameAndId.match(/pro|sonnet|70b|command-r/)) {
                    elo = dynamicHighTierBaseline; 
                } else if (nameAndId.match(/flash|haiku|mini|8b|3b|1b|8x7b|lite/)) {
                    elo = dynamicFastBaseline; 
                } else {
                    // Phase 2: Free Market Pricing Curve (Price vs Intelligence Correlation)
                    if (total_price_1m >= 15.0) {
                        elo = dynamicFlagshipBaseline; 
                    } else if (total_price_1m >= 5.0) {
                        elo = dynamicHighTierBaseline; 
                    } else if (total_price_1m >= 0.5) {
                        elo = dynamicFastBaseline; 
                    } else {
                        elo = 1050; // Free/Loss-leader baseline
                    }
                }
            }

            let value_score = 0;
            if (elo) {
                if (total_price_1m > 0) {
                    value_score = elo / total_price_1m;
                } else {
                    value_score = 999999;
                }
            }

            // Determine modality primarily for OR models
            let modality_type = 'text';
            if (use_cases.includes('Image Gen')) modality_type = 'image';
            else if (use_cases.includes('Vision')) modality_type = 'text'; // Vision implies text output typically, but multimodal input

            // Extract health or fallback to standard assuming it works
            const health: ModelHealth = m.health || { status: 'green' };

            return {
                ...m,
                use_cases,
                pricing_per_1m,
                elo,
                value_score,
                health,
                gateway: 'openrouter',
                modality_type
            };
        });

        // Merge Fal.ai models from intelligence dump
        if (dumpData && dumpData.entities) {
            dumpData.entities.forEach((ent: any) => {
                const falEvent = ent.events.find((e: any) => e.provider === 'fal.ai');
                if (falEvent) {
                    const m_id = falEvent.alias;
                    const name = ent.model_id.split('/').pop() || m_id;
                    const use_cases: string[] = [];
                    let modality_type = 'text';

                    if (ent.modalities_out.includes('video')) {
                        use_cases.push('Video Gen');
                        modality_type = 'video';
                    } else if (ent.modalities_out.includes('audio')) {
                         use_cases.push('Audio Gen');
                         modality_type = 'audio';
                    } else if (ent.modalities_out.includes('image') || ent.modalities_out.includes('->image')) {
                         use_cases.push('Image Gen');
                         modality_type = 'image';
                    } else if (ent.modalities_in.includes('image')) {
                         use_cases.push('Vision');
                    }
                    
                    const pricing_per_1m: ModelPricing = {
                         prompt: (ent.pricing_prompt || 0) * 1000000,
                         completion: (ent.pricing_completion || 0) * 1000000
                    };
                    
                    models.push({
                        id: m_id,
                        name: name,
                        description: `Fast, production-ready ${modality_type} model via Fal.ai.`,
                        context_length: 0,
                        created: Math.floor(Date.now() / 1000), // generic timestamp
                        pricing: {},
                        pricing_per_1m,
                        use_cases,
                        elo: null, // Visual models don't use standard ELO right now
                        value_score: 999999,
                        gateway: 'fal.ai',
                        modality_type
                    });
                }
            });
        }

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

        // Add Top Tier for existing high LMSYS ELO models
        models.forEach(m => {
            const elo = lmsysEloMap[m.id];
            if (elo && elo > 1250 && !m.use_cases.includes('Top Tier')) {
                m.use_cases.push('Top Tier');
            }
        });

        // Ensure all Top Tier generalist flagships are automatically qualified for complex cognitive tasks
        models.forEach(m => {
            if (m.use_cases.includes('Top Tier') || (m.elo && m.elo > 1250)) {
                if (!m.use_cases.includes('Coding & Logic')) m.use_cases.push('Coding & Logic');
                if (!m.use_cases.includes('Fictional')) m.use_cases.push('Fictional');
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
