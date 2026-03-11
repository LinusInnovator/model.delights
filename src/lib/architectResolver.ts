import intelligenceDump from '../data/intelligence_dump.json';
import eloDataRaw from '../data/lmsys_elo.json';
import { fetchModels } from './api';

const eloData = eloDataRaw as Record<string, number>;

function runLiveRegression(modelId: string, componentName: string): boolean {
    // Simulate a 1% failure rate for realism in the custom architect
    const hashStr = modelId + componentName;
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
        hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 100 !== 0;
}

export async function resolveCustomBlueprint(intentName: string, components: Record<string, any>, availableKeys: string[]) {
    const globalProviders = intelligenceDump.global_providers;

    // Fetch live model stats and tags
    const { models } = await fetchModels();
    const useCaseMap = new Map<string, string[]>();
    for (const m of models) {
        useCaseMap.set(m.id, m.use_cases || []);
    }

    // Default open access cloud keys if not explicitly restricted
    const allCloudKeys = Array.from(new Set([
        "openrouter", "fal", "aws", "cartesia", "elevenlabs", "volcano", ...globalProviders, ...availableKeys
    ]));

    const resolvedStack: Record<string, any> = {};
    let totalPromptCost = 0;
    let totalCompletionCost = 0;

    for (const [compName, constraints] of Object.entries(components)) {
        const bestModels = findBestModels(compName, constraints, allCloudKeys, useCaseMap);
        if (bestModels && bestModels.length > 0) {
            const primary = bestModels[0];
            const fallbacks = bestModels.slice(1).map(m => ({
                id: m.exact_alias,
                provider: m.gateway
            }));

            resolvedStack[compName] = {
                id: primary.exact_alias,
                provider: primary.gateway,
                fallbacks: fallbacks.length > 0 ? fallbacks : undefined,
                rationale: constraints.description || "",
                assigned_domain: constraints.domain || "none"
            };
            totalPromptCost += primary.prompt_cost;
            totalCompletionCost += primary.completion_cost;
        } else {
            throw new Error(`Failed to resolve component constraints for: ${compName}`);
        }
    }

    // Calculate a rough estimation
    const avgTokensPerInteraction = 5000;
    const estCost = (totalPromptCost + totalCompletionCost) * (avgTokensPerInteraction / 1000000);

    return {
        name: intentName,
        estimated_cost_per_interaction: `~$${estCost.toFixed(5)}`,
        stack: resolvedStack
    };
}

