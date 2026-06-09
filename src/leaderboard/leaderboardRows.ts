import { computeUserPoints, computeGroupBreakdown } from './points'
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
