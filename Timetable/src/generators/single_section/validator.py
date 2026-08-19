from __future__ import annotations

import csv
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.generators.single_section.conflict_checker import ScheduleState


def _parse_time_to_minutes(value: str | int | None) -> int:
    if value is None:
        return 0
    if isinstance(value, int):
        return value
    parts = str(value).strip().split(":")
    if len(parts) != 2:
        raise ValueError(f"Invalid time value: {value!r}")
    hours, minutes = parts
    return int(hours) * 60 + int(minutes)


def validate_timetable(rows: list[dict[str, Any]], payload: dict[str, Any]) -> list[str]:
    """Return a list of human-readable validation problems for a generated final timetable."""
    issues: list[str] = []

    subject_map = {subject["subject_id"]: subject for subject in payload.get("subjects", []) if "subject_id" in subject}
    teacher_map = {teacher["teacher_code"]: teacher for teacher in payload.get("teachers", []) if "teacher_code" in teacher}
    day_names = payload.get("schedule", {}).get("working_days", [])
    break_start = _parse_time_to_minutes(payload.get("schedule", {}).get("break", {}).get("start", "12:45"))
    break_end = _parse_time_to_minutes(payload.get("schedule", {}).get("break", {}).get("end", "13:30"))

    state = ScheduleState()
    lab_day_subjects: dict[str, set[str]] = defaultdict(set)
    teacher_subject_sets: dict[str, set[str]] = defaultdict(set)
    subject_teachers_seen: dict[str, set[str]] = defaultdict(set)  # subject_id -> {teacher_codes used}

    grouped: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for index, row in enumerate(rows, start=1):
        if not row:
            issues.append(f"Row {index}: empty row")
            continue

        required = ["subject_id", "subject_name", "teacher_code", "section", "day", "start_time", "end_time"]
        missing = [key for key in required if row.get(key) is None]
        if missing:
            issues.append(f"Row {index}: missing required keys: {', '.join(missing)}")
            continue

        grouped[(row["subject_id"], row["day"], row["teacher_code"], row["section"])].append(row)

    for (subject_id, day, teacher_code, section), group_rows in sorted(grouped.items(), key=lambda item: (item[0][1], item[0][0], item[0][2])):
        subject = subject_map.get(subject_id)
        if subject is None:
            issues.append(f"Subject {subject_id!r} on {day!r} was not found in the dataset")
            continue

        teacher = teacher_map.get(teacher_code)
        if teacher is None:
            issues.append(f"Teacher {teacher_code!r} on {day!r} was not found in the dataset")
            continue

        if subject_id not in teacher.get("subjects", []):
            issues.append(f"Teacher {teacher_code!r} is not qualified for {subject_id!r}")

        if teacher.get("can_teach_lab") is False and subject.get("type") == "lab":
            issues.append(f"Teacher {teacher_code!r} cannot teach lab subject {subject_id!r}")

        if teacher.get("can_teach_theory") is False and subject.get("type") != "lab":
            issues.append(f"Teacher {teacher_code!r} cannot teach theory subject {subject_id!r}")

        # Checks whether this teacher/section/day combination has two
        # DIFFERENT subjects with overlapping times. Fixed version of a
        # bug where the time-overlap comparison referenced `row` before
        # it was ever assigned in this loop iteration -- Python silently
        # reused whatever `row` was left over from a previous group's
        # inner loop further down, producing comparisons against an
        # unrelated period and flagging false conflicts that don't exist
        # in the actual generated data.
        same_teacher_day_rows = [
            other for other in rows
            if other.get("teacher_code") == teacher_code
            and other.get("section") == section
            and other.get("day") == day
        ]
        distinct_subjects = {r.get("subject_id") for r in same_teacher_day_rows}
        if len(distinct_subjects) > 1:
            issues.append(f"Teacher {teacher_code!r} teaches multiple subjects in section {section!r} on {day!r}")

        for other in same_teacher_day_rows:
            if other.get("subject_id") == subject_id:
                continue  # same subject's own periods aren't a conflict with each other
            for current_row in group_rows:
                if (_parse_time_to_minutes(other.get("start_time")) < _parse_time_to_minutes(current_row.get("end_time"))
                        and _parse_time_to_minutes(other.get("end_time")) > _parse_time_to_minutes(current_row.get("start_time"))):
                    issues.append(f"Teacher {teacher_code!r} is assigned to multiple subjects in section {section!r} at the same time on {day!r}")
                    break

        if day not in day_names:
            issues.append(f"Day {day!r} is outside the working-day set")
            continue

        option: list[dict[str, Any]] = []
        for row in sorted(group_rows, key=lambda x: _parse_time_to_minutes(x.get("start_time", "00:00"))):
            start_minutes = _parse_time_to_minutes(row["start_time"])
            end_minutes = _parse_time_to_minutes(row["end_time"])
            if start_minutes >= end_minutes:
                issues.append(f"Row for {subject_id!r} on {day!r} has an invalid time range")
            if start_minutes < break_end and end_minutes > break_start:
                issues.append(f"Subject {subject_id!r} overlaps the break on {day!r}")
            option.append({
                "teacher_code": row.get("teacher_code"),
                "section": row.get("section"),
                "room": row.get("room"),
                "subject_id": subject_id,
                "day_num": day_names.index(day),
                "start_minutes": start_minutes,
                "end_minutes": end_minutes,
                "max_subjects": teacher.get("max_subjects"),
            })

        if subject.get("type") == "lab":
            lab_day_subjects[day].add(subject_id)
            if len(lab_day_subjects[day]) > 1:
                issues.append(f"More than one lab subject is scheduled on {day!r}")

        teacher_subject_sets[teacher_code].add(subject_id)
        subject_teachers_seen[subject_id].add(teacher_code)
        max_subjects = teacher.get("max_subjects")
        if max_subjects is not None:
            try:
                if len(teacher_subject_sets[teacher_code]) > int(max_subjects):
                    issues.append(f"Teacher {teacher_code!r} exceeds max_subjects={max_subjects}")
            except (TypeError, ValueError):
                pass

        if not state.is_valid_option(option, subject.get("type") == "lab"):
            issues.append(f"Subject {subject_id!r} on {day!r} violates the hard constraint state")
            continue

        state.add_option(option, subject.get("type") == "lab")

    # THE CHECK THAT WAS MISSING: grouping by (subject_id, day, teacher_code,
    # section) up above means every teacher a subject ever used becomes its
    # own separate group -- nothing there ever compares teachers ACROSS
    # groups for the same subject. This is that comparison.
    for subject_id, teachers_used in subject_teachers_seen.items():
        if len(teachers_used) > 1:
            issues.append(
                f"Subject {subject_id!r} is taught by {len(teachers_used)} different "
                f"teachers this week: {sorted(teachers_used)} -- should be exactly one."
            )

    return issues