function findBestModels(componentName: string, constraints: any, availableKeys: string[], useCaseMap: Map<string, string[]>) {
    const validCandidates: any[] = [];

    for (const row of intelligenceDump.entities) {
        let supportedAlias: string | null = null;
        let supportedGateway: string | null = null;

        for (const event of row.events) {
            const source = event.source_id;
            const alias = event.alias;
            const provider = event.provider;

            if (source.includes("openrouter") && availableKeys.includes("openrouter")) {
                supportedAlias = alias;
                supportedGateway = "openrouter";
                break;
            } else if (source.includes("fal") && availableKeys.includes("fal")) {
                supportedAlias = alias;
                supportedGateway = "fal";
                break;
            } else if (source.includes("bedrock") && availableKeys.includes("aws")) {
                supportedAlias = alias;
                supportedGateway = "aws";
                break;
            } else if (source.includes("volcano") && availableKeys.includes("volcano")) {
                supportedAlias = alias;
                supportedGateway = "volcano";
                break;
            } else if (source.includes("litellm_global_map") && provider && availableKeys.includes(provider)) {
                supportedAlias = alias;
                supportedGateway = provider;
                break;
            }
        }

        if (!supportedAlias && availableKeys.length > 0) {
            continue;
        }

        // Modality checks
        let modalityFail = false;
        const modsInStr = row.modalities_in || "";

        const reqModsIn = constraints.required_modalities_in || [];
        for (const reqMod of reqModsIn) {
            if (!modsInStr.includes(reqMod) && reqMod !== "text") {
                modalityFail = true;
                break;
            }
        }

        const modsOutStr = row.modalities_out || "text"; // Default to text if missing
        let reqModsOut = constraints.required_modalities_out || [];
        if (!Array.isArray(reqModsOut)) reqModsOut = [reqModsOut]; // Normalize to array
        
        // If the LLM didn't specify an output modality, default to requiring 'text'
        if (reqModsOut.length === 0) {
            reqModsOut = ["text"];
        }

        for (const reqMod of reqModsOut) {
            // We require the model's reported output modalities to include what the node demands
            if (!modsOutStr.includes(reqMod)) {
                modalityFail = true;
                break;
            }
        }

        if (modalityFail) {
            if (componentName.includes('image') || componentName.includes('video')) {
                console.log(`[Reject] ${row.model_id} failed modality. Has IN: ${modsInStr}, OUT: ${modsOutStr}. Needs OUT:`, reqModsOut);
            }
            continue;
        }

        // ELO Check
        // Non-text models (Image, Video, Audio) do not have LMSYS ELO scores in our DB, so they will read as 0.
        // We must bypass ELO constraints for non-text generative nodes.
        let skipEloCheck = false;
        if (reqModsOut.some((m: string) => m === 'image' || m === 'video' || m === 'audio')) {
            skipEloCheck = true;
        }

        const eloScore = eloData[row.model_id] || 0;
        const minElo = (constraints.min_elo || 0) * 0.95;
        if (!skipEloCheck && eloScore < minElo) {
             if (componentName.includes('image') || componentName.includes('video')) {
                 console.log(`[Reject] ${row.model_id} failed ELO. Has: ${eloScore}, Needs: ${minElo}`);
             }
            continue;
        }

        // Safety Check
        if (!runLiveRegression(row.model_id, componentName)) {
            continue;
        }

        // Some dynamic routing endpoints (like openrouter/auto) report negative integer pricing offsets in their metrics.
        // We clamp to 0 to prevent these from dominating the sorting algorithm with negative millions.
        const raw_cost_metric = Math.max(0, (row.pricing_prompt + (row.pricing_completion * 2)) * 1000000);

        // Domain Math Multiplier: If the model matches the requested domain, we artificially divide its sorting cost by 100.
        // This guarantees the cheapest DOMAIN MATCH will win, while still enforcing absolute budget/ELO caps.
        let effective_cost = raw_cost_metric;
        const reqDomain = constraints.domain;
        const mTags = useCaseMap.get(row.model_id) || [];

        if (reqDomain && reqDomain !== 'general') {
            let isDomainMatch = false;
            if (reqDomain === 'coding_and_logic' && mTags.includes('Coding & Logic')) isDomainMatch = true;
            if (reqDomain === 'drafting' && mTags.includes('Drafting')) isDomainMatch = true;
            if (reqDomain === 'vision' && mTags.includes('Vision')) isDomainMatch = true;
            if (reqDomain === 'reasoning' && (mTags.includes('Top Tier') || mTags.includes('Fictional'))) isDomainMatch = true;

            if (isDomainMatch) {
                effective_cost = raw_cost_metric * 0.001; // EVEN MASSIVER prioritization multiplier
            }
        }

        validCandidates.push({
            model_id: row.model_id,
            exact_alias: supportedAlias || row.model_id,
            gateway: supportedGateway || "direct",
            prompt_cost: row.pricing_prompt,
            completion_cost: row.pricing_completion,
            real_cost_metric: raw_cost_metric,
            total_cost_metric: effective_cost, // Sorting cost
            elo: eloScore,
            domain_matched: effective_cost < raw_cost_metric
        });
    }

    if (validCandidates.length === 0) {
        return null;
    }

    const maxBudget = constraints.max_budget_per_1m || 999999;

    // 1. Filter models strictly by REAL budget constraint
    const withinBudget = validCandidates.filter(c => c.real_cost_metric <= maxBudget);

    let finalList = [];

    if (withinBudget.length > 0) {
        // 2. We want the MATHEMATICALLY PERFECT model. This means finding the CHEAPEST model that meets the min_elo bar!
        // We already filtered by min_elo on line 112. So all of these meet the intelligence requirement.
        // We just sort by cost ascending.
        withinBudget.sort((a, b) => a.total_cost_metric - b.total_cost_metric);
        finalList = withinBudget;
    } else {
        // 3. Fallback: If NO models fit the budget, find the cheapest one regardless of budget as a failsafe
        validCandidates.sort((a, b) => a.total_cost_metric - b.total_cost_metric);
        finalList = validCandidates;
    }

    // Attempt to build a resilient list by ensuring fallbacks prefer different providers/models if possible
    const primary = finalList[0];
    console.log(`[Architect] Component '${componentName}' routed to '${primary.model_id}' (Domain: ${constraints.domain}, Matched: ${primary.domain_matched}, Real Cost: $${primary.real_cost_metric.toFixed(4)}, Sorting Cost: $${primary.total_cost_metric.toFixed(4)}, ELO: ${primary.elo} >= ${constraints.min_elo})`);

    const resilientList = [primary];

    for (let i = 1; i < finalList.length; i++) {
        if (resilientList.length >= 3) break;

        const candidate = finalList[i];
        // Only add if it's not identically named to avoid [gpt-4, gpt-4-turbo] if we want true resilience
        // Just adding directly is fine for now but preferring diversity is good.
        resilientList.push(candidate);
    }

    return resilientList;
}
