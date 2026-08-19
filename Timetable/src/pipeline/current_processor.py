from __future__ import annotations

from datetime import datetime
from typing import Any

import pandas as pd

from src.json_handler import save_json_file


DAY_MAP = {
    "MON": "Monday", "MONDAY": "Monday",
    "TUE": "Tuesday", "TUESDAY": "Tuesday",
    "WED": "Wednesday", "WEDNESDAY": "Wednesday",
    "THU": "Thursday", "THURSDAY": "Thursday",
    "FRI": "Friday", "FRIDAY": "Friday",
    "SAT": "Saturday", "SATURDAY": "Saturday",
}


def normalize_day(raw_day: Any):
    """Return a canonical day name, or None if the supplied value is invalid."""
    if raw_day is None:
        return None
    return DAY_MAP.get(str(raw_day).strip().upper())


def normalize_time(raw_time: Any) -> str | None: #-> str | None: Hint Deta Hai Return Type Kya Hoga.. 
    if raw_time is None or not str(raw_time).strip():
        return None
    value = str(raw_time).strip().upper()
    for pattern in ("%H:%M", "%H.%M", "%I:%M %p"):
        try:
            return datetime.strptime(value, pattern).strftime("%H:%M")
        except ValueError:
            continue
    return None


def subjects_to_dataframe(payload: dict[str, Any]) -> pd.DataFrame: # yeh dataframe return karega
    columns = ["subject_id", "subject_name", "subject_type", "weekly_periods", "consecutive_periods", "missing_subject_id", "invalid_weekly_periods"]
    df = pd.DataFrame(payload.get("subjects", [])).rename(columns={"name": "subject_name", "type": "subject_type"})
    if df.empty:
        return pd.DataFrame(columns=columns)

    for column in columns:
        if column not in df:
            df[column] = pd.NA
    df["subject_id"] = df["subject_id"].astype("string").str.strip()
    df["subject_name"] = df["subject_name"].astype("string").str.strip()
    df["subject_type"] = df["subject_type"].astype("string").str.lower().str.strip()
    df["weekly_periods"] = pd.to_numeric(df["weekly_periods"], errors="coerce").astype("Int64") #errors coerce ka mtl
    df["consecutive_periods"] = pd.to_numeric(df["consecutive_periods"], errors="coerce").astype("Int64")
    df["missing_subject_id"] = df["subject_id"].isna() | df["subject_id"].eq("")
    df["invalid_weekly_periods"] = df["weekly_periods"].isna() | df["weekly_periods"].le(0)
    return df[columns]


def teachers_to_dataframe(payload: dict[str, Any]) -> pd.DataFrame:
    columns = ["teacher_id", "teacher_code", "teacher_name", "subject_id", "can_teach_theory", "can_teach_lab", "max_subjects", "missing_teacher_id", "duplicate_qualification"]
    df = pd.DataFrame(payload.get("teachers", [])).rename(columns={"name": "teacher_name"})
    if df.empty:
        return pd.DataFrame(columns=columns)

    for column in ("teacher_id", "teacher_code", "teacher_name", "subjects", "can_teach_theory", "can_teach_lab", "max_subjects"):
        if column not in df:
            df[column] = pd.NA
    df["subjects"] = df["subjects"].apply(lambda value: value if isinstance(value, list) and value else [pd.NA])
    df = df.explode("subjects", ignore_index=True).rename(columns={"subjects": "subject_id"}) #agar subject mai ek se zyada
    for column in ("teacher_id", "teacher_code", "teacher_name", "subject_id"): #agar column me string type ka data nahi hai to usko string me convert kar do aur strip kar do
        df[column] = df[column].astype("string").str.strip()
    df["max_subjects"] = pd.to_numeric(df["max_subjects"], errors="coerce").astype("Int64")
    df["missing_teacher_id"] = df["teacher_id"].isna() | df["teacher_id"].eq("")
    df["duplicate_qualification"] = df.duplicated(["teacher_id", "subject_id"], keep=False)
    return df[columns]


def schedule_to_dataframe(payload: dict[str, Any]) -> pd.DataFrame:
    schedule = payload.get("schedule", {})
    break_data = schedule.get("break", {})
    days = [normalize_day(day) for day in schedule.get("working_days", [])]
    return pd.DataFrame([{
        "working_days": [day for day in days if day is not None],
        "start_time": normalize_time(schedule.get("start_time")),
        "end_time": normalize_time(schedule.get("end_time")),
        "period_duration_minutes": pd.to_numeric(schedule.get("period_duration_minutes"), errors="coerce"),
        "break_start": normalize_time(break_data.get("start")),
        "break_end": normalize_time(break_data.get("end")),
        "break_duration_minutes": pd.to_numeric(break_data.get("duration_minutes"), errors="coerce"),
    }])


