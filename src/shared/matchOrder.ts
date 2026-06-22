// Orders matches chronologically. matchDate strings start with the day of
// month followed by a Hebrew month name, e.g. '11 ביוני' (June) / '11 ביולי' (July).
// Matches without a date sort last.
function parseMatchDateTime(matchDate: string | undefined, kickoffIST: string | undefined) {
  const month = !matchDate ? 99 : matchDate.includes('ביולי') ? 7 : 6
  const day = matchDate ? parseInt(matchDate, 10) : 99
  const [hh = 0, mm = 0] = (kickoffIST ?? '').split(':').map(Number)
  return { month, day, hh, mm }
}

export function matchSortKey(matchDate: string | undefined, kickoffIST: string | undefined): number {
  const { month, day, hh, mm } = parseMatchDateTime(matchDate, kickoffIST)
  return ((month * 100 + day) * 100 + hh) * 100 + mm
}

// The chronologically-last match in a list, or null when empty. Ties break to
// the later-listed match: a group's final two matches kick off simultaneously,
// and the group is decided at its last listed match (e.g. A6, not A5).
export function latestBySortKey<T extends { matchDate?: string; kickoffIST?: string }>(matches: T[]): T | null {
  return matches.reduce<T | null>((latest, m) =>
    !latest || matchSortKey(m.matchDate, m.kickoffIST) >= matchSortKey(latest.matchDate, latest.kickoffIST) ? m : latest, null)
}

// How long after kickoff a match is considered in progress when no final
// score has been recorded yet (covers stoppage time and halftime).
export const MATCH_WINDOW_MS = 3 * 60 * 60 * 1000

// Kickoff times are stored as Israel daylight time, and the whole tournament
// (June–July 2026) falls inside IDT, so a fixed UTC+3 offset and year are enough.
const IST_OFFSET_HOURS = 3

export function kickoffDate(matchDate: string | undefined, kickoffIST: string | undefined): Date | null {
  if (!matchDate || !kickoffIST) return null
  const { month, day, hh, mm } = parseMatchDateTime(matchDate, kickoffIST)
  return new Date(Date.UTC(2026, month - 1, day, hh - IST_OFFSET_HOURS, mm))
}

export function isLive(match: { matchDate?: string; kickoffIST?: string }, now: Date): boolean {
  const kickoff = kickoffDate(match.matchDate, match.kickoffIST)?.getTime()
  if (kickoff === undefined) return false
  return now.getTime() >= kickoff && now.getTime() < kickoff + MATCH_WINDOW_MS
}
