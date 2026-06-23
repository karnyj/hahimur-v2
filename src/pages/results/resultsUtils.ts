import type { TournamentResults, PredictionsState } from '../../shared/types'

export function clampGoals(real: number, entered: number): number {
  return Math.max(real, entered)
}

// Your "best case" result-set: every match not already decided resolves exactly
// as YOU predicted, while played (locked) matches keep their real outcome.
//
// Why your own bet — and not a points-max search like bestRemainingResult — is
// the right answer once the knockout is in scope: knockout points (r32 5–7 … sf
// 12–16, champion 25) dwarf group place points (1 each), and you only collect
// them when your predicted bracket actually materialises. Deviating a group
// scoreline to grab a stray place point can reshuffle your top-two and blow up
// those big knockout points. So reproducing your whole bet keeps the bracket you
// predicted intact and banks every knockout point — a correct joint near-optimum.
// (A later refinement can still swap in bracket-faithful group results that earn
// strictly more group points without disturbing the bracket.)
export function bestCaseResults(
  base: PredictionsState,
  myPredictions: PredictionsState,
  lockedIds: Set<string>,
): PredictionsState {
  const next: PredictionsState = {}
  for (const id of Object.keys(base)) {
    next[id] = lockedIds.has(id) ? base[id] : (myPredictions[id] ?? base[id])
  }
  return next
}

export function getLockedMatchIds(results: TournamentResults): Set<string> {
  return new Set<string>([
    ...Object.values(results.groupMatches).flat()
      .filter(m => m.scores?.home != null && m.scores?.away != null)
      .map(m => m.id),
    ...Object.values(results.knockoutStages).flat()
      .filter(m => m.scores?.home != null && m.scores?.away != null)
      .map(m => String(m.matchNum)),
  ])
}
