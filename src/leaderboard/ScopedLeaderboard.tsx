import LeaderboardTable from './LeaderboardTable'
import GroupScopeTable from './GroupScopeTable'
import { buildLeaderboardRows, buildGroupScopeRows, buildRangeRows } from './leaderboardRows'
import type { Scope } from './leaderboardRows'
import type { TournamentResults } from '../shared/types'
import type { User } from '../users'

// key resets the table's sort state when switching scopes
export default function ScopedLeaderboard({ users, results, scope, rangeFrom, rangeTo }: {
  users: User[]
  results: TournamentResults
  scope: Scope
  rangeFrom: number
  rangeTo: number
}) {
  if (scope === 'all') return <LeaderboardTable rows={buildLeaderboardRows(users, results)} />
  if (scope === 'range') return <GroupScopeTable key="range" variant="window" rows={buildRangeRows(users, results, rangeFrom, rangeTo)} />
  return <GroupScopeTable key={scope} rows={buildGroupScopeRows(users, results, scope)} />
}
