import { isUnpredicted, type MatchScores, type PredictionsState, type KnockoutMatch, type TournamentResults } from '../shared/types'
import { isPlayerParticipatingInKOMatch, buildKnockoutBracket, getQualifiedThirdPlaceTeams } from '../formView/knockout/knockout'
import { GROUPS } from '../shared/groups'
import { calculateStandings } from '../shared/standings'
import type { User } from '../users'

const ROUND_POINTS: Record<string, { pagiya: number; tzelifa: number }> = {
  r32:   { pagiya: 5,  tzelifa: 7  },
  r16:   { pagiya: 6,  tzelifa: 8  },
  qf:    { pagiya: 8,  tzelifa: 12 },
  sf:    { pagiya: 12, tzelifa: 16 },
  third: { pagiya: 16, tzelifa: 18 },
  final: { pagiya: 20, tzelifa: 25 },
  group: { pagiya: 2,  tzelifa: 4  },
}

function roundOf(matchId: string): keyof typeof ROUND_POINTS {
  const n = Number(matchId)
  if (isNaN(n)) return 'group'
  if (n <= 88) return 'r32'
  if (n <= 96) return 'r16'
  if (n <= 100) return 'qf'
  if (n <= 102) return 'sf'
  if (n === 103) return 'third'
  return 'final'
}

function winner(scores: MatchScores): 'home' | 'away' | 'draw' {
  if (scores.home! > scores.away!) return 'home'
  if (scores.away! > scores.home!) return 'away'
  return scores.drawWinner ?? 'draw'
}

function isExactMatch(predicted: MatchScores, actual: MatchScores): boolean {
  return (
    predicted.home === actual.home &&
    predicted.away === actual.away &&
    (predicted.drawWinner ?? null) === (actual.drawWinner ?? null)
  )
}

function isDraw(scores: MatchScores): boolean {
  return scores.home === scores.away
}

export function singleMatchPoints(matchId: string, predicted: MatchScores, actual: MatchScores): number {
  if (isUnpredicted(predicted)) return 0
  if (isUnpredicted(actual)) return 0
  const { pagiya, tzelifa } = ROUND_POINTS[roundOf(matchId)]
  if (isExactMatch(predicted, actual)) return tzelifa
  if (isDraw(predicted) !== isDraw(actual)) return 0
  if (winner(predicted) === winner(actual)) return pagiya
  return 0
}

function top2(groupId: string, predictions: PredictionsState): Set<string> {
  const { standings } = calculateStandings(GROUPS[groupId].matches, predictions)
  return new Set(standings.slice(0, 2).map(s => s.team))
}

function advPts(predicted: string[], actual: string[], pts: number): number {
  const actualSet = new Set(actual)
  return predicted.reduce((sum, t) => sum + (actualSet.has(t) ? pts : 0), 0)
}

export interface ThirdPlaceQualifiers {
  predictedThirdQualifiers: string[]
  actualThirdQualifiers: string[]
}

export interface KnockoutRoundAdvancers {
  r32?: string[]
  r16?: string[]
  qf?: string[]
  sf?: string[]
  thirdPlaceWinner?: string
  champion?: string
}

export interface KnockoutOleh {
  predicted: KnockoutRoundAdvancers
  actual: KnockoutRoundAdvancers
}

export interface GoldenBoot {
  predictedPlayer: string
  actualGoals: Record<string, number>
  goldenBootWinner: string
}

export function calculateGroupMatchPoints(
  groupId: string,
  userPredictions: PredictionsState,
  results: PredictionsState,
): number {
  return GROUPS[groupId].matches.reduce((total, match) => {
    const predicted = userPredictions[match.id]
    const actual = results[match.id]
    if (!predicted || !actual) return total
    return total + singleMatchPoints(match.id, predicted, actual)
  }, 0)
}

export function calculateGroupAdvancementPoints(
  groupId: string,
  userPredictions: PredictionsState,
  results: PredictionsState,
): number {
  const allPlayed = GROUPS[groupId].matches.every(m => {
    const r = results[m.id]
    return r && !isUnpredicted(r)
  })
  if (!allPlayed) return 0
  return advPts(Array.from(top2(groupId, userPredictions)), Array.from(top2(groupId, results)), 5)
}

function sumGroupPoints(userPredictions: PredictionsState, results: PredictionsState): number {
  return Object.keys(GROUPS).reduce((total, groupId) => {
    return total
      + calculateGroupMatchPoints(groupId, userPredictions, results)
      + calculateGroupAdvancementPoints(groupId, userPredictions, results)
  }, 0)
}

