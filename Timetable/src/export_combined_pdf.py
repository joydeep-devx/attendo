"""
export_combined_pdf.py
-----------------------
Reads output/timetable_CSE1.csv, timetable_CSE2.csv, timetable_CSE3.csv
(produced by generate_multisection.py) and renders all three sections as
bordered grids on a single landscape A4 PDF page: output/combined_timetable.pdf

Usage:
    python3 export_combined_pdf.py
"""

from __future__ import annotations

import csv
from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output"
SECTIONS = ["CSE1", "CSE2", "CSE3"]

PAGE_SIZE = landscape(A4)
MARGIN = 14 * mm

# Sizes tuned to keep all 3 section grids on a single landscape A4 page.
# If you add a 4th section, or the day-column text gets longer, these will
# likely need to shrink a bit -- reduce CELL_FS/CELL_PAD first.
CELL_FS = 7.4
HEADER_FS = 8.7
SLOT_FS = 8.2
TITLE_FS = 15
SECTION_FS = 11.7
CELL_PAD = 3.15
SECTION_SPACE_BEFORE = 8

styles = getSampleStyleSheet()
cell_style = ParagraphStyle(
    "cell", parent=styles["Normal"], fontSize=CELL_FS, leading=CELL_FS * 1.18,
    alignment=TA_CENTER, fontName="Helvetica",
)
header_style = ParagraphStyle(
    "header", parent=styles["Normal"], fontSize=HEADER_FS, leading=HEADER_FS * 1.13,
    alignment=TA_CENTER, fontName="Helvetica-Bold", textColor=colors.white,
)
slot_style = ParagraphStyle(
    "slot", parent=styles["Normal"], fontSize=SLOT_FS, leading=SLOT_FS * 1.14,
    alignment=TA_CENTER, fontName="Helvetica-Bold",
)
title_style = ParagraphStyle(
    "title", parent=styles["Heading1"], fontSize=TITLE_FS, leading=TITLE_FS * 1.14,
    alignment=TA_CENTER, spaceAfter=3,
)
section_title_style = ParagraphStyle(
    "section_title", parent=styles["Heading2"], fontSize=SECTION_FS, leading=SECTION_FS * 1.13,
    textColor=colors.HexColor("#1f3864"), spaceBefore=SECTION_SPACE_BEFORE, spaceAfter=3,
)

ACCENT = colors.HexColor("#1f3864")
BREAK_FILL = colors.HexColor("#e8e8e8")
HEADER_FILL = ACCENT
GRID_COLOR = colors.HexColor("#7f7f7f")


def read_section_csv(section: str) -> list[list[str]]:
    path = OUT_DIR / f"timetable_{section}.csv"
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.reader(f))


def build_section_table(rows: list[list[str]]) -> Table:
    data = [[Paragraph(c, header_style) for c in rows[0]]]

    is_break_row = []
    for r in rows[1:]:
        slot_label = r[0]
        is_break_row.append(slot_label.startswith("Break"))
        row_cells = [Paragraph(slot_label, slot_style)]
        row_cells += [Paragraph(cell if cell else "-", cell_style) for cell in r[1:]]
        data.append(row_cells)

    col_widths = [18 * mm] + [41.8 * mm] * 6
    tbl = Table(data, colWidths=col_widths, repeatRows=1)

    style_cmds = [
        ("GRID", (0, 0), (-1, -1), 0.5, GRID_COLOR),
        ("BOX", (0, 0), (-1, -1), 1.2, ACCENT),
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), CELL_PAD),
        ("BOTTOMPADDING", (0, 0), (-1, -1), CELL_PAD),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.5),
        ("BACKGROUND", (0, 1), (0, -1), colors.HexColor("#f2f2f2")),
    ]
    for i, is_break in enumerate(is_break_row, start=1):
        if is_break:
            style_cmds.append(("BACKGROUND", (0, i), (-1, i), BREAK_FILL))

    tbl.setStyle(TableStyle(style_cmds))
    return tbl


def main() -> None:
    story = [Paragraph("B.Tech CSE &mdash; Semester V &mdash; Combined Timetable", title_style), Spacer(1, 3)]

    for section in SECTIONS:
        rows = read_section_csv(section)
        story.append(Paragraph(f"Section {section}", section_title_style))
        story.append(build_section_table(rows))

    out_path = OUT_DIR / "combined_timetable.pdf"
    doc = SimpleDocTemplate(
        str(out_path), pagesize=PAGE_SIZE,
        leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN, bottomMargin=MARGIN,
        title="Combined Timetable",
    )
    doc.build(story)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
