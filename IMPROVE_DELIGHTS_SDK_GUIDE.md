# Model Delights B2B SDK Integration Guide (Improve.Delights.Pro)
**Target Audience**: AI Developer Agent (Antigravity/Cursor) working on the `improve.delights.pro` project.

## Context
You are integrating the `model-delights-snell` Universal SDK into the `improve.delights.pro` codebase. 

### Critical Architecture Note: "White-Box" vs OpenRouter Auto
Do not confuse this SDK with setting a model string to `openrouter/auto`. OpenRouter Auto is a **Black Box Execution** environment. 

The Snell SDK is a **White-Box Mathematical Pre-Flight Check**. It queries our backend to mathematically evaluate the global AI market in real-time based on LMSys ELO scores. It returns a bifurcated payload containing the absolute Best model (Flagship) AND the smartest, most cost-effective alternative (Smart Value).

**Because `improve.delights.pro` is configured for `budget=yes` restrictions, you must ALWAYS use the `smart_value` model alternative rather than the expensive flagship.**

This SDK is securely locked behind a bearer token API Gateway running on `model.delights.pro`. We are using a dedicated `INTERNAL_GOD_KEY` to bypass billing.

## 1. Installation Environment
The `model-delights-snell` SDK is published to the public NPM registry. You can install it natively into the `improve.delights.pro` codebase using your package manager.

**Command to execute:**
```bash
npm install model-delights-snell
```

## 2. Environment Variables
You must inject the God Key into `improve.delights.pro`'s `.env.local` to securely authenticate against the API Gateway.

```env
# Bypass billing for the Model Delights Universal Router
INTERNAL_GOD_KEY=super_secret_snell_key_123

# The API Gateway URL (Points to production gateway)
MODEL_DELIGHTS_BASE_URL=https://model.delights.pro
```

## 3. Implementation Patterns for `budget=yes`
The SDK is fully isomorphic and exposes native TypeScript definitions. For this project, your primary goal is to fetch the highest-ROI model and execute your prompt with it to save costs.

### Example A: Universal Execution Wrapper (Autonomous Fetch)
Instead of writing OpenRouter fetches manually and trying to handle model timeouts, use the built in `.execute()` wrapper. It handles fallback loops automatically.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

// 1. Initialize the Router
const router = new IntelligenceRouter({
  apiKey: process.env.INTERNAL_GOD_KEY!,
  baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
});

export async function executeImproveTask(messages: any[], userOpenRouterKey: string) {
  try {
    // 2. Execute. The router mathematically pulls the smartest model, prioritizing "smart_value" because of budget constraints.
    const result = await router.execute({
        messages,
        openrouterKey: userOpenRouterKey,
        config: {
            intent: 'reasoning',
            // [BUDGET=YES]: If we pass cached_payload, models like Claude 3.5 Sonnet get massive discounts
            // and might qualify as cheap enough to use!
            cached_payload: true 
        }
    });
    
    console.log("Response:", result.choices[0].message.content);
    console.log("Model Actually Used:", result._snell_telemetry.model_used);
    
  } catch (error) {
    console.error("SDK Execution Failed:", error);
    // Add graceful degradation logic here
  }
}
```

### Example B: Fallback Arrays
In cases where a provider goes down, the SDK provides a mathematically sound `fallback_array` of models in the same capability bracket. If the initial budget model times out, iterate through the fallback array.

```typescript
const { fallback_array } = await router.getOptimalRouting('coding');
// fallback_array = ["google/gemini-flash-1.5", "meta/llama-3.1-70b-instruct", ...]
```

## Architectural Directives for the Agent
- **Never Hardcode Models**: Do not hardcode `anthropic/claude-3-opus` or `openai/gpt-4o`. You MUST route all primary LLM decisions through `router.execute()`.
- **Enforce Budget Restrictions**: `budget=yes` is the primary directive. `execute()` naturally prefers `smart_value` if it is present. To maximize intelligence on a budget, **always pass `cached_payload: true`** if passing large system prompts, as the mathematical discount unlocks extreme value.
- **Fail Gracefully**: Always wrap your router calls in `try/catch` logic. `execute()` has automatic fallbacks, but you must catch absolute network failures.
- **Client vs Server**: Only execute the `IntelligenceRouter` from protected Server Components / API Routes.
