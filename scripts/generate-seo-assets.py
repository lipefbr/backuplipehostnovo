"""
Generate PWA manifest, favicon set, and OG image for LIPE.HOST SEO.
Outputs to /home/z/my-project/public/
"""
from PIL import Image, ImageDraw, ImageFont
import json
import os
import shutil

OUT_DIR = "/home/z/my-project/public"
SRC_LOGO = "/home/z/my-project/public/lipehost-logo.png"
os.makedirs(OUT_DIR, exist_ok=True)

# ---------- 1. manifest.json ----------
manifest = {
    "name": "LIPE.HOST — Sistemas, Aplicativos, SaaS e IA",
    "short_name": "LIPE.HOST",
    "description": "Desenvolvimento de sistemas, aplicativos, SaaS, IA e consultoria em infraestrutura.",
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#090909",
    "theme_color": "#090909",
    "categories": ["business", "productivity", "developer"],
    "lang": "pt-BR",
    "dir": "ltr",
    "icons": [
        {"src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png"},
        {"src": "/favicon-32x32.png", "sizes": "32x32", "type": "image/png"},
        {"src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png"},
        {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
        {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
    ],
    "shortcuts": [
        {"name": "Loja de Sistemas", "url": "/loja", "description": "Catálogo de sistemas prontos"},
        {"name": "Contato", "url": "/#contato", "description": "Solicitar orçamento"},
    ],
}
with open(f"{OUT_DIR}/manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print(f"✓ manifest.json")

# ---------- 2. Favicon set ----------
# Generate an "Lh" icon (square) with gradient bg using the LIPE.HOST brand
def make_icon(size, radius_ratio=0.22, save_path=None):
    """Generate a square icon with gradient background and 'L' letter."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Gradient background: blue (top-left) to purple (bottom-right)
    gradient = Image.new("RGB", (size, size), (0, 0, 0))
    gd = ImageDraw.Draw(gradient)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(59 + (109 - 59) * t)   # 59 -> 109 (blue -> purple)
            g = int(130 + (93 - 130) * t)  # 130 -> 93
            b = int(246 + (246 - 246) * t) # 246 -> 246
            gd.point((x, y), (r, g, b))

    # Mask with rounded corners
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    radius = int(size * radius_ratio)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    img.paste(gradient, (0, 0), mask)

    # Draw "L" letter in white
    try:
        # Try to find a bold font
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]
        font_path = next((p for p in font_paths if os.path.exists(p)), None)
        font_size = int(size * 0.6)
        font = ImageFont.truetype(font_path, font_size) if font_path else ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    # Draw "L" centered
    text = "L"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0]
    ty = (size - th) // 2 - bbox[1]
    draw.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)

    if save_path:
        img.save(save_path, "PNG", optimize=True)
        print(f"✓ {os.path.basename(save_path)} ({size}x{size})")
    return img

# Generate all favicon sizes
make_icon(16, save_path=f"{OUT_DIR}/favicon-16x16.png")
make_icon(32, save_path=f"{OUT_DIR}/favicon-32x32.png")
make_icon(180, save_path=f"{OUT_DIR}/apple-touch-icon.png")
make_icon(192, save_path=f"{OUT_DIR}/android-chrome-192x192.png")
make_icon(512, save_path=f"{OUT_DIR}/android-chrome-512x512.png")

# favicon.ico (multi-resolution: 16, 32, 48)
img16 = make_icon(16)
img32 = make_icon(32)
img48 = make_icon(48)
img16.save(f"{OUT_DIR}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"✓ favicon.ico")

# ---------- 3. Open Graph image (1200x630) ----------
W, H = 1200, 630
og = Image.new("RGB", (W, H), (9, 9, 9))  # background #090909
draw = ImageDraw.Draw(og)

# Gradient overlay
gradient = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(gradient)
for y in range(H):
    for x in range(W):
        # diagonal gradient from blue (top-left) to purple (bottom-right)
        t = (x / W + y / H) / 2
        r = int(59 * (1 - t) + 109 * t)
        g = int(130 * (1 - t) + 93 * t)
        b = int(246)
        gd.point((x, y), (r, g, b))

# Mask gradient as a soft glow in corners
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd2 = ImageDraw.Draw(glow)
# big radial-ish glow from top-left
for r in range(600, 0, -20):
    alpha = max(0, int(50 * (1 - r / 600)))
    gd2.ellipse([-r, -r, r * 2, r * 2], fill=(59, 130, 246, alpha))
# big radial-ish glow from bottom-right
for r in range(700, 0, -20):
    alpha = max(0, int(40 * (1 - r / 700)))
    gd2.ellipse([W - r * 2, H - r * 2, W + r, H + r], fill=(109, 93, 246, alpha))

og_rgba = og.convert("RGBA")
og_rgba = Image.alpha_composite(og_rgba, glow)

draw = ImageDraw.Draw(og_rgba)

# Load fonts
try:
    font_paths_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    font_paths_reg = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    fb = next((p for p in font_paths_bold if os.path.exists(p)), None)
    fr = next((p for p in font_paths_reg if os.path.exists(p)), None)
    font_h1 = ImageFont.truetype(fb, 80) if fb else ImageFont.load_default()
    font_h2 = ImageFont.truetype(fb, 50) if fb else ImageFont.load_default()
    font_sm = ImageFont.truetype(fr, 28) if fr else ImageFont.load_default()
    font_xs = ImageFont.truetype(fr, 22) if fr else ImageFont.load_default()
except Exception:
    font_h1 = font_h2 = font_sm = font_xs = ImageFont.load_default()

# Draw badge: "Tecnologia para empresas"
badge_text = "TECNOLOGIA PARA EMPRESAS"
bbox = draw.textbbox((0, 0), badge_text, font=font_sm)
bw = bbox[2] - bbox[0]
bh = bbox[3] - bbox[1]
bx, by = 80, 90
# badge background
draw.rounded_rectangle([bx - 20, by - 10, bx + bw + 20, by + bh + 10], radius=20, outline=(59, 130, 246), width=2, fill=(59, 130, 246, 0))
draw.text((bx, by - 3), badge_text, fill=(147, 197, 253), font=font_sm)  # blue-300

# Big title
title_y = 200
draw.text((80, title_y), "LIPE.HOST", fill=(255, 255, 255), font=font_h1)
draw.text((80, title_y + 110), "Sistemas, Aplicativos e IA", fill=(255, 255, 255), font=font_h2)
draw.text((80, title_y + 175), "para Empresas", fill=(167, 139, 250), font=font_h2)  # purple-300

# Subtitle
sub = "Aplicativos mobile • Sistemas web • SaaS • Marketplaces • IA • Infraestrutura"
draw.text((80, title_y + 260), sub, fill=(167, 167, 167), font=font_xs)

# Stats row at bottom
stats = [("100+", "Projetos"), ("30+", "Sistemas"), ("99.9%", "Disponibilidade"), ("24/7", "Suporte")]
sx = 80
sy = 540
for v, l in stats:
    bbox = draw.textbbox((0, 0), v, font=font_h2)
    vw = bbox[2] - bbox[0]
    draw.text((sx, sy), v, fill=(255, 255, 255), font=font_h2)
    draw.text((sx, sy + 55), l, fill=(167, 167, 167), font=font_xs)
    sx += vw + 80

# Add logo in top-right corner
if os.path.exists(SRC_LOGO):
    logo = Image.open(SRC_LOGO).convert("RGBA")
    # Resize to height 80
    target_h = 80
    ratio = target_h / logo.height
    target_w = max(1, int(logo.width * ratio))
    logo_small = logo.resize((target_w, target_h), Image.LANCZOS)
    # Place in top-right with padding
    lx = W - target_w - 80
    ly = 90
    og_rgba.paste(logo_small, (lx, ly), logo_small)

og_rgba.convert("RGB").save(f"{OUT_DIR}/og-image.png", "PNG", optimize=True)
print(f"✓ og-image.png (1200x630)")

# ---------- 4. safari-pinned-tab.svg ----------
svg_content = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" rx="3" fill="#090909"/>
  <text x="8" y="12" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
</svg>
"""
with open(f"{OUT_DIR}/safari-pinned-tab.svg", "w") as f:
    f.write(svg_content)
print(f"✓ safari-pinned-tab.svg")

print("\n--- All SEO assets generated ---")
print(f"Output directory: {OUT_DIR}")
for f in sorted(os.listdir(OUT_DIR)):
    p = os.path.join(OUT_DIR, f)
    if os.path.isfile(p):
        print(f"  {f}: {os.path.getsize(p) // 1024} KB")
