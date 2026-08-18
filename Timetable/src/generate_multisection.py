"""
generate_multisection.py
--------------------------
Entry point for multi-section generation via CP-SAT. Sibling to
src/resolver.py (single-section backtracking) -- this is the version to
reach for once you need more than one section sharing a teacher pool.

Usage:
    python3 generate_multisection.py            # random seed
    python3 generate_multisection.py 3           # fixed seed
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from src.multisection.solve import solve
from src.multisection.format_output import write_section_csvs

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "dataset" / "raw" / "current" / "demo_input_3section_shared.json"
OUTPUT_DIR = ROOT / "output"


def main():
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    teachers_by_code = {t["teacher_code"]: t for t in payload["teachers"]}

    seed = int(sys.argv[1]) if len(sys.argv) > 1 else None
    result = solve(payload, seed=seed)
    if not result["ok"]:
        print("FAILED:", result["status"], "build_time:", result.get("build_time_s"))
        sys.exit(1)

    print(f"Built model in {result['build_time_s']:.2f}s, solved {len(result['rows'])} rows in {result['solve_time_s']:.3f}s")
    written = write_section_csvs(result["rows"], teachers_by_code, OUTPUT_DIR, result["days"])
    for p in written:
        print(f"  wrote {p}")


if __name__ == "__main__":
    main()