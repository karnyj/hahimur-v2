import { useState } from 'react'
import Nav from '../../Nav'
import { GROUPS, TEAMS } from '../../shared/groups'
import type { Score } from '../../shared/types'
import { isUnpredicted } from '../../shared/types'
import ScoreInput from '../../formView/ScoreInput'
import { USERS } from '../../users/index'
import './MatchPredictionsPage.css'

const MATCH = GROUPS.A.matches[0]

export default function MatchPredictionsPage() {
  const home = TEAMS[MATCH.homeTeam]
  const away = TEAMS[MATCH.awayTeam]
  const [homeScore, setHomeScore] = useState<Score>(null)
  const [awayScore, setAwayScore] = useState<Score>(null)

  return (
    <>
      <div className="match-header">
        <div className="match-header__group-badge">קבוצה א · מחזור 1</div>

        <div className="match-header__teams">
          <div className="match-team">
            <span className={`fi fi-${home.iso} match-team__flag`} />
            <span className="match-team__name">{home.he}</span>
          </div>

          <div className="match-header__vs">
            <ScoreInput label={home.he} value={homeScore} onChange={setHomeScore} />
            <span className="match-header__vs-text">–</span>
            <ScoreInput label={away.he} value={awayScore} onChange={setAwayScore} />
          </div>

          <div className="match-team">
            <span className={`fi fi-${away.iso} match-team__flag`} />
            <span className="match-team__name">{away.he}</span>
          </div>
        </div>

        <div className="match-header__meta">
          <span>{MATCH.matchDate}</span>
          <span className="match-header__meta-dot" />
          <span>{MATCH.kickoffIST}</span>
          <span className="match-header__meta-dot" />
          <span>שעון ישראל</span>
        </div>
      </div>

      <Nav />

      <div className="match-predictions">
        <p className="match-predictions__heading">ניבויי השחקנים</p>

        {USERS.length === 0 ? (
          <p className="match-predictions__empty">אין תחזיות למשחק זה</p>
        ) : (
          USERS.map((u, i) => {
            const p = u.predictions['A1']
            const unpredicted = !p || isUnpredicted(p)
            const score = (v: number | null) => v !== null ? String(v) : '–'

            return (
              <div
                key={u.label}
                className={`prediction-row${unpredicted ? ' prediction-row--unpredicted' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="prediction-row__name">{u.label}</span>
                <div className="prediction-row__score">
                  <span className="prediction-row__digit">{score(p?.home ?? null)}</span>
                  <span className="prediction-row__sep">–</span>
                  <span className="prediction-row__digit">{score(p?.away ?? null)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