export function calculateKnockoutMatchPoints(
  userPredictions: PredictionsState,
  results: PredictionsState,
  userBracket?: KnockoutMatch[],
  actualBracket?: KnockoutMatch[],
): number {
  const userByNum   = userBracket   ? Object.fromEntries(userBracket.map(m   => [m.matchNum, m])) : null
  const actualByNum = actualBracket ? Object.fromEntries(actualBracket.map(m => [m.matchNum, m])) : null

  return Object.entries(results).reduce((total, [matchId, actual]) => {
    const matchNum = Number(matchId)
    if (isNaN(matchNum)) return total
    const predicted = userPredictions[matchId]
    if (!predicted) return total
    if (userByNum && actualByNum) {
      const userMatch   = userByNum[matchNum]
      const actualMatch = actualByNum[matchNum]
      if (!userMatch || !actualMatch || !isPlayerParticipatingInKOMatch(actualMatch, userMatch)) return total
    }
    return total + singleMatchPoints(matchId, predicted, actual)
  }, 0)
}

const KNOCKOUT_OLEH_POINTS: Record<keyof KnockoutRoundAdvancers, number> = {
  r32: 5, r16: 8, qf: 12, sf: 16, thirdPlaceWinner: 20, champion: 25,
}

export function calculateKnockoutAdvancementPoints(knockoutOleh: KnockoutOleh): number {
  let pts = 0
  for (const round of Object.keys(KNOCKOUT_OLEH_POINTS) as (keyof KnockoutRoundAdvancers)[]) {
    const pointsForRound = KNOCKOUT_OLEH_POINTS[round]
    const pred = knockoutOleh.predicted[round]
    const act  = knockoutOleh.actual[round]
    if (!pred || !act) continue
    if (typeof pred === 'string') {
      if (pred === act) pts += pointsForRound
    } else {
      pts += advPts(pred as string[], act as string[], pointsForRound)
    }
  }
  return pts
}

export function calculateThirdPlaceQualifierPoints(thirdPlace: ThirdPlaceQualifiers): number {
  return advPts(thirdPlace.predictedThirdQualifiers, thirdPlace.actualThirdQualifiers, 5)
}

export function calculateGoldenBootPoints(goldenBoot: GoldenBoot): number {
  const goals = goldenBoot.actualGoals[goldenBoot.predictedPlayer] ?? 0
  let pts = goals * 3
  if (goldenBoot.predictedPlayer === goldenBoot.goldenBootWinner) pts += 10
  return pts
}

export interface GroupBreakdown {
  matchPoints: number
  advancementPoints: number
  thirdPlaceQualification: number
  total: number
}

export interface RoundBreakdown {
  matchPoints: number
  advancementPoints: number
  total: number
}

export interface ThirdBreakdown {
  matchPoints: number
  thirdPlaceWinner: number
  total: number
}

export interface FinalBreakdown {
  matchPoints: number
  champion: number
  total: number
}

export interface GoldenBootBreakdown {
  goalsPoints: number
  winnerBonus: number
  total: number
}

export interface PointsBreakdown {
  group: GroupBreakdown
  r32: RoundBreakdown
  r16: RoundBreakdown
  qf: RoundBreakdown
  sf: RoundBreakdown
  third: ThirdBreakdown
  final: FinalBreakdown
  goldenBoot: GoldenBootBreakdown
  total: number
}

function teamsIn(bracket: KnockoutMatch[], matchIds: string[]): string[] {
  const nums = new Set(matchIds.map(Number))
  return bracket
    .filter(m => nums.has(m.matchNum) && m.home && m.away)
    .flatMap(m => [m.home, m.away])
}

function bracketWinner(matchId: string, bracket: KnockoutMatch[], predictions: PredictionsState): string | undefined {
  const m = bracket.find(b => b.matchNum === Number(matchId))
  if (!m || !m.home || !m.away) return undefined
  const pred = predictions[matchId]
  if (!pred || isUnpredicted(pred)) return undefined
  if (pred.home! > pred.away!) return m.home
  if (pred.away! > pred.home!) return m.away
  if (pred.drawWinner === 'home') return m.home
  if (pred.drawWinner === 'away') return m.away
  return undefined
}

function roundComplete(matchIds: string[], results: PredictionsState): boolean {
  return matchIds.every(id => {
    const r = results[id]
    return r && !isUnpredicted(r)
  })
}

