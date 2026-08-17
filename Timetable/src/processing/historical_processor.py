from __future__ import annotations
from pathlib import Path
from typing import Any
import pandas as pd
from src.json_handler import save_json_file
from src.processing.current_processor import normalize_day, normalize_time

CANONICAL_COLUMNS = [
    "source_file", "academic_year", "semester", "discipline", "section", "batch", "day",
    "subject_id", "subject_name", "teacher_id", "teacher_code", "room", "start_time",
    "end_time", "duration_hours", "record_type", "duplicate_record",
    "missing_subject", "missing_teacher", "invalid_time_range", "invalid_duration",
    "overlaps_with_another_class",
]

KEY_ALIASES = {
    "teacher": "teacher_code", "teachername": "teacher_code", "teacher_name": "teacher_code",
    "teachercode": "teacher_code", "subject": "subject_id", "subjectcode": "subject_id",
    "subjectname": "subject_name", "class_type": "record_type", "type": "record_type",
    "start": "start_time", "end": "end_time",
}


def extract_source_metadata(raw_payload: dict[str, Any], file_path: str) -> dict[str, Any]:
    metadata = raw_payload.get("metadata", {})
    return {
        "source_file": Path(file_path).name,
        "academic_year": metadata.get("academic_year"),
        "semester": metadata.get("semester"),
        "discipline": metadata.get("discipline"),
        "section": metadata.get("section"),
    }


def extract_routine_records(raw_payload: dict[str, Any]) -> list[dict[str, Any]]:
    for key in ("routine", "classes", "timetable", "schedule"):
        value = raw_payload.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    return []


