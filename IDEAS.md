# Ideas Backlog — brainstormed 2026-06-11 (opening day)

Unbuilt feature ideas, roughly ordered by value-per-effort during the live tournament.
Note: rank movement and "max points possible" were already in the Phase 2 wishlist
in PROGRESS.md but never built.

## Live-tournament drama (highest value now)

1. **Rank movement arrows (▲2 ▼1)** on the leaderboard, vs. before the last
   finished match. "Previous standings" = recompute with the last result excluded.
   Thin slice, huge daily-check appeal.
2. **"Prophet of the day"** — who scored the most points in the last matchday.
   One line on the home page or leaderboard. A daily winner even when overall
   ranks barely move.
3. **Today's matches on the home page** — kickoff times (Israel time) plus the
   consensus prediction per match ("19 מתוך 27 הלכו על צרפת"). Filter over
   `matchOrder.ts` + the aggregation ScoreFrequencyTable already does.
4. **Upset highlight** — when a finished match was predicted by ≤3 people, badge
   it and name who called it ("רק עידן ניחש 0-2"). Match drill-down already sorts
   by accuracy; this is mostly surfacing.

## Race-narrative features

5. **Cumulative points graph** — one line per player across matchdays. Pairs
   naturally with #1.
6. **Max points still attainable** per player — "אתה מחוסל מתמטית" moments.
   Harder than it looks (depends on which teams can still advance); slice it
   group-stage-only first.
7. **Head-to-head compare** — pick a rival, predictions side by side, diffs
   highlighted.
8. **Golden boot race page** — who picked which scorer, goals so far. Makes the
   newly shipped goal-tracking data visible.

## Glue with the group chat

9. **WhatsApp-shareable daily summary** — cron emits a copy-pasteable Hebrew
   text block after scores land (results, points awarded, new top 3, prophet of
   the day). Or just a "copy summary" button on the updates page.

## Ops (observability from the start)

10. **Cron failure alert** — dead-man's-switch for `fetch-scores`: ping
    healthchecks.io from the workflow, or show "last successful fetch: X" on the
    admin page. ~30-minute slice that protects everything else mid-tournament.

## Recommended next

- **#1 movement arrows** — already wishlisted, thin, makes every matchday more fun.
- **#10 cron alert** — do this week regardless; the whole site depends on the cron.
