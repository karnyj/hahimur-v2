Import a user's predictions from a raw JSON export into the app.

The user will provide some or all of: a JSON file path, an output slug, and a display name. Ask for anything missing before proceeding.

## Steps

### 1. Collect arguments

You need three values:
- `<input-json>` — path to the raw export JSON (e.g. `raw_exports/foo-wc2026-predictions.json`)
- `<output-slug>` — kebab-case filename for the user (e.g. `foo-bar`)
- `<name>` — display name in Hebrew (e.g. `"פו בר"`)

If any are missing, ask the user before continuing.

### 2. Run the import script

```bash
node --experimental-strip-types scripts/import-predictions.ts <input-json> <output-slug> "<name>"
```

This writes `src/users/<output-slug>.ts` and regenerates `src/users/index.ts`.

### 3. Report

Confirm which files were written.
