import json
import traceback

try:
    from gradio_client import Client
    print("Connecting to lmsys/chatbot-arena-leaderboard...", flush=True)
    client = Client("lmsys/chatbot-arena-leaderboard")
    
    print("\nAPI signature:")
    api_info = client.view_api(return_format="dict")
    print(json.dumps(api_info, indent=2))
    
    # Let's try to query the main dataframe if we can figure out the endpoint.
    # The Chatbot Arena has multiple tabs, the main leaderboard is usually the first dataframe.
except Exception as e:
    print(f"Error occurred: {e}")
    traceback.print_exc()
