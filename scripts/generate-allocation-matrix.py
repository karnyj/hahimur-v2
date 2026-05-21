#!/usr/bin/env python3
"""
One-time script to generate the correct allocation matrix for src/lib/allocationMatrix.ts.
Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage#Combinations_of_matches_in_the_round_of_32

The 495 combinations come from Annex C of the FIFA WC 2026 tournament regulations.
Columns 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L are the group winners who face 3rd-place teams.
"""

import urllib.request
from html.parser import HTMLParser
import os

URL = "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage"
OUT = os.path.join(os.path.dirname(__file__), "../src/lib/allocationMatrix.ts")


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current_row = []
        self.current_cell = ""
        self.in_cell = False
        self.current_colspan = 1

    def handle_starttag(self, tag, attrs):
        if tag in ("td", "th"):
            self.in_cell = True
            self.current_cell = ""
            self.current_colspan = int(dict(attrs).get("colspan", 1))

    def handle_endtag(self, tag):
        if tag == "tr":
            if self.current_row:
                self.rows.append(self.current_row)
                self.current_row = []
        elif tag in ("td", "th"):
            val = self.current_cell.strip()
            for _ in range(self.current_colspan):
                self.current_row.append(val)
            self.in_cell = False
            self.current_colspan = 1

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell += data


def fetch_combinations():
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")

    marker = "Combinations of matches in the round of 32\n</caption>"
    start = html.find(marker)
    if start == -1:
        raise RuntimeError("Could not find combinations table on Wikipedia page")

    tbody_start = html.find("<tbody>", start)
    tbody_end = html.find("</tbody>", tbody_start) + len("</tbody>")
    tbody = html[tbody_start:tbody_end]

    parser = TableParser()
    parser.feed(tbody)

    data_rows = [r for r in parser.rows if r and r[0].isdigit()]
    if len(data_rows) != 495:
        raise RuntimeError(f"Expected 495 rows, got {len(data_rows)}")

    lines = []
    for row in data_rows:
        num = row[0]
        group_cells = row[1:13]
        groups = "".join(c for c in group_cells if c and len(c) == 1 and c.isalpha())
        matchups = row[-8:]

        if len(groups) != 8:
            raise RuntimeError(f"Row {num}: expected 8 qualifying groups, got {groups!r}")
        if not all(m.startswith("3") and len(m) == 2 for m in matchups):
            raise RuntimeError(f"Row {num}: bad matchups {matchups}")

        sorted_groups = "".join(sorted(groups))
        lines.append(f"{num},{sorted_groups},{','.join(matchups)}")

    return lines


def main():
    print("Fetching Wikipedia table...")
    lines = fetch_combinations()
    print(f"Parsed {len(lines)} combinations")

    raw = "\n".join(lines)

    ts = f"""// 495-scenario allocation matrix for the 2026 FIFA WC Round of 32.
// Maps sorted qualifying-group letters (8 groups whose 3rd-place teams advanced)
// to which 3rd-place source group each of the 8 group-winners faces.
// Columns: 1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L
// Generated from: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
// Source: Annex C of the FIFA WC 2026 tournament regulations.
const RAW = `{raw}`

export const ALLOCATION_MATRIX: Record<string, Record<string, string>> = (() => {{
  const result: Record<string, Record<string, string>> = {{}}
  for (const line of RAW.split('\\n')) {{
    const parts = line.split(',')
    if (parts.length < 10) continue
    const key = [...new Set(parts[1].replace(/\\s+/g, '').split(''))].sort().join('')
    if (key.length !== 8) continue
    result[key] = {{
      '1A': parts[2], '1B': parts[3], '1D': parts[4], '1E': parts[5],
      '1G': parts[6], '1I': parts[7], '1K': parts[8], '1L': parts[9],
    }}
  }}
  return result
}})()
"""

    out_path = os.path.abspath(OUT)
    with open(out_path, "w") as f:
        f.write(ts)
    print(f"Written to {out_path}")

    # Sanity check: count unique keys
    seen = set()
    for line in lines:
        key = "".join(sorted(line.split(",")[1]))
        seen.add(key)
    print(f"Unique group combinations: {len(seen)} (expected 495)")


if __name__ == "__main__":
    main()
