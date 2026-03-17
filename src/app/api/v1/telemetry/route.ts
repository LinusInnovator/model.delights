import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Zero-Knowledge Incoming Schema
// We explicitly DO NOT accept 'prompt', 'messages', 'response', or 'api_key' fields.
const TelemetryIncomingSchema = z.object({
  model: z.string(),
  intent: z.string(),
  outcome: z.enum([
      'success', 
      'failed_schema', 
      'failed_timeout', 
      'failed_hallucination', 
      'failed_context_limit', 
      'user_rejected'
  ]),
  latency_ms: z.number().optional(),
  ttft_ms: z.number().optional()
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized. Missing SDK God Key." }, { status: 401 });
    }

    // We purposefully DO NOT check against process.env.INTERNAL_GOD_KEY here.
    // The telemetry endpoint is publicly accessible to any SDK user (they don't have god keys, only OpenRouter keys).
    // The authorization header is required to confirm they are using a standard SDK payload format.

    const body = await req.json();
    
    // Zod Stripping
    // If a developer accidentally passes { model: 'x', prompt: 'super secret phrase' },
    // Zod's parse() method will automatically strip 'prompt' out because it is not in the schema.
    const safePayload = TelemetryIncomingSchema.parse(body);

    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        ...safePayload
    };

    // For Phase 3 prototyping, append to a local JSON Lines (JSONL) file.
    // In production, this would stream directly to a Supabase Edge table or Clickhouse.
    const dbPath = path.join(process.cwd(), 'src/data/telemetry_db.jsonl');
    
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(dbPath, JSON.stringify(logEntry) + '\n');

    return NextResponse.json({ status: "acknowledged" });
  } catch (error) {
    console.error("[Telemetry Gateway] Dropped invalid telemetry payload.", error);
    // Even if telemetry fails, we return 200/202 so we don't spam the downstream client's console
    return NextResponse.json({ status: "dropped_invalid_schema" }, { status: 400 });
  }
}
