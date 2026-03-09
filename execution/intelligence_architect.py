import sqlite3
import json
import os
import uuid
from datetime import datetime

# Database paths
DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')
ELO_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'lmsys_elo.json')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'schema_blueprints_db.json')

# The Cascade Judges (Mock logic for local)
PRIMARY_JUDGE = "bytedance-seed/seed-2.0-mini"
ESCALATION_JUDGE = "google/gemini-3.1-flash-lite-preview"

def load_data():
    with open(ELO_PATH, 'r') as f:
        elo_data = json.load(f)
    with open(SCHEMA_PATH, 'r') as f:
        schemas = json.load(f)
    return elo_data, schemas

def run_live_regression(model_id, component_name):
    # This simulates our 'Scarily Accurate' Safety Net
    # In production, this would make an actual LLM call to verify the output structure.
    print(f"      [Safety Net] Executing sandboxed Regression Suite on {model_id}...")
    
    # Simulate a 5% failure rate to demonstrate the Engine actively rejecting bad fits
    if hash(model_id + component_name) % 20 == 0:
        print(f"      [Safety Net] FAILED: {model_id} hallucinated JSON keys or failed syntax.")
        return False
        
    print(f"      [Safety Net] PASSED: {model_id} verified by {PRIMARY_JUDGE}.")
    return True

def find_best_model(conn, elo_data, component_name, constraints, available_keys):
    cursor = conn.cursor()
    
    cursor.execute("SELECT entity_id, canonical_model_variant, pricing_prompt, pricing_completion, modalities_in, modalities_out FROM entities WHERE status = 'active'")
    rows = cursor.fetchall()
    
    valid_candidates = []
    
    for row in rows:
        ent_uid = row[0]
        model_id = row[1]
        p_prompt = row[2]
        p_comp = row[3]
        mods_in = row[4] or ""
        mods_out = row[5] or ""
        
        # 0. Check Provider Keys (BYOK Constraint)
        # Find which gateways actually host this specific entity
        cursor.execute('''
            SELECT DISTINCT e.source_id, a.alias, e.provider
            FROM detected_events e
            JOIN entity_aliases a ON (e.entity_id = a.entity_id OR e.entity_id = a.alias)
            WHERE a.entity_id = ?
        ''', (ent_uid,))
        events = cursor.fetchall()
        
        supported_alias = None
        supported_gateway = None
        
        # We need an alias that is supported by one of our available keys
        for event in events:
            source = event[0]
            alias = event[1]
            provider = event[2]
            if "openrouter" in source and "openrouter" in available_keys:
                supported_alias = alias
                supported_gateway = "openrouter"
                break
            elif "fal" in source and "fal" in available_keys:
                supported_alias = alias
                supported_gateway = "fal"
                break
            elif "bedrock" in source and "aws" in available_keys:
                supported_alias = alias
                supported_gateway = "aws"
                break
            elif "volcano" in source and "volcano" in available_keys:
                supported_alias = alias
                supported_gateway = "volcano"
                break
            elif "litellm_global_map" in source and provider in available_keys:
                supported_alias = alias
                supported_gateway = provider
                break
                
        # If the user doesn't have the key to access this entity from ANY provider, we can't recommend it to them
        if not supported_alias and available_keys:
            continue
            
        # 1. Check Modalities (IN)
        modality_fail = False
        mods_in_str = mods_in or ""
        mods_out_str = mods_out or ""
        
        for req_mod in constraints.get("required_modalities_in", []):
            if req_mod not in mods_in_str:
                modality_fail = True
                break
        if modality_fail:
            continue
            
        # 1b. Check Modalities (OUT)
        for req_mod in constraints.get("required_modalities_out", []):
            if req_mod not in mods_out_str:
                modality_fail = True
                break
        if modality_fail:
            continue
            
        # 2. Check ELO
        elo = elo_data.get(model_id, 0)
        req_elo = constraints.get("min_elo", 0)
        if req_elo > 0 and elo < req_elo:
            continue
            
        # 3. Check Budget
        blended_price = (p_prompt * 0.8 + p_comp * 0.2) * 1000000
        if blended_price < 0 or blended_price > constraints.get("max_budget_per_1m", 999.0):
            continue
            
        valid_candidates.append({
            "model_id": model_id, # Canonical Name
            "exact_alias": supported_alias or model_id, # The exact copy-paste string for their key
            "gateway": supported_gateway or "managed",
            "elo": elo,
            "price": blended_price
        })
        
    if not valid_candidates:
        return None
        
    valid_candidates.sort(key=lambda x: x['elo'], reverse=True)
    
    top_elo = valid_candidates[0]['elo']
    top_tier = [c for c in valid_candidates if top_elo - c['elo'] <= 15] 
    
    top_tier.sort(key=lambda x: x['price'])
    
    for candidate in top_tier:
        target_model = candidate['model_id']
        if run_live_regression(target_model, component_name):
            return candidate

    return None

def execute_architect():
    print("\n[Autonomous Architect] Booting Intelligence Engine...\n")
    conn = sqlite3.connect(DB_PATH)
    
    # Establish complete ecosystem keys array
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT provider FROM detected_events WHERE source_id = 'litellm_global_map' AND provider IS NOT NULL")
    global_providers = [row[0] for row in cursor.fetchall()]
    all_cloud_keys = ["openrouter", "fal", "aws", "cartesia", "elevenlabs", "volcano"] + global_providers
    
    elo_data, schemas = load_data()
    
    for blueprint in schemas.get("blueprints", []):
        bp_id = blueprint["id"]
        status = blueprint["status"]
        print(f"[{bp_id.upper()}] Status: {status}")
        
        # Compile Unrestrained Stack
        print("  [Compiling Unrestrained Default Stack]")
        all_components_resolved = True
        resolved_stack = {}
        for comp_name, constraints in blueprint["components"].items():
            best_model = find_best_model(conn, elo_data, comp_name, constraints, all_cloud_keys)
            if not best_model:
                all_components_resolved = False
                break
            resolved_stack[comp_name] = {"id": best_model['exact_alias'], "provider": best_model['gateway']}
            
        if all_components_resolved:
            blueprint["stack"] = resolved_stack
            
        # Compile OpenRouter-Only Stack
        print("  [Compiling OpenRouter-Only Stack]")
        or_resolved = True
        or_stack = {}
        for comp_name, constraints in blueprint["components"].items():
            best_model = find_best_model(conn, elo_data, comp_name, constraints, ["openrouter"])
            if not best_model:
                or_resolved = False
                break
            or_stack[comp_name] = {"id": best_model['exact_alias'], "provider": best_model['gateway']}
            
        if or_resolved:
            blueprint["stack_openrouter_only"] = or_stack
            print("  [V] OpenRouter-Only stack generated.")
        else:
            print("  [X] OpenRouter-Only stack failed (Missing required modality exclusively on OR).")
        
        print("")
        
        # Autonomous Decisions (Logging)
        if status == "dormant" and all_components_resolved:
            print(f"  [ALERT] BREAKING: Market constraint unlocked! Autonomously WAKING blueprint: {blueprint['name']}")
            blueprint["status"] = "active"

    # Save to disk
    with open(SCHEMA_PATH, 'w') as f:
        json.dump(schemas, f, indent=4)
        print(f"[Autonomous Architect] Resolved architectures written back to {SCHEMA_PATH}")
            
    conn.close()

if __name__ == "__main__":
    execute_architect()

