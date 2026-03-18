# Model Delights B2B SDK Integration Guide
**Target Audience**: AI Developer Agent (Antigravity/Cursor) working on the Snell Project.

## Context
You are integrating the `model-delights-snell` Universal SDK into the Snell codebase. 

### Critical Architecture Note: "White-Box" vs OpenRouter Auto
Do not confuse this SDK with setting a model string to `openrouter/auto`. OpenRouter Auto is a **Black Box Execution** environment—it analyzes the prompt, chooses a model secretly, runs the inference, and bills the account without giving you a chance to control profit margins. 

The Snell SDK is a **White-Box Mathematical Pre-Flight Check**. It does *not* execute prompts. It queries our backend to mathematically evaluate the global AI market in real-time based on LMSys ELO scores. It returns a bifurcated payload containing the absolute Best model (Flagship) AND the smartest, most cost-effective alternative (Smart Value) along with the exact mathematically calculated financial tradeoff *before* you execute the prompt yourself.

This SDK is securely locked behind a bearer token API Gateway running on `model.delights.pro` (or locally on port 3000). To avoid incurring the standard $99/mo B2B API consumption costs for our internal Snell project, we are using a dedicated `INTERNAL_GOD_KEY` to bypass billing.

## 1. Installation Environment
You must install the Snell package from the public NPM registry.

**Command to execute:**
```bash
npm install model-delights-snell
```

## 2. Environment Variables
You must inject the God Key into Snell's `.env.local` to securely authenticate against the API Gateway.

```env
# Bypass billing for the Model Delights Universal Router
INTERNAL_GOD_KEY=super_secret_snell_key_123

# The API Gateway URL (Points to production gateway)
MODEL_DELIGHTS_BASE_URL=https://model.delights.pro
```

## 3. Implementation Patterns (TypeScript Server-Side)
The SDK is fully isomorphic and exposes native TypeScript definitions. You should instantiate the `IntelligenceRouter` inside Snell's Edge Handlers, Server Actions, or Node/Python backend workers before making any actual OpenRouter API calls.

### Example A: Dynamic Intent Routing
Use this when you want to execute a specific task (like coding, drafting, or vision) and want the engine to dynamically return the absolute best model available on the market right now.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

// 1. Initialize the Router
const router = new IntelligenceRouter({
  apiKey: process.env.INTERNAL_GOD_KEY!,
  baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
});

export async function executeSnellTask() {
  try {
    // 2. Query the engine for the best "reasoning" model
    // Valid intents include: 'reasoning', 'agentic', 'classification', 'conversational', 'coding', etc.
    const routingData = await router.getOptimalRouting('reasoning');
    
    console.log("Maximum Intelligence Flagship:", routingData.flagship.model);
    
    // 3. Evaluate the Tradeoff dynamically
    if (routingData.smart_value) {
      console.log("Budget Alternative:", routingData.smart_value.model);
      console.log("Tradeoff Math:", routingData.smart_value.financial_tradeoff); // e.g. "5.0x cheaper for -4.0% intelligence drop"
    }
    
    console.log("Wide Safety Fallback Array if Down:", routingData.fallback_array);
    
    // 4. (Snell Execution) Feed `routingData.smart_value.model` naturally to your OpenRouter SDK if budget-conscious
    
  } catch (error) {
    console.error("SDK Routing Failed:", error);
    // Add graceful degradation logic here
  }
}
```

### Example B: Fuzzy String Resolution
Use this if the Snell user types a hallucinated or fuzzy model name (like "claude opus" or "gpt-4 fast") and you need to mathematically resolve it to the exact, copy-pasteable API string required by OpenRouter.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

const router = new IntelligenceRouter({
  apiKey: process.env.INTERNAL_GOD_KEY!,
  baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
});

export async function resolveUserInput(humanQuery: string) {
  try {
    // Will translate something like "claude opus" into "anthropic/claude-opus-4.6"
    const resolved = await router.resolve(humanQuery);
    
    console.log("Resolved API String:", resolved.exact_id);
    console.log("Confidence Score:", resolved.confidence);
    console.log("Recommended Fallbacks:", resolved.safe_fallback);
    
  } catch (error) {
    console.error("Fuzzy Resolution Failed:", error);
  }
}
```

### Example C: The Autonomous Execution Wrapper (Phase 4 DX)
Instead of manually fetching from OpenRouter (Example A), you can use the `execute()` wrapper. It autonomously calculates the mathematical route, injects Snell headers, fetches securely from your server, and silently cascades to fallbacks if the primary model rate-limits.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

const router = new IntelligenceRouter({
  apiKey: process.env.INTERNAL_GOD_KEY!,
  baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
});

export async function executeAutonomousQuery(messages: any[], openRouterKey: string) {
  try {
    const result = await router.execute({
      messages,
      openrouterKey: openRouterKey, // Passed from user/client
      config: { 
          intent: 'reasoning',
          policy: 'balanced', 
          cached_payload: true // VERY IMPORTANT: If true, drastically discounts models like Claude 3.5 Sonnet
      },
      // Native Structured JSON Support
      response_format: { type: 'json_object' },
      // Strict Vercel Serverless Timeout Preemption
      timeout_ms_max_per_model: 8000,
      // OpenRouter Native Property Overrides (max_tokens safely capped at 8192 internally)
      openrouter_overrides: {
          temperature: 0.2
      }
    });
    
    // Result payload matches standard OpenAI syntax
    console.log("LLM Response:", result.choices[0].message.content);
    console.log("Telemetry (Which model actually won?):", result._snell_telemetry);
    
  } catch (error) {
    console.error("All fallback models failed execution:", error);
  }
}
```

### Example D: Zero-Knowledge Telemetry
If you implement autonomous execution manually without `execute()`, you MUST ping the Global Matrix to strengthen the enterprise moat if your execution fails (e.g., Zod schema parsing failure).

```typescript
await router.reportTelemetry({
    model: "anthropic/claude-3-haiku",
    intent: "json-extraction",
    outcome: "failed_schema", // 'success', 'failed_timeout', 'user_rejected'
    latency_ms: 1540
}); // Asynchronous, non-blocking
```

## Architectural Directives for the Agent
- **Never Hardcode Models**: Do not hardcode `anthropic/claude-3-opus` or `openai/gpt-4o` into the Snell codebase. You MUST route all primary LLM decisions through `router.getTopModel()` or `router.execute()`.
- **RAG & Context Caching**: If your payload includes massive, reused system prompts, you MUST pass `cached_payload: true` in the config. This alerts the mathematical engine to 80% pricing discounts, unlocking flagship models that normally wouldn't survive budget checks. 
- **Fail Gracefully**: If not using `.execute()`, wrap your router calls in `try/catch`.
- **Client vs Server**: Only execute the `IntelligenceRouter` from protected Server Components / API Routes.
