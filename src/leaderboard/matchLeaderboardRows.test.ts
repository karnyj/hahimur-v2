// @vitest-environment node
import { expect, test } from 'vitest'
import type { GroupMatch, MatchScores, TournamentResults } from '../shared/types'
import { buildMatchLeaderboardRows } from './matchLeaderboardRows'
import { EMPTY_RESULTS, makeUser } from './testFixtures'

// Two group-A matches on consecutive days. roundOf treats group matches as
// pagiya=2 / tzelifa=4.
const A1: GroupMatch = { id: 'A1', homeTeam: 'X', awayTeam: 'Y', matchDate: '11 ביוני', kickoffIST: '19:00', scores: { home: 2, away: 1 } }
const A2: GroupMatch = { id: 'A2', homeTeam: 'X', awayTeam: 'Z', matchDate: '12 ביוני', kickoffIST: '19:00', scores: { home: 0, away: 0 } }

const results: TournamentResults = {
  ...EMPTY_RESULTS,
  groupMatches: { A: [A1, A2] },
}

const bettor = (label: string, a1: MatchScores, a2: MatchScores) =>
  makeUser({
    label,
    predictions: { A1: a1, A2: a2 },
    groupMatches: { A: [{ ...A1, scores: a1 }, { ...A2, scores: a2 }] },
  })

// Alice nails A1 (tzelifa, 4), misses A2. Bob gets A1 outcome (pgiya, 2), nails A2 (tzelifa, 4).
const alice = bettor('Alice', { home: 2, away: 1 }, { home: 1, away: 0 })
const bob = bettor('Bob', { home: 1, away: 0 }, { home: 0, away: 0 })

test('row carries the prediction and this-match points, sorted by cumulative total', () => {
  const rows = buildMatchLeaderboardRows([alice, bob], results, 'A1')
  expect(rows.map(r => r.label)).toEqual(['Alice', 'Bob'])
  expect(rows[0]).toMatchObject({ label: 'Alice', prediction: { home: 2, away: 1 }, matchPoints: 4 })
  expect(rows[1]).toMatchObject({ label: 'Bob', prediction: { home: 1, away: 0 }, matchPoints: 2 })
})

test('נקודות סה"כ is cumulative through this match only — later matches excluded', () => {
  const rows = buildMatchLeaderboardRows([alice, bob], results, 'A1')
  // As of A1: Alice 4, Bob 2. Bob's later A2 tzelifa (4) must NOT leak in.
  expect(rows.find(r => r.label === 'Alice')!.total).toBe(4)
  expect(rows.find(r => r.label === 'Bob')!.total).toBe(2)
})

test('the first played match has no position movement', () => {
  const rows = buildMatchLeaderboardRows([alice, bob], results, 'A1')
  expect(rows.every(r => r.placeMovement === null)).toBe(true)
})

test('A2 moves Bob up and Alice down, and totals include both matches', () => {
  const rows = buildMatchLeaderboardRows([alice, bob], results, 'A2')
  // Sorted by cumulative total: Bob 6, Alice 4.
  expect(rows.map(r => r.label)).toEqual(['Bob', 'Alice'])
  const bobRow = rows.find(r => r.label === 'Bob')!
  const aliceRow = rows.find(r => r.label === 'Alice')!
  expect(bobRow).toMatchObject({ matchPoints: 4, total: 6, placeMovement: 1 })   // climbed 1st
  expect(aliceRow).toMatchObject({ matchPoints: 0, total: 4, placeMovement: -1 }) // dropped to 2nd
})

test('before kickoff (no result yet) points are zero and there is no movement', () => {
  const A3: GroupMatch = { id: 'A3', homeTeam: 'X', awayTeam: 'W', matchDate: '13 ביוני', kickoffIST: '19:00' }
  const withUnplayed: TournamentResults = { ...results, groupMatches: { A: [A1, A2, A3] } }
  const guesser = bettor('Alice', { home: 2, away: 1 }, { home: 1, away: 0 })
  const rows = buildMatchLeaderboardRows([guesser], withUnplayed, 'A3')
  expect(rows[0].matchPoints).toBe(0)
  expect(rows[0].placeMovement).toBeNull()
  // Cumulative still reflects the played A1+A2 standings.
  expect(rows[0].total).toBe(4)
})