def time_slots_to_dataframe(payload: dict[str, Any]) -> pd.DataFrame:
    columns = ["day", "slot_id", "start_time", "end_time", "is_break"]
    schedule = payload.get("schedule", {})

    days = [normalize_day(day) for day in schedule.get("working_days", [])]
    days = [d for d in days if d is not None]

    start_str = normalize_time(schedule.get("start_time"))
    end_str = normalize_time(schedule.get("end_time"))
    period_minutes = pd.to_numeric(schedule.get("period_duration_minutes"), errors="coerce")

    if not days or start_str is None or end_str is None or pd.isna(period_minutes) or period_minutes <= 0:
        return pd.DataFrame(columns=columns)

    break_data = schedule.get("break", {})
    break_start_str = normalize_time(break_data.get("start"))
    break_end_str = normalize_time(break_data.get("end"))
    break_start = pd.to_datetime(break_start_str, format="%H:%M") if break_start_str else None
    break_end = pd.to_datetime(break_end_str, format="%H:%M") if break_end_str else None

    day_start = pd.to_datetime(start_str, format="%H:%M")
    day_end = pd.to_datetime(end_str, format="%H:%M")
    step = pd.Timedelta(minutes=int(period_minutes))

    # compute the periods ONCE (same every day), then cross with days
    periods = []
    slot_num = 1
    cursor = day_start
    while cursor < day_end:
        if break_start is not None and cursor == break_start:
            periods.append(("BREAK", cursor.strftime("%H:%M"), break_end.strftime("%H:%M"), True))
            cursor = break_end
            continue
        p_end = cursor + step
        if p_end > day_end:
            break
        periods.append((f"S{slot_num}", cursor.strftime("%H:%M"), p_end.strftime("%H:%M"), False))
        slot_num += 1
        cursor = p_end

    rows = [
        {"day": day, "slot_id": slot_id, "start_time": p_start, "end_time": p_end, "is_break": is_break}
        for day in days
        for slot_id, p_start, p_end, is_break in periods
    ]
    return pd.DataFrame(rows, columns=columns)


def build_current_dataframes(payload: dict[str, Any]) -> dict[str, pd.DataFrame]:
    return {
        "subjects": subjects_to_dataframe(payload),
        "teacher_qualifications": teachers_to_dataframe(payload),
        "schedule": schedule_to_dataframe(payload),
        "time_slots": time_slots_to_dataframe(payload),
    }


def export_current_processed_data(dfs: dict[str, pd.DataFrame], output_path: str) -> None:
    payload = {
        "metadata": {
            "status": "processed",
            "subject_count": int(dfs["subjects"].shape[0]),
            "teacher_qualification_count": int(dfs["teacher_qualifications"].shape[0]),
        },
        "subjects": dfs["subjects"].where(pd.notna(dfs["subjects"]), None).to_dict(orient="records"),
        "teacher_qualifications": dfs["teacher_qualifications"].where(pd.notna(dfs["teacher_qualifications"]), None).to_dict(orient="records"),
        "schedule": dfs["schedule"].where(pd.notna(dfs["schedule"]), None).to_dict(orient="records"),
        "time_slots": dfs["time_slots"].where(pd.notna(dfs["time_slots"]), None).to_dict(orient="records"),
    }
    save_json_file(output_path, payload)


def report_current_quality_issues(dfs: dict[str, pd.DataFrame]) -> None:
    subjects = dfs["subjects"]
    if not subjects.empty:
        bad = subjects[subjects["missing_subject_id"] | subjects["invalid_weekly_periods"]]
        if not bad.empty:
            print(f"  subjects with issues: {len(bad)} row(s)")
            for _, row in bad.iterrows():
                reasons = []
                if row["missing_subject_id"]:
                    reasons.append("missing subject_id")
                if row["invalid_weekly_periods"]:
                    reasons.append(f"weekly_periods invalid ({row['weekly_periods']})")
                label = row["subject_id"] if pd.notna(row["subject_id"]) else "(no id)"
                print(f"    - {label} / {row['subject_name']}: {', '.join(reasons)}")

    teachers = dfs["teacher_qualifications"]
    if not teachers.empty:
        bad = teachers[teachers["missing_teacher_id"] | teachers["duplicate_qualification"]]
        if not bad.empty:
            print(f"  teacher qualifications with issues: {len(bad)} row(s)")
            for _, row in bad.iterrows():
                reasons = []
                if row["missing_teacher_id"]:
                    reasons.append("missing teacher_id")
                if row["duplicate_qualification"]:
                    reasons.append("duplicate qualification row")
                label = row["teacher_id"] if pd.notna(row["teacher_id"]) else "(no id)"
                print(f"    - {label} -> {row['subject_id']}: {', '.join(reasons)}")


def get_training_ready_current(dfs: dict[str, pd.DataFrame]) -> dict[str, pd.DataFrame]:
    subjects = dfs["subjects"]
    if not subjects.empty:
        subjects = subjects.copy()
        valid = subjects.loc[~subjects["invalid_weekly_periods"]]
        medians_by_type = valid.groupby("subject_type")["weekly_periods"].median()
        overall_median = valid["weekly_periods"].median()

        def fill_weekly_periods(row):
            if not row["invalid_weekly_periods"]:
                return row["weekly_periods"]
            return medians_by_type.get(row["subject_type"], overall_median)

        subjects["weekly_periods_was_imputed"] = subjects["invalid_weekly_periods"]
        subjects["weekly_periods"] = subjects.apply(fill_weekly_periods, axis=1).astype("Int64")
        subjects = subjects[~subjects["missing_subject_id"]].reset_index(drop=True)

    teachers = dfs["teacher_qualifications"]
    if not teachers.empty:
        teachers = teachers[~teachers["missing_teacher_id"]]
        teachers = teachers.drop_duplicates(subset=["teacher_id", "subject_id"], keep="first").reset_index(drop=True)

    return {"subjects": subjects, "teacher_qualifications": teachers, "schedule": dfs["schedule"], "time_slots": dfs["time_slots"]}