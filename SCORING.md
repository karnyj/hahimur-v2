# Scoring Rules — FIFA WC 2026 Prediction Tracker

## Definitions

- **פגיעה** = correct result (right winner, or correct draw in group stage)
- **צליפה** = exact scoreline (implies also got the winner right)
- **עולה** = correctly predicted a team to advance to that round (derived from match score predictions — no separate input needed)

---

## Group Stage (שלב בתים) — per match

| Outcome | Points |
|---------|--------|
| פגיעה (correct result) | 2 |
| צליפה (exact score) | 4 |

Each friend predicts all 48 group matches. After each match is played, they earn points based on their prediction vs. the actual result.

---

## Group Stage — per advancing team

| Outcome | Points |
|---------|--------|
| עולה — each team correctly predicted to advance (top 2 per group + 8 best 3rd place qualifiers) | 5 |

**Total possible: 32 teams × 5 pts = 160 pts**

"עולה" is computed automatically: if a friend predicted Team X would advance from their group (based on their score predictions), and Team X actually advances, they get 5 points per team.

---

## Knockout Rounds — per match + per advancing team

| Round | פגיעה | צליפה | עולה |
|-------|-------|-------|------|
| Round of 32 (שלב נוקאאוט 1) | 5 | 7 | 5 |
| Round of 16 (שמינית גמר) | 6 | 8 | 8 |
| Quarter-finals (רבע גמר) | 8 | 12 | 12 |
| Semi-finals (חצי גמר) | 12 | 16 | 16 |
| Third-place match (מקום שלישי) | 16 | 18 | 20 (זוכה מקום שלישי) |
| Final (גמר) | 20 | 25 | 25 (זוכה) |

For each knockout match, a friend can earn:
- פגיעה (correct winner) — e.g., 5 points in R32
- צליפה (exact score) — replaces פגיעה with a higher score — e.g., 7 points in R32
- עולה (correctly predicted team advancement) — 5–25 points depending on the round

---

## How "עולה" Works (Bracket Advancement)

"עולה" is automatically computed by comparing a friend's predicted bracket to the actual bracket.

**Example:**
- Friend predicted: Brazil beats France 2–1 in R32 → Brazil to R16
- Actual: Brazil beats Germany 1–0 in R32 → Brazil to R16
  - No פגיעה/צליפה for the match (different opponent, different score)
  - BUT: עולה = 5 points for R32 (Brazil correctly predicted to advance)

The friend's bracket is derived entirely from their score predictions. No separate "bracket" input is needed.

---

## Top Scorer (מלך שערים) — Future Feature

To be added later. When implemented:
- Each goal the predicted player scores = 3 points
- If that player wins the golden boot (most goals) = +10 points

---

## Total Possible Points

- Group stage matches: 48 × 4 = 192 pts (all צליפה)
- Group stage advancement: 32 × 5 = 160 pts
- **Group stage total: 352 pts**

- R32: 16 × 7 + 16 × 5 = 112 + 80 = 192 pts
- R16: 8 × 8 + 8 × 8 = 64 + 64 = 128 pts
- QF: 4 × 12 + 4 × 12 = 48 + 48 = 96 pts
- SF: 2 × 16 + 2 × 16 = 32 + 32 = 64 pts
- 3rd place: 1 × 18 + 1 × 20 = 38 pts
- Final: 1 × 25 + 1 × 25 = 50 pts
- **Knockout total: 568 pts**

- **Grand total (without top scorer): ~920 pts**
