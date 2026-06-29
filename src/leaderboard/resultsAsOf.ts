import { deriveGroupStatus } from '../shared/groupStatus'
import { getThirdPlaceTeams, qualifyBestThirdPlace } from '../formView/thirdPlace/thirdPlace'
import { derivePlayerGoals } from '../tournament-results'
import type { KnockoutMatch, PredictionsState, TournamentResults } from '../shared/types'
import { playedMatchId } from './leaderboardRows'
import type { PlayedMatch } from './leaderboardRows'

// The tournament as it stood right after the first `count` played matches of
// `chrono`. Built by re-running the SAME derivation pipeline that produces the
// live results (deriveGroupStatus + third-place qualification) over only the
// in-slice scores — so feeding this to computeUserPoints yields exactly the
// leaderboard total at that moment, no scoring logic duplicated.
export function resultsAsOf(results: TournamentResults, chrono: PlayedMatch[], count: number): TournamentResults {
  const sliceIds = new Set(chrono.slice(0, count).map(playedMatchId))

  const partial: PredictionsState = {}
  for (const m of Object.values(results.groupMatches).flat()) {
    if (sliceIds.has(m.id) && m.scores) partial[m.id] = m.scores
  }

  const { allGroupData, allGroupsFilled } = deriveGroupStatus(partial)
  const groupTables = Object.fromEntries(allGroupData.map(d => [d.group, d.standings]))
  const thirdTeams = getThirdPlaceTeams(allGroupData)
  const thirdPlaceQualification = allGroupsFilled
    ? qualifyBestThirdPlace(thirdTeams)
    : { resolved: false as const, all: thirdTeams, tied: [] }

  const groupMatches = Object.fromEntries(
    Object.entries(results.groupMatches).map(([letter, ms]) => [
      letter,
      ms.map(m => (sliceIds.has(m.id) ? m : { ...m, scores: { home: null, away: null } })),
    ]),
  )

  // Keep the revealed bracket (home/away) but clear the score of any match not
  // yet in the slice, so unplayed-as-of-`count` rounds award nothing.
  const clearScore = (m: KnockoutMatch): KnockoutMatch =>
    sliceIds.has(String(m.matchNum)) ? m : { ...m, scores: { home: null, away: null } }
  const knockoutStages = {
    r32: (results.knockoutStages.r32 ?? []).map(clearScore),
    r16: (results.knockoutStages.r16 ?? []).map(clearScore),
    qf: (results.knockoutStages.qf ?? []).map(clearScore),
    sf: (results.knockoutStages.sf ?? []).map(clearScore),
    thirdPlace: (results.knockoutStages.thirdPlace ?? []).map(clearScore),
    final: (results.knockoutStages.final ?? []).map(clearScore),
  }

  const playerMatchGoals: Record<string, Record<string, number>> = {}
  for (const [player, byMatch] of Object.entries(results.playerMatchGoals ?? {})) {
    const kept = Object.fromEntries(Object.entries(byMatch).filter(([mid]) => sliceIds.has(mid)))
    if (Object.keys(kept).length) playerMatchGoals[player] = kept
  }

  // The tournament-deciders are only known once their match is in the slice;
  // until then they award nothing (the golden boot is settled at the very end).
  const decided = (m: KnockoutMatch) => sliceIds.has(String(m.matchNum))
  const tournamentOver = count >= chrono.length
  const champion = (results.knockoutStages.final ?? []).some(decided) ? results.champion : undefined
  const thirdPlaceWinner = (results.knockoutStages.thirdPlace ?? []).some(decided) ? results.thirdPlaceWinner : undefined

  return {
    ...results,
    groupMatches,
    groupTables,
    knockoutStages,
    playerMatchGoals,
    playerGoals: derivePlayerGoals(playerMatchGoals),
    thirdPlaceQualification,
    champion,
    thirdPlaceWinner,
    goldenBootWinner: tournamentOver ? results.goldenBootWinner : undefined,
  }
}
