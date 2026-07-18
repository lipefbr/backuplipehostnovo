"""
Process the uploaded LIPE.HOST logo:
- Remove the black background (make it transparent)
- Keep the white logo (icon + "lipe.host" text) as-is
- Auto-crop to content bounding box
- Save as transparent PNG to /home/z/my-project/public/lipehost-logo.png
"""
from PIL import Image
import numpy as np

SRC = "/home/z/my-project/upload/logolipehost_hd.png"
OUT = "/home/z/my-project/public/lipehost-logo.png"

# Load original
img = Image.open(SRC).convert("RGB")
print(f"Original: mode={img.mode}, size={img.size}")

arr = np.array(img)
brightness = arr.mean(axis=2)  # 0..255

# Alpha = brightness (white=255 -> opaque, black=0 -> transparent)
# Use smooth transition for anti-aliased edges
alpha = np.where(brightness > 50, 255, (brightness * 2).clip(0, 255).astype(np.uint8))

# Create RGBA: pure white where there's a logo, transparent elsewhere
rgba = np.zeros((arr.shape[0], arr.shape[1], 4), dtype=np.uint8)
mask = alpha > 0
rgba[mask, 0] = 255
rgba[mask, 1] = 255
rgba[mask, 2] = 255
rgba[:, :, 3] = alpha

out = Image.fromarray(rgba, mode="RGBA")

# Auto-crop to non-transparent content
bbox = out.getbbox()
print(f"Content bbox: {bbox}")
if bbox:
    out = out.crop(bbox)

# Save at full resolution
out.save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}")
print(f"Final size: {out.size}, mode: {out.mode}")
