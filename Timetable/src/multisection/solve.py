"""
solve.py
--------
Orchestrates: slot_graph -> sessions -> model -> solve -> plain result
dict. Nothing outside this package needs to know CP-SAT exists.
"""

from __future__ import annotations

import random
import time

from ortools.sat.python import cp_model

from .slot_graph import build_slot_graph
from .sessions import build_units, build_sessions
from .model import build_model


def solve(payload: dict, seed: int | None = None, time_limit_s: float = 60.0):
    schedule = payload["schedule"]
    units = build_units(payload)
    sessions = build_sessions(units)
    days, slots_by_day, slot_times, next_slot = build_slot_graph(schedule)

    t0 = time.time()
    model, ctx = build_model(payload, units, sessions, days, slots_by_day, next_slot, seed=seed)
    build_time = time.time() - t0

    solver = cp_model.CpSolver()
    solver.parameters.random_seed = seed if seed is not None else random.randint(0, 10_000)
    solver.parameters.randomize_search = True
    solver.parameters.num_search_workers = 1
    solver.parameters.max_time_in_seconds = time_limit_s
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {"ok": False, "status": solver.StatusName(status), "build_time_s": build_time}

    unit_by_key = ctx["unit_by_key"]
    teacher_of = {}
    for (sid, section, tc), v in ctx["uses_teacher"].items():
        if solver.Value(v):
            teacher_of[(sid, section)] = tc

    rows = []
    for (sid, section, inst), opts in ctx["session_options"].items():
        for day, start, tc, v in opts:
            if not solver.Value(v):
                continue
            u = unit_by_key[(sid, section)]
            length = (u.get("consecutive_periods") if u["type"] == "lab" else 1) or 1
            cur = start
            for _ in range(length):
                s_min, e_min = slot_times[cur]
                rows.append({
                    "subject_id": sid, "section": section, "type": u["type"],
                    "day": day, "start_time": f"{s_min // 60:02d}:{s_min % 60:02d}",
                    "end_time": f"{e_min // 60:02d}:{e_min % 60:02d}",
                    "start_minutes": s_min, "end_minutes": e_min,
                    "teacher_code": tc,
                })
                cur = next_slot.get((day, cur), cur)

    return {"ok": True, "rows": rows, "days": days, "solve_time_s": solver.WallTime(), "build_time_s": build_time}