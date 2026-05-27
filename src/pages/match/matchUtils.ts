import { GROUPS, TEAMS } from '../../shared/groups'

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

export const resultGroup = (h: number, aw: number) => h > aw ? 0 : h === aw ? 1 : 2

export const compareScores = (ha: number, aa: number, hb: number, ab: number) => {
  const ga = resultGroup(ha, aa), gb = resultGroup(hb, ab)
  if (ga !== gb) return ga - gb
  if (ga === 2) return aa - ab || ha - hb
  return ha - hb || ab - aa
}
