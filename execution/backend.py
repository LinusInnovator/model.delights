import os
import time
import requests
import threading
import json
import subprocess
from flask import Flask, jsonify, send_from_directory

app = Flask(__name__, static_folder='../public', static_url_path='')

# Global cache for openrouter models
cached_models = []
last_updated = 0

def fetch_models_loop():
    global cached_models, last_updated
    while True:
        try:
            print("Fetching models from OpenRouter...")
            response = requests.get("https://openrouter.ai/api/v1/models", timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = data.get("data", [])
                
                # Load ELO map
                elo_map = {}
                elo_path = os.path.join(os.path.dirname(__file__), 'elo_data.json')
                if os.path.exists(elo_path):
                    with open(elo_path, 'r') as f:
                        elo_map = json.load(f)

                def assign_use_cases(model):
                    use_cases = []
                    m_id = model.get('id', '').lower()
                    desc = model.get('description', '').lower()
                    name = model.get('name', '').lower()
                    
                    # Coding & Logic
                    if 'coder' in m_id or 'math' in m_id or 'coder' in name or 'math' in name:
                        use_cases.append('Coding & Logic')
                        
                    # Roleplay
                    if 'roleplay' in desc or 'uncensored' in desc or 'roleplay' in m_id or 'uncensored' in m_id:
                        use_cases.append('Roleplay')
                        
                    # Fictional Writing (Complex/larger models)
                    if 'claude-3' in m_id or 'gemini-1.5-pro' in m_id or 'opus' in m_id or 'gpt-4' in m_id or 'wizardlm' in m_id or 'llama-3.1-70b' in m_id or 'llama-3.1-405b' in m_id or 'llama-3-70b' in m_id:
                        use_cases.append('Fictional Writing')
                        
                    # Quick Drafting (Fast/cheap models)
                    if 'flash' in m_id or 'haiku' in m_id or 'mini' in m_id or '8b' in m_id or 'llama-3-8b' in m_id:
                        use_cases.append('Quick Drafting')
                        
                    # Vision
                    arch = model.get('architecture', {})
                    modalities = arch.get('modality', '') if isinstance(arch, dict) else ''
                    if 'vision' in desc or 'vision' in m_id or 'image' in modalities.lower():
                        use_cases.append('Vision')
                
                    return use_cases

                # Normalize data (e.g. text pricing to per 1M tokens)
                for m in models:
                    m['use_cases'] = assign_use_cases(m)
                    pricing = m.get("pricing", {})
                    # Calculate per 1M tokens price if available
                    m['pricing_per_1m'] = {}
                    for k, v in pricing.items():
                        try:
                            # Usually prices are per token or per request. 
                            # If it's prompt/completion, multiplying by 1M gives useful comparison numbers
                            m['pricing_per_1m'][k] = float(v) * 1_000_000 if v else 0.0
                        except (ValueError, TypeError):
                            m['pricing_per_1m'][k] = 0.0

                    # ELO calculations
                    total_price_1m = m['pricing_per_1m'].get('prompt', 0) + m['pricing_per_1m'].get('completion', 0)
                    if m['id'] in elo_map:
                        m['elo'] = elo_map[m['id']]
                        if total_price_1m > 0:
                            m['value_score'] = m['elo'] / total_price_1m
                        else:
                            m['value_score'] = 999999 # Free models with ELO get highest value
                    else:
                        m['elo'] = None
                        m['value_score'] = 0
                
                cached_models = models
                last_updated = time.time()
                print(f"Successfully updated cache with {len(models)} models.")
            else:
                print(f"Failed to fetch. Status code: {response.status_code}")
        except Exception as e:
            print(f"Error fetching models: {e}")
            
        time.sleep(60)

def fetch_elo_loop():
    while True:
        try:
            print("Triggering daily dynamic ELO update...")
            # Run the fetch_elo.py script
            subprocess.run(["python3", "execution/fetch_elo.py"], check=True)
            print("Successfully refreshed dynamic ELO data.")
        except Exception as e:
            print(f"Failed to update dynamic ELO: {e}")
            
        # Run every 24 hours (86400 seconds)
        time.sleep(86400)

@app.route('/api/models')
def get_models():
    return jsonify({
        "models": cached_models,
        "last_updated": last_updated
    })

@app.route('/')
def index():
    return send_from_directory('../public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../public', path)

if __name__ == '__main__':
    # Start the dynamic ELO fetch thread (runs daily)
    elo_thread = threading.Thread(target=fetch_elo_loop, daemon=True)
    elo_thread.start()

    # Start the background fetch thread (runs every 60s)
    model_thread = threading.Thread(target=fetch_models_loop, daemon=True)
    model_thread.start()
    
    # Run the server
    # Note: debug=False ensures the background thread doesn't start twice due to the reloader.
    app.run(port=8000, debug=False)
