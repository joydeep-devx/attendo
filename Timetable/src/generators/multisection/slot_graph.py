"""
slot_graph.py
-------------
Builds the day's period grid the same way src/processing/current_processor.py
does: the cursor jumps straight to break_end when it hits break_start,
instead of marching in fixed period-sized steps and discarding whichever
one overlaps the break. That distinction is what earlier put a session at
13:45 instead of the schedule's real 13:30 -- this avoids that class of
bug by construction.
"""

from __future__ import annotations


def parse_time(value: str) -> int:
    h, m = map(int, value.split(":"))
    return h * 60 + m


def build_slot_graph(schedule: dict):
    """Returns (days, slots_by_day, slot_times, next_slot):
      days: working day names
      slots_by_day: day -> ordered list of slot_ids
      slot_times: slot_id -> (start_minutes, end_minutes)
      next_slot: (day, slot_id) -> slot_id immediately following it in real
                 time, or None -- used to build valid consecutive lab blocks.
    """
    days = schedule["working_days"]
    start = parse_time(schedule["start_time"])
    end = parse_time(schedule["end_time"])
    period = int(schedule["period_duration_minutes"])
    break_start = parse_time(schedule["break"]["start"])
    break_end = parse_time(schedule["break"]["end"])

    periods = []
    cursor = start
    slot_num = 1
    while cursor < end:
        if cursor == break_start:
            cursor = break_end
            continue
        next_end = cursor + period
        if next_end > end:
            break
        periods.append((f"S{slot_num}", cursor, next_end))
        slot_num += 1
        cursor = next_end

    slots_by_day = {day: [p[0] for p in periods] for day in days}
    slot_times = {p[0]: (p[1], p[2]) for p in periods}

    next_slot: dict[tuple[str, str], str | None] = {}
    for day in days:
        for i, (sid, s, e) in enumerate(periods):
            nxt = None
            if i + 1 < len(periods):
                nsid, ns, ne = periods[i + 1]
                if ns == e:
                    nxt = nsid
            next_slot[(day, sid)] = nxt

    return days, slots_by_day, slot_times, next_slot


def consecutive_start_options(days, slots_by_day, next_slot, length: int):
    """All (day, start_slot, chain) where `length` truly-consecutive
    periods exist starting there, never crossing the break."""
    options = []
    for day in days:
        for slot in slots_by_day[day]:
            chain = [slot]
            cur = slot
            ok = True
            for _ in range(length - 1):
                nxt = next_slot.get((day, cur))
                if nxt is None:
                    ok = False
                    break
                chain.append(nxt)
                cur = nxt
            if ok:
                options.append((day, slot, chain))
    return options