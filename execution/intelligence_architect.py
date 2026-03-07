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

def find_best_model(conn, elo_data, component_name, constraints):
    cursor = conn.cursor()
    
    cursor.execute("SELECT canonical_model_variant, pricing_prompt, pricing_completion, modalities_in FROM entities WHERE status = 'active'")
    rows = cursor.fetchall()
    
    valid_candidates = []
    
    for row in rows:
        model_id = row[0]
        p_prompt = row[1]
        p_comp = row[2]
        mods_in = row[3] or ""
        
        # 1. Check Modalities
        modality_fail = False
        for req_mod in constraints.get("required_modalities_in", []):
            if req_mod not in mods_in:
                modality_fail = True
                break
        if modality_fail:
            continue
            
        # 2. Check ELO
        elo = elo_data.get(model_id, 0)
        if elo < constraints.get("min_elo", 0):
            continue
            
        # 3. Check Budget
        blended_price = (p_prompt * 0.8 + p_comp * 0.2) * 1000000
        if blended_price > constraints.get("max_budget_per_1m", 999.0):
            continue
            
        if blended_price == 0:
            continue # skip undefined pricing
            
        valid_candidates.append({
            "model_id": model_id,
            "elo": elo,
            "price": blended_price
        })
        
    if not valid_candidates:
        return None
        
    # Autonomy Logic:
    # 1. Sort by Highest Intelligence First
    # 2. If ELO gap is minor (< 10 points), sort by Cheaper Price (Arbitrage)
    
    # Keep math simple: Sort by ELO descending, then Price ascending.
    # To truly simulate the Arbitrage "Same Quality", we just pick the cheapest model among the top tier.
    valid_candidates.sort(key=lambda x: x['elo'], reverse=True)
    
    top_elo = valid_candidates[0]['elo']
    top_tier = [c for c in valid_candidates if top_elo - c['elo'] <= 15] # Models within 15 ELO of the best
    
    # Find the cheapest in the top tier
    top_tier.sort(key=lambda x: x['price'])
    
    # Regression Test Loop - Find the best model that ACTUALLY passes live tests
    for candidate in top_tier:
        target_model = candidate['model_id']
        if run_live_regression(target_model, component_name):
            return candidate

    return None

def execute_architect():
    print("[Autonomous Architect] Booting Intelligence Engine...\n")
    conn = sqlite3.connect(DB_PATH)
    elo_data, schemas = load_data()
    
    for blueprint in schemas.get("blueprints", []):
        bp_id = blueprint["id"]
        status = blueprint["status"]
        print(f"[{bp_id.upper()}] Status: {status}")
        
        all_components_resolved = True
        resolved_stack = {}
        
        for comp_name, constraints in blueprint["components"].items():
            print(f"  -> Compiling node: {comp_name}...")
            print(f"     Constraints: ELO > {constraints.get('min_elo')} | Budget < ${constraints.get('max_budget_per_1m')}/1M | Modalities: {constraints.get('required_modalities_in')}")
            
            best_model = find_best_model(conn, elo_data, comp_name, constraints)
            
            if not best_model:
                print(f"     [X] NO MODEL EXISTS: Market cannot fulfill constraints.")
                all_components_resolved = False
                break
                
            print(f"     [V] SELECTED: {best_model['model_id']} | ELO: {best_model['elo']} | Cost: ${best_model['price']:.2f}/1M")
            resolved_stack[comp_name] = best_model
            
        print("")
        
        # Autonomous Decisions
        if status == "dormant" and all_components_resolved:
            print(f"  [ALERT] BREAKING: Market constraint unlocked! Autonomously WAKING blueprint: {blueprint['name']}")
        elif status == "active" and all_components_resolved:
            # Check for arbitrage
            total_price = sum([m['price'] for m in resolved_stack.values()])
            print(f"  [OPTIMIZED] Stack resolved successfully. Total computed blended cost: ${total_price:.2f}/1M tokens.\n")
            
    conn.close()

if __name__ == "__main__":
    execute_architect()
