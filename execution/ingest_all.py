import os
import subprocess
import sys

# Define the absolute directory of this script to ensure correct execution paths
base_dir = os.path.dirname(os.path.abspath(__file__))

scripts = [
    "intelligence_ingest.py", # OpenRouter P0
    "fal_ingest.py",          # Fal.ai P0
    "anthropic_ingest.py",    # Anthropic Native P0
    "bedrock_ingest.py",      # AWS Bedrock P1
    "hf_rss_ingest.py",       # arXiv P1 Emergence
    "news_ingest.py",         # Google AI RSS P3
    "volcano_ingest.py",      # Volcano API P0
    "global_ecosystem_ingest.py", # Global Infrastructure Metarouter P0
    "canonical_merger.py"     # LLM Identity Brain
]

def run_script(script_name):
    script_path = os.path.join(base_dir, script_name)
    print(f"\n=============================================")
    print(f"[Orchestrator] Running {script_name}...")
    print(f"=============================================")
    try:
        subprocess.run([sys.executable, script_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[Orchestrator] ERROR: {script_name} failed with exit code {e.returncode}")
    except Exception as e:
        print(f"[Orchestrator] ERROR: Failed to execute {script_name}: {e}")

if __name__ == "__main__":
    print("[Orchestrator] Commencing $0.00 Intelligence Ingestion Matrix sweep...")
    for script in scripts:
        run_script(script)
    print("\n[Orchestrator] Full intelligence matrix sweep complete.")
