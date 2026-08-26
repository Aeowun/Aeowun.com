from PIL import Image, ImageDraw, ImageFont
import os

def create_logo(width, height, output_name):
    # Colors
    turquoise = (27, 196, 196)
    midnight = (15, 17, 26)
    
    # Create image
    img = Image.new('RGB', (width, height), color=midnight)
    draw = ImageDraw.Draw(img)
    
    # Draw a stylized "DROP" or "AEOPIN" icon
    # A simple geometric logo: A turquoise circle with a hollow center and a "drop" shape
    center_x, center_y = width // 2, height // 2
    radius = min(width, height) // 4
    
    # Glow effect
    for r in range(radius + 40, radius, -2):
        alpha = int(255 * (1 - (r - radius) / 40) * 0.2)
        glow_color = (turquoise[0], turquoise[1], turquoise[2])
        draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], outline=glow_color, width=2)

    # Main circle
    draw.ellipse([center_x - radius, center_y - radius, center_x + radius, center_y + radius], outline=turquoise, width=width // 40)
    
    # Inner "A" or "Drop" shape
    inner_radius = radius // 2
    draw.polygon([
        (center_x, center_y - inner_radius),
        (center_x - inner_radius, center_y + inner_radius),
        (center_x + inner_radius, center_y + inner_radius)
    ], fill=turquoise)
    
    # Text
    try:
        # Try to use a common Windows font
        font_path = "C:\\Windows\\Fonts\\segoeuib.ttf"
        font_size = width // 10
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
    
    text = "AEOPIN"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]
    
    # Draw text below the icon
    draw.text((center_x - text_w // 2, center_y + radius + 100), text, fill=(255, 255, 255), font=font)
    
    img.save(output_name)
    print(f"Created {output_name}")

# Create directories
os.makedirs("C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/assets/aeopin", exist_ok=True)

# Generate Box Art (1:1)
create_logo(2160, 2160, "C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/assets/aeopin/box_art.png")

# Generate Poster Art (2:3)
create_logo(1440, 2160, "C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/assets/aeopin/poster_art.png")
