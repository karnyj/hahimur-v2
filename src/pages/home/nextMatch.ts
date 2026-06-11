import type { GroupMatch } from '../../shared/types'
import type { User } from '../../users/index'
import { kickoffDate, MATCH_WINDOW_MS } from '../../shared/matchOrder'
import { scoreFrequencies } from '../match/matchUtils'

// Group-stage matches only for now: knockout fixtures have a different shape
// (matchNum, unresolved team slots) and their own resolution logic.
// A started match still counts as "next" until its final score is recorded.
// Returns every match sharing the earliest kickoff: round 3 of each group
// plays both matches simultaneously.
export function nextMatches(matches: GroupMatch[], now: Date): GroupMatch[] {
  let next: GroupMatch[] = []
  let nextTime = Infinity
  for (const m of matches) {
    const kickoff = kickoffDate(m.matchDate, m.kickoffIST)?.getTime()
    if (kickoff === undefined || kickoff > nextTime) continue
    const ended = m.scores?.home != null && m.scores?.away != null
    if (ended || now.getTime() >= kickoff + MATCH_WINDOW_MS) continue
    if (kickoff < nextTime) {
      next = [m]
      nextTime = kickoff
    } else {
      next.push(m)
    }
  }
  return next
}

export interface TopPrediction {
  home: number
  away: number
  count: number
  total: number
}

export function topPrediction(users: User[], matchId: string): TopPrediction | null {
  let top: { key: string; count: number } | null = null
  let total = 0
  for (const [key, count] of scoreFrequencies(users, matchId)) {
    total += count
    if (!top || count > top.count) top = { key, count }
  }
  if (!top) return null
  const [home, away] = top.key.split('-').map(Number)
  return { home, away, count: top.count, total }
}
