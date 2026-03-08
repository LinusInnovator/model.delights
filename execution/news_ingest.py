import sqlite3
import urllib.request
import xml.etree.ElementTree as ET
import os
import uuid
import json
from datetime import datetime
import ssl

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def seed_news_source(conn):
    cursor = conn.cursor()
    # Adding a generic tech news parser (e.g., TechCrunch AI section or Google's RSS)
    cursor.execute('''
    INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("google_ai_blog", "Google AI Blog", "social_signal", "Google", "https://blog.google/technology/ai/rss/", "rss", 0.90, 0.85, 0.20, "active"))
    conn.commit()

def log_event(cursor, source_id, event_type, provider, entity_id, title, raw_data, started_at):
    event_id = f"evt_{str(uuid.uuid4())}"
    cursor.execute('''
    INSERT INTO detected_events (event_id, source_id, event_type, entity_type, provider, entity_id, title, detected_at, source_confidence, raw_data, verification_state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        event_id, 
        source_id, 
        event_type, 
        "rumor", 
        provider, 
        entity_id, 
        title, 
        started_at, 
        0.35, # Scout Signal confidence (low)
        json.dumps(raw_data), 
        "pending"
    ))

def crawl_news_rss(conn):
    print("[Ingest] Crawling Provider Blogs (P3) for scout signals...")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "https://blog.google/technology/ai/rss/"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        rss_data = urllib.request.urlopen(req, context=ctx).read()
        
        root = ET.fromstring(rss_data)
        
        cursor = conn.cursor()
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = 0

        # Create a simple table to track news we've already seen
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS seen_news (
            article_id TEXT PRIMARY KEY,
            title TEXT,
            published_at TEXT
        )
        ''')

        for item in root.findall('.//item'):
            items_found += 1
            title = item.findtext('title', '')
            link = item.findtext('link', '')
            pubDate = item.findtext('pubDate', '')
            desc = item.findtext('description', '')
            
            article_id = link if link else title
            
            cursor.execute("SELECT article_id FROM seen_news WHERE article_id = ?", (article_id,))
            if not cursor.fetchone():
                cursor.execute("INSERT INTO seen_news (article_id, title, published_at) VALUES (?, ?, ?)", (article_id, title, pubDate))
                
                # Check for signal keywords 
                title_lower = title.lower()
                desc_lower = desc.lower()
                signal_words = ['model', 'gemini', 'gemma', 'introducing', 'release', 'video', 'audio', 'agent']
                
                if any(word in title_lower or word in desc_lower for word in signal_words):
                    raw_data = {
                        "title": title,
                        "link": link,
                        "pubDate": pubDate
                    }
                    
                    log_event(
                        cursor=cursor, 
                        source_id="google_ai_blog", 
                        event_type="rumor_detected", 
                        provider="Google", 
                        entity_id=article_id, 
                        title=f"Scout Signal: {title}", 
                        raw_data=raw_data, 
                        started_at=started_at
                    )
                    events_generated += 1

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "google_ai_blog", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] Provider Blog processing complete! Scanned {items_found} articles. Generated {events_generated} new scout events.")
    except Exception as e:
        print(f"[Ingest] Provider Blog Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing P3 Scout Signal Engine...")
    conn = sqlite3.connect(DB_PATH)
    seed_news_source(conn)
    crawl_news_rss(conn)
    conn.close()
    print("[Ingest] P3 Scout execution complete.")
