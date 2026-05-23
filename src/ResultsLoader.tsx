import { useEffect, useState } from 'react'
import type { MatchScores } from './shared/types'
import ResultsPage from './ResultsPage'

type PredictionsState = Record<string, MatchScores>

interface Results {
  predictions: PredictionsState
  topGoalscorer: string
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; results: Results }

export default function ResultsLoader() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetch('/results.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((results: Results) => setState({ status: 'loaded', results }))
      .catch(() => setState({ status: 'error' }))
  }, [])

  if (state.status === 'loading') return <p>טוען תוצאות...</p>
  if (state.status === 'error') return <p role="alert">שגיאה בטעינת התוצאות. נסה שוב מאוחר יותר.</p>
  return <ResultsPage results={state.results} />
}
