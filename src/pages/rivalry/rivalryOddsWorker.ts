import { runSims } from '../../../sim-core'
import type { PredictionsState } from '../../shared/types'

export interface RivalryOddsRequest {
  played: PredictionsState
  playerGoals: Record<string, number>
  aLabel: string
  bLabel: string
  n: number
  seed: number
}

export interface RivalryOddsResponse {
  /** P(player A finishes above B) and vice-versa, plus exact-tie share. */
  aAbove: number
  bAbove: number
  tie: number
  samples: number
}

// `self` is the dedicated worker global; the DOM-lib `Worker` shape covers the
// single-arg postMessage + onmessage we need without a separate webworker lib.
const worker = self as unknown as Worker

worker.onmessage = (e: MessageEvent<RivalryOddsRequest>) => {
  const { played, playerGoals, aLabel, bLabel, n, seed } = e.data
  // Same engine the leaderboard uses; `collect` keeps the per-run point series so
  // we can read the two rivals as a *paired* comparison (same simulated world per
  // run), which is exactly the head-to-head question "who finishes above whom".
  const sims = runSims(played, n, seed, true, playerGoals)
  const aS = sims.series?.get(aLabel) ?? []
  const bS = sims.series?.get(bLabel) ?? []
  const len = Math.min(aS.length, bS.length)

  let aAbove = 0
  let bAbove = 0
  let tie = 0
  for (let i = 0; i < len; i++) {
    if (aS[i] > bS[i]) aAbove++
    else if (bS[i] > aS[i]) bAbove++
    else tie++
  }
  const total = len || 1
  worker.postMessage({
    aAbove: aAbove / total,
    bAbove: bAbove / total,
    tie: tie / total,
    samples: len,
  } satisfies RivalryOddsResponse)
}
