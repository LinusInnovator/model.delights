from playwright.sync_api import sync_playwright
import time

def scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://lmarena.ai/", timeout=60000)
        time.sleep(10)
        page.screenshot(path="/tmp/lmarena_screenshot.png")
        browser.close()

if __name__ == "__main__":
    scrape()
    print("Screenshot saved to /tmp/lmarena_screenshot.png")
