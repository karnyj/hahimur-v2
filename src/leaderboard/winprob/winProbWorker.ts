import { runSims, buildRows, mergeSimAgg, type Row, type SimAgg } from '../../../sim-core'
import type { PredictionsState } from '../../shared/types'

export interface WinProbRequest {
  played: PredictionsState
  lastMatchId: string | null
  // real golden-boot goals accrued up to the viewed point, keyed by player — so
  // the projection and current rank both reward a scorer who's already scoring.
  playerGoals: Record<string, number>
  // same, but excluding the last played match — the baseline the delta compares
  // against, so a scorer netting in that game shows up as a positive swing.
  prevPlayerGoals: Record<string, number>
  n: number
  seed: number
}

export interface WinProbResponse {
  rows: Row[]
  // win% change since the last played game (real minus the same sim with that
  // match removed, common-seeded so the diff is low-noise). Empty before any game.
  deltaByLabel: Record<string, number>
  // Simulated probability each team survives the group stage (reaches the round
  // of 32), keyed by team code. Lets the view treat a ~0% team as eliminated even
  // before its group formally finishes (see effectiveEliminations).
  reachByTeam: Record<string, number>
}

// `self` is the dedicated worker global; the DOM-lib `Worker` shape covers the
// single-arg postMessage + onmessage we need without a separate webworker lib.
const worker = self as unknown as Worker

// n sims is ~1.5s of solid CPU; running it as one blocking loop pins a core for
// that whole stretch, which starves the rest of the machine (the IDE, its
// browser/CDP, the element picker) and feels like a freeze. Slicing it into
// CHUNK-sized batches with a macrotask yield between them keeps the maths
// identical (each batch gets its own seed via seed + i, then merged) while
// letting the event loop — and the host — breathe between batches.
const CHUNK = 250

async function runChunked(
  played: PredictionsState, n: number, seed: number,
  collect: boolean, realGoals: Record<string, number>,
): Promise<SimAgg> {
  let agg: SimAgg | null = null
  for (let done = 0, i = 0; done < n; i++) {
    const batch = Math.min(CHUNK, n - done)
    const part = runSims(played, batch, seed + i, collect, realGoals)
    agg = agg ? mergeSimAgg(agg, part) : part
    done += batch
    if (done < n) await new Promise<void>(resolve => setTimeout(resolve))
  }
  return agg!
}

worker.onmessage = async (e: MessageEvent<WinProbRequest>) => {
  const { played, lastMatchId, playerGoals, prevPlayerGoals, n, seed } = e.data

  const real = await runChunked(played, n, seed, true, playerGoals)
  const rows = buildRows(real, n, played, playerGoals)

  const reachByTeam: Record<string, number> = {}
  for (const [team, count] of real.reachR32) reachByTeam[team] = count / n

  const deltaByLabel: Record<string, number> = {}
  if (lastMatchId && played[lastMatchId]) {
    const prevPlayed: PredictionsState = { ...played }
    delete prevPlayed[lastMatchId]
    // Same per-chunk seeds as `real` so the two runs stay a paired
    // common-random-numbers experiment and the delta keeps cancelling shared noise.
    const prev = await runChunked(prevPlayed, n, seed, false, prevPlayerGoals)
    for (const r of rows) {
      const prevPct = ((prev.win.get(r.label) ?? 0) / n) * 100
      deltaByLabel[r.label] = r.winPct - prevPct
    }
  }

  worker.postMessage({ rows, deltaByLabel, reachByTeam } satisfies WinProbResponse)
}
