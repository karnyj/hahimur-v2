Import a user's predictions from a raw JSON export into the app.

The user will provide some or all of: a JSON file path, an output slug, and a display name. Ask for anything missing before proceeding.

## Steps

### 1. Collect arguments

You need two values:
- `<input-json>` — path to the raw export JSON (e.g. `raw_exports/foo-wc2026-predictions.json`)
- `<output-slug>` — kebab-case filename for the user (e.g. `foo-bar`)

The display name is read from the `label` field in the JSON. If any are missing, ask the user before continuing.

### 2. Run the import script

```bash
node --experimental-strip-types scripts/import-user.ts <input-json> <output-slug>
```

This creates `src/users/<output-slug>.ts` with all predictions.

### 3. Add the user to the index

Open `src/users/index.ts` and add an import and entry for the new user (follow the existing pattern).

### 4. Report

Confirm which files were written.