function calculateRoundMatchPoints(
  matchIds: string[],
  userPredictions: PredictionsState,
  results: PredictionsState,
  participating?: Set<number>,
): number {
  return matchIds.reduce((total, matchId) => {
    if (participating && !participating.has(Number(matchId))) return total
    const predicted = userPredictions[matchId]
    const actual = results[matchId]
    if (!predicted || !actual) return total
    return total + singleMatchPoints(matchId, predicted, actual)
  }, 0)
}

const R32_IDS  = Array.from({ length: 16 }, (_, i) => String(73 + i))
const R16_IDS  = Array.from({ length: 8  }, (_, i) => String(89 + i))
const QF_IDS   = Array.from({ length: 4  }, (_, i) => String(97 + i))
const SF_IDS   = ['101', '102']
const THIRD_ID = ['103']
const FINAL_ID = ['104']

export function calculatePointsBreakdown(
  userPredictions: PredictionsState,
  results: PredictionsState,
  goldenBoot?: GoldenBoot,
): PointsBreakdown {
  const userBracket   = buildKnockoutBracket(userPredictions)
  const actualBracket = buildKnockoutBracket(results)
  const actualByNum   = Object.fromEntries(actualBracket.map(m => [m.matchNum, m]))
  const participating = new Set(
    userBracket
      .filter(userMatch => {
        const actualMatch = actualByNum[userMatch.matchNum]
        return actualMatch && isPlayerParticipatingInKOMatch(actualMatch, userMatch)
      })
      .map(m => m.matchNum)
  )

  const actualThirdQual = getQualifiedThirdPlaceTeams(results)
  const thirdPlaceQualPts = actualThirdQual
    ? advPts(getQualifiedThirdPlaceTeams(userPredictions) ?? [], actualThirdQual, 5)
    : 0

  const groupMatchPoints       = sumGroupPoints(userPredictions, results)
  const r32MatchPoints         = calculateRoundMatchPoints(R32_IDS, userPredictions, results, participating)
  const r32AdvancementPoints   = roundComplete(R32_IDS, results) ? advPts(teamsIn(userBracket, R16_IDS), teamsIn(actualBracket, R16_IDS), KNOCKOUT_OLEH_POINTS.r32) : 0
  const r16MatchPoints         = calculateRoundMatchPoints(R16_IDS, userPredictions, results, participating)
  const r16AdvancementPoints   = roundComplete(R16_IDS, results) ? advPts(teamsIn(userBracket, QF_IDS), teamsIn(actualBracket, QF_IDS), KNOCKOUT_OLEH_POINTS.r16) : 0
  const qfMatchPoints          = calculateRoundMatchPoints(QF_IDS, userPredictions, results, participating)
  const qfAdvancementPoints    = roundComplete(QF_IDS, results) ? advPts(teamsIn(userBracket, SF_IDS), teamsIn(actualBracket, SF_IDS), KNOCKOUT_OLEH_POINTS.qf) : 0
  const sfMatchPoints          = calculateRoundMatchPoints(SF_IDS, userPredictions, results, participating)
  const sfAdvancementPoints    = roundComplete(SF_IDS, results) ? advPts(teamsIn(userBracket, FINAL_ID), teamsIn(actualBracket, FINAL_ID), KNOCKOUT_OLEH_POINTS.sf) : 0
  const thirdActualWinner      = bracketWinner('103', actualBracket, results)
  const thirdMatchPoints       = calculateRoundMatchPoints(THIRD_ID, userPredictions, results, participating)
  const thirdPlaceWinnerPts    = thirdActualWinner !== undefined && bracketWinner('103', userBracket, userPredictions) === thirdActualWinner ? KNOCKOUT_OLEH_POINTS.thirdPlaceWinner : 0
  const finalActualWinner      = bracketWinner('104', actualBracket, results)
  const finalMatchPoints       = calculateRoundMatchPoints(FINAL_ID, userPredictions, results, participating)
  const championPts            = finalActualWinner !== undefined && bracketWinner('104', userBracket, userPredictions) === finalActualWinner ? KNOCKOUT_OLEH_POINTS.champion : 0
  const goldenBootGoalsPoints = goldenBoot ? (goldenBoot.actualGoals[goldenBoot.predictedPlayer] ?? 0) * 3 : 0
  const goldenBootWinnerBonus = goldenBoot && goldenBoot.predictedPlayer === goldenBoot.goldenBootWinner ? 10 : 0

  const group:           GroupBreakdown      = { matchPoints: groupMatchPoints, advancementPoints: 0, thirdPlaceQualification: thirdPlaceQualPts, total: groupMatchPoints + thirdPlaceQualPts }
  const r32:             RoundBreakdown      = { matchPoints: r32MatchPoints, advancementPoints: r32AdvancementPoints, total: r32MatchPoints + r32AdvancementPoints }
  const r16:             RoundBreakdown      = { matchPoints: r16MatchPoints, advancementPoints: r16AdvancementPoints, total: r16MatchPoints + r16AdvancementPoints }
  const qf:              RoundBreakdown      = { matchPoints: qfMatchPoints, advancementPoints: qfAdvancementPoints, total: qfMatchPoints + qfAdvancementPoints }
  const sf:              RoundBreakdown      = { matchPoints: sfMatchPoints, advancementPoints: sfAdvancementPoints, total: sfMatchPoints + sfAdvancementPoints }
  const third:           ThirdBreakdown      = { matchPoints: thirdMatchPoints, thirdPlaceWinner: thirdPlaceWinnerPts, total: thirdMatchPoints + thirdPlaceWinnerPts }
  const finalBreakdown:  FinalBreakdown      = { matchPoints: finalMatchPoints, champion: championPts, total: finalMatchPoints + championPts }
  const goldenBootBreakdown: GoldenBootBreakdown = { goalsPoints: goldenBootGoalsPoints, winnerBonus: goldenBootWinnerBonus, total: goldenBootGoalsPoints + goldenBootWinnerBonus }

  const total = group.total + r32.total + r16.total + qf.total + sf.total + third.total + finalBreakdown.total + goldenBootBreakdown.total
  return { group, r32, r16, qf, sf, third, final: finalBreakdown, goldenBoot: goldenBootBreakdown, total }
}

