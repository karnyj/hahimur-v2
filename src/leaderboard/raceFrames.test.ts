// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { buildRaceFrames } from './raceFrames'
import { makeUser } from './testFixtures'
import { tournamentResults as R } from '../tournament-results'
import { USERS } from '../users'
import { computeUserPoints } from './points'
import { playedMatchesChrono } from './leaderboardRows'
import type { TournamentResults } from '../shared/types'

// Two played group matches in chronological order; two bettors with known hits.
// Group A: A1 = Mexico 2–0 South Africa, A2 = South Korea 1–1 Czech Republic.
const results: TournamentResults = {
  groupMatches: {
    A: [
      { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00', scores: { home: 2, away: 0 } },
      { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', matchDate: '12 ביוני', kickoffIST: '05:00', scores: { home: 1, away: 1 } },
    ],
  },
  // Left incomplete on purpose: no advancement/place awarded, so this test
  // isolates the cumulative per-match scoring.
  groupTables: {},
  thirdPlaceQualification: { resolved: false, all: [], tied: [] },
  knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
}

// Alice nails both exactly (4 + 4). Bob gets the direction right both times (2 + 2).
const alice = makeUser({ label: 'Alice', groupMatches: { A: [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', scores: { home: 2, away: 0 } },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', scores: { home: 1, away: 1 } },
] } })
const bob = makeUser({ label: 'Bob', groupMatches: { A: [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', scores: { home: 1, away: 0 } },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', scores: { home: 0, away: 0 } },
] } })

describe('buildRaceFrames', () => {
  test('one frame per played group match, in chronological order', () => {
    const frames = buildRaceFrames([alice, bob], results)
    expect(frames.map(f => f.matchId)).toEqual(['A1', 'A2'])
    expect(frames.map(f => f.date)).toEqual(['11 ביוני', '12 ביוני'])
  })

  test('each frame carries the match result as a caption', () => {
    const [first] = buildRaceFrames([alice, bob], results)
    expect(first.matchLabel).toBe('מקסיקו 2–0 דרום אפריקה')
  })

  test('bars hold each bettor cumulative total, sorted high to low', () => {
    const frames = buildRaceFrames([alice, bob], results)
    expect(frames[0].bars).toEqual([
      { label: 'Alice', total: 4 },
      { label: 'Bob', total: 2 },
    ])
    expect(frames[1].bars).toEqual([
      { label: 'Alice', total: 8 },
      { label: 'Bob', total: 4 },
    ])
  })

  test('a bettor total never decreases from frame to frame (cumulative)', () => {
    const frames = buildRaceFrames([alice, bob], results)
    for (const label of ['Alice', 'Bob']) {
      const totals = frames.map(f => f.bars.find(b => b.label === label)!.total)
      for (let i = 1; i < totals.length; i++) expect(totals[i]).toBeGreaterThanOrEqual(totals[i - 1])
    }
  })

  test('no played matches yields no frames', () => {
    const empty: TournamentResults = { ...results, groupMatches: {} }
    expect(buildRaceFrames([alice, bob], empty)).toEqual([])
  })
})

// A knockout advancer's bonus belongs to the frame of the match that sends them
// through — not to the group stage, where the bracket isn't decided yet. This is
// the bug behind "the timelapse tells a different story": the old snapshot kept
// the full final bracket revealed in every frame, so R32→SF advancement points
// were handed out from the very first group-stage frame, reordering the board.
describe('knockout advancement does not leak into group-stage frames', () => {
  const koResult = (matchNum: number, home: string, away: string, date: string, scores: { home: number; away: number }) =>
    ({ matchNum, home, away, matchDate: date, kickoffIST: '22:00', resolved: true, scores })
  const koPick = (matchNum: number, home: string, away: string, scores: { home: number; away: number }) =>
    ({ matchNum, home, away, resolved: true, scores })
  const empty = { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] }

  // One played group match (A1), then one R32 match (#73) that sends Canada through.
  const results: TournamentResults = {
    groupMatches: { A: [{ id: 'A1', homeTeam: 'Mexico', awayTeam: 'Canada', matchDate: '11 ביוני', kickoffIST: '22:00', scores: { home: 1, away: 2 } }] },
    groupTables: {},
    thirdPlaceQualification: { resolved: false, all: [], tied: [] },
    knockoutStages: { ...empty, r32: [koResult(73, 'SouthAfrica', 'Canada', '28 ביוני', { home: 0, away: 1 })] },
  }
  // Dana tips Canada to reach the R16, so she earns the R32 advancement bonus —
  // but only once Canada's R32 match (#73) is played, not during the group stage.
  const dana = makeUser({
    label: 'Dana',
    groupMatches: { A: [{ id: 'A1', homeTeam: 'Mexico', awayTeam: 'Canada', scores: { home: 0, away: 0 } }] },
    knockoutStages: { ...empty, r16: [koPick(89, 'Canada', 'Germany', { home: 1, away: 0 })] },
  })

  test('the group-stage frame carries no knockout advancement', () => {
    const [groupFrame] = buildRaceFrames([dana], results)
    // A1 alone: nothing from the R32 yet (a miss on the scoreline → 0 here).
    expect(groupFrame.bars).toEqual([{ label: 'Dana', total: 0 }])
  })

  test('the advancement bonus appears at the R32 frame, not before', () => {
    const frames = buildRaceFrames([dana], results)
    const totals = frames.map(f => f.bars.find(b => b.label === 'Dana')!.total)
    expect(totals[1] - totals[0]).toBe(7) // OLEH r32, credited at #73
  })
})

// The race is the cumulative leaderboard over time, so its last frame must equal
// the live board exactly for every bettor — guarded against the real tournament.
describe('the final frame reproduces the live leaderboard', () => {
  test('every bettor cumulative total at the last frame equals computeUserPoints', () => {
    const frames = buildRaceFrames(USERS, R)
    expect(frames.length).toBe(playedMatchesChrono(R).length)
    const final = new Map(frames.at(-1)!.bars.map(b => [b.label, b.total]))
    for (const user of USERS) {
      expect(final.get(user.label), user.label).toBe(computeUserPoints(user, R).total)
    }
  })

  test('totals never decrease frame to frame', () => {
    const frames = buildRaceFrames(USERS, R)
    for (const user of USERS) {
      const totals = frames.map(f => f.bars.find(b => b.label === user.label)!.total)
      for (let i = 1; i < totals.length; i++) {
        expect(totals[i], `${user.label} frame ${i + 1}`).toBeGreaterThanOrEqual(totals[i - 1])
      }
    }
  })
})
