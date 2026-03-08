import sqlite3
import json
import os
import uuid
from datetime import datetime
import urllib.request

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def call_llm_judge(model_a_info, model_b_info):
    """
    Uses OpenRouter (free/cheap tier) to ask if two model fragments refer to the exact same underlying model.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("[Merger] ERROR: OPENROUTER_API_KEY missing. Cannot run Canonical Merger.")
        return False
        
    prompt = f"""
    You are an expert AI Model Taxonomy Judge.
    Your job is to determine if Entity A and Entity B refer to the EXACT SAME underlying model family or version.

    Entity A:
    {json.dumps(model_a_info, indent=2)}

    Entity B:
    {json.dumps(model_b_info, indent=2)}

    Rules:
    - Return ONLY valid JSON.
    - If they are the same underlying intelligence (e.g. "Seaweed" rumor and "Seaweed-7B" release), is_same = true.
    - If they are the same model but just hosted on different providers (e.g. "AWS Bedrock Claude 3" and "Anthropic Claude 3"), is_same = true.
    - If they are different sizes/variants (e.g. "Llama 3 8B" vs "Llama 3 70B"), is_same = false (they are different intelligence tiers).
    - If you are unsure, is_same = false.

    Format:
    {{
      "is_same": boolean,
      "reasoning": "brief 1-sentence explanation",
      "canonical_name": "If same, what is the best official name for this model?"
    }}
    """
    
    # Use Haiku or Flash for fast, cheap $0.0001 judgments
    payload = {
        "model": "google/gemini-flash-1.5-8b", 
        "messages": [{"role": "user", "content": prompt}],
        "response_format": { "type": "json_object" }
    }
    
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        content = result['choices'][0]['message']['content']
        
        # Strip codeblocks and whitespace if the LLM hallucinated markdown
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
            
        decision = json.loads(content)
        
        # Safety fallback if it just returned a boolean literal instead of JSON struct
        if isinstance(decision, bool):
            return {"is_same": decision, "reasoning": "Fallback boolean literal parsed."}
            
        return decision
    except Exception as e:
        print(f"[Merger] LLM Call Failed: {e}")
        return {"is_same": False, "reasoning": "API Error"}

def process_pending_events(conn):
    cursor = conn.cursor()
    
    print("[Merger] Fetching pending un-merged atomic events...")
    # Get all events that theoretically need placing into a Canonical Entity bucket
    cursor.execute('''
        SELECT event_id, title, provider, entity_id, raw_data, source_id
        FROM detected_events 
        WHERE verification_state = 'pending'
    ''')
    pending_events = cursor.fetchall()
    
    if not pending_events:
        print("[Merger] No pending events found. Database is clean.")
        return

    # Get a list of known canonical entities to test against 
    # (In a real system you'd use TF-IDF or vector embeddings to find the top 5 candidates, 
    # but for this prototype we'll just check against recent entities)
    cursor.execute('''
        SELECT entity_id, canonical_provider, canonical_model_family, canonical_model_variant
        FROM entities
        ORDER BY rowid DESC LIMIT 50
    ''')
    known_entities = cursor.fetchall()
    
    processed = 0
    merged = 0
    
    for event in pending_events:
        event_id, title, provider, ext_id, raw_data_str, source = event
        
        # Skip events that don't look like models (e.g. deprecation announcements that aren't specific)
        if "Scout Signal" not in title and "Enterprise Deployment" not in title and "Emerging Research" not in title:
            continue
            
        print(f"\n[Merger] Analyzing pending event: {title}")
        event_info = {
            "title": title,
            "provider": provider,
            "source_type": source,
            "raw_data": json.loads(raw_data_str) if raw_data_str else {}
        }
        
        match_found = False
        target_entity_uid = None
        
        # LLM fuzzy match against recent known entities
        for entity in known_entities:
            ent_uid, c_provider, c_family, c_variant = entity
            entity_info = {
                "provider": c_provider,
                "model_family": c_family,
                "variant": c_variant
            }
            
            # Ask the LLM Brain
            decision = call_llm_judge(event_info, entity_info)
            
            # Unpack response safely
            is_same = False
            reasoning = "N/A"
            
            if isinstance(decision, dict):
                is_same = decision.get('is_same') is True
                reasoning = decision.get('reasoning', 'N/A')
            elif isinstance(decision, bool):
                is_same = decision
                reasoning = "Boolean True returned."
                
            if is_same:
                print(f"[Merger] => MATCH FOUND! Merging into '{c_variant}'")
                print(f"[Merger] => Reasoning: {reasoning}")
                match_found = True
                target_entity_uid = ent_uid
                break
                
        if match_found:
            # 1. Add Alias mapping
            cursor.execute("INSERT OR IGNORE INTO entity_aliases (alias, entity_id) VALUES (?, ?)", (ext_id, target_entity_uid))
            # 2. Update Event as merged
            cursor.execute("UPDATE detected_events SET verification_state = 'verified' WHERE event_id = ?", (event_id,))
            merged += 1
        else:
            print("[Merger] => No match. Creating NEW canonical entity.")
            # 3. Create NEW Canonical Entity bucket
            new_uid = f"ent_{str(uuid.uuid4())}"
            cursor.execute('''
                INSERT INTO entities (entity_id, canonical_provider, canonical_model_family, canonical_model_variant, status)
                VALUES (?, ?, ?, ?, ?)
            ''', (new_uid, provider, title, title, "active"))
            
            # Map alias to new bucket
            cursor.execute("INSERT INTO entity_aliases (alias, entity_id) VALUES (?, ?)", (ext_id, new_uid))
            # Set event as verified
            cursor.execute("UPDATE detected_events SET verification_state = 'verified' WHERE event_id = ?", (event_id,))
            
        processed += 1
        conn.commit()

    print(f"\n[Merger] Processed {processed} events. Merged {merged} aliases. Created {processed - merged} new canonical entities.")


if __name__ == "__main__":
    print("[Merger] Initializing Canonical Identity Brain...")
    conn = sqlite3.connect(DB_PATH)
    process_pending_events(conn)
    conn.close()
    print("[Merger] Execution complete.")
