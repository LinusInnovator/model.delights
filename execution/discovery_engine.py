import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'blueprints_db.json')

def scrape_trending_gateways():
    print("[Discovery Engine] Synthesizing 100X Application Blueprints...")
    
    blueprints = {
        "last_updated": int(time.time()),
        "intents": {
            "realtime_translation_earbud": {
                "name": "Live Speech-to-Speech Translation (Earbud Latency)",
                "stack": {
                    "audio_transcription": {
                        "provider": "groq",
                        "id": "whisper-large-v3",
                        "rationale": "LPU hardware provides near-instantaneous (<100ms) transcription of the incoming audio stream."
                    },
                    "translation_engine": {
                        "provider": "together",
                        "id": "meta-llama/llama-3.1-8b-instruct-turbo",
                        "rationale": "Ultra-fast text translation (200+ tokens/sec) catching slang and idiom context flawlessly."
                    },
                    "text_to_speech": {
                        "provider": "cartesia",
                        "id": "cartesia/sonic",
                        "rationale": "The only TTS engine capable of 150ms latency with high emotional preservation."
                    }
                },
                "estimated_cost_per_interaction": "$0.004",
                "bleeding_edge_wildcard": {
                    "provider": "openrouter",
                    "id": "gpt-4o-audio-preview",
                    "rationale": "Direct speech-to-speech without text intermediation. Higher cost, but lower theoretical latency."
                }
            },
            "autonomous_seo_factory": {
                "name": "Autonomous SEO Media Network",
                "stack": {
                    "serp_researcher": {
                        "provider": "openrouter",
                        "id": "perplexity/llama-3.1-sonar-huge-128k-online",
                        "rationale": "Live web grounding to find exactly what competitors are ranking for today."
                    },
                    "structural_editor": {
                        "provider": "openrouter",
                        "id": "anthropic/claude-3.5-sonnet",
                        "rationale": "Unmatched at adhering to strict markdown structures and creating logical content flow."
                    },
                    "hero_image_generation": {
                        "provider": "fal.ai",
                        "id": "fal-ai/recraft-v3",
                        "rationale": "Currently the highest-fidelity model for generating vector art and graphic-design assets with exact text overlays."
                    }
                },
                "estimated_cost_per_interaction": "$0.120",
                "bleeding_edge_wildcard": {
                    "provider": "openrouter",
                    "id": "google/gemini-pro-1.5",
                    "rationale": "Massive context window allows you to feed in 100 competitor articles at once for meta-analysis before writing."
                }
            },
            "financial_rag_pipeline": {
                 "name": "Institutional Financial Data RAG",
                 "stack": {
                    "embedding_model": {
                        "provider": "together",
                        "id": "togethercomputer/m2-bert-80M-8k-retrieval",
                        "rationale": "High accuracy embeddings with 8k context length for dense 10-K financial reports."
                    },
                     "reranker": {
                         "provider": "cohere",
                         "id": "cohere/rerank-english-v3.0",
                         "rationale": "Crucial for pulling exact numerical tables out of massive vector databases accurately."
                     },
                     "reasoning_engine": {
                         "provider": "openrouter",
                         "id": "openai/o1-preview",
                         "rationale": "Step-by-step logical reasoning prevents hallucination when doing complex financial math across retrieved documents."
                     }
                 },
                 "estimated_cost_per_interaction": "$0.085",
                 "bleeding_edge_wildcard": {
                     "provider": "openrouter",
                     "id": "anthropic/claude-3.7-sonnet:thinking",
                     "rationale": "The new 3.7 explicitly supports extended thinking, matching o1 reasoning but with Claude's superior formatting."
                 }
            },
            "npc_story_engine": {
                 "name": "Gaming NPC Dynamic Story Engine",
                 "stack": {
                    "dialogue_brain": {
                        "provider": "openrouter",
                        "id": "anthropic/claude-3-haiku",
                        "rationale": "Lightning fast, deeply expressive, and highly steerable for specific medieval/sci-fi personality personas."
                    },
                     "sentiment_router": {
                         "provider": "groq",
                         "id": "meta-llama/llama-3.1-8b-instant",
                         "rationale": "Used purely to classify the player's sentiment (Hostile, Friendly, Merchant) in 10ms to trigger game animations."
                     },
                     "voice_acting": {
                         "provider": "elevenlabs",
                         "id": "elevenlabs/turbo-v2.5",
                         "rationale": "The highest emotional range and voice consistency across an entire 100-hour game."
                     }
                 },
                 "estimated_cost_per_interaction": "$0.015",
                 "bleeding_edge_wildcard": {
                     "provider": "replicate",
                     "id": "meta/llama-3-70b-instruct-uncensored",
                     "rationale": "Community fine-tune perfect for gritty, unfiltered M-rated gaming scenarios where safety filters ruin immersion."
                 }
            },
            "cybersecurity_anomaly_detector": {
                 "name": "Live Cybersecurity Log Anomaly Detection",
                 "stack": {
                    "bulk_log_parser": {
                        "provider": "together",
                        "id": "mistralai/mixtral-8x22b-instruct",
                        "rationale": "MoE architecture is perfect for cheap, high-throughput parsing of millions of lines of Nginx access logs."
                    },
                     "threat_investigator": {
                         "provider": "openrouter",
                         "id": "openai/gpt-4o",
                         "rationale": "Triggered only when Mixtral flags an anomaly. High reasoning capability to determine if a payload is an actual zero-day exploit."
                     }
                 },
                 "estimated_cost_per_interaction": "$0.005",
                 "bleeding_edge_wildcard": {
                     "provider": "openrouter",
                     "id": "qwen/qwen-2.5-72b-instruct",
                     "rationale": "Chinese leading model is exceptionally sharp at code and log syntax, often outperforming Llama 3 on technical schemas."
                 }
            },
            "low_latency_coding_agent": {
                "name": "Hyper-Fast Autonomous Coding Cursor Sync",
                "stack": {
                    "reasoning_llm": {
                        "provider": "groq",
                        "id": "llama-3.3-70b-versatile",
                        "rationale": "LPU hardware provides 800+ tokens per second. Incredible for fast autonomous code generation."
                    },
                    "embedding": {
                        "provider": "together",
                        "id": "nomic-ai/nomic-embed-text-v1.5",
                        "rationale": "Extremely fast, low cost embedding model for searching local codebase context."
                    }
                },
                "estimated_cost_per_interaction": "$0.003",
                "bleeding_edge_wildcard": {
                    "provider": "openrouter",
                    "id": "qwen/qwen-2.5-coder-32b-instruct",
                    "rationale": "Matches GPT-4o coding performance at 1/10th the token cost."
                }
            },
            "cinematic_video_producer": {
                 "name": "Automated Cinematic Video Trailer Production",
                 "stack": {
                    "script_generation": {
                        "provider": "openrouter",
                        "id": "openai/o1-mini",
                        "rationale": "High planning capability to write detailed visual scene descriptions and camera prompt logic (pan, dolly, tracking)."
                    },
                     "image_generation": {
                         "provider": "replicate",
                         "id": "black-forest-labs/flux-1.1-pro",
                         "rationale": "The absolute pinnacle of photorealism for base frames."
                     },
                     "video_generation": {
                         "provider": "fal.ai",
                         "id": "fal-ai/kling-video/v1/standard/image-to-video",
                         "rationale": "Smooth motion, 5s generations natively with excellent physics adherence."
                     }
                 },
                 "estimated_cost_per_interaction": "$0.850",
                 "bleeding_edge_wildcard": {
                     "provider": "fal.ai",
                     "id": "fal-ai/hunyuan-video",
                     "rationale": "Brand new Tencent open weights video model. Extremely fluid physics, matching Sora in closed betas."
                 }
            },
             "automated_medical_triage": {
                 "name": "HIPAA-Compliant Automated Medical Triage",
                 "stack": {
                    "intake_parser": {
                        "provider": "openrouter",
                        "id": "anthropic/claude-3-haiku",
                        "rationale": "High accuracy text parsing to extract symptoms, duration, and pain levels from messy patient intake forms."
                    },
                     "diagnostic_brain": {
                         "provider": "openrouter",
                         "id": "google/gemini-1.5-pro",
                         "rationale": "Google's models frequently score highest on the MedQA benchmarks for clinical reasoning."
                     }
                 },
                 "estimated_cost_per_interaction": "$0.012",
                 "bleeding_edge_wildcard": {
                     "provider": "openrouter",
                     "id": "meta-llama/llama-3-8b-instruct",
                     "rationale": "Deployable securely fully on-premise, bypassing cloud HIPAA compliance entirely for edge hospitals."
                 }
            }
        }
    }
    
    print(f"[Discovery Engine] Curated {len(blueprints['intents'])} 100X application stacks.")
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w') as f:
        json.dump(blueprints, f, indent=4)
        
    print(f"[Discovery Engine] Database updated at {DB_PATH}")

if __name__ == "__main__":
    scrape_trending_gateways()
