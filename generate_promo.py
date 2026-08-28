import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw, ImageFont

async def capture_screenshots():
    print("Capturing HTML screenshots...")
    cwd = Path.cwd()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        # Capture settings page
        options_url = f"file://{cwd}/options.html"
        await page.goto(options_url)
        # Add a little artificial delay so fonts/images load
        await page.wait_for_timeout(1000)
        await page.screenshot(path="promo/screenshot-1.png")
        print("Generated screenshot-1.png (Options)")
        
        # Capture overlay page
        overlay_url = f"file://{cwd}/test-overlay.html"
        await page.goto(overlay_url)
        # Wait for the dog video and countdown to render
        await page.wait_for_timeout(2000)
        
        # Hide the trigger button so it looks like a real screenshot
        await page.evaluate("document.getElementById('trigger-btn').style.display = 'none';")
        await page.evaluate("document.getElementById('pawsoff-overlay').style.display = 'block';")
        await page.wait_for_timeout(500)
        
        await page.screenshot(path="promo/screenshot-2.png")
        print("Generated screenshot-2.png (Overlay)")
        
        await browser.close()

def generate_tiles():
    print("Generating promotional tiles...")
    
    # Ensure promo dir exists
    Path("promo").mkdir(exist_ok=True)
    
    # Load the logo (fallback to a default puppy if missing)
    logo_path = Path("icons/icon128.png")
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
    else:
        logo = Image.new("RGBA", (128, 128), (255, 100, 100, 255))
        
    bg_color = (15, 12, 9)
    primary_text = (240, 235, 229)
    accent_text = (255, 150, 100)
    
    # 1. Small Tile (440x280)
    img_small = Image.new("RGB", (440, 280), bg_color)
    draw_small = ImageDraw.Draw(img_small)
    
    # Center the logo and text
    # Resize logo slightly for the small tile
    logo_s = logo.resize((100, 100), Image.Resampling.LANCZOS)
    logo_x = (440 - 100) // 2
    logo_y = 60
    img_small.paste(logo_s, (logo_x, logo_y), logo_s)
    
    # Add Text (if font is available, else we just use default)
    # macOS standard font fallback
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except IOError:
        font_large = ImageFont.load_default()
        
    text = "PawsOff"
    bbox = draw_small.textbbox((0, 0), text, font=font_large)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw_small.text(((440 - tw) / 2, logo_y + 110), text, font=font_large, fill=primary_text)
    
    img_small.save("promo/small-tile.png", "PNG")
    print("Generated small-tile.png (440x280)")
    
    # 2. Marquee Tile (1400x560)
    img_marq = Image.new("RGB", (1400, 560), bg_color)
    draw_marq = ImageDraw.Draw(img_marq)
    
    # Logo
    logo_m = logo.resize((200, 200), Image.Resampling.LANCZOS)
    logo_x = (1400 - 200) // 2
    logo_y = 120
    img_marq.paste(logo_m, (logo_x, logo_y), logo_m)
    
    # Text
    try:
        font_huge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
        font_med = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except IOError:
        font_huge = ImageFont.load_default()
        font_med = ImageFont.load_default()
        
    title = "PawsOff"
    subtitle = "The cutest forced break."
    
    bbox_title = draw_marq.textbbox((0, 0), title, font=font_huge)
    tw_t, th_t = bbox_title[2] - bbox_title[0], bbox_title[3] - bbox_title[1]
    draw_marq.text(((1400 - tw_t) / 2, logo_y + 220), title, font=font_huge, fill=primary_text)
    
    bbox_sub = draw_marq.textbbox((0, 0), subtitle, font=font_med)
    tw_s, th_s = bbox_sub[2] - bbox_sub[0], bbox_sub[3] - bbox_sub[1]
    draw_marq.text(((1400 - tw_s) / 2, logo_y + 320), subtitle, font=font_med, fill=accent_text)
    
    img_marq.save("promo/marquee.png", "PNG")
    print("Generated marquee.png (1400x560)")

async def main():
    Path("promo").mkdir(exist_ok=True)
    generate_tiles()
    await capture_screenshots()
    print("All promo images successfully generated in the 'promo' folder!")

if __name__ == "__main__":
    asyncio.run(main())
