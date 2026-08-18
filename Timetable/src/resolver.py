from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.conflict_checker import ScheduleState
from src.validator import validate_timetable, write_timetable_csv


def _parse_time_to_minutes(value: str | None) -> int:
    if value is None:
        raise ValueError("Time value is required")
    h, m = map(int, str(value).split(":"))
    return h * 60 + m


def _format_time(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


def _get_valid_start_times(payload: dict[str, Any]) -> list[int]:
    """Matches src/processing/current_processor.py's time_slots_to_dataframe
    exactly: the cursor jumps straight to break_end when it hits
    break_start, instead of marching forward in fixed period-sized steps
    and discarding whichever one happens to overlap the break. The old
    version here did the latter -- since the break (45 min) isn't a
    multiple of the period length (60 min), that left a real 15-minute
    gap between break_end (13:30) and the next period it produced (13:45),
    diverging from the actual published schedule."""
    schedule = payload.get("schedule", {})
    start_time = _parse_time_to_minutes(schedule.get("start_time"))
    end_time = _parse_time_to_minutes(schedule.get("end_time"))
    period_minutes = int(schedule.get("period_duration_minutes", 60))
    break_details = schedule.get("break", {})
    break_start = _parse_time_to_minutes(break_details.get("start", "12:45"))
    break_end = _parse_time_to_minutes(break_details.get("end", "13:30"))

    starts: list[int] = []
    cursor = start_time
    while cursor < end_time:
        if cursor == break_start:
            cursor = break_end
            continue
        next_end = cursor + period_minutes
        if next_end > end_time:
            break
        starts.append(cursor)
        cursor = next_end

    return starts


def _teacher_eligibility(subject: dict[str, Any], teacher: dict[str, Any]) -> bool:
    subject_id = subject.get("subject_id")
    if not subject_id:
        return False

    if subject.get("type") == "lab":
        if not teacher.get("can_teach_lab", False):
            return False
    else:
        if not teacher.get("can_teach_theory", False):
            return False

    if subject_id not in teacher.get("subjects", []):
        return False
    return True


def _build_option_rows(
    payload: dict[str, Any],
    subject: dict[str, Any],
    teacher: dict[str, Any],
    day_name: str,
    start_minutes: int,
    section: str,
    count: int,
) -> list[dict[str, Any]]:
    period_minutes = int(payload.get("schedule", {}).get("period_duration_minutes", 60))
    rows: list[dict[str, Any]] = []
    for offset in range(count):
        current_start = start_minutes + offset * period_minutes
        current_end = current_start + period_minutes
        rows.append({
            "subject_id": subject["subject_id"],
            "subject_name": subject["name"],
            "teacher_code": teacher["teacher_code"],
            "teacher_name": teacher.get("name"),
            "section": section,
            "room": None,
            "day": day_name,
            "day_num": payload.get("schedule", {}).get("working_days", []).index(day_name),
            "start_time": _format_time(current_start),
            "end_time": _format_time(current_end),
            "start_minutes": current_start,
            "end_minutes": current_end,
            "duration_minutes": period_minutes,
            "type": subject.get("type", "theory"),
            "max_subjects": teacher.get("max_subjects"),
        })
    return rows


def _score_option(
    subject: dict[str, Any],
    day_name: str,
    start_minutes: int,
    teacher: dict[str, Any],
    day_usage: dict[str, int],
    slot_usage: dict[tuple[str, int], int],
) -> int:
    score = 0
    if day_name in {"MON", "TUE", "WED", "THU", "FRI"}:
        score += 10
    else:
        score += 4

    if start_minutes < 12 * 60:
        score += 20
    elif start_minutes >= 13 * 60:
        score += 12
    else:
        score -= 10

    score += max(0, 6 - day_usage.get(day_name, 0)) * 8
    score += max(0, 4 - slot_usage.get((day_name, start_minutes), 0)) * 6

    if subject.get("type") == "lab":
        score += 12
    if teacher.get("can_teach_lab") and subject.get("type") == "lab":
        score += 5

    return score


def _pattern_slot_order(payload: dict[str, Any]) -> list[tuple[str, int]]:
    day_names = payload.get("schedule", {}).get("working_days", ["MON", "TUE", "WED", "THU", "FRI", "SAT"])
    valid_starts = _get_valid_start_times(payload)
    ordered: list[tuple[str, int]] = []
    for day_name in day_names:
        for start_minutes in valid_starts:
            ordered.append((day_name, start_minutes))
    return ordered


def generate_timetable(payload: dict[str, Any]) -> list[dict[str, Any]]:
    schedule = payload.get("schedule", {})
    subjects = payload.get("subjects", [])
    teachers = payload.get("teachers", [])
    section = payload.get("metadata", {}).get("section", "CSE2")
    day_names = schedule.get("working_days", ["MON", "TUE", "WED", "THU", "FRI", "SAT"])
    valid_starts = _get_valid_start_times(payload)
    slot_pattern = _pattern_slot_order(payload)
    schedule_end_minutes = _parse_time_to_minutes(schedule.get("end_time"))
    period_minutes = int(schedule.get("period_duration_minutes", 60))
    state = ScheduleState()
    selected_rows: list[dict[str, Any]] = []
    day_usage: dict[str, int] = {day: 0 for day in day_names}
    slot_usage: dict[tuple[str, int], int] = {}

    eligibility_count = {
        subject.get("subject_id"): len([
            teacher for teacher in teachers if _teacher_eligibility(subject, teacher)
        ])
        for subject in subjects
    }

    ordered_subjects = sorted(
        subjects,
        key=lambda s: (
            eligibility_count.get(s.get("subject_id"), 999),
            -int(s.get("weekly_periods", 0)),
            s.get("type", "theory"),
            s.get("subject_id", ""),
        ),
    )

    def place_subject(subject_index: int) -> bool:
        if subject_index >= len(ordered_subjects):
            return True

        subject = ordered_subjects[subject_index]
        subject_id = subject["subject_id"]
        is_lab = subject.get("type") == "lab"
        remaining = int(subject.get("weekly_periods", 1))
        eligible_teachers = sorted(
            [teacher for teacher in teachers if _teacher_eligibility(subject, teacher)],
            key=lambda teacher: (
                len(teacher.get("subjects", [])),
                teacher.get("teacher_code", ""),
            ),
        )
        if not eligible_teachers:
            raise ValueError(f"No eligible teacher found for subject {subject_id!r}")

        candidates: list[tuple[int, list[dict[str, Any]], dict[str, Any]]] = []
        block_size = 1 if not is_lab else min(int(subject.get("consecutive_periods", 1) or 1), remaining)

        for day_name, start_minutes in slot_pattern:
            # THE FIX: a block's last period must still fit before the
            # schedule's actual end_time. Only single-period starts were
            # ever checked against this -- a multi-period lab block could
            # start at the last valid single-period slot and run straight
            # past closing time with nothing to catch it.
            if start_minutes + block_size * period_minutes > schedule_end_minutes:
                continue
            for teacher in eligible_teachers:
                option = _build_option_rows(payload, subject, teacher, day_name, start_minutes, section, block_size)
                if state.is_valid_option(option, is_lab):
                    score = _score_option(subject, day_name, start_minutes, teacher, day_usage, slot_usage)
                    candidates.append((score, option, teacher))

        if not candidates:
            return False

        candidates.sort(key=lambda item: item[0], reverse=True)
        top_score = candidates[0][0]
        filtered = [item for item in candidates if item[0] >= max(top_score - 10, 0)]
        random.shuffle(filtered)

        for _, chosen_option, _ in filtered:
            state.add_option(chosen_option, is_lab)
            selected_rows.extend(chosen_option)
            for row in chosen_option:
                day = row["day"]
                start = _parse_time_to_minutes(row["start_time"])
                day_usage[day] = day_usage.get(day, 0) + 1
                slot_usage[(day, start)] = slot_usage.get((day, start), 0) + 1

            next_remaining = remaining - len(chosen_option)
            if next_remaining <= 0:
                if place_subject(subject_index + 1):
                    return True
            else:
                subject_copy = dict(subject)
                subject_copy["weekly_periods"] = next_remaining
                temp_subjects = ordered_subjects[:]
                temp_subjects[subject_index] = subject_copy
                # THE BUG: `old_subjects = ordered_subjects` was just a second
                # name for the SAME list, not a copy -- so the "restore" below
                # was a no-op, and a reduced weekly_periods count from an
                # abandoned attempt permanently leaked through as if it were
                # real. `[:]` makes an actual copy of the list contents.
                old_subjects = ordered_subjects[:]
                ordered_subjects[:] = temp_subjects
                if place_subject(subject_index):
                    return True
                ordered_subjects[:] = old_subjects

            for row in chosen_option:
                day = row["day"]
                start = _parse_time_to_minutes(row["start_time"])
                day_usage[day] = day_usage.get(day, 0) - 1
                slot_usage[(day, start)] = slot_usage.get((day, start), 0) - 1
            state.remove_option(chosen_option, is_lab)
            del selected_rows[-len(chosen_option):]

        return False

    if not place_subject(0):
        raise ValueError("Unable to build a complete schedule that satisfies all constraints")
    return selected_rows


def generate_csv_timetable(payload_path: str | Path, output_path: str | Path | None = None) -> list[dict[str, Any]]:
    import signal

    payload_file = Path(payload_path)
    output = Path(output_path) if output_path else payload_file.parent / "generated_timetable.csv"
    payload = json.loads(payload_file.read_text(encoding="utf-8"))

    # Plain backtracking can occasionally thrash badly on a tight
    # (zero-vacancy) problem -- confirmed directly: one run hung past 25s
    # while several back-to-back runs finished instantly. Rather than let
    # one unlucky run hang indefinitely, retry a few times with a hard
    # per-attempt time limit before giving up for real.
    MAX_ATTEMPTS = 5
    PER_ATTEMPT_TIMEOUT_S = 10
    rows = None

    def _handler(signum, frame):
        raise TimeoutError()

    for attempt in range(MAX_ATTEMPTS):
        old_handler = signal.signal(signal.SIGALRM, _handler)
        signal.alarm(PER_ATTEMPT_TIMEOUT_S)
        try:
            rows = generate_timetable(payload)
            signal.alarm(0)
            break
        except TimeoutError:
            print(f"  attempt {attempt + 1}/{MAX_ATTEMPTS} exceeded {PER_ATTEMPT_TIMEOUT_S}s -- retrying.")
            rows = None
        finally:
            signal.signal(signal.SIGALRM, old_handler)

    if rows is None:
        raise TimeoutError(
            f"Could not generate a timetable within {PER_ATTEMPT_TIMEOUT_S}s across "
            f"{MAX_ATTEMPTS} attempts. This dataset may need a real constraint solver "
            "instead of backtracking for reliable zero-vacancy generation."
        )

    issues = validate_timetable(rows, payload)
    if issues:
        raise ValueError("Generated timetable failed validation: " + "; ".join(issues))
    write_timetable_csv(output, rows)
    return rows


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parent.parent
    json_path = project_root / "dataset" / "raw" / "current" / "demo_input.json"
    csv_path = project_root / "output" / "timetable.csv"
    rows = generate_csv_timetable(json_path, csv_path)
    print(f"Generated {len(rows)} timetable rows to {csv_path}")