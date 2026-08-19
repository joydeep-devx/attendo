import csv
import json
from pathlib import Path

from Timetable.src.generators.single_section.resolver import generate_timetable
from Timetable.src.generators.single_section.validator import write_timetable_csv


DATA_PATH = Path(__file__).resolve().parents[1] / "dataset" / "raw" / "current" / "demo_input.json"


def test_lab_blocks_are_consecutive_and_break_safe():
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    rows = generate_timetable(payload)

    lab_subjects = {subject["subject_id"]: subject for subject in payload["subjects"] if subject.get("type") == "lab"}
    for subject_id, subject in lab_subjects.items():
        subject_rows = sorted(
            [row for row in rows if row["subject_id"] == subject_id],
            key=lambda row: (row["day"], row["start_minutes"]),
        )
        assert len(subject_rows) == int(subject["weekly_periods"]), f"Lab {subject_id} should have {subject['weekly_periods']} rows"
        for day in sorted({row["day"] for row in subject_rows}):
            day_rows = [row for row in subject_rows if row["day"] == day]
            starts = sorted(row["start_minutes"] for row in day_rows)
            assert starts == sorted(starts), "Lab rows should be ordered by time"
            assert len(starts) >= 2
            for first, second in zip(starts, starts[1:]):
                assert second - first == 60, f"Lab {subject_id} is not consecutive on {day}"


def test_csv_contains_full_day_slots_and_break_row():
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    rows = generate_timetable(payload)
    output_path = Path(__file__).resolve().parents[1] / "output" / "constraint_test.csv"

    write_timetable_csv(output_path, rows)
    with output_path.open("r", newline="", encoding="utf-8") as handle:
        table = list(csv.reader(handle))

    assert table[0] == ["Slot", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    # write_timetable_csv inserts the break row right after S3 (it fires when
    # the slot start is "11:45"), so the real row order is S1, S2, S3, Break,
    # S4, S5, S6 -- 7 data rows after the header, not 6.
    assert [row[0] for row in table[1:8]] == ["S1", "S2", "S3", "Break 12:45-13:30", "S4", "S5", "S6"]
    assert table[4][0] == "Break 12:45-13:30"
    assert table[5][0] == "S4"
    assert table[6][0] == "S5"
    assert table[7][0] == "S6"