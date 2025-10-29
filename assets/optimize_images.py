from PIL import Image
from pathlib import Path

BASE = Path(__file__).parent
IMAGES = [
    (BASE / 'route1.jpg', 'route1', [400,800,1200]),
    (BASE / 'route2.jpg', 'route2', [400,800,1200]),
    (BASE / 'route3.jpg', 'route3', [400,800,1200]),
    (BASE / 'hero-poster.jpg', 'hero-poster', [800,1600])
]

WEBP_QUALITY = 80
JPG_QUALITY = 82

print('Optimizing images...')

for path, name, sizes in IMAGES:
    if not path.exists():
        print(f'Warning: {path} not found, skipping')
        continue
    img = Image.open(path)
    img = img.convert('RGB')
    w0, h0 = img.size
    for s in sizes:
        # compute target size preserving aspect ratio
        ratio = s / max(w0, h0)
        tw = int(w0 * ratio)
        th = int(h0 * ratio)
        resized = img.resize((tw, th), Image.LANCZOS)
        webp_path = BASE / f'{name}-{s}.webp'
        jpg_path = BASE / f'{name}-{s}.jpg'
        print(f'Saving {webp_path} ({tw}x{th})')
        resized.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        print(f'Saving {jpg_path} ({tw}x{th})')
        resized.save(jpg_path, 'JPEG', quality=JPG_QUALITY, optimize=True)

print('Done.')
