import os
import json
import requests
from datetime import datetime

# Paths
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'promo_db.json')

# OpenRouter Configuration
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
model_to_use = "openai/gpt-4o"

def aggregate_stats():
    """Reads promo_db.json and calculates CTR and impression share."""
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return None

    with open(DB_PATH, 'r') as f:
        db = json.load(f)
    
    promos = db.get('promotions', [])
    events = db.get('events', [])
    
    stats = []
    
    for promo in promos:
        if promo['status'] != 'active':
            continue
            
        promo_events = [e for e in events if e.get('promoId') == promo['id']]
        views = len([e for e in promo_events if e.get('eventType') == 'view'])
        hovers = len([e for e in promo_events if e.get('eventType') == 'hover'])
        clicks = len([e for e in promo_events if e.get('eventType') == 'click'])
        
        ctr = (clicks / views * 100) if views > 0 else 0
        
        stats.append({
            'company': promo['title'],
            'views': views,
            'clicks': clicks,
            'ctr': round(ctr, 2)
        })
        
    # Sort by CTR descending
    stats.sort(key=lambda x: x['ctr'], reverse=True)
    return stats

def generate_outreach(top_performer, stats):
    """Uses OpenRouter to identify similar scale-ups and draft outreach emails."""
    if not OPENROUTER_API_KEY:
        print("Warning: OPENROUTER_API_KEY not set. Please set it in your environment.")
        return "Skipped LLM generation due to missing API key."

    stats_str = "\n".join([f"- {s['company']}: {s['views']} views, {s['clicks']} clicks ({s['ctr']}% CTR)" for s in stats])

    prompt = f"""
    We run a highly targeted directory for AI developers comparing LLMs (model.delights.pro).
    We inject native "Promotion Gems" into our grid instead of traditional ads.
    
    Our recent top performing sponsor is '{top_performer['company']}' which achieved a {top_performer['ctr']}% Click-Through Rate from {top_performer['views']} guaranteed views in our grid.
    
    Here is the full performance context of our site's native slot:
    {stats_str}

    Your task:
    1. Identify 3 completely different scaling startups/companies (NOT '{top_performer['company']}') in the AI developer tools space (e.g. vector DBs, LLM observability, orchestration, deployment). These should be hungry scale-ups, not massive giants.
    2. Write a short, highly personalized, and punchy cold outreach email for EACH of the 3 companies. 
    3. The email should cite the exact success of '{top_performer['company']}' on our platform as proof of ROI, and pitch them a native "Featured Gem" slot to capture our audience of technical builders.

    Format the output as a clean Markdown document.
    """

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://model.delights.pro",
                "X-Title": "model.delights proactive outreach"
            },
            json={
                "model": model_to_use,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        return "Failed to generate outreach via LLM."


def main():
    print("--- Starting Proactive Outreach Engine ---")
    stats = aggregate_stats()
    
    if not stats:
        print("No active promotions or no data to process.")
        return

    print("\n[Current Performance]")
    for stat in stats:
        print(f"{stat['company']}: CTR {stat['ctr']}% ({stat['views']} views)")

    top_performer = stats[0]
    if top_performer['views'] == 0:
        print("\nNot enough data yet to identify a top performer based on views.")
        return

    print(f"\n[LLM Brainstorm] Finding scale-ups similar to top performer: {top_performer['company']}...")
    outreach_drafts = generate_outreach(top_performer, stats)

    # Save the report
    report_name = f"outreach_report_{datetime.now().strftime('%Y%m%d')}.md"
    report_path = os.path.join(os.path.dirname(__file__), report_name)
    
    with open(report_path, 'w') as f:
        f.write("# Proactive Partnership Outreach Report\n\n")
        f.write("## Current Portfolio Stats\n")
        for stat in stats:
            f.write(f"- **{stat['company']}**: {stat['views']} impressions, {stat['clicks']} clicks ({stat['ctr']}% CTR)\n")
        
        f.write("\n## LLM Generated Outreach Drafts\n")
        f.write(outreach_drafts)
        
    print(f"\n✅ Report and 3 personalized drafts generated successfully: {report_path}")

if __name__ == "__main__":
    main()
