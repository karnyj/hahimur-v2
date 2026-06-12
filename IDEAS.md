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
3. ~~**Today's matches on the home page**~~ ✅ Done — home page shows the next
   match with the crowd's favorite score, and keeps showing it until it ends.
   Simultaneous round-3 kickoffs (12 pairs, June 24–28) all get their own card.
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

## Low priority (not needed, but Eyal & Eldad always loved this kind of thing)

11. **"Banality index" (מדד הבנאליות)** — per player, how often they predicted
    with the crowd vs. against it. E.g. a match where the majority said X wins
    and you picked something else counts as "against the stream". A simple table:
    times with the flow / times against. Consensus-per-match already exists in
    the aggregation logic, so this is mostly counting.

## Data sources

12. ~~**ESPN hidden API as a live-score source**~~ ✅ Done (cron part) — ESPN
    is now the cron's primary finished-score source, football-data.org the
    backup; either source can fail and the run survives on the other. Live
    scores on the home page were deliberately skipped — the per-match detail
    endpoint (`.../summary?event={id}`, incl. scorers) is still unused if we
    ever want them.

## Glue with the group chat

9. **WhatsApp-shareable daily summary** — cron emits a copy-pasteable Hebrew
   text block after scores land (results, points awarded, new top 3, prophet of
   the day). Or just a "copy summary" button on the updates page.

## Ops (observability from the start)

10. ~~**Cron failure alert**~~ ✅ Done — covered via cron-job.org, which
    monitors the `fetch-scores` cron and alerts on failure.

## Recommended next

- **#1 movement arrows** — already wishlisted, thin, makes every matchday more fun.
