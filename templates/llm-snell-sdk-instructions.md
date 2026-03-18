# LLM Initialization Package: Integrating the Snell SDK 
**System Prompt Instructions:** Read this document strictly. You are integrating the `model-delights-snell` Universal SDK into a new Node.js/TypeScript service. This is NOT a standard `openrouter/auto` integration. It is a White-Box Mathematical Pre-Flight routing engine that protects our margins by calculating real-time ELO arbitrage models before fetching.

## 1. Installation Environment
You must install the Snell package from the public NPM registry.
```bash
npm install model-delights-snell
```

## 2. Injected Environment Variables 
You require TWO specific access keys to properly spin up the Engine. The **GOD key** (Internal Bypass API) and the **OpenRouter Execution Key** for the actual LLM fetch fallback. 

Add these exactly as formatted to your service's `.env.local` or `.env` file:
```env
# Authenticate against Snell's White-Box Model Router
INTERNAL_GOD_KEY=super_secret_snell_key_123

# Default URL for Snell Resolution (Staging/Production)
MODEL_DELIGHTS_BASE_URL=https://model.delights.pro

# The Execution Fallback Array API Key
OPENROUTER_API_KEY=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
```

## 3. Implementation Patterns (TypeScript Server-Side)
The SDK is fully isomorphic and exposes native TypeScript definitions. You should instantiate the `IntelligenceRouter` inside Edge Handlers, Server Actions, or backend workers.

### Autonomous Execution Wrapper (Phase 4 Developer Experience)
Do NOT manually fetch from OpenRouter unless specifically requested. Use the `execute()` wrapper. It autonomously calculates the mathematical route, injects Snell headers, and silently cascades to fallbacks if the primary model rate-limits.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

const router = new IntelligenceRouter({
  apiKey: process.env.INTERNAL_GOD_KEY!,
  baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
});

export async function executeAutonomousQuery(messages: any[]) {
  try {
    const result = await router.execute({
      messages,
      openrouterKey: process.env.OPENROUTER_API_KEY!,
      config: { 
          intent: 'reasoning', // Options: 'coding', 'reasoning', 'vision', 'agentic'
          policy: 'balanced', // Options: 'balanced', 'max_savings', 'low_latency'
          cached_payload: true // MUST pass true if passing massive reusable RAG system prompts
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

## Architectural Directives for the Agent
- **Never Hardcode Models**: Do not hardcode `anthropic/claude-3-opus` or `openai/gpt-4o`. You MUST route all primary LLM decisions through `router.execute()`.
- **RAG & Context Caching**: If your payload includes massive, reused system prompts, you MUST pass `cached_payload: true`.
- **Client vs Server**: Only execute the `IntelligenceRouter` from protected Server Components or API Routes to protect the keys.
