// @vitest-environment node
import { test } from 'vitest'
import { tournamentResults, derivePlayerGoals } from './src/tournament-results'
import { realPlayedState } from './src/leaderboard/winprob/realPlayed'
import { simulateTournament, realGamesByTeam, currentResults, expectedUserPoints } from './sim-core'
import { computeUserPoints } from './src/leaderboard/points'
import { USERS } from './src/users'

test('Karni vs Lior head-to-head', () => {
  const N = 20000
  const played = realPlayedState(tournamentResults)
  const realGoals = derivePlayerGoals((tournamentResults as any).playerMatchGoals ?? {})
  const realGames = realGamesByTeam(played)
  const karni = USERS.find(u => u.label === 'יונתן קרני')!
  const lior = USERS.find(u => u.label === 'ליאור מולדובן')!

  // current locked points
  const cur = currentResults(played)
  console.log('Current LOCKED points: Karni', computeUserPoints(karni, cur).total, ' Lior', computeUserPoints(lior, cur).total)

  // head to head
  let kBeatsL = 0, lBeatsK = 0, tie = 0
  let kFinalPts = 0, lFinalPts = 0, kThirdPts = 0, lThirdPts = 0
  for (let i = 0; i < N; i++) {
    const res = simulateTournament(played, realGoals, realGames)
    const kb = computeUserPoints(karni, res)
    const lb = computeUserPoints(lior, res)
    if (kb.total > lb.total) kBeatsL++
    else if (lb.total > kb.total) lBeatsK++
    else tie++
    kFinalPts += kb.final.total; lFinalPts += lb.final.total
    kThirdPts += kb.third.total; lThirdPts += lb.third.total
  }
  console.log(`Head-to-head: Karni>Lior ${(kBeatsL / N * 100).toFixed(1)}%  Lior>Karni ${(lBeatsK / N * 100).toFixed(1)}%  tie ${(tie / N * 100).toFixed(1)}%`)
  console.log(`Final-stage avg pts:  Karni ${(kFinalPts / N).toFixed(1)}  Lior ${(lFinalPts / N).toFixed(1)}`)
  console.log(`Third-place avg pts:  Karni ${(kThirdPts / N).toFixed(1)}  Lior ${(lThirdPts / N).toFixed(1)}`)

  // full stage breakdown
  const kb = expectedUserPoints(karni, played, N, 12345, realGoals)
  const lb = expectedUserPoints(lior, played, N, 12345, realGoals)
  const fmt = (b: typeof kb) => `group=${b.group.total.toFixed(0)} r32=${b.r32.toFixed(0)} r16=${b.r16.toFixed(0)} qf=${b.qf.toFixed(0)} sf=${b.sf.toFixed(0)} third=${b.third.toFixed(1)} final=${b.final.toFixed(1)} gb=${b.goldenBoot.toFixed(1)} TOTAL=${b.total.toFixed(0)}`
  console.log('Karni:', fmt(kb))
  console.log('Lior :', fmt(lb))

  // R16 differences
  const kSet = new Set(karni.predictedR16Teams)
  const lSet = new Set(lior.predictedR16Teams)
  console.log('Karni-only R16:', karni.predictedR16Teams!.filter(t => !lSet.has(t)))
  console.log('Lior-only R16:', lior.predictedR16Teams!.filter(t => !kSet.has(t)))
  console.log('Karni final/champ:', lior && karni.predictedFinalTeams, karni.predictedChampion, ' thirdWinner', karni.predictedThirdPlaceWinner)
  console.log('Lior  final/champ:', lior.predictedFinalTeams, lior.predictedChampion, ' thirdWinner', lior.predictedThirdPlaceWinner)
}, 180000)
