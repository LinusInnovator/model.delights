import { fetchModels } from './api';

export interface RouteObj {
    model: string;
    elo: number | null;
    cost_per_1m: number;
    name: string;
    financial_tradeoff?: string;
    context_length?: number;
}

export interface RoutingResponse {
    intent: string;
    flagship: RouteObj;
    smart_value?: RouteObj;
    fallback_array: string[];
    is_sticky_affinity?: boolean;
}

export type RoutingPolicy = 'max_quality' | 'balanced' | 'max_savings' | 'low_latency' | 'high_reliability';

export interface RouteConfig {
    intent?: string;
    estimatedInputTokens?: number;
    capabilities?: string[];
    policy?: RoutingPolicy;
    cached_payload?: boolean;
    sessionId?: string;
}

// --- AGENT-SAFE SESSION AFFINITY STORE ---
// Maps session IDs (from x-session-id or session_id) to previously routed models
// to preserve KV-cache discounts (up to 90%) and prevent assistant persona drift.
interface SessionRecord {
    modelId: string;
    lastUsed: number;
}

const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const sessionAffinityStore = new Map<string, SessionRecord>();

export function getSessionAffinity(sessionId: string): string | null {
    const record = sessionAffinityStore.get(sessionId);
    if (!record) return null;
    if (Date.now() - record.lastUsed > SESSION_TTL_MS) {
        sessionAffinityStore.delete(sessionId);
        return null;
    }
    return record.modelId;
}

export function recordSessionAffinity(sessionId: string, modelId: string): void {
    sessionAffinityStore.set(sessionId, {
        modelId,
        lastUsed: Date.now()
    });
}

export function clearSessionAffinity(sessionId: string): void {
    sessionAffinityStore.delete(sessionId);
}