def write_timetable_csv(path: str | Path, rows: list[dict[str, Any]]) -> Path:
    output_path = Path(path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    day_names = ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
    slot_starts = ["09:45", "10:45", "11:45", "13:30", "14:30", "15:30"]

    slot_map: dict[tuple[str, str], str] = {}
    collisions: list[tuple] = []
    for row in rows:
        day = row.get("day")
        start = row.get("start_time")
        if day and start:
            key = (str(day), str(start))
            subject_id = row.get("subject_id") or ""
            if row.get("type") == "lab" and subject_id:
                subject_id += "-LAB"
            teacher_name = row.get("teacher_name") or row.get("teacher_code") or ""
            label = f"{subject_id} ({teacher_name})" if subject_id else ""
            if key in slot_map and slot_map[key] != label:
                # THE FIX: this used to silently overwrite, hiding a genuine
                # double-booking behind whichever row happened to be written
                # last. Now it's a loud failure instead of a quiet one.
                collisions.append((key, slot_map[key], label))
            slot_map[key] = label

    if collisions:
        details = "; ".join(f"{k}: {a!r} vs {b!r}" for k, a, b in collisions)
        raise ValueError(f"Two different sessions landed in the same cell -- {details}")

    temp_path = output_path.with_suffix(output_path.suffix + ".tmp")
    with temp_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["Slot", *day_names])

        for slot_index, start_time in enumerate(slot_starts, start=1):
            row_values = [f"S{slot_index}"]
            for day in day_names:
                row_values.append(slot_map.get((day, start_time), ""))
            writer.writerow(row_values)
            if start_time == "11:45":
                writer.writerow(["Break 12:45-13:30"] + ["Break"] * 6)

    try:
        if output_path.exists():
            output_path.unlink()
        temp_path.replace(output_path)
    except PermissionError:
        temp_path.replace(output_path)

    return output_path