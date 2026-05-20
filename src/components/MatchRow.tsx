import type { Match, MatchScores, Score } from '../types'
import { TEAM_NAMES_HE } from '../lib/groups'
import ScoreInput from './ScoreInput'

interface Props {
  match: Match
  scores: MatchScores
  onChange: (scores: MatchScores) => void
}

export default function MatchRow({ match, scores, onChange }: Props) {
  const set = (home: Score, away: Score) => onChange({ home, away })
  return (
    <div className="match-row">
      <ScoreInput label={TEAM_NAMES_HE[match.homeTeam]} value={scores.home} onChange={(v) => set(v, scores.away)} />
      <span className="match-separator">נגד</span>
      <ScoreInput label={TEAM_NAMES_HE[match.awayTeam]} value={scores.away} onChange={(v) => set(scores.home, v)} />
    </div>
  )
}
