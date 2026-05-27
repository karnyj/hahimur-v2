import { isUnpredicted } from '../../shared/types'
import type { User } from '../../users/index'

type Props = { matchId: string; homeLabel: string; awayLabel: string; users: User[] }

export default function PredictionSummary({ matchId, homeLabel, awayLabel, users }: Props) {
  let homeWins = 0, draws = 0, awayWins = 0
  for (const u of users) {
    const p = u.predictions[matchId]
    if (!p || isUnpredicted(p)) continue
    if (p.home! > p.away!) homeWins++
    else if (p.home! < p.away!) awayWins++
    else draws++
  }
  const total = homeWins + draws + awayWins
  const pct = (n: number) => total === 0 ? 33.333 : (n / total) * 100

  return (
    <div className="pred-summary">
      <div className="pred-summary__cols">
        <div className="pred-summary__col pred-summary__col--away">
          <span className="pred-summary__count" data-testid="pred-count">{awayWins}</span>
          <span className="pred-summary__label">{awayLabel}</span>
        </div>
        <div className="pred-summary__col pred-summary__col--draw">
          <span className="pred-summary__count" data-testid="pred-count">{draws}</span>
          <span className="pred-summary__label">תיקו</span>
        </div>
        <div className="pred-summary__col pred-summary__col--home">
          <span className="pred-summary__count" data-testid="pred-count">{homeWins}</span>
          <span className="pred-summary__label">{homeLabel}</span>
        </div>
      </div>
      <div className="pred-summary__bar" aria-hidden="true">
        <div className="pred-summary__seg pred-summary__seg--away" style={{ width: `${pct(awayWins)}%` }} />
        <div className="pred-summary__seg pred-summary__seg--draw" style={{ width: `${pct(draws)}%` }} />
        <div className="pred-summary__seg pred-summary__seg--home" style={{ width: `${pct(homeWins)}%` }} />
      </div>
    </div>
  )
}
