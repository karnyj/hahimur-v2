# By-Date View Counter

Every click of the לפי תאריך toggle on the forms page is recorded as one row
in the `date_view_clicks` table on Neon. Rows hold only a timestamp — no user
data. This is the usage signal for the chronological forms view.

## One-time setup

The table must exist before clicks can be recorded (mirrors `sim_clicks`):

```sql
CREATE TABLE date_view_clicks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  clicked_at timestamptz NOT NULL DEFAULT now()
);
```

## The headline number

```sql
SELECT count(*) FROM date_view_clicks;
```

> "X people switched to the chronological view during WC 2026."

## Clicks per day

```sql
SELECT clicked_at::date AS day, count(*)
FROM date_view_clicks
GROUP BY day
ORDER BY day;
```

## How it works

- `api/date-view-click.ts` — POST inserts one row.
- `reportDateView()` in `src/formView/FormView.tsx` fires a fire-and-forget
  `fetch` to it when a user taps לפי תאריך; localhost clicks are skipped and
  failures are swallowed so the counter can never break the view.
