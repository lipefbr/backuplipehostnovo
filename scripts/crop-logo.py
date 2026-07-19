"""
Tight-crop the processed logo and save optimized versions for navbar/footer.
"""
from PIL import Image
import numpy as np
import os

SRC = "/home/z/my-project/public/lipehost-logo.png"
OUT = "/home/z/my-project/public/lipehost-logo.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
mask = arr[:, :, 3] > 10
ys, xs = np.where(mask)

# Add padding around content
pad = 30
left = max(0, xs.min() - pad)
top = max(0, ys.min() - pad)
right = min(img.width, xs.max() + pad)
bottom = min(img.height, ys.max() + pad)

cropped = img.crop((left, top, right, bottom))
print(f"Cropped: {cropped.size} (aspect: {cropped.size[0]/cropped.size[1]:.2f})")

# Save full HD version (for retina display on high-DPI screens)
cropped.save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT} ({os.path.getsize(OUT)//1024} KB)")

# Save a smaller version for footer / mobile to reduce payload
# Navbar height target = 32px CSS, but provide 2x for retina = 64px
navbar_height = 64
ratio = navbar_height / cropped.size[1]
navbar_width = max(1, int(cropped.size[0] * ratio))
navbar_small = cropped.resize((navbar_width, navbar_height), Image.LANCZOS)
navbar_path = "/home/z/my-project/public/lipehost-logo-navbar.png"
navbar_small.save(navbar_path, "PNG", optimize=True)
print(f"Navbar version: {navbar_small.size} ({os.path.getsize(navbar_path)//1024} KB)")
