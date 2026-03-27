import fs from 'fs';
import path from 'path';

export interface ModelHealth {
    status: string;
    ttft?: number;
}

export interface ModelPricing {
    prompt: number;
    completion: number;
    prompt_cached?: number;
}

export interface ModelArchitecture {
    modality?: string;
    input_modalities?: string[];
    output_modalities?: string[];
}

export interface ModelIntelligence {
    global: number;
    coding: number;
    chat: number;
    document: number;
    agentic?: number;
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
    intelligence: ModelIntelligence;
    capabilities: string[];
    elo: number | null; // Retained temporarily for backward compatibility during migration
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
        let intelligenceMatrix: Record<string, { lmsys_elo?: number, aider_pass_1?: number, bfcl_score?: number }> = {};
        let telemetryStats: Record<string, { total: number, failures: number, successRate: number }> = {};
        let dumpData: any = null;
        try {
            const dataPath = path.join(process.cwd(), 'src/data/lmsys_elo.json');
            if (fs.existsSync(dataPath)) {
                lmsysEloMap = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            }
            const matrixPath = path.join(process.cwd(), 'src/data/intelligence_matrix.json');
            if (fs.existsSync(matrixPath)) {
                intelligenceMatrix = JSON.parse(fs.readFileSync(matrixPath, 'utf-8'));
            }
            const dumpPath = path.join(process.cwd(), 'src/data/intelligence_dump.json');
            if (fs.existsSync(dumpPath)) {
                dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
            }
            const telemetryPath = path.join(process.cwd(), 'src/data/telemetry_db.jsonl');
            if (fs.existsSync(telemetryPath)) {
                const logs = fs.readFileSync(telemetryPath, 'utf-8').split('\n').filter(Boolean);
                for (const line of logs) {
                    try {
                        const log = JSON.parse(line);
                        const m_id = log.model;
                        if (!telemetryStats[m_id]) telemetryStats[m_id] = { total: 0, failures: 0, successRate: 1.0 };
                        telemetryStats[m_id].total++;
                        if (log.outcome !== 'success') {
                            telemetryStats[m_id].failures++;
                        }
                    } catch (e) {}
                }
                for (const m_id in telemetryStats) {
                    const stats = telemetryStats[m_id];
                    if (stats.total > 0) {
                        stats.successRate = (stats.total - stats.failures) / stats.total;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load local data files", e);
        }

        const res = await fetch("https://openrouter.ai/api/v1/models", {
            next: { revalidate: 300 }
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
                // Extract OpenRouter's Prompt Caching Discount if available (Massively impacts RAG routing)
                if (m.pricing.prompt_cached && !isNaN(parseFloat(m.pricing.prompt_cached))) {
                    pricing_per_1m.prompt_cached = parseFloat(m.pricing.prompt_cached) * 1000000;
                }
            }

            const total_price_1m = pricing_per_1m.prompt + pricing_per_1m.completion;
            
            // For Smart Value mathematical calculations, if the user declares cached_payload=true, we swap to this price.
            // If they don't, we just fall back to standard prompt cost safely.
            const total_cached_price_1m = (pricing_per_1m.prompt_cached ?? pricing_per_1m.prompt) + pricing_per_1m.completion;

            const nameAndId = `${m_id} ${name}`.toLowerCase();

            // Determine modality primarily for OR models
            let modality_type = 'text';
            if (use_cases.includes('Image Gen')) modality_type = 'image';
            else if (use_cases.includes('Vision')) modality_type = 'text';

            // Assign LMSYS score. If missing, assign a conservative baseline so it sorts below proven gems
            const triForce = intelligenceMatrix[m.id] || {};
            let elo = triForce.lmsys_elo || lmsysEloMap[m.id];
            
            const aider_pass = triForce.aider_pass_1;
            const bfcl_score = triForce.bfcl_score;

            if (!elo) {
                // Zero-Maintenance Dynamic ELO Engine powered by The Floating Baseline
                
                // Create deterministic jitter from the model ID to organically disperse unranked models on the UI Matrix
                const hashStr = m.id || "unknown";
                let hash = 0;
                for (let i = 0; i < hashStr.length; i++) {
                    hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
                    hash |= 0;
                }
                const jitter = (Math.abs(hash) % 31) - 15; // -15 to +15

                // Phase 1: String Taxonomy Matcher (Flagship Keywords)
                if (nameAndId.match(/opus|gpt-?5|gpt-?4|gemini-?3|gemini-?2|o1|o3|405b|72b/)) {
                    elo = dynamicFlagshipBaseline + jitter; 
                } else if (nameAndId.match(/pro|sonnet|70b|command-r/)) {
                    elo = dynamicHighTierBaseline + jitter; 
                } else if (nameAndId.match(/flash|haiku|mini|8b|3b|1b|8x7b|lite/)) {
                    elo = dynamicFastBaseline + jitter; 
                } else {
                    // Phase 2: Free Market Pricing Curve (Price vs Intelligence Correlation)
                    if (total_price_1m >= 15.0) {
                        elo = dynamicFlagshipBaseline + jitter; 
                    } else if (total_price_1m >= 5.0) {
                        elo = dynamicHighTierBaseline + jitter; 
                    } else if (total_price_1m >= 0.5) {
                        elo = dynamicFastBaseline + jitter; 
                    } else {
                        elo = 1050 + jitter; // Free/Loss-leader baseline
                    }
                }
            }

            // Phase 3: Construct Composite Intelligence Matrix (Multi-Axis ELO)
            const globalElo = elo || 1050; // Fallback should never hit due to phase phases above, but TS safe
            
            const intelligence: ModelIntelligence = {
                global: globalElo,
                coding: globalElo,
                chat: globalElo,
                document: globalElo,
                agentic: globalElo
            };

            // Apply Telemetry Self-Healing Penalty (Idea B)
            const tStats = telemetryStats[m.id];
            if (tStats && tStats.total >= 5) {
                // If success drops below 90%, severely penalize the Agentic routing ELO
                if (tStats.successRate < 0.90) {
                    const penalty = (0.90 - tStats.successRate) * 1500; 
                    intelligence.agentic! -= penalty; 
                    intelligence.global -= (penalty * 0.2); // Light penalty to global prestige
                }
            }

            // Apply Aider Coding Multiplier (Empirical Override)
            if (aider_pass) {
                // Normalizes extremely high passing rates (e.g. 75%+) to +75 ELO edge, and penalizes bad logic
                intelligence.coding += (aider_pass - 50) * 3;
            } else if (use_cases.includes('Coding & Logic')) {
                intelligence.coding += 50;
            } else if (nameAndId.match(/flash|haiku|mini|8b/)) {
                intelligence.coding -= 50; // Small models drop off hard in complex logic
            }

            // Apply BFCL Agentic Multiplier
            if (bfcl_score) {
                // Normalizes BFCL 80%+ scores
                intelligence.agentic! += (bfcl_score - 70) * 4;
            }

            if (use_cases.includes('Conversational') || use_cases.includes('Roleplay')) {
                intelligence.chat += 50;
            }

            if (use_cases.includes('Reasoning') || m.context_length >= 100000) {
                intelligence.document += 75; // High context reasoners excel at document processing
            } else if (m.context_length < 32000) {
                intelligence.document -= 100; // Low context penalized in docs
            }

            // Phase 4: Capability Gating Indexing
            const capabilities: string[] = [];
            // Infer capabilities from flagship statuses
            if (nameAndId.match(/gpt-4|gpt-5|claude-3|gemini|mistral|llama-3\.1|o1|o3/)) {
                capabilities.push('json', 'tools');
            }
            if (m.context_length >= 128000) {
                capabilities.push('long_context');
            }
            if (modality_type !== 'text') {
                capabilities.push(modality_type);
            }

            let value_score = 0;
            if (globalElo) {
                if (total_price_1m > 0) {
                    value_score = globalElo / total_price_1m;
                } else {
                    value_score = 999999;
                }
            }

            // Extract health or fallback to standard assuming it works
            const health: ModelHealth = m.health || { status: 'green' };

            return {
                ...m,
                use_cases,
                pricing_per_1m,
                elo: globalElo, // Keep backward compatible
                intelligence,
                capabilities,
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
                        intelligence: { global: 1000, coding: 0, chat: 0, document: 0 },
                        capabilities: [modality_type],
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
