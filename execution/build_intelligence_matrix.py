import requests
import json
import os
import yaml
from thefuzz import process

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT_DIR, 'src', 'data')
LMSYS_JSON_PATH = os.path.join(DATA_DIR, 'lmsys_elo.json')
INTELLIGENCE_MATRIX_PATH = os.path.join(DATA_DIR, 'intelligence_matrix.json')

WULONG_LMSYS_API_URL = "https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text"
AIDER_YAML_URL = "https://raw.githubusercontent.com/Aider-AI/aider/main/aider/website/_data/edit_leaderboard.yml"
BFCL_HF_URL = "https://datasets-server.huggingface.co/rows?dataset=gorilla-llm%2FBerkeley-Function-Calling-Leaderboard&config=default&split=train&offset=0&length=100"

def fetch_openrouter_models():
    print("Fetching OpenRouter models...", flush=True)
    response = requests.get("https://openrouter.ai/api/v1/models")
    if response.status_code != 200:
        print(f"Failed to fetch OR models: {response.text}")
        return {}
    models = response.json().get('data', [])
    return {m['id'].split('/')[-1].lower(): m['id'] for m in models}

def fetch_lmsys():
    print(f"Fetching LMSYS (Conversational IQ)...", flush=True)
    try:
        res = requests.get(WULONG_LMSYS_API_URL, timeout=15)
        if res.status_code == 200:
            models_list = res.json().get("models", [])
            print(f"  -> {len(models_list)} models")
            return {m["model"]: {"elo": m["score"]} for m in models_list}
    except Exception as e:
        print(f"Failed LMSYS: {e}")
    return {}

def fetch_aider():
    print("Fetching Aider (Coding IQ)...", flush=True)
    try:
        res = requests.get(AIDER_YAML_URL, timeout=15)
        if res.status_code == 200:
            data = yaml.safe_load(res.text)
            print(f"  -> {len(data)} models")
            # Map model dir name "gpt-4o-2024-05-13" to pass@1
            return {item["dirname"]: {"pass_rate_1": item.get("pass_rate_1", 0)} for item in data}
    except Exception as e:
        print(f"Failed Aider: {e}")
    return {}

def fetch_bfcl():
    # Since BFCL isn't trivially exposed, we pull a proxy or leave a dummy until we have HF authentication if needed
    print("Fetching BFCL (Agentic IQ)...", flush=True)
    try:
        res = requests.get(BFCL_HF_URL, timeout=15)
        if res.status_code == 200:
            rows = res.json().get("rows", [])
            print(f"  -> {len(rows)} models")
            # Example response struct: [{"row": {"Model": "gpt-4-turbo", "Overall Score": 89.2}}, ...]
            # We map model -> score
            return {r["row"]["Model"]: {"agentic_score": r["row"].get("Overall Score", 0)} for r in rows if "Model" in r.get("row", {})}
    except Exception as e:
        print(f"Failed BFCL: {e}")
    return {}

def clean_model_name(name):
    # Aggressively clean standard suffixes that break matching
    for suffix in ['-api', '-0514', '-0801', '-20240229', '-20240307', '-20240620', '-2024-05-13', '-2024-04-09', '-2024-08-13', '-thinking', 'preview', 'instruct', 'chat']:
        name = name.replace(suffix, '')
    return name.strip('-').strip()

def map_metrics(raw_dict, or_models, metric_key):
    mapped = {}
    or_short_names = list(or_models.keys())
    
    for raw_name, data in raw_dict.items():
        val = data.get(metric_key)
        if not val: continue
        
        clean = clean_model_name(raw_name.lower())
        
        if clean in or_models:
            mapped[or_models[clean]] = val
            continue
            
        best_match, score = process.extractOne(clean, or_short_names)
        if score > 85:
            mapped[or_models[best_match]] = val
        else:
            best_match, score = process.extractOne(clean, list(or_models.values()))
            if score > 85:
                mapped[best_match] = val
    return mapped

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    or_models = fetch_openrouter_models()
    
    lmsys_raw = fetch_lmsys()
    aider_raw = fetch_aider()
    bfcl_raw = fetch_bfcl()
    
    lmsys_mapped = map_metrics(lmsys_raw, or_models, "elo")
    aider_mapped = map_metrics(aider_raw, or_models, "pass_rate_1")
    bfcl_mapped = map_metrics(bfcl_raw, or_models, "agentic_score")
    
    print("\n--- Mapping Results ---")
    print(f"LMSYS (Conversational): {len(lmsys_mapped)} mapped")
    print(f"Aider (Coding): {len(aider_mapped)} mapped")
    print(f"BFCL (Agentic): {len(bfcl_mapped)} mapped")
    
    # Save LMSYS backward compat
    with open(LMSYS_JSON_PATH, 'w') as f:
        json.dump(lmsys_mapped, f, indent=2)
        
    # Save the new Tri-Force Matrix payload
    matrix = {}
    for m in or_models.values():
        if m in lmsys_mapped or m in aider_mapped or m in bfcl_mapped:
            matrix[m] = {}
            if m in lmsys_mapped: matrix[m]['lmsys_elo'] = round(lmsys_mapped[m])
            if m in aider_mapped: matrix[m]['aider_pass_1'] = float(aider_mapped[m])
            if m in bfcl_mapped: matrix[m]['bfcl_score'] = float(bfcl_mapped[m])
            
    with open(INTELLIGENCE_MATRIX_PATH, 'w') as f:
        json.dump(matrix, f, indent=2)
        
    print(f"\nTri-Force Matrix saved to {INTELLIGENCE_MATRIX_PATH}")

if __name__ == "__main__":
    import yaml # ensure installed
    main()
