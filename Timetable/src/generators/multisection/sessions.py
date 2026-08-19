"""
sessions.py
-----------
Expands every section's subject list into the concrete session instances
that need a placement, and looks up which teachers are actually eligible
for a given subject.

Multi-section shape: payload["sections"] = [{"name": "CSE1", "subjects":
[...]}, ...], with a single shared "teachers" list -- the same teacher can
be qualified to teach the same or different subjects across sections.
"""

from __future__ import annotations


def build_units(payload: dict) -> list[dict]:
    """Flattens payload["sections"] into one list of subject-dicts, each
    tagged with its section. Falls back to the old single-section shape
    (payload["subjects"] + metadata.section) if "sections" isn't present."""
    if "sections" in payload:
        section_defs = payload["sections"]
    else:
        section_defs = [{
            "name": payload.get("metadata", {}).get("section", "CSE2"),
            "subjects": payload.get("subjects", []),
        }]

    units = []
    for sd in section_defs:
        for subj in sd["subjects"]:
            u = dict(subj)
            u["section"] = sd["name"]
            units.append(u)
    return units


def build_sessions(units: list[dict]) -> list[dict]:
    """theory subject with weekly_periods=4 -> 4 single-period sessions.
    lab subject with weekly_periods=2, consecutive_periods=2 -> 1 block."""
    sessions = []
    for u in units:
        sid, section = u["subject_id"], u["section"]
        if u["type"] != "lab":
            for i in range(u["weekly_periods"]):
                sessions.append({"subject_id": sid, "section": section, "instance": i, "length": 1, "kind": "theory"})
        else:
            cp = u.get("consecutive_periods") or 1
            wp = u["weekly_periods"]
            n_blocks = -(-wp // cp)  # ceil division
            for i in range(n_blocks):
                sessions.append({"subject_id": sid, "section": section, "instance": i, "length": cp, "kind": "lab"})
    return sessions


def eligible_teachers(subject_id: str, is_lab: bool, teachers: list[dict]) -> list[dict]:
    out = []
    for t in teachers:
        if subject_id not in t.get("subjects", []):
            continue
        if is_lab and not t.get("can_teach_lab", False):
            continue
        if not is_lab and not t.get("can_teach_theory", False):
            continue
        out.append(t)
    return out