export async function getOptimalRoute(config: RouteConfig = {}): Promise<RoutingResponse | null> {
    const { 
        intent = 'all', 
        estimatedInputTokens = 0, 
        capabilities = [], 
        policy = 'balanced',
        cached_payload = false,
        sessionId
    } = config;

    try {
        const data = await fetchModels();
        let models = data.models.filter(m => !m.id.includes(':batch') && !m.id.includes('-batch'));

        // --- SDK INTELLIGENCE: Capability Gating ---
        // Verifies the model can actually fulfill the runtime contract before scoring
        if (capabilities.length > 0) {
            models = models.filter(m => {
                const modelCaps = (m.capabilities || []).map(c => c.toLowerCase().trim());
                return capabilities.every(cap => {
                    const c = cap.toLowerCase().trim();
                    if (c === 'tools' || c === 'tool_calling') {
                        return Boolean(
                            m.operational_specs?.supports_tools ||
                            (m.benchmarks?.bfcl_score && m.benchmarks.bfcl_score > 60) ||
                            modelCaps.includes('tools') ||
                            modelCaps.includes('function_calling')
                        );
                    }
                    if (c === 'json_schema') {
                        return Boolean(
                            m.operational_specs?.supports_json_schema ||
                            m.operational_specs?.supports_tools ||
                            modelCaps.includes('tools')
                        );
                    }
                    if (c === 'reasoning') {
                        return Boolean(
                            m.operational_specs?.is_reasoning ||
                            (m.elo && m.elo >= 1300)
                        );
                    }
                    return modelCaps.includes(c);
                });
            });
        }

        // --- SDK INTELLIGENCE: Tri-State Context Failsafe (Hard Fit) ---
        // Instantly strips out models that will mathematically fail to process the user's prompt
        if (estimatedInputTokens > 0) {
            models = models.filter(m => (m.context_length || 0) >= estimatedInputTokens);
        }

        // --- SDK INTELLIGENCE: Agent-Safe Session Affinity (Sticky Thread) ---
        // If a valid session ID is provided and was already routed to a model that satisfies
        // current capability requirements, preserve that model to protect KV cache discounts (up to 90%).
        if (sessionId) {
            const stickyModelId = getSessionAffinity(sessionId);
            if (stickyModelId) {
                const existingModel = models.find(m => m.id === stickyModelId);
                if (existingModel) {
                    const fallback_array = [existingModel.id];
                    const peerFallback = models.find(m => m.id !== existingModel.id);
                    if (peerFallback) fallback_array.push(peerFallback.id);

                    const cost1M = existingModel.pricing_per_1m.prompt + existingModel.pricing_per_1m.completion;
                    return {
                        intent: intent || 'session_affinity',
                        flagship: {
                            model: existingModel.id,
                            elo: existingModel.elo,
                            cost_per_1m: cost1M,
                            name: existingModel.name,
                            context_length: existingModel.context_length
                        },
                        fallback_array,
                        is_sticky_affinity: true
                    };
                }
            }
        }

        const mappedIntent = mapIntent(intent).toLowerCase();
        let axis: 'global' | 'coding' | 'chat' | 'document' | 'agentic' = 'global';
        if (mappedIntent === 'coding & logic') axis = 'coding';
        else if (mappedIntent === 'fictional' || mappedIntent === 'reasoning') axis = 'document';
        else if (mappedIntent === 'conversational' || mappedIntent === 'roleplay') axis = 'chat';
        else if (mappedIntent === 'agentic') axis = 'agentic';

        // --- SDK INTELLIGENCE: Continuous Routing Math (Composite Scores) ---
        // Replaces single blunt penalties with continuous policy-weighted adjustments
        models = models.map(m => {
            let task_score = m.intelligence ? (m.intelligence[axis] || m.intelligence.global) : (m.elo || 1050);

            // Domain benchmark weighting
            if (axis === 'coding' && m.benchmarks?.aider_pass_1) {
                // Aider pass rate (e.g. 80%) scaled to ELO range (+60 ELO boost for 80%+)
                task_score += (m.benchmarks.aider_pass_1 - 50) * 2;
            } else if (axis === 'agentic' && m.benchmarks?.bfcl_score) {
                // BFCL tool score (e.g. 88) scaled to ELO range
                task_score += (m.benchmarks.bfcl_score - 70) * 3;
            } else if (mappedIntent === 'reasoning' && m.operational_specs?.is_reasoning) {
                task_score += 80;
            } else if (intent === 'fast_utility') {
                // For fast utility, cost & latency matter far more than overkill flagship ELO
                if (m.pricing_per_1m.prompt + m.pricing_per_1m.completion < 1.0) {
                    task_score += 150; // Boost ultra-cheap fast models (Gemini Flash, DeepSeek Chat)
                }
            }

            let latency_penalty = 0;
            let reliability_penalty = 0;
            let cost_penalty = 0;

            // Safe Fit Penalty (Attention degradation near token cap)
            if (estimatedInputTokens > 0) {
                const utilization = estimatedInputTokens / (m.context_length || 1);
                if (utilization > 0.75) {
                    reliability_penalty += 50; 
                }
            }

            // Continuous Uptime & Reliability Penalties
            if (m.health?.status) {
                if (m.health.status === 'amber') reliability_penalty += 50;
                else if (m.health.status === 'red') reliability_penalty += 250; // Severe outage
            }
            if (m.health?.ttft) {
                if (m.health.ttft > 2000) latency_penalty += 25;
                if (m.health.ttft > 5000) latency_penalty += 100;
            }

            // Apply Caching Economics
            let active_prompt_price = m.pricing_per_1m.prompt;
            if (cached_payload && m.pricing_per_1m.prompt_cached !== undefined) {
                // Massive discount unlocked via repetitive RAG context caching
                active_prompt_price = m.pricing_per_1m.prompt_cached;
            }
            const total_price_1m = active_prompt_price + m.pricing_per_1m.completion;

            // Policy-Aware Weighting Modes
            if (policy === 'max_quality') {
                cost_penalty = 0; 
            } else if (policy === 'max_savings') {
                cost_penalty = total_price_1m * 50; 
            } else if (policy === 'low_latency') {
                latency_penalty *= 3; 
            } else if (policy === 'high_reliability') {
                reliability_penalty *= 3; 
            } else {
                // balanced
                cost_penalty = total_price_1m * 10;
            }

            // Economic Fit 
            if (estimatedInputTokens > 0 && policy !== 'max_quality') {
                const strCost = (estimatedInputTokens / 1000000) * total_price_1m;
                if (strCost > 1.0) { // Costs more than $1 just to process the prompt
                    cost_penalty += 100;
                }
            }

            // Thompson-style dynamic ELO exploration jitter to discover new/unstable node performance
            const explorationJitter = (Math.random() - 0.5) * 10; // -5 to +5 ELO points
            const activeElo = task_score - reliability_penalty - latency_penalty - cost_penalty + explorationJitter;

            return {
                ...m,
                elo: activeElo
            };
        });

        if (intent.toLowerCase() !== 'all' && mappedIntent !== 'all models') {
            models = models.filter(m => {
                return m.use_cases && m.use_cases.some(uc => uc.toLowerCase() === mappedIntent);
            });
        }

        if (models.length === 0) return null;

        models.sort((a, b) => (b.elo || 0) - (a.elo || 0));

        const flagship = models[0];
        
        // Recalculate true payload cost for the return statements
        let flagship_active_prompt = flagship.pricing_per_1m.prompt;
        if (cached_payload && flagship.pricing_per_1m.prompt_cached !== undefined) {
            flagship_active_prompt = flagship.pricing_per_1m.prompt_cached;
        }
        const flagshipCost1M = flagship_active_prompt + flagship.pricing_per_1m.completion;

        const isExtremeEnterprise = flagshipCost1M >= 10.0;
        // Future-proof ELO math: Tolerable intelligence drop scales percentage-wise as absolute ELO inflates to 2000+.
        // Tolerates a 15% intelligence drop for hyper-expensive models, and 8% for standard flagships.
        const acceptableDropPercentage = isExtremeEnterprise ? 0.15 : 0.08;
        const eloRadius = Math.max(100, Math.floor((flagship.elo || 1200) * acceptableDropPercentage));

        let highCapabilitySubset = models.filter(m =>
            m.id !== flagship.id &&
            m.elo !== null &&
            flagship.elo !== null &&
            ((flagship.elo as number) - (m.elo as number)) <= eloRadius
        );

        highCapabilitySubset = highCapabilitySubset.filter(m => {
             let m_active_prompt = m.pricing_per_1m.prompt;
             if (cached_payload && m.pricing_per_1m.prompt_cached !== undefined) m_active_prompt = m.pricing_per_1m.prompt_cached;
             const cost = m_active_prompt + m.pricing_per_1m.completion;
             return cost <= (flagshipCost1M * 0.40);
        });

        highCapabilitySubset.sort((a, b) => (b.elo as number) - (a.elo as number));

        let smartValue = null;
        let financialTradeoff = `No smart alternatives found within a -${eloRadius} point intelligence drop that saved >60% cost.`;

        if (highCapabilitySubset.length > 0) {
            const sv = highCapabilitySubset[0];
            smartValue = sv;
            
            let sv_active_prompt = sv.pricing_per_1m.prompt;
            if (cached_payload && sv.pricing_per_1m.prompt_cached !== undefined) sv_active_prompt = sv.pricing_per_1m.prompt_cached;
            
            const valueCost1M = sv_active_prompt + sv.pricing_per_1m.completion;

            const costMultiplier = (flagshipCost1M / (valueCost1M || 0.0001)).toFixed(1);
            const eloDropPercent = (((flagship.elo as number) - (sv.elo as number)) / (flagship.elo as number) * 100).toFixed(1);
            financialTradeoff = `${costMultiplier}x cheaper for -${eloDropPercent}% intelligence drop`;
        } else {
            // Fallback: If no model matched the strict radius, just find the absolute cheapest capable model
            const absoluteCheapest = [...models]
                .filter(m => m.id !== flagship.id && (m.pricing_per_1m.prompt + m.pricing_per_1m.completion) < flagshipCost1M)
                .sort((a, b) => (a.pricing_per_1m.prompt + a.pricing_per_1m.completion) - (b.pricing_per_1m.prompt + b.pricing_per_1m.completion))[0];

            if (absoluteCheapest) {
                smartValue = absoluteCheapest;
                let sv_active_prompt = smartValue.pricing_per_1m.prompt;
                if (cached_payload && smartValue.pricing_per_1m.prompt_cached !== undefined) sv_active_prompt = smartValue.pricing_per_1m.prompt_cached;
                const valueCost1M = sv_active_prompt + smartValue.pricing_per_1m.completion;

                const costMultiplier = (flagshipCost1M / (valueCost1M || 0.0001)).toFixed(1);
                let eloDropPercent = "Unknown";
                if (flagship.elo && smartValue.elo) {
                    eloDropPercent = (((flagship.elo as number) - (smartValue.elo as number)) / (flagship.elo as number) * 100).toFixed(1);
                }
                
                financialTradeoff = `Extreme Budget: ${costMultiplier}x cheaper but accepts a -${eloDropPercent}% intelligence drop`;
            }
        }

        const closestPeers = data.models.filter(m =>
            m.id !== flagship.id &&
            m.elo !== null &&
            flagship.elo !== null &&
            m.context_length >= flagship.context_length &&
            Math.abs(m.elo - (flagship.elo as number)) <= 100
        ).sort((a, b) => Math.abs((a.elo as number) - (flagship.elo as number)) - Math.abs((b.elo as number) - (flagship.elo as number)));

        const fallback_array = [flagship.id];
        if (smartValue) fallback_array.push(smartValue.id);
        if (closestPeers.length > 0 && !fallback_array.includes(closestPeers[0].id)) {
            fallback_array.push(closestPeers[0].id);
        }

        if (sessionId) {
            const chosenModelId = (policy === 'max_savings' && smartValue) ? smartValue.id : flagship.id;
            recordSessionAffinity(sessionId, chosenModelId);
        }

        return {
            intent,
            flagship: {
                model: flagship.id,
                elo: flagship.elo,
                cost_per_1m: flagshipCost1M,
                name: flagship.name,
                context_length: flagship.context_length
            },
            ...(smartValue && {
                smart_value: {
                    model: smartValue.id,
                    elo: smartValue.elo,
                    cost_per_1m: (() => {
                        let p = smartValue.pricing_per_1m.prompt;
                        if (cached_payload && smartValue.pricing_per_1m.prompt_cached !== undefined) p = smartValue.pricing_per_1m.prompt_cached;
                        return p + smartValue.pricing_per_1m.completion;
                    })(),
                    name: smartValue.name,
                    financial_tradeoff: financialTradeoff,
                    context_length: smartValue.context_length
                }
            }),
            fallback_array
        };
    } catch (e) {
        console.error("Internal Routing Engine Error:", e);
        return null;
    }
}

export function mapIntent(intent: string): string {
    const i = intent.toLowerCase();
    
    if (i.includes('cod') || i.includes('logic') || i.includes('math')) return 'Coding & Logic';
    if (i.includes('fiction') || i.includes('story') || i.includes('complex')) return 'Fictional';
    if (i.includes('draft') || i.includes('fast') || i.includes('cheap')) return 'Drafting';
    if (i.includes('roleplay') || i.includes('uncensor')) return 'Roleplay';
    if (i.includes('vision') || i.includes('image')) return 'Vision';
    if (i.includes('top') || i.includes('flagship')) return 'Top Tier';
    
    if (i.includes('reason') || i.includes('think') || i.includes('boardroom') || i.includes('plan')) return 'Reasoning';
    if (i.includes('classif') || i.includes('tag') || i.includes('sort') || i.includes('filter')) return 'Classification';
    if (i.includes('chat') || i.includes('conversation') || i.includes('support')) return 'Conversational';
    if (i.includes('agent') || i.includes('tool') || i.includes('strict') || i.includes('json') || i.includes('extract')) return 'Agentic';
    
    return 'All Models';
}
