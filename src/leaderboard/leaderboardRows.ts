import { computeUserPoints, computeGroupBreakdown, singleMatchOutcome } from './points'
import { GROUPS } from '../shared/groups'
import type { GroupLetter } from '../shared/groups'
import type { TournamentResults } from '../shared/types'
import type { User } from '../users'

export type Scope = 'all' | GroupLetter

export function buildLeaderboardRows(users: User[], results: TournamentResults, scope: Scope) {
  const filtered = scope !== 'all' ? {
    ...results,
    groupMatches: { [scope]: results.groupMatches[scope] ?? [] },
    groupTables: { [scope]: results.groupTables[scope] ?? [] },
    thirdPlaceQualification: { resolved: false as const, all: [], tied: [] },
  } : null

  return users.map(user => {
    const breakdown = computeUserPoints(user, results)
    if (filtered === null) return { label: user.label, ...breakdown }
    const scopeData = computeGroupBreakdown(user, filtered)
    return { label: user.label, ...breakdown, total: scopeData.total, scopeData }
  }).sort((a, b) => b.total - a.total)
}

export function groupScopeLabel(scope: Scope): string | undefined {
  return scope !== 'all' ? `בית ${GROUPS[scope].he}` : undefined
}

export interface HitsRow {
  label: string
  tzelifaCount: number
  pgiyaCount: number
}

export function buildHitsRows(users: User[], results: TournamentResults, scope: Scope, sortBy: 'pgiya' | 'tzelifa' = 'tzelifa'): HitsRow[] {
  const groupIds = scope === 'all' ? Object.keys(results.groupMatches) : [scope]

  const resultById: Record<string, typeof results.groupMatches[string][number]> = {}
  for (const groupId of groupIds) {
    for (const m of results.groupMatches[groupId] ?? []) resultById[m.id] = m
  }

  return users.map(user => {
    let tzelifaCount = 0
    let pgiyaCount = 0
    for (const groupId of groupIds) {
      for (const userMatch of user.groupMatches[groupId] ?? []) {
        const outcome = singleMatchOutcome(
          userMatch.scores ?? { home: null, away: null },
          resultById[userMatch.id]?.scores ?? { home: null, away: null },
        )
        if (outcome === 'tzelifa') tzelifaCount++
        else if (outcome === 'pgiya') pgiyaCount++
      }
    }
    return { label: user.label, tzelifaCount, pgiyaCount }
  }).sort(sortBy === 'pgiya'
    ? (a, b) => b.pgiyaCount - a.pgiyaCount || b.tzelifaCount - a.tzelifaCount
    : (a, b) => b.tzelifaCount - a.tzelifaCount || b.pgiyaCount - a.pgiyaCount
  )
}
