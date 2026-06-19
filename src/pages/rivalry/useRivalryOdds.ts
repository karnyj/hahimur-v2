import { useEffect, useState } from 'react'
import type { PredictionsState } from '../../shared/types'
import type { RivalryOddsRequest, RivalryOddsResponse } from './rivalryOddsWorker'

export type OddsStatus = 'loading' | 'ready' | 'unsupported'

export interface RivalryOdds {
  status: OddsStatus
  aAbove: number
  bAbove: number
  tie: number
}

// Lighter than the leaderboard run (this is a single head-to-head, not the whole
// field), so a smaller N keeps the secondary page snappy while staying stable.
export const ODDS_N = 1500
const SEED = 12345

// Deterministic for a given (played, goals): memoise per scenario for the session
// so revisits and live re-renders are instant; only a genuinely new state re-runs.
const cache = new Map<string, RivalryOddsResponse>()

export function useRivalryOdds(
  played: PredictionsState,
  playerGoals: Record<string, number>,
  aLabel: string,
  bLabel: string,
): RivalryOdds {
  const supported = typeof Worker !== 'undefined'
  const [, bump] = useState(0)
  const key = `${JSON.stringify(played)}|${JSON.stringify(playerGoals)}|${aLabel}|${bLabel}|${ODDS_N}|${SEED}`

  useEffect(() => {
    if (!supported || cache.has(key)) return
    const w = new Worker(new URL('./rivalryOddsWorker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent<RivalryOddsResponse>) => {
      cache.set(key, e.data)
      bump(x => x + 1)
    }
    w.postMessage({ played, playerGoals, aLabel, bLabel, n: ODDS_N, seed: SEED } satisfies RivalryOddsRequest)
    return () => w.terminate()
    // played/goals/labels are all captured via `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, supported])

  if (!supported) return { status: 'unsupported', aAbove: 0, bAbove: 0, tie: 0 }
  const hit = cache.get(key)
  if (hit) return { status: 'ready', aAbove: hit.aAbove, bAbove: hit.bAbove, tie: hit.tie }
  return { status: 'loading', aAbove: 0, bAbove: 0, tie: 0 }
}
