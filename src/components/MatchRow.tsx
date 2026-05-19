import type { Match, MatchScores, Score } from '../types'
import ScoreInput from './ScoreInput'

interface Props {
  match: Match
  scores: MatchScores
  onChange: (scores: MatchScores) => void
}

export default function MatchRow({ match, scores, onChange }: Props) {
  const set = (home: Score, away: Score) => onChange({ home, away })
  return (
    <div>
      <ScoreInput label={`${match.homeTeam} score`} value={scores.home} onChange={(v) => set(v, scores.away)} />
      <span>vs</span>
      <ScoreInput label={`${match.awayTeam} score`} value={scores.away} onChange={(v) => set(scores.home, v)} />
    </div>
  )
}
