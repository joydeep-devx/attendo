"""
model.py
--------
Builds the CP-SAT model. The one thing worth understanding before editing
this file: teacher choice is folded directly INTO each placement variable
(one boolean per session x day x start x eligible-teacher), instead of a
separate "teacher assigned to subject" variable linked back to placement
via reification. An earlier version used AddMultiplicationEquality to
link them -- roughly 10,000+ extra variables for a 3-section problem, and
it never finished solving. This version needs no reification at all:
cell-exclusivity and teacher-exclusivity are both plain sums over the
placement variables themselves.

Constraints:
  1. Each (subject, section) commits to exactly one teacher for the week
     (AddExactlyOne over eligible teachers).
  2. A teacher never exceeds their max_subjects cap (counted once per
     subject regardless of how many sections they cover it in).
  3. Each session instance lands in exactly one (day, start, teacher).
  4. Every cell is filled exactly once, PER SECTION -- sections run in
     parallel, so two different sections sharing a (day, slot) is normal,
     not a conflict.
  5. A teacher is never in two places at once, ACROSS ALL SECTIONS --
     this is the constraint that failed with independent per-section
     generation; here it's enforced from the start.
  6. A subject appears at most once per day, per section.
  7. At most one lab (any subject) per day, per section.
"""

from __future__ import annotations

import random

from ortools.sat.python import cp_model

from .slot_graph import consecutive_start_options
from .sessions import eligible_teachers


def build_model(payload: dict, units: list[dict], sessions: list[dict],
                 days, slots_by_day, next_slot, seed: int | None = None):
    teachers = payload["teachers"]
    unit_by_key = {(u["subject_id"], u["section"]): u for u in units}

    model = cp_model.CpModel()
    rng = random.Random(seed)

    # --- one fixed teacher per (subject, section) ---
    uses_teacher: dict[tuple, cp_model.IntVar] = {}
    for (sid, section), u in unit_by_key.items():
        opts = eligible_teachers(sid, u["type"] == "lab", teachers)
        if not opts:
            raise ValueError(f"No eligible teacher for {sid!r} in section {section!r}")
        bools = []
        for t in opts:
            v = model.NewBoolVar(f"uses_{sid}_{section}_{t['teacher_code']}")
            uses_teacher[(sid, section, t["teacher_code"])] = v
            bools.append(v)
        model.AddExactlyOne(bools)

    # max_subjects cap, global across sections
    for t in teachers:
        code = t["teacher_code"]
        cap = t.get("max_subjects")
        if cap is None:
            continue
        by_subject: dict[str, list[cp_model.IntVar]] = {}
        for (sid, section, tc), v in uses_teacher.items():
            if tc == code:
                by_subject.setdefault(sid, []).append(v)
        if not by_subject:
            continue
        subject_used = []
        for sid, vs in by_subject.items():
            u = model.NewBoolVar(f"cap_used_{code}_{sid}")
            model.AddMaxEquality(u, vs)
            subject_used.append(u)
        model.Add(sum(subject_used) <= int(cap))

    # --- session placement ---
    cell_by_section: dict[tuple, list[cp_model.IntVar]] = {}
    teacher_cell: dict[tuple, list[cp_model.IntVar]] = {}
    by_subject_section_day: dict[tuple, list[cp_model.IntVar]] = {}
    by_day_section_labs: dict[tuple, list[cp_model.IntVar]] = {}
    session_options: dict[tuple, list] = {}

    shuffled = list(sessions)
    rng.shuffle(shuffled)

    for sess in shuffled:
        sid, section, inst, length, kind = sess["subject_id"], sess["section"], sess["instance"], sess["length"], sess["kind"]
        opts = consecutive_start_options(days, slots_by_day, next_slot, length)
        rng.shuffle(opts)
        teacher_codes = [t["teacher_code"] for t in eligible_teachers(sid, kind == "lab", teachers)]

        bools = []
        placed = []
        for day, start, chain in opts:
            for tc in teacher_codes:
                v = model.NewBoolVar(f"place_{sid}_{section}_{inst}_{day}_{start}_{tc}")
                bools.append(v)
                placed.append((day, start, tc, v))

                # cheap linear implication -- placing with teacher tc
                # implies tc is the committed teacher for this subject+section
                model.Add(v <= uses_teacher[(sid, section, tc)])

                for cell in chain:
                    cell_by_section.setdefault((section, day, cell), []).append(v)
                    teacher_cell.setdefault((tc, day, cell), []).append(v)

        for day, start, tc, v in placed:
            by_subject_section_day.setdefault((sid, section, day), []).append(v)
            if kind == "lab":
                by_day_section_labs.setdefault((day, section), []).append(v)

        if not bools:
            raise ValueError(f"No valid slot pattern for {sid!r}/{section!r} instance {inst} (length={length})")
        model.AddExactlyOne(bools)
        session_options[(sid, section, inst)] = placed

    for vs in cell_by_section.values():
        model.AddExactlyOne(vs)

    for vs in teacher_cell.values():
        model.Add(sum(vs) <= 1)

    for vs in by_subject_section_day.values():
        model.Add(sum(vs) <= 1)

    for vs in by_day_section_labs.values():
        model.Add(sum(vs) <= 1)

    ctx = {"uses_teacher": uses_teacher, "session_options": session_options, "unit_by_key": unit_by_key}
    return model, ctx