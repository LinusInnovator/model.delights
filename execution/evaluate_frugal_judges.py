import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "intelligence.db")
ELO_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "lmsys_elo.json")

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        with open(ELO_PATH, 'r') as f:
            elo_data = json.load(f)
    except Exception as e:
        print(f"Error loading ELO: {e}")
        return

    cursor.execute("SELECT canonical_model_variant, pricing_prompt, pricing_completion FROM entities")
    rows = cursor.fetchall()
    
    results = []
    
    for row in rows:
        model_id = row[0]
        p_prompt = row[1]
        p_comp = row[2]
        
        # Skip models with 0 pricing or missing ELO
        if p_prompt == 0.0 or p_comp == 0.0:
            continue
            
        if model_id not in elo_data:
            continue
            
        elo = elo_data[model_id]
        
        if elo < 1180: # roughly Sonnet 3.7 level capability floor
            continue

        # Price per 1M blended (assume 80% prompt, 20% completion)
        blended_price_per_1M = (p_prompt * 0.8 + p_comp * 0.2) * 1000000
        
        if blended_price_per_1M <= 0.01: # Filter out purely free/dummy pricing models to be rigorous
            continue
            
        value_score = elo / blended_price_per_1M
        results.append({
            "model_id": model_id,
            "elo": elo,
            "price_1m": blended_price_per_1M,
            "value_score": value_score
        })

    # Sort by value score descending
    results.sort(key=lambda x: x['value_score'], reverse=True)
    
    print("\n[TOP FRUGAL JUDGES]")
    for i, r in enumerate(results[:10]):
        print(f"{i+1}. {r['model_id']} | ELO: {r['elo']} | Blended Price/1M: ${r['price_1m']:.4f} | Value Score: {r['value_score']:.2f}")

if __name__ == "__main__":
    main()