def normalize_column_names(record: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for key, value in record.items():
        compact_key = key.replace(" ", "").replace("_", "").lower()
        normalized[KEY_ALIASES.get(compact_key, key)] = value
    return normalized


def calculate_duration_hours(start_time: str | None, end_time: str | None) -> float | None:
    if start_time is None or end_time is None:
        return None
    start = pd.to_datetime(start_time, format="%H:%M", errors="coerce")
    end = pd.to_datetime(end_time, format="%H:%M", errors="coerce")
    if pd.isna(start) or pd.isna(end) or end <= start:
        return None
    return (end - start).total_seconds() / 3600


def classify_record_type(record: dict[str, Any]) -> str | None:
    raw_type = record.get("record_type", record.get("type"))
    if raw_type is None:
        return None
    value = str(raw_type).strip().lower()
    return value if value in {"theory", "lab", "remedial"} else None


def routine_records_to_dataframe(records: list[dict[str, Any]]) -> pd.DataFrame:
    rows = []
    for raw_record in records:
        record = normalize_column_names(raw_record)
        start_time = normalize_time(record.get("start_time"))
        end_time = normalize_time(record.get("end_time"))
        rows.append({
            "source_file": record.get("source_file"), "academic_year": record.get("academic_year"),
            "semester": record.get("semester"), "discipline": record.get("discipline"),
            "section": record.get("section"), "batch": record.get("batch"),
            "day": normalize_day(record.get("day")),
            "subject_id": record.get("subject_id"), "subject_name": record.get("subject_name"),
            "teacher_id": record.get("teacher_id"), "teacher_code": record.get("teacher_code"),
            "room": record.get("room"),
            "start_time": start_time, "end_time": end_time,
            "duration_hours": calculate_duration_hours(start_time, end_time),
            "record_type": classify_record_type(record),
        })
    df = pd.DataFrame(rows)
    if df.empty:
        return pd.DataFrame(columns=CANONICAL_COLUMNS)
    for column in ("subject_id", "subject_name", "teacher_id", "teacher_code", "section", "discipline"):
        df[column] = df[column].astype("string").str.strip()
    return apply_quality_flags(df)


def detect_time_overlaps(df: pd.DataFrame, group_columns: list[str]) -> "pd.Series[bool]":
    overlap = pd.Series(False, index=df.index)
    has_times = df["start_time"].notna() & df["end_time"].notna()
    for _, group in df[has_times].groupby(group_columns, dropna=False):
        if len(group) < 2:
            continue
        starts = pd.to_datetime(group["start_time"], format="%H:%M")
        ends = pd.to_datetime(group["end_time"], format="%H:%M")
        idx = group.index.to_list()
        for i in range(len(idx)):
            for j in range(i + 1, len(idx)):
                # two ranges overlap if one starts before the other ends, both ways
                if starts.iloc[i] < ends.iloc[j] and starts.iloc[j] < ends.iloc[i]:
                    overlap[idx[i]] = True
                    overlap[idx[j]] = True
    return overlap


def apply_quality_flags(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    duplicate_keys = ["source_file", "section", "batch", "day", "subject_id", "teacher_code", "start_time", "end_time"]
    has_complete_identity = df[["subject_id", "teacher_code", "day"]].notna().all(axis=1)
    df["duplicate_record"] = False
    df.loc[has_complete_identity, "duplicate_record"] = df.loc[has_complete_identity].duplicated(duplicate_keys, keep=False)
    df["missing_subject"] = df["subject_id"].isna() | df["subject_id"].eq("")
    df["missing_teacher"] = (df["teacher_id"].isna() | df["teacher_id"].eq("")) & (df["teacher_code"].isna() | df["teacher_code"].eq(""))
    both_times_present = df["start_time"].notna() & df["end_time"].notna()
    df["invalid_time_range"] = both_times_present & df["duration_hours"].isna()
    df["invalid_duration"] = both_times_present & (df["duration_hours"].isna() | df["duration_hours"].le(0))
    section_overlap = detect_time_overlaps(df, ["day", "section", "batch"])
    teacher_overlap = detect_time_overlaps(df, ["day", "teacher_code"])
    df["overlaps_with_another_class"] = section_overlap | teacher_overlap
    return df.reindex(columns=CANONICAL_COLUMNS)



def build_historical_dataframe(raw_files: list[dict[str, Any]]) -> pd.DataFrame:
    all_records: list[dict[str, Any]] = []
    for payload in raw_files:
        metadata = extract_source_metadata(payload, payload.get("_source_file", "unknown.json"))
        for record in extract_routine_records(payload):
            all_records.append({**metadata, **record})
    return routine_records_to_dataframe(all_records)


def export_historical_processed_data(df: pd.DataFrame, output_path: str) -> None:
    records = df.where(pd.notna(df), None).to_dict(orient="records")
    save_json_file(output_path, {
        "metadata": {"status": "processed", "record_count": len(records)},
        "source_files": sorted(df["source_file"].dropna().unique().tolist()) if not df.empty else [],
        "records": records,
    })


HISTORICAL_FLAG_COLUMNS = [
    "duplicate_record", "missing_subject", "missing_teacher",
    "invalid_time_range", "invalid_duration", "overlaps_with_another_class",
]


def report_historical_quality_issues(df: pd.DataFrame) -> None:
    if df.empty:
        print("  (no historical records to check)")
        return
    any_issue = pd.Series(False, index=df.index)
    for flag in HISTORICAL_FLAG_COLUMNS:
        flagged = df[df[flag]]
        any_issue |= df[flag]
        if flagged.empty:
            continue
        print(f"  {flag}: {len(flagged)} row(s)")
        for _, row in flagged.iterrows():
            print(f"    - {row['source_file']} | {row['day']} | section={row['section']} | subject={row['subject_id']} | teacher={row['teacher_code']} | time={row['start_time']}-{row['end_time']}")
    clean_count = int((~any_issue).sum())
    print(f"  -> {clean_count}/{len(df)} row(s) clean and usable for training")


def get_training_ready_historical(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    has_issue = df[HISTORICAL_FLAG_COLUMNS].any(axis=1)
    return df[~has_issue].reset_index(drop=True)