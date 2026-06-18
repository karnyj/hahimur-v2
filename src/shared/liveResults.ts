import type { TournamentResults } from './types'
import { derivePlayerGoals } from '../tournament-results'
import type { LiveOverlay } from './espnLive'

// Overlays a live {scores, goals} overlay onto the baked tournament results.
// Never overrides a match that already has a final baked score, and returns the
// base object unchanged when the overlay is empty (no live match / fetch failed),
// so the app behaves exactly as before when nothing is live.
export function mergeLiveResults(base: TournamentResults, live: LiveOverlay): TournamentResults {
  const hasScores = Object.keys(live.scores).length > 0
  const hasGoals = Object.keys(live.goals).length > 0
  const hasLive = Object.keys(live.live ?? {}).length > 0
  if (!hasScores && !hasGoals && !hasLive) return base

  const finalIds = new Set<string>()
  for (const matches of Object.values(base.groupMatches)) {
    for (const m of matches) {
      if (m.scores?.home != null && m.scores?.away != null) finalIds.add(m.id)
    }
  }

  // Carry live status for in-progress matches, but never for one that already
  // has a baked final score — a finished match is finished even if ESPN is slow
  // to flip its state.
  const liveStatus: NonNullable<TournamentResults['live']> = {}
  for (const [matchId, status] of Object.entries(live.live ?? {})) {
    if (!finalIds.has(matchId)) liveStatus[matchId] = status
  }

  const groupMatches: TournamentResults['groupMatches'] = {}
  for (const [letter, matches] of Object.entries(base.groupMatches)) {
    groupMatches[letter] = matches.map(m => {
      const liveScore = live.scores[m.id]
      return liveScore && !finalIds.has(m.id)
        ? { ...m, scores: { home: liveScore.home, away: liveScore.away } }
        : m
    })
  }

  const playerMatchGoals: Record<string, Record<string, number>> = {}
  for (const [player, byMatch] of Object.entries(base.playerMatchGoals ?? {})) {
    playerMatchGoals[player] = { ...byMatch }
  }
  for (const [player, byMatch] of Object.entries(live.goals)) {
    const target = playerMatchGoals[player] ?? (playerMatchGoals[player] = {})
    for (const [matchId, count] of Object.entries(byMatch)) {
      if (!finalIds.has(matchId)) target[matchId] = count
    }
  }

  return {
    ...base,
    groupMatches,
    playerMatchGoals,
    playerGoals: derivePlayerGoals(playerMatchGoals),
    live: liveStatus,
  }
}
