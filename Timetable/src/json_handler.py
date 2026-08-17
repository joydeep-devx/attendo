import json  # JSON file ko read/write karne ke liye Python library
import math  # NaN ya Infinity jaise invalid values ko check karne ke liye
from pathlib import Path  # File path ko easy tarike se handle karne ke liye
from typing import Any, Iterable  # Type hints ke liye: value koi bhi type ho sakta hai


# JSON file ko open karke Python dictionary me convert karta hai.
def load_json_file(file_path: str | Path) -> dict[str, Any]:
    path = Path(file_path)  # String path ko Path object me convert kar diya
    with path.open("r", encoding="utf-8") as json_file:  # File ko read mode me UTF-8 encoding ke saath open kiya
        data = json.load(json_file)  # JSON content ko Python object me parse kar diya

    # Pipeline ko expectation hai ki har source file ek JSON object ho, sirf list nahi.
    if not isinstance(data, dict):  # Agar JSON file me list ya string aaya, to error do
        raise ValueError(f"Expected a JSON object in {path}, received {type(data).__name__}.")
    return data  # Final valid dictionary return kar diya


# Agar data me NaN, Infinity ya invalid values hain, to unko JSON-safe None me convert karta hai.
def make_json_safe(value: Any) -> Any:
    """Convert missing and non-finite values to JSON-safe ``None`` values."""
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None  # Float NaN/Infinity ko None bana diya, taaki JSON save karte waqt error na aaye
    if isinstance(value, dict):  # Agar value dictionary hai, to har key/value ko recursively clean karo
        return {key: make_json_safe(item) for key, item in value.items()}
    if isinstance(value, list):  # Agar value list hai, to har item ko same process se safe karo
        return [make_json_safe(item) for item in value]
    return value  # Safe values as-is return kar diye


# Clean data ko file me JSON format me save karta hai.
def save_json_file(file_path: str | Path, payload: dict[str, Any]) -> None:

    path = Path(file_path)  # File path ko Path object me convert kiya
    path.parent.mkdir(parents=True, exist_ok=True)  # Parent folder agar missing hai, to create kar do
    with path.open("w", encoding="utf-8") as json_file:  # File ko write mode me open kiya
        json.dump(make_json_safe(payload), json_file, indent=2, ensure_ascii=False, allow_nan=False)
        # make_json_safe payload ko clean karta hai, pretty format me JSON write hota hai
        # ensure_ascii=False se Hindi/other languages as-is save hote hain
        # allow_nan=False se NaN/Infinity ko JSON me allow nahi kiya jayega
        json_file.write("\n")  # File ke end me newline add kar diya, neat formatting ke liye


# Dictionary me required keys exist kar rahi hain ya nahi, ye check karta hai.
def validate_required_keys(data: dict[str, Any], required_keys: Iterable[str]) -> bool:
    if not isinstance(data, dict):  # Agar data dictionary nahi hai, to false return kar do
        return False
    return all(key in data for key in required_keys)  # Har required key ko check kiya, sab exist karna chahiye


# File ko load karta hai aur optional required keys validate bhi karta hai.
def load_clean_json(file_path: str | Path, required_keys: Iterable[str] | None = None) -> dict[str, Any]:
    data = load_json_file(file_path)  # Pehle file ko as-is JSON se load kiya
    if required_keys is not None and not validate_required_keys(data, required_keys):
        # Agar required keys diya gaye hain aur missing hain, to clear error dikhana hai
        raise ValueError(f"{file_path} is missing required keys: {', '.join([key for key in required_keys if key not in data])}")
    return data  # Clean valid data return kar diya
