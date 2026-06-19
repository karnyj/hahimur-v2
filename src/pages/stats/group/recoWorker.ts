/// <reference lib="webworker" />
// Runs the Monte-Carlo group recommendation off the main thread — a single
// recommendation fans out to tens of thousands of simulated tournaments, which
// would otherwise freeze the UI. The worker keeps no state between messages;
// each request carries the live results so a fresh score follows every update.
import type { TournamentResults } from '../../../shared/types'
import { USERS } from '../../../users'
import { recommendGroupOutcomes, type GroupRecommendation } from './recommendation'

export interface RecoRequest {
  reqId: number
  userLabel: string
  groupLetter: string
  results: TournamentResults
}

export interface RecoResponse {
  reqId: number
  rec: GroupRecommendation | null
}

self.onmessage = (e: MessageEvent<RecoRequest>) => {
  const { reqId, userLabel, groupLetter, results } = e.data
  const user = USERS.find(u => u.label === userLabel)
  const rec = user ? recommendGroupOutcomes(user, groupLetter, results) : null
  ;(self as unknown as Worker).postMessage({ reqId, rec } satisfies RecoResponse)
}
