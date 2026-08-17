# Timetable Data Foundation

This project is intentionally scoped to the first phase of the timetable-generation pipeline.

## Phase 1 TODAY: Python + JSON + Pandas + NumPy

This phase focuses only on the data foundation required before timetable generation can begin.

Responsibilities for this phase:
- Python basics and data structures
- JSON file loading and saving
- Raw dataset inspection
- Historical timetable data processing
- Data cleaning and normalization
- Feature preparation for later ML or rule-based modeling
- NumPy feature matrix creation

Important constraints for this phase:
- No timetable generator implementation yet
- No ML model training yet
- No FastAPI/Pydantic API yet
- No constraint solver or backtracking logic yet
- No MongoDB integration yet
- No executable timetable-building logic yet

## Project structure

The repository is organized around a clear data pipeline:

1. Raw JSON inputs live under dataset/raw/
2. Processed tabular data is prepared in Python/Pandas modules
3. Numerical feature matrices are created from processed records
4. Later phases can build on this cleaned foundation

## Phase 2: Pydantic + FastAPI

This phase will add schema validation and API endpoints for timetable-related data. It will be used to validate input payloads, expose data services, and prepare model-friendly interfaces.

## Phase 3: Candidate generation

This phase will generate possible timetable assignments, subject combinations, teacher assignments, and room/slot options based on curriculum and scheduling rules.

## Phase 4: Hard constraints

This phase will encode correctness rules such as:
- teacher availability
- room availability
- session count limits
- time conflict prevention
- section/batch limits
- lab constraints

These are correctness constraints, not preferences.

## Phase 5: Conflict resolution

This phase will repair schedule conflicts that arise after candidate generation or during partial assignment. This is distinct from validating correctness rules.

## Phase 6: Backtracking

This phase will perform search-style schedule building when a partial assignment cannot satisfy all constraints. This is the exploration/search layer.

## Phase 7: Rule-based suitability scoring

This phase will rank candidate timetable placements according to soft rules, preference logic, and quality heuristics. This is a scoring layer that helps choose among valid options.

## Phase 8: Scikit-learn ML training

This phase will train a model for ranking or preference estimation based on historical patterns and processed timetable features. The model is not the schedule generator itself.

## Phase 9: ML prediction

This phase will use trained models to estimate the desirability or suitability of an assignment or timetable candidate.

## Phase 10: Final timetable validation

This final phase verifies the completed timetable against all rules, constraints, and quality requirements before it is considered valid.

## Terminology

- ML = ranking or preference estimation
- Constraints = correctness rules
- Conflict resolver = repair logic for broken assignments
- Backtracking = search over possible schedule states
- Validator = final verification of schedule correctness

## Current implementation status

This repository is intentionally in a TODO-only state for the data foundation stage. No scheduler logic, model training, API layer, or timetable generator is implemented here.
