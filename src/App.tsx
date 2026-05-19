import { useState } from 'react'
import type { Match, MatchScores } from './types'
import MatchRow from './components/MatchRow'

const OPENING_MATCH: Match = { homeTeam: 'Mexico', awayTeam: 'South Africa' }

export default function App() {
  const [scores, setScores] = useState<MatchScores>({ home: null, away: null })

  return (
    <main>
      <h1>2026 World Cup Predictions</h1>
      <MatchRow match={OPENING_MATCH} scores={scores} onChange={setScores} />
    </main>
  )
}
