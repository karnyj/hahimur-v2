import type { TournamentResults } from '../../shared/types'
import type { User } from '../../users/index'
import { buildLeaderboardRows } from '../../leaderboard/leaderboardRows'
import './TopThreeCard.css'

const MEDALS = ['🥇', '🥈', '🥉']

type Props = { users: User[]; results: TournamentResults }

export default function TopThreeCard({ users, results }: Props) {
  const topThree = buildLeaderboardRows(users, results).slice(0, 3)

  return (
    <div dir="rtl" className="top-three" data-testid="top-three">
      <div className="top-three__heading">הצמרת</div>
      {topThree.map((row, i) => (
        <div key={row.label} className="top-three__row" data-testid="top-three-row">
          <span className="top-three__medal">{MEDALS[i]}</span>
          <span className="top-three__name">{row.label}</span>
          <span className="top-three__points" dir="ltr">{row.total}</span>
        </div>
      ))}
      <a className="top-three__link" href="/results">לכל התוצאות ›</a>
    </div>
  )
}
