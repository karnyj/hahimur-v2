import type { KnockoutMatch, MatchScores } from '../shared/types'
import ScoreInput from '../shared/ScoreInput'
import TeamSlot from '../shared/TeamSlot'

interface Props {
  matches: KnockoutMatch[]
  predictions: Record<string, MatchScores>
  onChange: (matchId: string, scores: MatchScores) => void
  alwaysShowScores?: boolean
}

export default function KnockoutTable({ matches, predictions, onChange, alwaysShowScores = false }: Props) {
  return (
    <div className="ko-grid">
      {matches.map(m => {
        const id = String(m.matchNum)
        const pred = predictions[id] ?? { home: null, away: null }
        return (
          <div key={m.matchNum} className={`ko-card${m.resolved ? ' ko-card--resolved' : ''}`}>
            <span className="ko-matchnum">{m.matchNum}</span>
            {(m.resolved || alwaysShowScores) ? (
              <>
                <div className="ko-team-row">
                  <TeamSlot name={m.home} />
                  <ScoreInput
                    label={m.home}
                    value={pred.home}
                    onChange={v => onChange(id, { home: v, away: pred.away })}
                  />
                </div>
                <div className="ko-row-divider" />
                <div className="ko-team-row">
                  <TeamSlot name={m.away} />
                  <ScoreInput
                    label={m.away}
                    value={pred.away}
                    onChange={v => onChange(id, { home: pred.home, away: v })}
                  />
                </div>
              </>
            ) : (
              <>
                <TeamSlot name={m.home} />
                <div className="ko-divider">
                  <span className="ko-divider-line" />
                  <span className="ko-divider-word">נגד</span>
                  <span className="ko-divider-line" />
                </div>
                <TeamSlot name={m.away} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
