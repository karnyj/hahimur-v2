import type { PredictionsState, KnockoutStages, GroupMatch } from '../shared/types'

// Pure: turns a user's group + knockout match scores into a flat predictions map.
// Lives apart from index.ts so importing it doesn't pull in the 27 prediction
// data files (and ~700KB) that the USERS barrel loads.
export function derivePredictions(groupMatches: Record<string, GroupMatch[]>, knockoutStages: KnockoutStages): PredictionsState {
  const result: PredictionsState = {}
  for (const matches of Object.values(groupMatches)) {
    for (const match of matches) {
      if (match.scores) result[match.id] = match.scores
    }
  }
  const allKO = (['r32', 'r16', 'qf', 'sf', 'thirdPlace', 'final'] as const).flatMap(k => knockoutStages[k])
  for (const match of allKO) {
    if (match.scores) result[String(match.matchNum)] = match.scores
  }
  return result
}
