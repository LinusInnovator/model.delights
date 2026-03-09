import sqlite3
import json
import os
import time
import urllib.request
import ssl
from datetime import datetime
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def seed_fal_source(conn):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("fal_models_api", "Fal.ai Models API", "first_party_api", "fal.ai", "https://fal.ai/api/models", "api", 0.95, 0.95, 0.05, "active"))
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
        0.90, 
        json.dumps(raw_data), 
        "pending"
    ))

def crawl_fal(conn):
    print("[Ingest] Crawling Fal.ai (P0) for multimodal models...")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://fal.ai/api/models" 
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        data = json.loads(html)
        
        items = data.get('items', [])
        cursor = conn.cursor()
        
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = len(items)

        for model in items:
            ext_id = model.get('id')
            if not ext_id: continue
            
            provider = "fal.ai"
            title = model.get('title', ext_id)
            category = model.get('category', '').lower()
            
            # Extract current state metrics
            # Fal is flat fee or duration based, not prompt/completion tokens usually.
            # We will store pricing as 0.0 for token fields, and maybe parse pricingInfoOverride if needed.
            curr_prompt, curr_comp = 0.0, 0.0
            curr_ctx = 0
            
            # Map modalities based on category
            curr_mod_in, curr_mod_out = "text", "image" # Default assumption for Fal
            if "video" in category:
                curr_mod_out = "video"
            elif "audio" in category or "tts" in category or "voice" in category:
                curr_mod_out = "audio"
            
            if "image-to" in category or "video-to" in category:
                curr_mod_in = "image,text"

            # Check if this entity is known
            cursor.execute("SELECT entity_id FROM entity_aliases WHERE alias = ?", (ext_id,))
            alias_row = cursor.fetchone()
            
            if not alias_row:
                # 1. NEW MODEL DETECTED
                entity_id = f"ent_{str(uuid.uuid4())[:8]}"
                cursor.execute('''
                INSERT INTO entities (entity_id, canonical_provider, canonical_model_family, canonical_model_variant, pricing_prompt, pricing_completion, context_length, modalities_in, modalities_out, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                ''', (entity_id, provider, title, ext_id, curr_prompt, curr_comp, curr_ctx, curr_mod_in, curr_mod_out))
                
                cursor.execute('INSERT INTO entity_aliases (alias, entity_id) VALUES (?, ?)', (ext_id, entity_id))
                
                log_event(cursor, "fal_models_api", "model_added", provider, ext_id, f"New Multimodal Engine Added: {title}", model, started_at)
                events_generated += 1
            else:
                # 2. KNOWN MODEL -> Diff State (simplified for Fal since pricing is in sentences)
                # Just verify the modalities haven't shifted
                entity_id = alias_row[0]
                cursor.execute("SELECT modalities_in, modalities_out FROM entities WHERE entity_id = ?", (entity_id,))
                entity_state = cursor.fetchone()
                
                if entity_state:
                    db_mod_in, db_mod_out = entity_state
                    cap_changed = False
                    events_messages = []
                        
                    if (db_mod_in != curr_mod_in) or (db_mod_out != curr_mod_out):
                        cap_changed = True
                        events_messages.append(f"Modality Shift: In[{curr_mod_in}] Out[{curr_mod_out}]")
                        
                    if cap_changed:
                        cursor.execute('''
                        UPDATE entities SET modalities_in = ?, modalities_out = ? WHERE entity_id = ?
                        ''', (curr_mod_in, curr_mod_out, entity_id))
                        
                        event_type = "capability_changed"
                        log_event(cursor, "fal_models_api", event_type, provider, ext_id, f"State Change on {title}: {' | '.join(events_messages)}", model, started_at)
                        events_generated += 1

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "fal_models_api", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] Fal.ai processing complete! Processed {items_found} live models. Generated {events_generated} new atomic events.")
    except Exception as e:
        print(f"[Ingest] Fal.ai Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing Fal.ai Ingestion Engine...")
    conn = sqlite3.connect(DB_PATH)
    seed_fal_source(conn)
    crawl_fal(conn)
    conn.close()
    print("[Ingest] Fal.ai execution complete.")
