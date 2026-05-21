import type { KnockoutMatch, MatchScores } from '../shared/types'
import ScoreInput from '../shared/ScoreInput'
import TeamSlot from '../shared/TeamSlot'

interface Props {
  matches: KnockoutMatch[]
  predictions: Record<string, MatchScores>
  onChange: (matchId: string, scores: MatchScores) => void
}

export default function KnockoutTable({ matches, predictions, onChange }: Props) {
  return (
    <div className="ko-grid">
      {matches.map(m => {
        const id = String(m.matchNum)
        const pred = m.resolved ? (predictions[id] ?? { home: null, away: null }) : { home: null, away: null }
        return (
          <div key={m.matchNum} className={`ko-card${m.resolved ? ' ko-card--resolved' : ''}`}>
            <span className="ko-matchnum">{m.matchNum}</span>
            <div className="ko-team-row">
              <TeamSlot name={m.home} />
              <ScoreInput
                label={m.home}
                value={pred.home}
                disabled={!m.resolved}
                onChange={v => onChange(id, { home: v, away: pred.away })}
              />
            </div>
            <div className="ko-row-divider" />
            <div className="ko-team-row">
              <TeamSlot name={m.away} />
              <ScoreInput
                label={m.away}
                value={pred.away}
                disabled={!m.resolved}
                onChange={v => onChange(id, { home: pred.home, away: v })}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
