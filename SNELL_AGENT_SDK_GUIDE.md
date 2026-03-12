# Model Delights B2B SDK Integration Guide
**Target Audience**: AI Developer Agent (Antigravity/Cursor) working on the Snell Project.

## Context
You are integrating the `@model-delights/router` Universal SDK into the Snell codebase. This SDK acts as an intelligent middleware Gateway. Instead of hardcoding LLM API strings (which change constantly) and trying to route requests yourself, you will query this SDK. It mathematically evaluates the global AI market in real-time and returns the absolute best, most cost-effective model for the given intent.

This SDK is securely locked behind a bearer token API Gateway running on `model.delights.pro` (or locally on port 3000). To avoid incurring the standard $99/mo B2B API consumption costs for our internal Snell project, we are using a dedicated `INTERNAL_GOD_KEY` to bypass billing.

## 1. Installation Environment
The built SDK is currently sitting in a local workspace directory on this machine. You need to install it directly via the filesystem rather than the public NPM registry.

**Command to execute:**
```bash
npm install "/Users/linus/Library/Mobile Documents/com~apple~CloudDocs/projects/Dream Validator/Prototrying.com/Prototryers/antigravity/OR-rates/openrate-nextjs/packages/sdk"
```
*(Note: adjust the relative path if necessary based on Snell's Next.js root folder location).*

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
import { IntelligenceRouter } from '@model-delights/router';

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
import { IntelligenceRouter } from '@model-delights/router';

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

## Architectural Directives for the Agent
- **Never Hardcode Models**: Do not hardcode `anthropic/claude-3-opus` or `openai/gpt-4o` into the Snell codebase. You MUST route all primary LLM decisions through `router.getTopModel()` to ensure Snell's margins remain optimized against market fluctuations.
- **Fail Gracefully**: Always wrap your router calls in `try/catch` logic. If the API Gateway is temporarily unreachable, maintain a hard-coded fallback (e.g. `anthropic/claude-3.5-sonnet`) so the Snell application doesn't crash.
- **Client vs Server**: Only execute the `IntelligenceRouter` from protected Server Components / API Routes to prevent leaking the `INTERNAL_GOD_KEY` to the browser.
