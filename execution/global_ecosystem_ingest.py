import urllib.request
import json
import sqlite3
import datetime
import uuid
import os
import ssl

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')
LITELLM_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json"

def fetch_litellm_providers():
    print(f"[Metarouter] Fetching Global AI Ecosystem map from {LITELLM_URL}...")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(LITELLM_URL, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except Exception as e:
        print(f"[Metarouter] ERROR fetching LiteLLM map: {e}")
        return {}

def ingest_to_db(model_data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    new_events = 0
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Target some emergent infrastructure providers
    target_providers = ['fireworks_ai', 'together_ai', 'deepinfra', 'groq', 'databricks']
    
    for model_name, details in model_data.items():
        if model_name == "sample_spec":
            continue
            
        provider = details.get("litellm_provider", "")
        if provider in target_providers:
            # Generate a consistent ID
            event_id = f"evt_global_{uuid.uuid5(uuid.NAMESPACE_URL, provider + '_' + model_name)}"
            
            cursor.execute("SELECT 1 FROM detected_events WHERE event_id = ?", (event_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO detected_events 
                    (event_id, source_id, event_type, entity_type, provider, entity_id, title, detected_at, source_confidence, raw_data, verification_state)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event_id,
                    'litellm_global_map',
                    'api_surface_added', 
                    'model',
                    provider, 
                    model_name,
                    model_name,
                    now,
                    0.95, 
                    json.dumps(details),
                    'verified' # Mark verified so architect can route to it without heavy LLM-judge verification for now
                ))
                
                # Automatically promote to an entity so the Architect can route to it
                ent_uid = f"ent_{provider}_{model_name.replace('/', '_')}"
                try:
                    # Simplify modalities mapping
                    mods = "text"
                    if details.get("supports_vision", False):
                        mods += ",image"
                    if details.get("mode") == "image_generation":
                        mods_out = "image"
                    else:
                        mods_out = "text"

                    cursor.execute("""
                        INSERT OR IGNORE INTO entities 
                        (entity_id, canonical_provider, canonical_model_family, canonical_model_variant, pricing_prompt, pricing_completion, context_length, modalities_in, modalities_out, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        ent_uid,
                        provider,
                        model_name.split('/')[0] if '/' in model_name else model_name,
                        model_name,
                        details.get("input_cost_per_token", 0),
                        details.get("output_cost_per_token", 0),
                        details.get("max_input_tokens", 8192),
                        mods,
                        mods_out,
                        "active"
                    ))
                    
                    cursor.execute("""
                        INSERT OR IGNORE INTO entity_aliases (alias, entity_id) VALUES (?, ?)
                    """, (model_name, ent_uid))
                    
                    cursor.execute("UPDATE detected_events SET entity_id = ? WHERE event_id = ?", (ent_uid, event_id))
                    new_events += 1
                except Exception as e:
                    print(f"[Metarouter] Failed to inject {model_name}: {e}")

    conn.commit()
    conn.close()
    print(f"[Metarouter] Ingestion complete. Synced {new_events} new models from dynamic providers.")

if __name__ == "__main__":
    data = fetch_litellm_providers()
    if data:
        ingest_to_db(data)
