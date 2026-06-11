import { GROUPS, TEAMS } from '../../shared/groups'
import { isUnpredicted } from '../../shared/types'
import type { User } from '../../users/index'

export const ALL_MATCHES = Object.values(GROUPS).flatMap(g => g.matches)

export function findMatch(matchId: string) {
  return ALL_MATCHES.find(m => m.id === matchId) ?? null
}

export function resolveMatch(matchId: string | null) {
  const match = matchId ? findMatch(matchId) : null
  const home = match ? TEAMS[match.homeTeam] : null
  const away = match ? TEAMS[match.awayTeam] : null
  return { match, home, away }
}

// Counts predicted scores for a match, keyed by `${home}-${away}`.
export function scoreFrequencies(users: User[], matchId: string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const u of users) {
    const p = u.predictions[matchId]
    if (!p || isUnpredicted(p)) continue
    const key = `${p.home}-${p.away}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export const resultGroup = (h: number, aw: number) => h > aw ? 0 : h === aw ? 1 : 2

export const compareScores = (ha: number, aa: number, hb: number, ab: number) => {
  const ga = resultGroup(ha, aa), gb = resultGroup(hb, ab)
  if (ga !== gb) return ga - gb
  if (ga === 2) return aa - ab || ha - hb
  return ha - hb || ab - aa
}
