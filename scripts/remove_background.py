#!/usr/bin/env python3
"""Remove background from an image and save a new PNG in the same folder."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
VENV_DIR = SCRIPT_DIR / ".venv"
VENV_PYTHON = VENV_DIR / "bin" / "python"
GET_PIP_URL = "https://bootstrap.pypa.io/get-pip.py"
PACKAGE_IMPORTS = {
    "rembg": "rembg",
    "pillow": "PIL",
    "onnxruntime": "onnxruntime",
}


def running_in_venv() -> bool:
    if sys.prefix == sys.base_prefix:
        return False
    return Path(sys.prefix).resolve() == VENV_DIR.resolve()


def get_missing_packages(python: Path) -> list[str]:
    missing: list[str] = []
    for package, import_name in PACKAGE_IMPORTS.items():
        result = subprocess.run(
            [str(python), "-c", f"import {import_name}"],
            capture_output=True,
        )
        if result.returncode != 0:
            missing.append(package)
    return missing


def install_packages(python: Path, packages: list[str]) -> None:
    if not packages:
        return
    print(f"Installing packages: {', '.join(packages)}")
    subprocess.check_call(
        [str(python), "-m", "pip", "install", *packages],
        stdout=sys.stdout,
        stderr=sys.stderr,
    )


def create_venv() -> None:
    print(f"Creating virtual environment at {VENV_DIR}")
    subprocess.check_call(
        [sys.executable, "-m", "venv", "--without-pip", str(VENV_DIR)],
        stdout=sys.stdout,
        stderr=sys.stderr,
    )


def bootstrap_pip() -> None:
    get_pip_path = SCRIPT_DIR / ".get-pip.py"
    print("Bootstrapping pip in virtual environment...")
    try:
        urllib.request.urlretrieve(GET_PIP_URL, get_pip_path)
        subprocess.check_call(
            [str(VENV_PYTHON), str(get_pip_path)],
            stdout=sys.stdout,
            stderr=sys.stderr,
        )
    finally:
        get_pip_path.unlink(missing_ok=True)


def ensure_venv() -> None:
    if running_in_venv():
        install_packages(sys.executable, get_missing_packages(Path(sys.executable)))
        return

    if not VENV_PYTHON.is_file():
        create_venv()
        bootstrap_pip()

    pip_check = subprocess.run(
        [str(VENV_PYTHON), "-m", "pip", "--version"],
        capture_output=True,
    )
    if pip_check.returncode != 0:
        bootstrap_pip()

    install_packages(VENV_PYTHON, get_missing_packages(VENV_PYTHON))

    print("Restarting script inside virtual environment...")
    os.execv(str(VENV_PYTHON), [str(VENV_PYTHON), *sys.argv])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove background from an image and save a timestamped PNG."
    )
    parser.add_argument(
        "image_path",
        type=Path,
        help="Path to the source image file",
    )
    return parser.parse_args()


def build_output_path(source: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return source.parent / f"{source.stem}_nobg_{timestamp}.png"


def remove_background(source: Path, destination: Path) -> None:
    from PIL import Image
    from rembg import remove

    with Image.open(source) as image:
        result = remove(image)

    if result.mode != "RGBA":
        result = result.convert("RGBA")

    result.save(destination, format="PNG")
    print(f"Saved: {destination}")


def main() -> int:
    ensure_venv()

    args = parse_args()
    source = args.image_path.expanduser().resolve()

    if not source.is_file():
        print(f"Error: file not found: {source}", file=sys.stderr)
        return 1

    destination = build_output_path(source)

    try:
        remove_background(source, destination)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
