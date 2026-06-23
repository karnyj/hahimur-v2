import { useMemo } from 'react'
import type { PredictionsState } from './types'
import { deriveGroupStatus } from './groupStatus'
import { getThirdPlaceTeams, qualifyBestThirdPlace } from '../formView/thirdPlace/thirdPlace'
import { resolveRound32, resolveKnockout } from '../formView/knockout/knockout'

export function useTournament(predictions: PredictionsState) {
  return useMemo(() => {
    const { allGroupData, groupsWithTies, completedGroups, allGroupsFilled } = deriveGroupStatus(predictions)

    const thirdPlaceTeams = getThirdPlaceTeams(allGroupData)
    const thirdPlaceQual = allGroupsFilled
      ? qualifyBestThirdPlace(thirdPlaceTeams)
      : { resolved: false as const, all: thirdPlaceTeams, tied: [] as typeof thirdPlaceTeams }
    const round32Matches = resolveRound32(allGroupData, thirdPlaceQual)
    const knockout = resolveKnockout(round32Matches, predictions)

    const finalPred = predictions['104']
    let finalWinner: string | null = null
    if (knockout.final.resolved && finalPred && finalPred.home !== null && finalPred.away !== null) {
      if (finalPred.home > finalPred.away) finalWinner = knockout.final.home
      else if (finalPred.away > finalPred.home) finalWinner = knockout.final.away
      else if (finalPred.drawWinner === 'home') finalWinner = knockout.final.home
      else if (finalPred.drawWinner === 'away') finalWinner = knockout.final.away
    }

    return {
      allGroupData,
      groupsWithTies,
      completedGroups,
      thirdPlaceQual,
      allGroupsFilled,
      round32Matches,
      knockout,
      finalWinner,
    }
  }, [predictions])
}
