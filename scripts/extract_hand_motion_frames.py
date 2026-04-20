from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


KNOWN_REMOTION_ROOTS = (
    Path.home() / "Desktop" / "vibe-coding" / "Remotion" / "node_modules" / "@remotion" / "compositor-win32-x64-msvc",
    Path.home() / "Desktop" / "vibe-coding" / "remotion-cursor" / "node_modules" / "@remotion" / "compositor-win32-x64-msvc",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract representative hand-motion frames and build review sheets."
    )
    parser.add_argument("--source", required=True, help="Directory containing source mp4 files.")
    parser.add_argument("--output", required=True, help="Directory to write extracted review assets.")
    parser.add_argument("--samples", type=int, default=9, help="Number of evenly spaced samples per clip.")
    parser.add_argument(
        "--trim-start",
        type=float,
        default=0.08,
        help="Start sampling after this fraction of the clip duration.",
    )
    parser.add_argument(
        "--trim-end",
        type=float,
        default=0.92,
        help="Stop sampling before this fraction of the clip duration.",
    )
    parser.add_argument("--thumb-width", type=int, default=260, help="Thumbnail width for contact sheets.")
    parser.add_argument("--thumb-height", type=int, default=260, help="Thumbnail height for contact sheets.")
    parser.add_argument("--tile-cols", type=int, default=3, help="Columns per contact sheet.")
    return parser.parse_args()


def find_binary(binary_name: str) -> str:
    env_name = f"{binary_name.upper()}_BIN"
    env_value = os.environ.get(env_name)
    if env_value and Path(env_value).exists():
        return env_value

    resolved = shutil.which(binary_name)
    if resolved:
        return resolved

    for root in KNOWN_REMOTION_ROOTS:
        candidate = root / f"{binary_name}.exe"
        if candidate.exists():
            return str(candidate)

    raise FileNotFoundError(
        f"Could not find {binary_name}. Set {env_name} or install the binary."
    )


def run(cmd: list[str]) -> str:
    completed = subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return completed.stdout.strip()


def probe_duration(ffprobe_bin: str, video_path: Path) -> float:
    output = run(
        [
            ffprobe_bin,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nk=1:nw=1",
            str(video_path),
        ]
    )
    return float(output)


def probe_stream(ffprobe_bin: str, video_path: Path) -> dict[str, str]:
    output = run(
        [
            ffprobe_bin,
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate,nb_frames",
            "-of",
            "json",
            str(video_path),
        ]
    )
    payload = json.loads(output)
    streams = payload.get("streams", [])
    return streams[0] if streams else {}


def build_sample_times(duration: float, count: int, trim_start: float, trim_end: float) -> list[float]:
    if count <= 1:
        return [duration * 0.5]

    start = duration * trim_start
    end = duration * trim_end
    if end <= start:
        start = duration * 0.1
        end = duration * 0.9

    return [
        start + ((end - start) * index / (count - 1))
        for index in range(count)
    ]


def extract_frame(ffmpeg_bin: str, video_path: Path, time_s: float, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            ffmpeg_bin,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            f"{time_s:.3f}",
            "-i",
            str(video_path),
            "-frames:v",
            "1",
            str(output_path),
        ],
        check=True,
    )


def get_font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def fit_image(path: Path, width: int, height: int) -> Image.Image:
    image = Image.open(path).convert("RGB")
    return ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def draw_label(draw: ImageDraw.ImageDraw, x: int, y: int, width: int, title: str, subtitle: str) -> None:
    title_font = get_font(18)
    subtitle_font = get_font(14)
    padding_x = 12
    padding_y = 8
    overlay_height = 54

    draw.rounded_rectangle(
        (x + 8, y + 8, x + width - 8, y + 8 + overlay_height),
        radius=14,
        fill=(10, 12, 20, 210),
    )
    draw.text((x + padding_x + 8, y + padding_y + 8), title, fill=(245, 247, 255), font=title_font)
    draw.text((x + padding_x + 8, y + padding_y + 28), subtitle, fill=(130, 214, 255), font=subtitle_font)


def build_contact_sheet(
    frame_paths: list[Path],
    labels: list[tuple[str, str]],
    output_path: Path,
    thumb_width: int,
    thumb_height: int,
    tile_cols: int,
) -> None:
    tile_rows = math.ceil(len(frame_paths) / tile_cols)
    gap = 18
    title_height = 28
    canvas_width = tile_cols * thumb_width + (tile_cols + 1) * gap
    canvas_height = tile_rows * (thumb_height + title_height) + (tile_rows + 1) * gap
    canvas = Image.new("RGB", (canvas_width, canvas_height), (8, 10, 16))
    draw = ImageDraw.Draw(canvas)

    for index, frame_path in enumerate(frame_paths):
        row = index // tile_cols
        col = index % tile_cols
        x = gap + col * (thumb_width + gap)
        y = gap + row * (thumb_height + title_height + gap)
        tile = fit_image(frame_path, thumb_width, thumb_height)
        canvas.paste(tile, (x, y + title_height))
        title, subtitle = labels[index]
        draw_label(draw, x, y, thumb_width, title, subtitle)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, quality=95)


