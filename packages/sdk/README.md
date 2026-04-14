# model-delights-snell 

> **White-Box Mathematical Routing for B2B AI Agents.**

Save up to 60% on your LLM API bills without sacrificing intelligence. The Snell SDK provides deterministic, ELO-based routing recommendations *before* you send a prompt.

## The Problem: Black-Box Routing
When you use a generic tool like `openrouter/auto`, you surrender control of your margins. The system reads your prompt, secretly selects an expensive flagship model, runs the inference, and bills you. You cannot predict the cost or define the exact intelligence tradeoff.

## The Solution: Mathematical Pre-Flight
Snell is a **White-Box** routing engine. We do not execute prompts. Instead, you query our SDK with an intent (e.g., `'reasoning'`), and we mathematically evaluate the entire OpenRouter market against live LMSys Chatbot Arena ELO data in under 20ms.

We return the **Global Flagship** *and* the **Smart Budget Alternative**, allowing you to protect your profit margins dynamically.

### Visual Architecture Configurator
Hate writing code? Design your entire microservice routing topology visually via the [Snell Configurator](https://model.delights.pro/configurator). 
Use the **Autonomous Architect** prompt to describe your use case in natural language, visually review the LIVE routing math, and instantly export a `snell.config.json` directly into your repo.

---

## Installation

```bash
npm install model-delights-snell
```

## Quick Start
You must obtain a B2B API Key from the [Enterprise Dashboard](https://model.delights.pro/enterprise) to authenticate.

```typescript
import { IntelligenceRouter } from 'model-delights-snell';

const router = new IntelligenceRouter({
  apiKey: process.env.SNELL_API_KEY // e.g., sk_snell_xxxxxxxx
});

async function main() {
    // 1. Ask Snell for the best math based natively on capabilities and intent
    // Valid intents: 'reasoning', 'coding', 'drafting', 'vision', 'agentic'
    const route = await router.getTopModel({
        intent: 'agentic',            
        estimatedInputTokens: 85000, 
        capabilities: ['text'],       
        // Options: 'max_quality', 'balanced', 'max_savings'
        // NOTE: 'max_savings' GUARANTEES the absolute cheapest capable model globally!
        policy: 'max_savings'        
    });

    console.log(`Global Flagship: ${route.flagship.model}`);
    // Output: openai/gpt-4o-2024-08-06

    if (route.smart_value) {
        console.log(`Budget Alternative: ${route.smart_value.model}`);
        // Output: openai/gpt-4o-mini-search-preview
        
        console.log(`The Math: ${route.smart_value.financial_tradeoff}`);
        // Output: "16.7x cheaper for a -0.2% intelligence drop"
    }

    console.log(`Safe Fallback Chain: ${route.fallback_array.join(', ')}`);
}
```

## Autonomous Execution Wrapper
Snell also provides an `execute()` method that autonomously calculates the optimal route, natively constructs the payload, runs it securely via OpenRouter using *your* keys, and cascades down through fallbacks silently on error:

```typescript
const response = await router.execute({
    openrouterKey: process.env.OPENROUTER_API_KEY,  // Executes locally for Control Plane Privacy
    messages: [ { role: 'user', content: 'Extract the entities...' } ],
    config: {
        intent: 'reasoning',
        policy: 'max_quality',
        capabilities: ['text'] // Prevents non-structured models from hanging execution
    },
    timeout_ms_max_per_model: 15000,
});
```

## Margin Protection Tactics
Because Snell is a pre-flight check, you can use the math to build dynamic business logic directly into your app.

### Example: Tiered Execution
```typescript
let modelId = route.smart_value.model; // Default to the 16x cheaper model

// If the user paid for a Premium subscription, upgrade them to the Flagship
if (user.subscription === 'PRO') {
    modelId = route.flagship.model;
}

// Now securely execute the request on your own OpenRouter instance
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "Write a React component" }]
    })
});
```

## Security & Privacy: The Dual-Key Architecture
Because Snell is a pre-flight routing calculator, **we operate a Zero-Knowledge Control Plane.** 

Why do we require two separate API Keys?
1. **The Snell `apiKey`**: Used exclusively to ping `model.delights.pro` for the mathematical routing logic.
2. **Your `openrouterKey`**: Used natively on *your machinery* to execute the LLM inference. 

We never see your user's prompts, we never view your vector data, and we do not charge your credit card for inferences. You handle the actual AI execution directly with OpenRouter on your own servers. We are just the air traffic control math engine.
