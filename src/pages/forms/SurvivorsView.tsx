import { useMemo } from 'react'
import type { User } from '../../users/index'
import { tournamentResults } from '../../tournament-results'
import { TEAMS } from '../../shared/groups'
import { buildStageSurvival, type TeamSurvival } from './survivorsStats'
import './SurvivorsView.css'

interface Props {
  user: User
}

function teamHe(team: string): string {
  return TEAMS[team]?.he ?? team
}

function TeamChip({ team, alive }: TeamSurvival) {
  const iso = TEAMS[team]?.iso
  return (
    <span className={`sv-team${alive ? '' : ' sv-team--out'}`}>
      {iso && <span className={`fi fi-${iso} sv-team__flag`} aria-hidden="true" />}
      <span className="sv-team__name">{teamHe(team)}</span>
      {!alive && <span className="sv-team__out">הודחה</span>}
    </span>
  )
}

export default function SurvivorsView({ user }: Props) {
  const stages = useMemo(() => buildStageSurvival(user, tournamentResults), [user])

  return (
    <div className="sv" dir="rtl">
      <p className="sv__intro">כמה מהקבוצות שבחרת לכל שלב עדיין בטורניר</p>

      {stages.map(stage => (
        <div key={stage.key} className="sv-stage">
          <div className="sv-stage__head">
            <span className="sv-stage__label">{stage.label}</span>
            <span className="sv-stage__count">
              <b className={stage.alive === 0 ? 'sv-stage__alive sv-stage__alive--none' : 'sv-stage__alive'}>
                {stage.alive}
              </b>
              <span className="sv-stage__slash">/</span>
              {stage.total}
            </span>
          </div>
          <div className="sv-stage__bar" aria-hidden="true">
            <span
              className="sv-stage__bar-fill"
              style={{ width: stage.total ? `${(stage.alive / stage.total) * 100}%` : '0%' }}
            />
          </div>
          <div className="sv-stage__teams">
            {stage.teams.map(t => (
              <TeamChip key={t.team} team={t.team} alive={t.alive} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