export function calculateUserPoints(
  userPredictions: PredictionsState,
  results: PredictionsState,
  thirdPlace?: ThirdPlaceQualifiers,
  knockoutOleh?: KnockoutOleh,
  goldenBoot?: GoldenBoot,
): number {
  return sumGroupPoints(userPredictions, results)
    + calculateKnockoutMatchPoints(userPredictions, results)
    + (knockoutOleh ? calculateKnockoutAdvancementPoints(knockoutOleh) : 0)
    + (thirdPlace   ? calculateThirdPlaceQualifierPoints(thirdPlace)   : 0)
    + (goldenBoot   ? calculateGoldenBootPoints(goldenBoot)            : 0)
}

function koMatchPoints(userMatches: KnockoutMatch[], resultMatches: KnockoutMatch[]): number {
  return resultMatches.reduce((total, resultMatch) => {
    if (!resultMatch.scores || isUnpredicted(resultMatch.scores)) return total
    if (!resultMatch.home || !resultMatch.away) return total
    const userMatch = userMatches.find(m =>
      m.home && m.away &&
      ((m.home === resultMatch.home && m.away === resultMatch.away) ||
       (m.home === resultMatch.away && m.away === resultMatch.home))
    )
    if (!userMatch || !userMatch.scores || isUnpredicted(userMatch.scores)) return total
    const flipped = userMatch.home === resultMatch.away
    const predicted: MatchScores = flipped
      ? { home: userMatch.scores.away, away: userMatch.scores.home, drawWinner: userMatch.scores.drawWinner === 'home' ? 'away' : userMatch.scores.drawWinner === 'away' ? 'home' : undefined }
      : userMatch.scores
    return total + singleMatchPoints(String(resultMatch.matchNum), predicted, resultMatch.scores)
  }, 0)
}

function roundTeams(matches: KnockoutMatch[]): string[] {
  return matches.flatMap(m => [m.home, m.away]).filter(Boolean) as string[]
}

function roundReady(matches: KnockoutMatch[]): boolean {
  return matches.length > 0 && matches.every(m => m.home && m.away)
}

