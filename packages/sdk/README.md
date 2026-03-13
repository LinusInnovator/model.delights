# model-delights-snell 

> **White-Box Mathematical Routing for B2B AI Agents.**

Save up to 60% on your LLM API bills without sacrificing intelligence. The Snell SDK provides deterministic, ELO-based routing recommendations *before* you send a prompt.

## The Problem: Black-Box Routing
When you use a generic tool like `openrouter/auto`, you surrender control of your margins. The system reads your prompt, secretly selects an expensive flagship model, runs the inference, and bills you. You cannot predict the cost or define the exact intelligence tradeoff.

## The Solution: Mathematical Pre-Flight
Snell is a **White-Box** routing engine. We do not execute prompts. Instead, you query our SDK with an intent (e.g., `'reasoning'`), and we mathematically evaluate the entire OpenRouter market against live LMSys Chatbot Arena ELO data in under 20ms.

We return the **Global Flagship** *and* the **Smart Budget Alternative**, allowing you to protect your profit margins dynamically.

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
    // 1. Ask Snell for the best math on a specific task
    // Valid intents: 'reasoning', 'coding', 'drafting', 'vision', 'agentic'
    const routing = await router.getOptimalRouting('reasoning');

    console.log(`Global Flagship: ${routing.flagship.model}`);
    // Output: anthropic/claude-3.5-sonnet

    if (routing.smart_value) {
        console.log(`Budget Alternative: ${routing.smart_value.model}`);
        // Output: google/gemini-flash-1.5
        
        console.log(`The Math: ${routing.smart_value.financial_tradeoff}`);
        // Output: "12.5x cheaper for a -4.2% intelligence drop"
    }

    console.log(`Safe Fallback Chain: ${routing.fallback_array.join(', ')}`);
    // Output: anthropic/claude-3.5-sonnet, google/gemini-flash-1.5, openai/gpt-4o-mini
}
```

## Margin Protection Tactics
Because Snell is a pre-flight check, you can use the math to build dynamic business logic directly into your app.

### Example: Tiered Execution
```typescript
let modelId = routing.smart_value.model; // Default to the 12.5x cheaper model

// If the user paid for a Premium subscription, upgrade them to the Flagship
if (user.subscription === 'PRO') {
    modelId = routing.flagship.model;
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

## Security & Privacy
Because Snell is a pre-flight routing calculator, **we never see your user's prompts or data.** You only send us the *intent category* (e.g., 'coding'), and we return the model names. You handle the actual AI execution directly with OpenRouter on your own servers.
