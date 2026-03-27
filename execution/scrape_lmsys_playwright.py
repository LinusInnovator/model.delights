from playwright.sync_api import sync_playwright
import time
import json

def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to lmarena.ai...", flush=True)
        page.goto("https://lmarena.ai/", timeout=60000)
        
        # We need to wait for the Leaderboard to be fully rendered 
        print("Waiting for table to render...", flush=True)
        try:
            page.wait_for_selector('table tbody tr', timeout=30000)
        except Exception as e:
            print("Timeout waiting for table. Here is the page content:")
            print(page.content()[:1000])
            browser.close()
            return {}
            
        time.sleep(5) # Let it render fully
        
        print("Extracting rows...", flush=True)
        rows = page.query_selector_all('table tbody tr')
        
        elo_dict = {}
        for row in rows:
            tds = row.query_selector_all('td')
            if len(tds) >= 3:
                cells = [td.inner_text().strip() for td in tds]
                if not cells: continue
                
                # Gradio table columns: Rank, Model, Elo, 95% CI, Votes...
                try:
                    model_name = cells[1]
                    elo_col = cells[2]
                    
                    # Clean up model name (sometimes has links or extra text)
                    model_name_clean = model_name.split("\n")[0].strip()
                    elo_val = int(elo_col)
                    elo_dict[model_name_clean] = elo_val
                except ValueError:
                    pass
                except IndexError:
                    pass
        
        browser.close()
        return elo_dict

if __name__ == "__main__":
    data = scrape()
    print(f"Scraped {len(data)} models.")
    if data:
        print(json.dumps({k: data[k] for k in list(data.keys())[:10]}, indent=2))
