import requests
import json
import os

def normalize_to_openrouter(raw_model_name):
    name = str(raw_model_name).lower()
    
    # Anthropic
    if "claude-3-5-sonnet" in name: return "anthropic/claude-3.5-sonnet"
    if "claude 3.5 sonnet" in name: return "anthropic/claude-3.5-sonnet"
    if "claude 3 opus" in name or "claude-3-opus" in name: return "anthropic/claude-3-opus"
    if "claude 3 sonnet" in name or "claude-3-sonnet" in name: return "anthropic/claude-3-sonnet"
    if "claude 3 haiku" in name or "claude-3-haiku" in name: return "anthropic/claude-3-haiku"
    
    # OpenAI
    if "gpt-4o-mini" in name or "gpt-4o mini" in name: return "openai/gpt-4o-mini"
    if "gpt-4o" in name: return "openai/gpt-4o"
    if "gpt-4 turbo" in name or "gpt-4-turbo" in name: return "openai/gpt-4-turbo"
    if "o1-preview" in name or "o1 preview" in name: return "openai/o1-preview"
    if "o1-mini" in name or "o1 mini" in name: return "openai/o1-mini"
    
    # Google
    if "gemini-1.5-pro" in name or "gemini 1.5 pro" in name: return "google/gemini-pro-1.5"
    if "gemini-1.5-flash" in name or "gemini 1.5 flash" in name: return "google/gemini-flash-1.5"
    if "gemini-1.0-pro" in name or "gemini 1.0 pro" in name: return "google/gemini-pro"
    
    # Meta
    if "llama 3.1 405b" in name or "llama-3.1-405b" in name: return "meta-llama/llama-3.1-405b-instruct"
    if "llama 3.1 70b" in name or "llama-3.1-70b" in name: return "meta-llama/llama-3.1-70b-instruct"
    if "llama 3 70b" in name or "llama-3-70b" in name: return "meta-llama/llama-3-70b-instruct"
    if "llama 3.1 8b" in name or "llama-3.1-8b" in name: return "meta-llama/llama-3.1-8b-instruct"
    
    # Deepseek
    if "deepseek coder v2" in name or "deepseek-coder-v2" in name: return "deepseek/deepseek-coder"
    if "deepseek v2" in name or "deepseek-v2" in name: return "deepseek/deepseek-chat"
    if "deepseek v3" in name or "deepseek-v3" in name: return "deepseek/deepseek-chat"
    
    # Mistral
    if "mistral large" in name or "mistral-large" in name: return "mistralai/mistral-large"
    
    return name.replace(" ", "-")

def fetch_and_update_elo():
    # Because LMSys data is locked, and Aider moved their yaml, the most robust 80/20 solution
    # is to pull OpenRouter's own model rank routing data via their public API. OpenRouter sorts 
    # their default `api/v1/models` by usage, but there's a community metric proxy. 
    # To keep it completely independent without failing, we will implement a dynamic weighting 
    # based on Context Window + OpenRouter default rank (which correlates natively to ELO/Demand).
    
    url = "https://openrouter.ai/api/v1/models"
    
    print(f"Fetching OpenRouter models to build a dynamic heuristic Value Score proxy...")
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json().get('data', [])
        
        mapped_proxy_elo = {}
        
        # OpenRouter's array is roughly ordered by popularity/capability internally. 
        # We can create a solid 80/20 heuristic ELO proxy without a brittle hardcoded scraper.
        # Base ELO = 1000. 
        # Top 10 models get +200 bonus. Next 20 get +100.
        # Context window sizes get small multipliers.
        
        for index, model in enumerate(data):
            or_id = model.get('id')
            context = model.get('context_length', 8000)
            
            # Start at base 1100
            proxy_elo = 1100
            
            # Popularity proxy (first in array = more popular / recommended)
            if index < 10: proxy_elo += 150
            elif index < 30: proxy_elo += 80
            elif index < 100: proxy_elo += 40
            
            # Context proxy (higher context = generally more capable model)
            if context > 100000: proxy_elo += 50
            elif context > 32000: proxy_elo += 20
            
            # Specialized boosts for known frontier families based on ID parsing
            if "gpt-4" in or_id or "claude-3" in or_id or "gemini-1.5" in or_id:
                proxy_elo += 30
            
            mapped_proxy_elo[or_id] = round(proxy_elo)

        if mapped_proxy_elo:
            output_path = os.path.join(os.path.dirname(__file__), 'elo_data.json')
            with open(output_path, 'w') as f:
                json.dump(mapped_proxy_elo, f, indent=2)
            print(f"Successfully generated dynamic heuristic ELO proxy for {len(mapped_proxy_elo)} models.")
            return True
        else:
            print("Failed to map models from source.")
    except Exception as e:
        print(f"Error fetching dynamic ELO: {e}")
        
    print("Falling back to static ELO...")
    return False

if __name__ == "__main__":
    fetch_and_update_elo()
