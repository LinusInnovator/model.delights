from playwright.sync_api import sync_playwright
import time

def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://lmarena.ai/", timeout=60000)
        time.sleep(5)
        
        try:
            page.click('text="Accept Cookies"', timeout=5000)
            print("Clicked Accept Cookies")
        except:
            print("Could not find Accept Cookies")
            
        time.sleep(2)
        
        # Try to find something that says Leaderboard and click it
        try:
            page.click('text="Leaderboard"', timeout=5000)
            print("Clicked text='Leaderboard'")
        except:
            print("Could not find text='Leaderboard'")
            # Let's see if there is an a tag with href containing leaderboard
            try:
                page.click('a[href*="leaderboard"]', timeout=5000)
                print("Clicked a[href*='leaderboard']")
            except:
                print("Could not find a href leaderboard")
                
        time.sleep(5)
        page.screenshot(path="/tmp/lmarena_screenshot_2.png")
        
        with open("/tmp/lmarena_dump_2.html", "w") as f:
            f.write(page.content())
            
        browser.close()

if __name__ == "__main__":
    scrape()
    print("Screenshot saved to /tmp/lmarena_screenshot_2.png")
