import sqlite3
import json
import os
import urllib.request
import ssl
from datetime import datetime
import uuid

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def seed_bedrock_source(conn):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("aws_bedrock_models", "AWS Bedrock Supported Models", "cloud_catalog", "Amazon AWS", "https://aws.amazon.com/bedrock/pricing/", "page_diff", 0.95, 0.74, 0.04, "active"))
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
        0.88, # Cloud Availability confidence
        json.dumps(raw_data), 
        "pending"
    ))

def crawl_bedrock(conn):
    print("[Ingest] Crawling AWS Bedrock (P1) for enterprise cloud deployability signals...")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        # AWS Bedrock Pricing data contains models available.
        url = "https://aws.amazon.com/api/dirs/items/search?item.directoryId=bedrock-pricing&sort_by=item.additionalFields.SortOrder&sort_order=asc&size=500"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        json_data = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        
        data = json.loads(json_data)
        items = data.get('items', [])
        
        cursor = conn.cursor()
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = len(items)

        for model in items:
            fields = model.get('item', {}).get('additionalFields', {})
            ext_id = fields.get('ModelId')
            if not ext_id: continue
            
            provider = fields.get('Provider', 'AWS')
            title = fields.get('ModelName', ext_id)
            
            # Check if this entity is known
            cursor.execute("SELECT entity_id FROM entity_aliases WHERE alias = ?", (ext_id,))
            alias_row = cursor.fetchone()
            
            if not alias_row:
                # 1. NEW MODEL DETECTED ON CLOUD CATALOG
                raw_data = {
                    "provider": provider,
                    "title": title,
                    "ext_id": ext_id
                }
                
                log_event(cursor, "aws_bedrock_models", "cloud_available", "Amazon AWS", ext_id, f"Enterprise Deployment Unlock: {provider} {title}", raw_data, started_at)
                events_generated += 1
            else:
                pass

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "aws_bedrock_models", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] AWS Bedrock processing complete! Processed {items_found} catalog items. Generated {events_generated} new cloud release events.")
    except Exception as e:
        print(f"[Ingest] AWS Bedrock Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing P1 Cloud Catalog Engine...")
    conn = sqlite3.connect(DB_PATH)
    seed_bedrock_source(conn)
    crawl_bedrock(conn)
    conn.close()
    print("[Ingest] AWS Bedrock execution complete.")
