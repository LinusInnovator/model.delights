"use server";

import { IntelligenceRouter } from 'model-delights-snell';

export async function getOptimalWriterModel() {
  try {
    const router = new IntelligenceRouter({
      apiKey: process.env.INTERNAL_GOD_KEY || "super_secret_snell_key_123",
      baseUrl: process.env.MODEL_DELIGHTS_BASE_URL || "https://model.delights.pro"
    });
    
    const routingData = await router.getTopModel('writing') as any;
    
    const smart = routingData.smart_value || routingData.flagship;
    const fallback = routingData.flagship;
    
    return {
      success: true,
      flagship: fallback?.model || "anthropic/claude-3.5-sonnet",
      smartValue: smart?.model || "anthropic/claude-3-haiku",
      tradeoff: smart?.financial_tradeoff || (fallback?.name ? `Provider: ${fallback.name}` : undefined)
    };
  } catch (error: any) {
    console.error("SDK Server Action Error:", error.message);
    // Graceful fallback if the API gateway is unreachable locally
    return {
      success: true,
      flagship: "anthropic/claude-3.5-sonnet",
      smartValue: "anthropic/claude-3-haiku",
      tradeoff: "20x cheaper for -5% intelligence drop",
      isFallback: true
    };
  }
}
