import PageLayout from '../shared/PageLayout'
import { USERS_SORTED } from '../users/index'
import { computeUserPoints } from './points'
import LeaderboardTable from './LeaderboardTable'
import { tournamentResults } from '../tournament-results'
import './LeaderboardPage.css'

export default function LeaderboardPage() {
  const rows = USERS_SORTED.map(user => ({
    label: user.label,
    ...computeUserPoints(user, tournamentResults),
  })).sort((a, b) => b.total - a.total)

  return (
    <PageLayout title="לוח המובילים">
      <div className="lb-page" dir="rtl">
        <LeaderboardTable rows={rows} />
      </div>
    </PageLayout>
  )
}
