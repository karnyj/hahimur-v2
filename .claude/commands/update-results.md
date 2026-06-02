Find the next unplayed group match and ask the user for the score, then write it to `src/tournament-results.ts`. Repeat until the user stops.

## Steps

### 1. Find the next unplayed match

- Read `src/tournament-results.ts` to see which match IDs are already in `groupScores`
- Read `src/shared/groups.ts` to get all group matches with their dates
- Find all matches whose ID is NOT in `groupScores`, sorted by date (day number, then month: ביוני=June, ביולי=July)
- If all matches are played, tell the user and stop

### 2. Ask for the score

Show the match clearly, e.g.:
```
Mexico vs South Africa (Group A, 11 ביוני)
```
Then ask: "What's the score? (home away)"

Wait for the user to reply with two numbers.

### 3. Write to the file

Update the `groupScores` object in `src/tournament-results.ts` by adding the new entry. Keep all existing entries. The format is:
```ts
const groupScores: Record<string, MatchScores> = {
  A1: { home: 2, away: 1 },
}
```

### 4. Confirm and continue

Tell the user the score was saved, then ask: "Continue to the next match?"

If yes, go back to step 1. If no, stop.
