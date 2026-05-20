import type { Match, MatchScores, Score } from '../types'
import { TEAM_NAMES_HE, TEAM_FLAGS } from '../lib/groups'
import ScoreInput from './ScoreInput'

interface Props {
  match: Match
  scores: MatchScores
  onChange: (scores: MatchScores) => void
}

export default function MatchRow({ match, scores, onChange }: Props) {
  const set = (home: Score, away: Score) => onChange({ home, away })
  return (
    <div className="match-card">
      <div className="match-team match-team--home">
        <span className="match-team-flag">{TEAM_FLAGS[match.homeTeam]}</span>
        <span className="match-team-name">{TEAM_NAMES_HE[match.homeTeam]}</span>
      </div>
      <div className="match-score-zone">
        <ScoreInput
          label={TEAM_NAMES_HE[match.homeTeam]}
          value={scores.home}
          onChange={(v) => set(v, scores.away)}
        />
        <span className="match-score-sep">:</span>
        <ScoreInput
          label={TEAM_NAMES_HE[match.awayTeam]}
          value={scores.away}
          onChange={(v) => set(scores.home, v)}
        />
      </div>
      <div className="match-team match-team--away">
        <span className="match-team-name">{TEAM_NAMES_HE[match.awayTeam]}</span>
        <span className="match-team-flag">{TEAM_FLAGS[match.awayTeam]}</span>
      </div>
    </div>
  )
}
