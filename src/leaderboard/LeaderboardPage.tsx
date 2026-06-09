import { useState } from 'react'
import PageLayout from '../shared/PageLayout'
import { USERS_SORTED } from '../users/index'
import LeaderboardTable from './LeaderboardTable'
import { tournamentResults } from '../tournament-results'
import { buildLeaderboardRows, groupScopeLabel } from './leaderboardRows'
import type { Scope } from './leaderboardRows'
import LeaderboardScopeBar from './LeaderboardScopeBar'
import './LeaderboardPage.css'

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('all')
  const rows = buildLeaderboardRows(USERS_SORTED, tournamentResults, scope)
  const scopeLabel = groupScopeLabel(scope)

  return (
    <PageLayout title="לוח המובילים">
      <div className="lb-page" dir="rtl">
        <div className="lb-scope-wrap">
          <LeaderboardScopeBar scope={scope} onScopeChange={setScope} />
        </div>
        <LeaderboardTable rows={rows} scopeLabel={scopeLabel} />
      </div>
    </PageLayout>
  )
}
