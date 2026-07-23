"""
Regenera favicons a partir da logo Lh branca no fundo preto (1254x1254).
Mantém o fundo preto — perfeito pra ícone de navegador.
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/ChatGPT Image 20 de jul. de 2026, 02_20_45.png"
OUT_DIR = "/home/z/my-project/public"

img = Image.open(SRC).convert("RGB")
print(f"Loaded: {img.size} {img.mode}")

# Garante dir
os.makedirs(OUT_DIR, exist_ok=True)

# Sizes a gerar
sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}

# Apple touch icon: preenchemos com bg #090909 (dark) pra combinar com a marca
apple = img.copy()
apple.thumbnail((180, 180), Image.LANCZOS)
padded = Image.new("RGB", (180, 180), (9, 9, 9))
offset = ((180 - apple.width) // 2, (180 - apple.height) // 2)
padded.paste(apple, offset)
padded.save(f"{OUT_DIR}/apple-touch-icon.png", "PNG", optimize=True)
print(f"✓ apple-touch-icon.png (180x180)")

# Outros PNGs
for filename, size in sizes.items():
    if filename == "apple-touch-icon.png":
        continue
    s = img.copy()
    s.thumbnail((size, size), Image.LANCZOS)
    if s.size != (size, size):
        s = s.resize((size, size), Image.LANCZOS)
    s.save(f"{OUT_DIR}/{filename}", "PNG", optimize=True)
    print(f"✓ {filename} ({size}x{size})")

# favicon.ico multi-resolução
img16 = img.resize((16, 16), Image.LANCZOS)
img32 = img.resize((32, 32), Image.LANCZOS)
img48 = img.resize((48, 48), Image.LANCZOS)
img16.save(f"{OUT_DIR}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print(f"✓ favicon.ico")

# Atualiza safari-pinned-tab.svg
svg_content = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" rx="3" fill="#090909"/>
  <text x="8" y="12" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">L</text>
</svg>
"""
with open(f"{OUT_DIR}/safari-pinned-tab.svg", "w") as f:
    f.write(svg_content)
print(f"✓ safari-pinned-tab.svg")

# Copia a logo original pra ser usada como bot icon no chat (mantém fundo preto, 1254x1254)
img.save(f"{OUT_DIR}/chat-bot-icon.png", "PNG", optimize=True)
print(f"✓ chat-bot-icon.png (1254x1254 — para o bot do chat)")

# Versão menor pra não pesar (64x64)
small = img.copy()
small.thumbnail((64, 64), Image.LANCZOS)
small.save(f"{OUT_DIR}/chat-bot-icon-small.png", "PNG", optimize=True)
print(f"✓ chat-bot-icon-small.png (64x64)")

print("\n--- All favicons + bot icon generated ---")
