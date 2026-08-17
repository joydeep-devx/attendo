"""
main.py
--------
Orchestrator. Loads current + historical input, builds clean
DataFrames, prints WHY any row got flagged, and writes only the two clean
processed datasets needed by the NumPy and ML stages. JSON only, no CSV.
"""

from src.data.data_loader import load_current_timetable_json, load_multiple_historical_jsons
from src.processing.current_processor import (
    build_current_dataframes,
    export_current_processed_data,
    report_current_quality_issues,
    get_training_ready_current,
)
from src.processing.historical_processor import (
    build_historical_dataframe,
    export_historical_processed_data,
    report_historical_quality_issues,
    get_training_ready_historical,
)
CURRENT_INPUT_PATH = "dataset/raw/current/demo_input.json"
HISTORICAL_FOLDER = "dataset/raw/historical"

CURRENT_OUTPUT_PATH = "dataset/processed/current_processed.json"
HISTORICAL_OUTPUT_PATH = "dataset/processed/historical_processed.json"


def run():
    # --- current input ---
    current_payload = load_current_timetable_json(CURRENT_INPUT_PATH)
    current_dfs = build_current_dataframes(current_payload)

    print("=== CURRENT INPUT ===")
    for name, df in current_dfs.items():
        print(f"{name}: {df.shape[0]} rows, {df.shape[1]} cols")

    print("Quality check (current):")
    report_current_quality_issues(current_dfs)

    current_clean = get_training_ready_current(current_dfs)
    export_current_processed_data(current_clean, CURRENT_OUTPUT_PATH)
    print(f"-> wrote {CURRENT_OUTPUT_PATH} ({current_clean['subjects'].shape[0]} clean subjects, {current_clean['teacher_qualifications'].shape[0]} clean qualifications)")
    print()

    # --- historical input ---
    historical_payloads = load_multiple_historical_jsons(HISTORICAL_FOLDER)
    historical_df = build_historical_dataframe(historical_payloads)

    print("=== HISTORICAL INPUT ===")
    print(f"historical_df: {historical_df.shape[0]} rows, {historical_df.shape[1]} cols")

    print("Quality check (historical):")
    report_historical_quality_issues(historical_df)

    historical_clean = get_training_ready_historical(historical_df)
    export_historical_processed_data(historical_clean, HISTORICAL_OUTPUT_PATH)
    print(f"-> wrote {HISTORICAL_OUTPUT_PATH} ({historical_clean.shape[0]} clean rows)")

    return current_dfs, historical_df, current_clean, historical_clean


if __name__ == "__main__":
    run()
