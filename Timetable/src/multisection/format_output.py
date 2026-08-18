"""
format_output.py
-----------------
One CSV per section (timetable_CSE1.csv, timetable_CSE2.csv, ...),
matching the same cell format used elsewhere in this project: subject
code (with -LAB suffix where relevant) and teacher name in parentheses.
"""

from __future__ import annotations

import csv
from pathlib import Path


def write_section_csvs(rows: list[dict], teachers_by_code: dict, output_dir: Path, days_order: list[str]):
    output_dir.mkdir(parents=True, exist_ok=True)
    by_section: dict[str, list[dict]] = {}
    for r in rows:
        by_section.setdefault(r["section"], []).append(r)

    slot_starts = ["09:45", "10:45", "11:45", "13:30", "14:30", "15:30"]
    written = []
    for section, srows in sorted(by_section.items()):
        grid = {}
        for r in srows:
            label = r["subject_id"] + ("-LAB" if r["type"] == "lab" else "")
            tname = teachers_by_code.get(r["teacher_code"], {}).get("name", r["teacher_code"])
            grid[(r["day"], r["start_time"])] = f"{label} ({tname})"

        path = output_dir / f"timetable_{section}.csv"
        with path.open("w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["Slot", *days_order])
            for i, start in enumerate(slot_starts, 1):
                row = [f"S{i}"] + [grid.get((d, start), "") for d in days_order]
                w.writerow(row)
                if start == "11:45":
                    w.writerow(["Break 12:45-13:30"] + ["Break"] * len(days_order))
        written.append(path)
    return written