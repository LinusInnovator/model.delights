import sqlite3
import json
import os
import time
import requests
from datetime import datetime
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # sources registry
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sources (
        source_id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        provider TEXT,
        base_url TEXT,
        crawl_method TEXT,
        authority_score REAL,
        freshness_score REAL,
        noise_score REAL,
        status TEXT
    )
    ''')

    # canonical entities (models, runtimes, etc) - now storing state for diffing
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS entities (
        entity_id TEXT PRIMARY KEY,
        canonical_provider TEXT,
        canonical_model_family TEXT,
        canonical_model_variant TEXT,
        pricing_prompt REAL,
        pricing_completion REAL,
        context_length INTEGER,
        status TEXT
    )
    ''')

    # aliases map
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS entity_aliases (
        alias TEXT PRIMARY KEY,
        entity_id TEXT,
        FOREIGN KEY(entity_id) REFERENCES entities(entity_id)
    )
    ''')

    # event log
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS detected_events (
        event_id TEXT PRIMARY KEY,
        source_id TEXT,
        event_type TEXT,
        entity_type TEXT,
        provider TEXT,
        entity_id TEXT,
        title TEXT,
        detected_at TEXT,
        source_confidence REAL,
        raw_data TEXT,
        verification_state TEXT
    )
    ''')

    # crawl runs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS crawl_runs (
        run_id TEXT PRIMARY KEY,
        source_id TEXT,
        started_at TEXT,
        status TEXT,
        items_found INTEGER,
        events_generated INTEGER
    )
    ''')
    
    conn.commit()
    return conn

def seed_p0_sources(conn):
    cursor = conn.cursor()
    sources = [
        ("openrouter_models_api", "OpenRouter Models API", "aggregator_catalog", "OpenRouter", "https://openrouter.ai/api/v1/models", "api", 0.88, 0.97, 0.09, "active"),
        ("anthropic_models_api", "Anthropic Models API", "first_party_api", "Anthropic", "https://api.anthropic.com/v1/models", "api", 0.99, 0.96, 0.02, "active"),
        ("groq_models_api", "Groq Models API", "aggregator_catalog", "Groq", "https://api.groq.com/openai/v1/models", "api", 0.90, 0.95, 0.05, "active")
    ]
    for src in sources:
        cursor.execute('''
        INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', src)
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

def crawl_openrouter(conn):
    print("[Ingest] Crawling OpenRouter (P0) for state diffs...")
    try:
        res = requests.get("https://openrouter.ai/api/v1/models")
        if res.status_code != 200:
            print("[Ingest] OpenRouter API failed.")
            return

        data = res.json().get('data', [])
        cursor = conn.cursor()
        
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = len(data)

        for model in data:
            ext_id = model.get('id')
            provider = ext_id.split('/')[0] if '/' in ext_id else "Unknown"
            title = model.get('name', ext_id)
            
            # Extract current state metrics
            try:
                curr_prompt = float(model.get('pricing', {}).get('prompt', 0.0))
                curr_comp = float(model.get('pricing', {}).get('completion', 0.0))
            except:
                curr_prompt, curr_comp = 0.0, 0.0
                
            curr_ctx = int(model.get('context_length', 0))
            
            # Check if this entity is known
            cursor.execute("SELECT entity_id FROM entity_aliases WHERE alias = ?", (ext_id,))
            alias_row = cursor.fetchone()
            
            if not alias_row:
                # 1. NEW MODEL DETECTED
                entity_id = f"ent_{str(uuid.uuid4())[:8]}"
                cursor.execute('''
                INSERT INTO entities (entity_id, canonical_provider, canonical_model_family, canonical_model_variant, pricing_prompt, pricing_completion, context_length, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
                ''', (entity_id, provider, title, ext_id, curr_prompt, curr_comp, curr_ctx))
                
                cursor.execute('INSERT INTO entity_aliases (alias, entity_id) VALUES (?, ?)', (ext_id, entity_id))
                
                log_event(cursor, "openrouter_models_api", "model_added", provider, ext_id, f"New Model Added: {title}", model, started_at)
                events_generated += 1
            else:
                # 2. KNOWN MODEL -> Diff State
                entity_id = alias_row[0]
                cursor.execute("SELECT pricing_prompt, pricing_completion, context_length FROM entities WHERE entity_id = ?", (entity_id,))
                entity_state = cursor.fetchone()
                
                if entity_state:
                    db_prompt, db_comp, db_ctx = entity_state
                    
                    price_changed = False
                    cap_changed = False
                    events_messages = []
                    
                    # Diff Pricing
                    if db_prompt != curr_prompt or db_comp != curr_comp:
                        # Only log if it's not the exact same free tier or small float error
                        if abs(db_prompt - curr_prompt) > 0.0000001 or abs(db_comp - curr_comp) > 0.0000001:
                            price_changed = True
                            events_messages.append(f"Price Shift: P:${curr_prompt} C:${curr_comp}")
                            
                    # Diff Context Window expanding
                    if curr_ctx > 0 and db_ctx != curr_ctx:
                        cap_changed = True
                        events_messages.append(f"Context Change: {db_ctx} -> {curr_ctx}")
                        
                    if price_changed or cap_changed:
                        # Update the DB
                        cursor.execute('''
                        UPDATE entities SET pricing_prompt = ?, pricing_completion = ?, context_length = ? WHERE entity_id = ?
                        ''', (curr_prompt, curr_comp, curr_ctx, entity_id))
                        
                        event_type = "pricing_changed" if price_changed else "capability_changed"
                        log_event(cursor, "openrouter_models_api", event_type, provider, ext_id, f"State Change on {title}: {' | '.join(events_messages)}", model, started_at)
                        events_generated += 1

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "openrouter_models_api", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] Diffing complete! Processed {items_found} live models. Generated {events_generated} new atomic events.")
    except Exception as e:
        print(f"[Ingest] Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing Phase 1 Diff Engine...")
    conn = init_db()
    seed_p0_sources(conn)
    crawl_openrouter(conn)
    conn.close()
    print("[Ingest] Execution complete.")
