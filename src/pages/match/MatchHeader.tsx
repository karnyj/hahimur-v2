import { useState } from 'react'
import { GROUPS } from '../../shared/groups'
import type { Score } from '../../shared/types'
import ScoreInput from '../../formView/ScoreInput'

type Team = { iso: string; he: string }
type Match = { id: string; matchDate?: string; kickoffIST?: string }

export default function MatchHeader({ match, home, away }: { match: Match; home: Team; away: Team }) {
  const [homeScore, setHomeScore] = useState<Score>(null)
  const [awayScore, setAwayScore] = useState<Score>(null)

  return (
    <div className="match-header">
      <div className="match-header__group-badge">בית {GROUPS[match.id[0]]?.he} · משחק {match.id[1]}</div>

      <div className="match-header__teams">
        <div className="match-team">
          <span className={`fi fi-${away.iso} match-team__flag`} />
          <span className="match-team__name">{away.he}</span>
        </div>

        <div className="match-header__vs">
          <ScoreInput label={away.he} value={awayScore} onChange={setAwayScore} />
          <span className="match-header__vs-text">–</span>
          <ScoreInput label={home.he} value={homeScore} onChange={setHomeScore} />
        </div>

        <div className="match-team">
          <span className={`fi fi-${home.iso} match-team__flag`} />
          <span className="match-team__name">{home.he}</span>
        </div>
      </div>

      <div className="match-header__meta">
        <span>{match.matchDate}</span>
        <span className="match-header__meta-dot" />
        <span>{match.kickoffIST}</span>
        <span className="match-header__meta-dot" />
        <span>שעון ישראל</span>
      </div>
    </div>
  )
}
