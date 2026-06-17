import { matchSortKey } from './matchOrder'
import type { Match, MatchScores, TournamentResults } from './types'
import { GROUPS, ALL_GROUP_LETTERS, type GroupLetter } from './groups'

export type MatchEntry = { match: Match; group: GroupLetter }
export type DateGroup  = { date: string; dayLabel: string; matches: MatchEntry[] }

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function groupMatchesByDate(entries: MatchEntry[]): DateGroup[] {
  const sorted = [...entries].sort((a, b) =>
    matchSortKey(a.match.matchDate, a.match.kickoffIST) -
    matchSortKey(b.match.matchDate, b.match.kickoffIST)
  )
  const grouped: DateGroup[] = []
  for (const entry of sorted) {
    const date = entry.match.matchDate ?? ''
    const last = grouped[grouped.length - 1]
    if (last?.date === date) {
      last.matches.push(entry)
    } else {
      const day = parseInt(date, 10)
      const d = new Date(2026, 5, day)
      grouped.push({ date, dayLabel: `יום ${HE_DAYS[d.getDay()]}`, matches: [entry] })
    }
  }
  return grouped
}

// All group-stage matches in kickoff order, bucketed by date. Derived from
// static fixture data, so it's computed once at module load and shared.
export const GROUP_MATCHES_BY_DATE: DateGroup[] = groupMatchesByDate(
  ALL_GROUP_LETTERS.flatMap(l =>
    (GROUPS[l]?.matches ?? []).map(m => ({ match: m, group: l }))
  )
)

// Earliest chronological group match with no finished score, or undefined once
// they're all played. Both the results page and per-bettor form view use this
// to auto-scroll their by-date view to where the tournament currently is.
export function nextUnplayedMatchId(results: TournamentResults): string | undefined {
  const scores: Record<string, MatchScores> = {}
  for (const matches of Object.values(results.groupMatches)) {
    for (const m of matches) if (m.scores) scores[m.id] = m.scores
  }
  for (const { matches } of GROUP_MATCHES_BY_DATE) {
    for (const { match } of matches) {
      const s = scores[match.id]
      if (!s || s.home === null || s.away === null) return match.id
    }
  }
  return undefined
}
