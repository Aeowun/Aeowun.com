from PIL import Image, ImageDraw, ImageFont
import os

def create_screenshot():
    # Colors
    turquoise = (27, 196, 196)
    midnight = (15, 17, 26)
    slate = (27, 30, 43)
    text_primary = (225, 229, 242)
    text_secondary = (139, 148, 158)
    
    # Desktop background (dark gradient)
    img = Image.new('RGB', (1920, 1080), color=(10, 12, 20))
    draw = ImageDraw.Draw(img)
    
    # App window (centered)
    win_w, win_h = 340 * 2, 520 * 2 # Scale up for better quality
    win_x, win_y = (1920 - win_w) // 2, (1080 - win_h) // 2
    
    # Shadow
    draw.rounded_rectangle([win_x - 10, win_y - 10, win_x + win_w + 10, win_y + win_h + 10], radius=24, fill=(0, 0, 0, 100))
    
    # Window body
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + win_h], radius=24, fill=midnight, outline=turquoise, width=2)
    
    # Header
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + 88], radius=24, fill=slate)
    
    # Title "DROP"
    try:
        font = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 40)
        font_small = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 24)
    except:
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
        
    draw.text((win_x + 60, win_y + 24), "DROP", fill=text_secondary, font=font)
    draw.ellipse([win_x + 24, win_y + 32, win_x + 48, win_y + 56], fill=turquoise)
    
    # Storage Appliance (The Circle)
    circle_r = 140
    circle_x, circle_y = win_x + win_w // 2, win_y + 200
    draw.ellipse([circle_x - circle_r, circle_y - circle_r, circle_x + circle_r, circle_y + circle_r], outline=(255, 255, 255, 20), width=2)
    draw.ellipse([circle_x - 80, circle_y - 80, circle_x + 80, circle_y + 80], fill=(27, 196, 196, 30))
    
    # Search Bar
    draw.rounded_rectangle([win_x + 40, win_y + 400, win_x + win_w - 40, win_y + 480], radius=12, fill=slate, outline=turquoise, width=1)
    draw.text((win_x + 60, win_y + 420), "Search captured items...", fill=text_secondary, font=font_small)
    
    # Sample Items
    draw.text((win_x + 40, win_y + 520), "Recent Drops", fill=text_primary, font=font)
    
    for i in range(3):
        y = win_y + 580 + (i * 100)
        draw.rounded_rectangle([win_x + 40, y, win_x + win_w - 40, y + 80], radius=8, fill=slate)
        draw.text((win_x + 60, y + 20), f"Captured Snippet #{3-i}", fill=text_primary, font=font_small)
        draw.text((win_x + 60, y + 50), "2 minutes ago • Text", fill=text_secondary, font=font_small)

    img.save("C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/assets/aeopin/screenshot_1.png")
    print("Created C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/assets/aeopin/screenshot_1.png")

create_screenshot()
