from pathlib import Path  # File path ko handle karne ke liye
from typing import Any  # Data ka type flexible ho sakta hai, isliye use kiya
from src.json_handler import load_clean_json  # JSON ko load + validate karne wala helper


# Current timetable ke liye raw JSON file ko load karta hai.
def load_current_timetable_json(file_path: str | Path) -> dict[str, Any]:
    # Current input ko complete generation configuration chahiye, isliye ye required fields check karte hain.
    return load_clean_json(file_path, required_keys=("metadata", "schedule", "subjects", "teachers"))


# Historical timetable JSON ko load karta hai aur source file ka naam bhi attach karta hai.
def load_historical_timetable_json(file_path: str | Path) -> dict[str, Any]:
    payload = load_clean_json(file_path, required_keys=("metadata", "routine"))
    # Source ko clear rakhne ke liye original metadata ke bahar provenance store karte hain.
    payload["_source_file"] = Path(file_path).name  # Example: sample_1.json
    return payload  # Final loaded historical payload return ho jaata hai


# Folder ke andar sab JSON files ko ek list me load kar deta hai.
def load_multiple_historical_jsons(folder_path: str | Path) -> list[dict[str, Any]]:
    folder = Path(folder_path)  # Folder path ko Path object bana diya
    return [load_historical_timetable_json(path) for path in sorted(folder.glob("*.json"))]
    # Sab files ko sort karke ek list me load kiya, taaki consistent order rahe


# Historical records ko ek hi merged structure me combine karta hai.
def combine_historical_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    merged_records: list[dict[str, Any]] = []  # Final combined records store karne ke liye
    source_files: list[str] = []  # Kaun-kaun se source files use hui, uska track rakhenge
    for payload in records:  # Har file ka payload process karo
        source_file = payload.get("_source_file", "unknown.json")  # Kis source file se aya, ye pata lagao
        source_files.append(source_file)  # Source files ki list me add kar do
        metadata = payload.get("metadata", {})  # File ka metadata nikal lo
        for record in payload.get("routine", []):  # Har record ko ek-ek karke process karo
            merged_records.append(
                add_source_metadata(
                    record, source_file, metadata.get("semester"), metadata.get("academic_year")
                )
            )
    return {
        "metadata": {"source_files": source_files, "count": len(merged_records)},
        "records": merged_records,
    }
    # Final output me metadata plus combined records dono mil jayenge


# Har record me source file, semester aur academic_year jod deta hai.
def add_source_metadata(record: dict[str, Any], source_file: str, semester: str | None = None, year: int | None = None) -> dict[str, Any]:

    enriched = record.copy()  # Original record ko modify nahi karte, copy bana lete hain
    enriched["source_file"] = source_file  # Record ko kis file se aaya, ye bata dete hain
    enriched["semester"] = semester  # Semester add kar diya
    enriched["academic_year"] = year  # Academic year add kar diya
    return enriched  # Enriched record return kar diya
