import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'intelligence_dump.json')

def export_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Global providers
    cursor.execute("SELECT DISTINCT provider FROM detected_events WHERE source_id = 'litellm_global_map' AND provider IS NOT NULL")
    global_providers = [row[0] for row in cursor.fetchall()]

    # 2. Entities
    cursor.execute("SELECT entity_id, canonical_model_variant, pricing_prompt, pricing_completion, modalities_in, modalities_out FROM entities WHERE status = 'active'")
    entities = []
    
    for row in cursor.fetchall():
        ent_uid = row[0]
        model_id = row[1]
        
        cursor.execute('''
            SELECT DISTINCT e.source_id, a.alias, e.provider
            FROM detected_events e
            JOIN entity_aliases a ON (e.entity_id = a.entity_id OR e.entity_id = a.alias)
            WHERE a.entity_id = ?
        ''', (ent_uid,))
        
        events = [{"source_id": e[0], "alias": e[1], "provider": e[2]} for e in cursor.fetchall()]
        
        entities.append({
            "entity_id": ent_uid,
            "model_id": model_id,
            "pricing_prompt": row[2] or 0.0,
            "pricing_completion": row[3] or 0.0,
            "modalities_in": row[4] or "",
            "modalities_out": row[5] or "",
            "events": events
        })

    conn.close()

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump({
            "global_providers": global_providers,
            "entities": entities
        }, f, indent=2)

    print("Exported intelligence.db to intelligence_dump.json")

if __name__ == "__main__":
    export_db()
