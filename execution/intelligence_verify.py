import sqlite3
import json
import os
import requests
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'intelligence.db')
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# The "Judge" models used to evaluate other models
PRIMARY_JUDGE = "bytedance-seed/seed-2.0-mini"
ESCALATION_JUDGE = "google/gemini-3.1-flash-lite-preview"

# The Vibe Check Test Suite
TEST_SUITE = {
    "coding": "Write a highly optimized React component for a sortable data table. Return only the raw code.",
    "reasoning": "A farmer has 17 sheep, all but 9 die. How many active sheep are left? Explain your logic briefly.",
    "creative": "Write a 3-sentence hook for a cyberpunk novel set in an underwater neo-Tokyo."
}

def init_verify_db(conn):
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS verification_jobs (
        job_id TEXT PRIMARY KEY,
        event_id TEXT,
        entity_id TEXT,
        test_type TEXT,
        status TEXT,
        score INTEGER,
        judge_rationale TEXT,
        created_at TEXT,
        FOREIGN KEY(event_id) REFERENCES detected_events(event_id)
    )
    ''')
    conn.commit()

def run_llm_call(model_id, prompt):
    if not OPENROUTER_API_KEY:
        print("[Verify] ERROR: OPENROUTER_API_KEY not set.")
        return "ERROR: Missing API Key"
        
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://model.delights.pro",
        "X-Title": "Intelligence Engine Verify"
    }
    
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0
    }
    
    try:
        res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"[Verify] API Error for {model_id}: {e}")
        return f"ERROR: {e}"

def verify_pending_events():
    conn = sqlite3.connect(DB_PATH)
    init_verify_db(conn)
    cursor = conn.cursor()
    
    # Get up to 5 pending model_added events
    cursor.execute('''
    SELECT event_id, entity_id, title 
    FROM detected_events 
    WHERE event_type = 'model_added' AND verification_state = 'pending'
    LIMIT 5
    ''')
    
    pending_events = cursor.fetchall()
    
    if not pending_events:
        print("[Verify] No pending ‘model_added’ events found.")
        conn.close()
        return

    print(f"[Verify] Found {len(pending_events)} pending models to evaluate.")
    
    for event_id, entity_id, title in pending_events:
        # Extract the actual model ID from the title or DB
        cursor.execute("SELECT canonical_model_variant FROM entities WHERE entity_id = ?", (entity_id,))
        row = cursor.fetchone()
        if not row:
            continue
            
        target_model_id = row[0]
        print(f"\n[Verify] Target: {target_model_id}")
        
        # 1. Generate responses from the target model
        test_results = {}
        for test_type, prompt in TEST_SUITE.items():
            print(f"  -> Running {test_type} test...")
            # For local testing without burning real API credits, we will mock the target response
            # In production, this would be: target_response = run_llm_call(target_model_id, prompt)
            target_response = f"MOCK RESPONSE for {test_type} from {target_model_id}"
            test_results[test_type] = target_response
            
        # 2. Ask the Primary Judge to grade the responses
        print(f"  -> Consulting Primary Judge: {PRIMARY_JUDGE}...")
        
        judge_prompt = f"""
        You are an expert AI evaluator.
        I am testing a new model: {target_model_id}.
        
        Here are its responses to my standard test suite:
        {json.dumps(test_results, indent=2)}
        
        Grade this model's overall intelligence on a scale of 0-100.
        If you feel these responses contain complex reasoning or coding structures that are beyond your capability to accurately grade, you MUST set "escalate": true.
        Return ONLY a JSON object with three keys: "score" (integer), "rationale" (1-sentence string), and "escalate" (boolean).
        """
        
        # Mocking the judge response for local execution
        # In production: raw_grade_json = run_llm_call(PRIMARY_JUDGE, judge_prompt)
        
        # We will simulate that 1 out of every 3 models is "too complex" for the hyper-cheap model
        mock_escalate = (hash(target_model_id) % 3 == 0)
        
        if mock_escalate:
            print(f"  -> {PRIMARY_JUDGE} requested escalation. Consulting Escalation Judge: {ESCALATION_JUDGE}...")
            # In production: raw_grade_json = run_llm_call(ESCALATION_JUDGE, judge_prompt)
            mock_score = 92
            mock_rationale = f"[Graded by {ESCALATION_JUDGE}] {target_model_id} passed complex reasoning checks that the primary judge could not verify."
        else:
            mock_score = 85
            mock_rationale = f"[Graded by {PRIMARY_JUDGE}] {target_model_id} demonstrates strong structural adherence but reasoning is average."
        
        # 3. Save the verification job
        job_id = f"job_{str(uuid.uuid4())[:8]}"
        cursor.execute('''
        INSERT INTO verification_jobs (job_id, event_id, entity_id, test_type, status, score, judge_rationale, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (job_id, event_id, entity_id, "vibe_check_suite", "completed", mock_score, mock_rationale, datetime.utcnow().isoformat()))
        
        # 4. Mark event as verified
        cursor.execute('''
        UPDATE detected_events 
        SET verification_state = 'verified'
        WHERE event_id = ?
        ''', (event_id,))
        
        print(f"  -> Result: Score {mock_score}. {mock_rationale}")
        conn.commit()
        
    print("\n[Verify] Verification run complete.")
    conn.close()

if __name__ == "__main__":
    verify_pending_events()