def build_overview_sheet(entries: list[dict], output_path: Path) -> None:
    thumb_width = 250
    thumb_height = 250
    tile_cols = 4
    gap = 20
    title_height = 72
    tile_rows = max(1, math.ceil(len(entries) / tile_cols))
    canvas_width = tile_cols * thumb_width + (tile_cols + 1) * gap
    canvas_height = tile_rows * (thumb_height + title_height) + (tile_rows + 1) * gap
    canvas = Image.new("RGB", (canvas_width, canvas_height), (8, 10, 16))
    draw = ImageDraw.Draw(canvas)
    title_font = get_font(20)
    subtitle_font = get_font(13)

    for index, entry in enumerate(entries):
        row = index // tile_cols
        col = index % tile_cols
        x = gap + col * (thumb_width + gap)
        y = gap + row * (thumb_height + title_height + gap)
        chosen_frame = Path(entry["samples"][-1]["file"])
        tile = fit_image(chosen_frame, thumb_width, thumb_height)
        canvas.paste(tile, (x, y + title_height))
        draw.rounded_rectangle(
            (x, y, x + thumb_width, y + title_height - 10),
            radius=16,
            fill=(13, 16, 28),
            outline=(48, 55, 88),
            width=1,
        )
        draw.text((x + 12, y + 10), f"{entry['index']:02d}", fill=(245, 247, 255), font=title_font)
        draw.text((x + 62, y + 12), entry["slug"], fill=(130, 214, 255), font=subtitle_font)
        draw.text(
            (x + 12, y + 40),
            f"{entry['duration_s']:.2f}s | {entry['stream'].get('width', '?')}x{entry['stream'].get('height', '?')}",
            fill=(180, 186, 204),
            font=subtitle_font,
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, quality=95)


def main() -> int:
    args = parse_args()
    source_dir = Path(args.source).expanduser()
    output_dir = Path(args.output)

    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory does not exist: {source_dir}")

    ffmpeg_bin = find_binary("ffmpeg")
    ffprobe_bin = find_binary("ffprobe")

    videos = sorted(source_dir.glob("*.mp4"))
    if not videos:
        raise FileNotFoundError(f"No mp4 files found in: {source_dir}")

    review_dir = output_dir / "review"
    frames_root = review_dir / "frames"
    sheets_root = review_dir / "sheets"
    manifest_path = review_dir / "manifest.json"

    entries: list[dict] = []

    for index, video_path in enumerate(videos, start=1):
        slug = f"clip-{index:02d}"
        duration = probe_duration(ffprobe_bin, video_path)
        stream_info = probe_stream(ffprobe_bin, video_path)
        sample_times = build_sample_times(duration, args.samples, args.trim_start, args.trim_end)

        frame_dir = frames_root / slug
        frame_paths: list[Path] = []
        labels: list[tuple[str, str]] = []
        samples: list[dict] = []

        for sample_index, time_s in enumerate(sample_times, start=1):
            frame_path = frame_dir / f"{slug}-sample-{sample_index:02d}.png"
            extract_frame(ffmpeg_bin, video_path, time_s, frame_path)
            frame_paths.append(frame_path)
            labels.append((f"{slug} / {sample_index:02d}", f"{time_s:.2f}s"))
            samples.append(
                {
                    "sample_index": sample_index,
                    "time_s": round(time_s, 3),
                    "file": str(frame_path).replace("\\", "/"),
                }
            )

        contact_sheet = sheets_root / f"{slug}-contact.jpg"
        build_contact_sheet(
            frame_paths=frame_paths,
            labels=labels,
            output_path=contact_sheet,
            thumb_width=args.thumb_width,
            thumb_height=args.thumb_height,
            tile_cols=args.tile_cols,
        )

        entries.append(
            {
                "index": index,
                "slug": slug,
                "source_name": video_path.name,
                "source_path": str(video_path).replace("\\", "/"),
                "duration_s": round(duration, 3),
                "stream": stream_info,
                "contact_sheet": str(contact_sheet).replace("\\", "/"),
                "samples": samples,
            }
        )

    build_overview_sheet(entries, sheets_root / "overview.jpg")
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(
            {
                "source": str(source_dir).replace("\\", "/"),
                "ffmpeg_bin": ffmpeg_bin.replace("\\", "/"),
                "ffprobe_bin": ffprobe_bin.replace("\\", "/"),
                "entries": entries,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Generated review assets for {len(entries)} video clips in {review_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
