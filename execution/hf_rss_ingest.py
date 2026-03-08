import sqlite3
import urllib.request
import xml.etree.ElementTree as ET
import os
import uuid
import json
from datetime import datetime
import ssl

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')

def seed_hf_source(conn):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT OR IGNORE INTO sources (source_id, name, category, provider, base_url, crawl_method, authority_score, freshness_score, noise_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("arxiv_cs_ai", "arXiv Computer Science: AI", "research_emergence", "arXiv", "http://export.arxiv.org/rss/cs.AI", "rss", 0.90, 0.98, 0.40, "active"))
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
        "research_paper", 
        provider, 
        entity_id, 
        title, 
        started_at, 
        0.75, # P1 Research Emergence confidence
        json.dumps(raw_data), 
        "pending"
    ))

def crawl_hf_rss(conn):
    print("[Ingest] Crawling arXiv (P1) for research emergence signals...")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        url = "http://export.arxiv.org/rss/cs.AI"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        rss_data = urllib.request.urlopen(req, context=ctx).read()
        
        # arXiv RSS uses a namespace
        root = ET.fromstring(rss_data)
        
        cursor = conn.cursor()
        run_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        events_generated = 0
        items_found = 0

        # Create a simple table to track papers we've already seen
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS seen_research (
            paper_id TEXT PRIMARY KEY,
            title TEXT,
            published_at TEXT
        )
        ''')

        # Find all <item> tags in the RSS feed
        for item in root.findall('.//item'):
            items_found += 1
            title = item.findtext('title', '')
            link = item.findtext('link', '')
            pubDate = item.findtext('pubDate', '')
            
            # Use the link or title as a unique ID
            paper_id = link if link else title
            
            # Check if we've seen this paper
            cursor.execute("SELECT paper_id FROM seen_research WHERE paper_id = ?", (paper_id,))
            if not cursor.fetchone():
                # Add to seen list
                cursor.execute("INSERT INTO seen_research (paper_id, title, published_at) VALUES (?, ?, ?)", (paper_id, title, pubDate))
                
                # Check for signal keywords to reduce noise
                title_lower = title.lower()
                signal_words = ['model', 'llm', 'generation', 'video', 'audio', 'parameter', 'state-of-the-art', 'sota', 'architecture']
                if any(word in title_lower for word in signal_words):
                    raw_data = {
                        "title": title,
                        "link": link,
                        "pubDate": pubDate
                    }
                    
                    # We don't create an `entity` yet (it's not an API we can hit), 
                    # we just log the event to trip the "dumb wire".
                    # If this triggers a threshold, Gemini would later review it.
                    log_event(
                        cursor=cursor, 
                        source_id="arxiv_cs_ai", 
                        event_type="research_paper_published", 
                        provider="arXiv", 
                        entity_id=paper_id, 
                        title=f"Emerging Research: {title}", 
                        raw_data=raw_data, 
                        started_at=started_at
                    )
                    events_generated += 1

        # Log Run
        cursor.execute('''
        INSERT INTO crawl_runs (run_id, source_id, started_at, status, items_found, events_generated)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (run_id, "arxiv_cs_ai", started_at, "success", items_found, events_generated))

        conn.commit()
        print(f"[Ingest] arXiv RSS processing complete! Scanned {items_found} papers. Generated {events_generated} new research events.")
    except Exception as e:
        print(f"[Ingest] arXiv RSS Error: {e}")

if __name__ == "__main__":
    print("[Ingest] Initializing P1 Research Ingestion Engine...")
    conn = sqlite3.connect(DB_PATH)
    seed_hf_source(conn)
    crawl_hf_rss(conn)
    conn.close()
    print("[Ingest] arXiv RSS execution complete.")
