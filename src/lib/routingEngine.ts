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
}

export type RoutingPolicy = 'max_quality' | 'balanced' | 'max_savings' | 'low_latency' | 'high_reliability';

export interface RouteConfig {
    intent?: string;
    estimatedInputTokens?: number;
    capabilities?: string[];
    policy?: RoutingPolicy;
}

export async function getOptimalRoute(config: RouteConfig = {}): Promise<RoutingResponse | null> {
    const { 
        intent = 'all', 
        estimatedInputTokens = 0, 
        capabilities = [], 
        policy = 'balanced' 
    } = config;

    try {
        const data = await fetchModels();
        let models = data.models;

        // --- SDK INTELLIGENCE: Capability Gating ---
        // Verifies the model can actually fulfill the runtime contract before scoring
        if (capabilities.length > 0) {
            models = models.filter(m => {
                const modelCaps = m.capabilities || [];
                return capabilities.every(cap => modelCaps.includes(cap.toLowerCase().trim()));
            });
        }

        // --- SDK INTELLIGENCE: Tri-State Context Failsafe (Hard Fit) ---
        // Instantly strips out models that will mathematically fail to process the user's prompt
        if (estimatedInputTokens > 0) {
            models = models.filter(m => (m.context_length || 0) >= estimatedInputTokens);
        }

        const mappedIntent = mapIntent(intent).toLowerCase();
        let axis: 'global' | 'coding' | 'chat' | 'document' = 'global';
        if (mappedIntent === 'coding & logic') axis = 'coding';
        else if (mappedIntent === 'fictional' || mappedIntent === 'reasoning') axis = 'document';
        else if (mappedIntent === 'conversational' || mappedIntent === 'roleplay') axis = 'chat';

        // --- SDK INTELLIGENCE: Continuous Routing Math (Composite Scores) ---
        // Replaces single blunt penalties with continuous policy-weighted adjustments
        models = models.map(m => {
            const task_score = m.intelligence ? (m.intelligence[axis] || m.intelligence.global) : (m.elo || 1050);

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
                else if (m.health.status === 'red') reliability_penalty += 250; // Severe outage, but potentially recoverable mathematically if policy ignores reliability
            }
            if (m.health?.ttft) {
                if (m.health.ttft > 2000) latency_penalty += 25;
                if (m.health.ttft > 5000) latency_penalty += 100;
            }

            const total_price_1m = m.pricing_per_1m.prompt + m.pricing_per_1m.completion;

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

            const activeElo = task_score - reliability_penalty - latency_penalty - cost_penalty;

            return {
                ...m,
                elo: activeElo // Redefine `elo` temporarily for the legacy downstream sorting code
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
        const flagshipCost1M = flagship.pricing_per_1m.prompt + flagship.pricing_per_1m.completion;

        const isExtremeEnterprise = flagshipCost1M >= 10.0;
        const eloRadius = isExtremeEnterprise ? 250 : 100;

        let highCapabilitySubset = models.filter(m =>
            m.id !== flagship.id &&
            m.elo !== null &&
            flagship.elo !== null &&
            ((flagship.elo as number) - (m.elo as number)) <= eloRadius
        );

        highCapabilitySubset = highCapabilitySubset.filter(m => {
            const cost = m.pricing_per_1m.prompt + m.pricing_per_1m.completion;
            return cost <= (flagshipCost1M * 0.40);
        });

        highCapabilitySubset.sort((a, b) => (b.elo as number) - (a.elo as number));

        let smartValue = null;
        let financialTradeoff = `No smart alternatives found within a -${eloRadius} point intelligence drop that saved >60% cost.`;

        if (highCapabilitySubset.length > 0) {
            const sv = highCapabilitySubset[0];
            smartValue = sv;
            const valueCost1M = sv.pricing_per_1m.prompt + sv.pricing_per_1m.completion;

            const costMultiplier = (flagshipCost1M / (valueCost1M || 0.0001)).toFixed(1);
            const eloDropPercent = (((flagship.elo as number) - (sv.elo as number)) / (flagship.elo as number) * 100).toFixed(1);
            financialTradeoff = `${costMultiplier}x cheaper for -${eloDropPercent}% intelligence drop`;
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
                    cost_per_1m: (smartValue.pricing_per_1m.prompt + smartValue.pricing_per_1m.completion),
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