export function computeUserPoints(user: User, results: TournamentResults): PointsBreakdown {
  let groupMatchPoints = 0
  let groupAdvancementPoints = 0

  const allGroupIds = new Set([...Object.keys(user.groupMatches), ...Object.keys(user.groupTables)])

  for (const groupId of allGroupIds) {
    const userMatches   = user.groupMatches[groupId]  ?? []
    const resultMatches = results.groupMatches[groupId] ?? []
    for (const userMatch of userMatches) {
      const resultMatch = resultMatches.find(m => m.id === userMatch.id)
      if (userMatch.scores && resultMatch?.scores && !isUnpredicted(resultMatch.scores)) {
        groupMatchPoints += singleMatchPoints(userMatch.id, userMatch.scores, resultMatch.scores)
      }
    }
    const actualTable = results.groupTables[groupId]
    if (actualTable && actualTable.length >= 2) {
      const userTop2   = (user.groupTables[groupId] ?? []).slice(0, 2).map(s => s.team)
      const actualTop2 = actualTable.slice(0, 2).map(s => s.team)
      groupAdvancementPoints += advPts(userTop2, actualTop2, 5)
    }
  }

  let thirdPlaceQualification = 0
  if (user.thirdPlaceQualification.resolved && results.thirdPlaceQualification.resolved) {
    const userQual   = user.thirdPlaceQualification.qualifiers.map(t => t.team)
    const actualQual = results.thirdPlaceQualification.qualifiers.map(t => t.team)
    thirdPlaceQualification = advPts(userQual, actualQual, 5)
  }

  const ko  = results.knockoutStages
  const uko = user.knockoutStages

  const r32MatchPoints = koMatchPoints(uko.r32, ko.r32)
  const r32AdvancementPoints = roundReady(ko.r16)
    ? advPts(user.predictedR16Teams ?? roundTeams(uko.r16), roundTeams(ko.r16), KNOCKOUT_OLEH_POINTS.r32)
    : 0

  const r16MatchPoints = koMatchPoints(uko.r16, ko.r16)
  const r16AdvancementPoints = roundReady(ko.qf)
    ? advPts(user.predictedQFTeams ?? roundTeams(uko.qf), roundTeams(ko.qf), KNOCKOUT_OLEH_POINTS.r16)
    : 0

  const qfMatchPoints = koMatchPoints(uko.qf, ko.qf)
  const qfAdvancementPoints = roundReady(ko.sf)
    ? advPts(user.predictedSFTeams ?? roundTeams(uko.sf), roundTeams(ko.sf), KNOCKOUT_OLEH_POINTS.qf)
    : 0

  const sfMatchPoints = koMatchPoints(uko.sf, ko.sf)
  const sfAdvancementPoints = roundReady(ko.final)
    ? advPts(user.predictedFinalTeams ?? roundTeams(uko.final), roundTeams(ko.final), KNOCKOUT_OLEH_POINTS.sf)
    : 0

  const thirdMatchPoints = koMatchPoints(uko.thirdPlace, ko.thirdPlace)
  const thirdPlaceWinnerPts = results.thirdPlaceWinner && user.predictedThirdPlaceWinner === results.thirdPlaceWinner
    ? KNOCKOUT_OLEH_POINTS.thirdPlaceWinner : 0

  const finalMatchPoints = koMatchPoints(uko.final, ko.final)
  const championPts = results.champion && user.predictedChampion === results.champion
    ? KNOCKOUT_OLEH_POINTS.champion : 0

  let goldenBootGoalsPoints = 0
  let goldenBootWinnerBonus = 0
  if (results.goldenBootWinner) {
    goldenBootGoalsPoints = (results.playerGoals?.[user.topGoalscorer] ?? 0) * 3
    if (user.topGoalscorer === results.goldenBootWinner) goldenBootWinnerBonus = 10
  }

  const group:      GroupBreakdown      = { matchPoints: groupMatchPoints, advancementPoints: groupAdvancementPoints, thirdPlaceQualification, total: groupMatchPoints + groupAdvancementPoints + thirdPlaceQualification }
  const r32:        RoundBreakdown      = { matchPoints: r32MatchPoints, advancementPoints: r32AdvancementPoints, total: r32MatchPoints + r32AdvancementPoints }
  const r16:        RoundBreakdown      = { matchPoints: r16MatchPoints, advancementPoints: r16AdvancementPoints, total: r16MatchPoints + r16AdvancementPoints }
  const qf:         RoundBreakdown      = { matchPoints: qfMatchPoints, advancementPoints: qfAdvancementPoints, total: qfMatchPoints + qfAdvancementPoints }
  const sf:         RoundBreakdown      = { matchPoints: sfMatchPoints, advancementPoints: sfAdvancementPoints, total: sfMatchPoints + sfAdvancementPoints }
  const third:      ThirdBreakdown      = { matchPoints: thirdMatchPoints, thirdPlaceWinner: thirdPlaceWinnerPts, total: thirdMatchPoints + thirdPlaceWinnerPts }
  const final:      FinalBreakdown      = { matchPoints: finalMatchPoints, champion: championPts, total: finalMatchPoints + championPts }
  const goldenBoot: GoldenBootBreakdown = { goalsPoints: goldenBootGoalsPoints, winnerBonus: goldenBootWinnerBonus, total: goldenBootGoalsPoints + goldenBootWinnerBonus }

  const total = group.total + r32.total + r16.total + qf.total + sf.total + third.total + final.total + goldenBoot.total
  return { group, r32, r16, qf, sf, third, final, goldenBoot, total }
}
