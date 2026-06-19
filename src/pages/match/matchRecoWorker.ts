/// <reference lib="webworker" />
// Runs the competitive match recommendation off the main thread — each request
// simulates the rest of the tournament tens of thousands of times and scores the
// whole field, which would otherwise stall the page. Stateless between messages
// so every live update gets a fresh read.
import type { TournamentResults } from '../../shared/types'
import { USERS } from '../../users'
import { recommendMatchOutcome, type MatchRecommendation } from './matchReco'

export interface MatchRecoRequest {
  reqId: number
  userLabel: string
  matchId: string
  results: TournamentResults
}

export interface MatchRecoResponse {
  reqId: number
  rec: MatchRecommendation | null
}

self.onmessage = (e: MessageEvent<MatchRecoRequest>) => {
  const { reqId, userLabel, matchId, results } = e.data
  const user = USERS.find(u => u.label === userLabel)
  const rec = user ? recommendMatchOutcome(user, matchId, results) : null
  ;(self as unknown as Worker).postMessage({ reqId, rec } satisfies MatchRecoResponse)
}
