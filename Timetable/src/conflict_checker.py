from __future__ import annotations

from typing import Any


class ScheduleState:
    """Tracks hard constraints that have already been placed in the current schedule."""

    def __init__(self):
        self.teacher_schedule: set[tuple] = set()       # (teacher, day, start, end)
        self.teacher_section_schedule: set[tuple] = set()  # (teacher, section, day, start, end)
        self.teacher_section_subjects: dict[tuple[str, str], set[str]] = {}  # (teacher, section) -> {subject_ids}
        self.section_schedule: set[tuple] = set()       # (section, day, start, end)
        self.room_schedule: set[tuple] = set()          # (room, day, start, end)
        self.teacher_subjects: dict[str, set[str]] = {}  # teacher -> {subject_ids}
        self.subject_days: dict[tuple[str, int], bool] = {}  # (subject_id, day) -> placed?
        self.lab_days: dict[int, set[str]] = {}          # day -> {lab subject_ids placed that day}
        self.subject_teacher: dict[str, str] = {}        # subject_id -> the ONE teacher committed for the whole week
        self.subject_unit_count: dict[str, int] = {}      # subject_id -> how many units currently placed (for backtracking)

    def is_teacher_free(self, teacher: Any, day: Any, start: int, end: int) -> bool:
        if teacher is None or _is_nan(teacher):
            return True
        for (t, d, s, e) in self.teacher_schedule:
            if t == teacher and d == day and start < e and end > s:
                return False
        return True

    def is_section_free(self, section: Any, day: Any, start: int, end: int) -> bool:
        if section is None or _is_nan(section):
            return True
        for (sec, d, s, e) in self.section_schedule:
            if sec == section and d == day and start < e and end > s:
                return False
        return True

    def is_teacher_section_free(self, teacher: Any, section: Any, day: Any, start: int, end: int) -> bool:
        if teacher is None or _is_nan(teacher) or section is None or _is_nan(section):
            return True
        for (t, sec, d, s, e) in self.teacher_section_schedule:
            if t == teacher and sec == section and d == day and start < e and end > s:
                return False
        return True

    def is_room_free(self, room: Any, day: Any, start: int, end: int) -> bool:
        if room is None or str(room).strip() == "":
            return True
        for (r, d, s, e) in self.room_schedule:
            if r == room and d == day and start < e and end > s:
                return False
        return True

    def is_valid_option(self, option: list[dict], is_lab: bool) -> bool:
        if not option:
            return False

        first = option[0]
        subject_id = first["subject_id"]
        day = first["day_num"]

        # THE FIX: once this subject has committed to a teacher (from an
        # earlier-placed unit), every other unit of the SAME subject must
        # use that SAME teacher for the rest of the week. Without this
        # check, each unit picks a teacher independently from every
        # eligible one -- which is exactly how a subject like PCC-CS501
        # ends up taught by two different people on different days.
        committed_teacher = self.subject_teacher.get(subject_id)
        if committed_teacher is not None:
            for c in option:
                if c["teacher_code"] != committed_teacher:
                    return False

        start_times = sorted(c["start_minutes"] for c in option)
        if is_lab and len(start_times) > 1:
            period_minutes = int(first.get("duration_minutes", 60))
            for earlier, later in zip(start_times, start_times[1:]):
                if later - earlier != period_minutes:
                    return False

        for c in option:
            teacher, section, room = c["teacher_code"], c["section"], c["room"]
            day_num, start, end = c["day_num"], c["start_minutes"], c["end_minutes"]

            if not self.is_teacher_free(teacher, day_num, start, end):
                return False

            if not self.is_teacher_section_free(teacher, section, day_num, start, end):
                return False

            section_key = (teacher, section)
            current_section_subjects = self.teacher_section_subjects.get(section_key, set())
            option_subjects = {row["subject_id"] for row in option}
            if current_section_subjects and not option_subjects.issubset(current_section_subjects):
                return False

            if not self.is_section_free(section, day_num, start, end):
                return False

            if not self.is_room_free(room, day_num, start, end):
                return False

            if not self._is_valid_break_window(start, end):
                return False

            if teacher is not None and not _is_nan(teacher):
                max_subjects = c.get("max_subjects")
                current = self.teacher_subjects.get(teacher, set())
                if subject_id not in current and max_subjects is not None:
                    try:
                        if len(current) >= int(max_subjects):
                            return False
                    except (TypeError, ValueError):
                        pass

        if self.subject_days.get((subject_id, day)):
            return False

        if is_lab and self.lab_days.get(day):
            existing = self.lab_days[day]
            if existing and subject_id not in existing:
                return False

        return True

    def add_option(self, option: list[dict], is_lab: bool):
        if not option:
            return

        first = option[0]
        subject_id, day = first["subject_id"], first["day_num"]
        self.subject_days[(subject_id, day)] = True
        if is_lab:
            self.lab_days.setdefault(day, set()).add(subject_id)

        self.subject_unit_count[subject_id] = self.subject_unit_count.get(subject_id, 0) + 1
        if subject_id not in self.subject_teacher:
            self.subject_teacher[subject_id] = first["teacher_code"]

        for c in option:
            teacher, section, room = c["teacher_code"], c["section"], c["room"]
            d, s, e = c["day_num"], c["start_minutes"], c["end_minutes"]

            if teacher is not None and not _is_nan(teacher):
                self.teacher_schedule.add((teacher, d, s, e))
                self.teacher_section_schedule.add((teacher, section, d, s, e))
                self.teacher_subjects.setdefault(teacher, set()).add(c["subject_id"])
                self.teacher_section_subjects.setdefault((teacher, section), set()).add(c["subject_id"])

            self.section_schedule.add((section, d, s, e))

            if room is not None and str(room).strip() != "":
                self.room_schedule.add((room, d, s, e))

    def remove_option(self, option: list[dict], is_lab: bool):
        if not option:
            return

        first = option[0]
        subject_id, day = first["subject_id"], first["day_num"]
        self.subject_days.pop((subject_id, day), None)
        if is_lab:
            self.lab_days.get(day, set()).discard(subject_id)

        self.subject_unit_count[subject_id] = self.subject_unit_count.get(subject_id, 1) - 1
        if self.subject_unit_count[subject_id] <= 0:
            self.subject_unit_count.pop(subject_id, None)
            self.subject_teacher.pop(subject_id, None)

        for c in option:
            teacher, section, room = c["teacher_code"], c["section"], c["room"]
            d, s, e = c["day_num"], c["start_minutes"], c["end_minutes"]

            if teacher is not None and not _is_nan(teacher):
                self.teacher_schedule.discard((teacher, d, s, e))
                self.teacher_section_schedule.discard((teacher, section, d, s, e))
                self.teacher_subjects.get(teacher, set()).discard(c["subject_id"])
                self.teacher_section_subjects.get((teacher, section), set()).discard(c["subject_id"])
                if not self.teacher_section_subjects.get((teacher, section)):
                    self.teacher_section_subjects.pop((teacher, section), None)

            self.section_schedule.discard((section, d, s, e))

            if room is not None and str(room).strip() != "":
                self.room_schedule.discard((room, d, s, e))

    @staticmethod
    def _is_valid_break_window(start: int, end: int) -> bool:
        break_start = 12 * 60 + 45
        break_end = 13 * 60 + 30
        return not (start < break_end and end > break_start)


def _is_nan(value) -> bool:
    try:
        return value != value
    except Exception:
        return False