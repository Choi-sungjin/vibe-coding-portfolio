from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy selected extracted hand-motion frames into the pose asset folder."
    )
    parser.add_argument("--review-root", required=True, help="Review directory produced by extract_hand_motion_frames.py")
    parser.add_argument("--selection", required=True, help="Selection json file")
    parser.add_argument("--target-dir", required=True, help="Destination pose asset directory")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    review_root = Path(args.review_root)
    selection_path = Path(args.selection)
    target_dir = Path(args.target_dir)

    selection = json.loads(selection_path.read_text(encoding="utf-8"))
    target_dir.mkdir(parents=True, exist_ok=True)

    copied: list[dict[str, str]] = []

    for target_name, entry in selection.items():
        clip = entry["clip"]
        sample = int(entry["sample"])
        source_path = review_root / "frames" / clip / f"{clip}-sample-{sample:02d}.png"
        if not source_path.exists():
            raise FileNotFoundError(f"Missing extracted frame: {source_path}")

        destination_path = target_dir / target_name
        shutil.copy2(source_path, destination_path)
        clear_source_badge(destination_path)
        copied.append(
            {
                "target": str(destination_path).replace("\\", "/"),
                "clip": clip,
                "sample": sample,
                "note": entry.get("note", ""),
            }
        )

    manifest_path = target_dir / "pose-capture-manifest.json"
    manifest_path.write_text(
        json.dumps({"copied": copied}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Applied {len(copied)} selected pose captures into {target_dir}")
    return 0


def clear_source_badge(image_path: Path) -> None:
    image = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle((0, 0, 104, 104), fill=(0, 0, 0, 255))

    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rectangle((0, 0, 104, 104), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(14))

    result = Image.composite(overlay, image, mask)
    result.convert("RGB").save(image_path)


if __name__ == "__main__":
    raise SystemExit(main())
