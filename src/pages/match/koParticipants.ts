import type { KnockoutMatch, MatchScores } from '../../shared/types'
import type { User } from '../../users/index'
import { isPlayerParticipatingInKOMatch } from '../../formView/knockout/knockout'

// The bettor's predicted fixture for a given knockout match number, found across
// every round they filled in (a match number is unique to one round).
export function userKnockoutMatch(user: User, matchNum: number): KnockoutMatch | undefined {
  const s = user.knockoutStages
  for (const stage of [s.r32, s.r16, s.qf, s.sf, s.thirdPlace, s.final]) {
    const m = stage.find(m => m.matchNum === matchNum)
    if (m) return m
  }
}

// Re-express a bettor's predicted score in the real match's home/away terms, so
// someone who stored the two teams reversed still reads in the same orientation
// as the page — the penalty winner flips sides along with the score.
export function orientToActual(actualMatch: KnockoutMatch, predicted: KnockoutMatch): MatchScores | null {
  const sc = predicted.scores
  if (!sc) return null
  if (predicted.home === actualMatch.home) return sc
  return {
    home: sc.away,
    away: sc.home,
    drawWinner: sc.drawWinner === 'home' ? 'away' : sc.drawWinner === 'away' ? 'home' : undefined,
  }
}

// A bettor "participates" in a knockout match when they predicted both teams that
// actually reached it. Returns their called score oriented to the real fixture's
// home/away, or null if they're not in this match.
export function knockoutParticipantScore(actualMatch: KnockoutMatch, user: User): MatchScores | null {
  const um = userKnockoutMatch(user, actualMatch.matchNum)
  if (!um || !isPlayerParticipatingInKOMatch(actualMatch, um)) return null
  return orientToActual(actualMatch, um)
}
