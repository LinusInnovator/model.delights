import { IntelligenceRouter } from './dist/index.js';

async function testSDK() {
  console.log("Initializing SDK with God Key...");
  const router = new IntelligenceRouter({ 
    apiKey: "super_secret_snell_key_123",
    baseUrl: "http://localhost:3000" 
  });

  try {
    console.log("1. Testing getTopModel('coding')...");
    const topModel = await router.getTopModel('coding');
    console.log("✅ Success! Best coding model:", topModel.recommended_model);
    console.log("   Fallback Array:", topModel.fallback_array);

    console.log("\n2. Testing resolve('claude opus')...");
    const resolved = await router.resolve('claude opus');
    console.log("✅ Success! Resolved ID:", resolved.exact_id);
    
  } catch (err) {
    console.error("❌ SDK Test Failed:", err);
  }
}

testSDK();
