import sqlite3
import json
import os
import urllib.request
import ssl
from datetime import datetime
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def seed_anthropic_source(conn):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("anthropic_models_api", "Anthropic Models API", "first_party_api", "Anthropic", "https://api.anthropic.com/v1/models", "api", 0.99, 0.96, 0.02, "active"))
    conn.commit()

def log_event(cursor, source_id, event_type, provider, entity_id, title, raw_data, started_at):
    event_id = f"evt_{str(uuid.uuid4())}"
    cursor.execute('''
    INSERT INTO detected_events (event_id, source_id, event_type, entity_type, provider, entity_id, title, detected_at, source_confidence, raw_data, verification_state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        event_id, 
        source_id, 
        event_type, 
        "model", 
        provider, 
        entity_id, 
        title, 
        started_at, 
        0.99, # First party is extreme confidence
        json.dumps(raw_data), 
        "pending"
    ))

def crawl_anthropic(conn):
    print("[Ingest] Crawling Anthropic (P0) for native model detection...")
    
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        print("[Ingest] WARNING: ANTHROPIC_API_KEY not found in environment. Skipping.")
        return

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://api.anthropic.com/v1/models" 
        req = urllib.request.Request(url, headers={
            'x-api-key': anthropic_key,
            'anthropic-version': '2023-06-01'
        })
        
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        data = json.loads(html)
        
        items = data.get('data', [])
        cursor = conn.cursor()
        
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = len(items)

        for model in items:
            ext_id = model.get('id')
            if not ext_id: continue
            
            provider = "Anthropic"
            title = model.get('display_name', ext_id)
            
            # Anthropic's free /models endpoint typically just returns ID, type, and created_at.
            # Real pricing/context info isn't always in this exact metadata endpoint cleanly, 
            # so we use defaults as place-holders until the Evaluator node updates them.
            curr_prompt, curr_comp = 0.0, 0.0
            curr_ctx = 200000 # Claude 3 is standard 200k
            curr_mod_in, curr_mod_out = "text,image", "text"

            # Check if this entity is known
            # We must remember that Anthropic native IDs (e.g., 'claude-3-5-sonnet-20241022') 
            # might not perfectly match OpenRouter IDs ('anthropic/claude-3.5-sonnet'). 
            # This is exactly why the Canonical DB deduplication matters.
            cursor.execute("SELECT entity_id FROM entity_aliases WHERE alias = ?", (ext_id,))
            alias_row = cursor.fetchone()
            
            if not alias_row:
                # 1. NEW MODEL DETECTED
                entity_id = f"ent_{str(uuid.uuid4())[:8]}"
                cursor.execute('''
                INSERT INTO entities (entity_id, canonical_provider, canonical_model_family, canonical_model_variant, pricing_prompt, pricing_completion, context_length, modalities_in, modalities_out, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                ''', (entity_id, provider, title, ext_id, curr_prompt, curr_comp, curr_ctx, curr_mod_in, curr_mod_out))
                
                # Insert native alias
                cursor.execute('INSERT INTO entity_aliases (alias, entity_id) VALUES (?, ?)', (ext_id, entity_id))
                # Insert "anthropic/" prefixed alias to help match OpenRouter when it drops
                cursor.execute('INSERT INTO entity_aliases (alias, entity_id) VALUES (?, ?)', (f"anthropic/{ext_id}", entity_id))
                
                log_event(cursor, "anthropic_models_api", "model_added", provider, ext_id, f"First-Party Launch Detected: {title}", model, started_at)
                events_generated += 1
            else:
                # Known model natively - we could diff capabilities if the endpoint upgrades
                pass

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "anthropic_models_api", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] Anthropic processing complete! Processed {items_found} live native models. Generated {events_generated} new atomic events.")
    except Exception as e:
        print(f"[Ingest] Anthropic Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing Anthropic Native Ingestion Engine...")
    conn = sqlite3.connect(DB_PATH)
    seed_anthropic_source(conn)
    crawl_anthropic(conn)
    conn.close()
    print("[Ingest] Anthropic native execution complete.")
