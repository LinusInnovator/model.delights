import requests
import yaml
import json
import os

AIDER_YAML_URL = "https://raw.githubusercontent.com/paul-gauthier/aider/main/aider/website/_data/polyglot_leaderboard.yml"

def normalize_aider_to_or(aider_model_name):
    name = str(aider_model_name).lower()
    
    mapping = {
        "gpt-4o-mini": "openai/gpt-4o-mini",
        "gpt-4o-2024-11-20": "openai/gpt-4o-2024-11-20",
        "gpt-4o-2024-08-06": "openai/gpt-4o-2024-08-06",
        "gpt-4o-latest": "openai/chatgpt-4o-latest",
        "gpt-4.5": "openai/gpt-4.5-preview",
        "o1-mini": "openai/o1-mini",
        "o1-preview": "openai/o1-preview",
        "o1-2024-12-17": "openai/o1",
        "o3-mini": "openai/o3-mini",
        
        "claude-3-7-sonnet": "anthropic/claude-3.7-sonnet",
        "claude-3-5-sonnet": "anthropic/claude-3.5-sonnet",
        "claude-3-5-haiku": "anthropic/claude-3.5-haiku",
        "claude 3.5 sonnet": "anthropic/claude-3.5-sonnet",
        
        "gemini 2.0 pro": "google/gemini-2.0-pro-exp-02-05:free",
        "gemini-2.0-flash": "google/gemini-2.0-flash-exp:free",
        "gemini-1.5-pro": "google/gemini-pro-1.5",
        "gemini-1.5-flash": "google/gemini-flash-1.5",
        
        "deepseek chat v3": "deepseek/deepseek-chat",
        "deepseek v3": "deepseek/deepseek-chat",
        "deepseek r1": "deepseek/deepseek-reasoner",
        
        "qwen2.5-coder-32b": "qwen/qwen-2.5-coder-32b-instruct",
        "qwen-max": "qwen/qwen-max",
        "qwq-32b": "qwen/qwq-32b-preview",
        
        "codestral": "mistralai/codestral-2501",
        
        "llama 3.1 405b": "meta-llama/llama-3.1-405b-instruct",
        "llama 3.1 70b": "meta-llama/llama-3.1-70b-instruct",
        
        "command-a": "cohere/command-r-plus"
    }
    
    for key, or_id in mapping.items():
        if key in name:
            return or_id
            
    # Fuzzy fallback based on standard rules
    if "claude" in name and "sonnet" in name: return "anthropic/claude-3.5-sonnet"
    if "gpt-4o" in name: return "openai/gpt-4o"
    if "o1" in name: return "openai/o1"
    
    return None

def fetch_and_generate_coding_elo():
    print("Fetching Aider Polyglot Leaderboard YAML...")
    try:
        response = requests.get(AIDER_YAML_URL, timeout=10)
        response.raise_for_status()
        
        leaderboard_data = yaml.safe_load(response.text)
        
        coding_elo_map = {}
        
        for entry in leaderboard_data:
            model_name = entry.get('model', '')
            pass_rate = entry.get('pass_rate_2', 0)  # Use the main pass rate metric
            
            or_id = normalize_aider_to_or(model_name)
            
            if or_id and pass_rate > 0:
                # Calculate proxy ELO: Base 1000 + (Pass Rate * 8)
                # This ensures a 60% pass rate gives roughly a 1480 ELO.
                proxy_elo = 1000 + (pass_rate * 8)
                
                # Keep the highest ELO if a model appears multiple times
                if or_id in coding_elo_map:
                    coding_elo_map[or_id] = max(coding_elo_map[or_id], round(proxy_elo))
                else:
                    coding_elo_map[or_id] = round(proxy_elo)
        
        if coding_elo_map:
            app_data_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'openrate-nextjs', 'src', 'data'
            )
            # Create src/data directory if it doesn't exist
            os.makedirs(app_data_path, exist_ok=True)
            
            output_path = os.path.join(app_data_path, 'coding_elo.json')
            
            with open(output_path, 'w') as f:
                json.dump(coding_elo_map, f, indent=2)
                
            print(f"Successfully generated Coding ELO proxy for {len(coding_elo_map)} models.")
            print(f"Top 3 models: {list(sorted(coding_elo_map.items(), key=lambda x: x[1], reverse=True))[:3]}")
            return True
        else:
            print("Failed to map any models to OpenRouter IDs.")
    except Exception as e:
        print(f"Error fetching/parsing Aider YAML: {e}")
        
    return False

if __name__ == "__main__":
    fetch_and_generate_coding_elo()
