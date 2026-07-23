"""
Generate favicon set from uploaded Lh icon image.
- Input: upload/ChatGPT Image 20 de jul. de 2026, 02_20_45.png (1254x1254, black bg, white Lh)
- Output: favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180x180),
         android-chrome-192x192.png, android-chrome-512x512.png
- Strategy: keep the black background (looks great as favicon), no need to remove it.
  The icon will appear as a black square with white Lh — perfect for browser tab.
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/ChatGPT Image 20 de jul. de 2026, 02_20_45.png"
OUT_DIR = "/home/z/my-project/public"

# Load
img = Image.open(SRC).convert("RGB")
print(f"Loaded: {img.size} {img.mode}")

# Ensure output dir exists
os.makedirs(OUT_DIR, exist_ok=True)

# Generate all required favicon sizes
sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}

# Apple touch icon traditionally has a background — keep as-is (black)
# but add subtle padding for the 180 version
apple = img.copy()
apple.thumbnail((180, 180), Image.LANCZOS)
# Add small padding so the icon doesn't touch the edge of the apple touch icon
padded = Image.new("RGB", (180, 180), (9, 9, 9))  # match brand bg #090909
offset = ((180 - apple.width) // 2, (180 - apple.height) // 2)
padded.paste(apple, offset)
padded.save(f"{OUT_DIR}/apple-touch-icon.png", "PNG", optimize=True)
print(f"✓ apple-touch-icon.png (180x180)")

# Generate other PNG sizes
for filename, size in sizes.items():
    if filename == "apple-touch-icon.png":
        continue  # already done above
    s = img.copy()
    s.thumbnail((size, size), Image.LANCZOS)
    # Ensure exact size (thumbnail preserves aspect ratio, but our source is square)
    if s.size != (size, size):
        s = s.resize((size, size), Image.LANCZOS)
    s.save(f"{OUT_DIR}/{filename}", "PNG", optimize=True)
    print(f"✓ {filename} ({size}x{size})")

# Generate favicon.ico (multi-resolution: 16, 32, 48)
img16 = img.resize((16, 16), Image.LANCZOS)
img32 = img.resize((32, 32), Image.LANCZOS)
img48 = img.resize((48, 48), Image.LANCZOS)
img16.save(f"{OUT_DIR}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"✓ favicon.ico (multi-resolution 16+32+48)")

# Also update safari-pinned-tab.svg to match (simplified Lh on black)
svg_content = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" rx="3" fill="#090909"/>
  <text x="8" y="12" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
</svg>
"""
with open(f"{OUT_DIR}/safari-pinned-tab.svg", "w") as f:
    f.write(svg_content)
print(f"✓ safari-pinned-tab.svg")

print("\n--- All favicons generated ---")
for f in sorted(os.listdir(OUT_DIR)):
    p = os.path.join(OUT_DIR, f)
    if os.path.isfile(p) and ('favicon' in f or 'icon' in f or 'chrome' in f or 'safari' in f):
        print(f"  {f}: {os.path.getsize(p) // 1024} KB")
