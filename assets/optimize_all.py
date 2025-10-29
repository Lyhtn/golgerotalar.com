from PIL import Image
from pathlib import Path

# Simple image optimizer: resizes down to max_width and saves optimized JPG and WEBP
BASE = Path(__file__).parent
EXCLUDE_DIRS = {BASE / 'backups', BASE / 'new_uploads'}
MAX_WIDTH = 1200
JPG_QUALITY = 82
WEBP_QUALITY = 80

def is_image(p: Path):
    return p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')

def process_file(p: Path):
    try:
        img = Image.open(p)
    except Exception as e:
        print(f"Skipping (open error): {p} -> {e}")
        return
    # convert to RGB for JPG
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > MAX_WIDTH:
        ratio = MAX_WIDTH / max(w, h)
        tw = int(w * ratio)
        th = int(h * ratio)
        img = img.resize((tw, th), Image.LANCZOS)
        print(f"Resized {p.name} -> {tw}x{th}")
    else:
        print(f"Keeping size for {p.name} ({w}x{h})")

    # save optimized jpg (overwrite original if jpg/jpeg)
    jpg_path = p.with_suffix('.jpg')
    try:
        img.save(jpg_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
        print(f"Saved optimized JPG: {jpg_path.name}")
    except Exception as e:
        print(f"Failed JPG save for {p}: {e}")

    # save webp
    webp_path = p.with_suffix('.webp')
    try:
        img.save(webp_path, 'WEBP', quality=WEBP_QUALITY, method=6)
        print(f"Saved WEBP: {webp_path.name}")
    except Exception as e:
        print(f"Failed WEBP save for {p}: {e}")

def main():
    for p in sorted(BASE.iterdir()):
        if any(str(p).startswith(str(d)) for d in EXCLUDE_DIRS):
            continue
        if p.is_dir():
            continue
        if not is_image(p):
            continue
        if p.name.lower() in ('logo.svg',):
            continue
        process_file(p)

if __name__ == '__main__':
    print('Running optimize_all.py')
    main()
