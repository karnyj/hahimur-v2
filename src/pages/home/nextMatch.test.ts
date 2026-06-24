import { nextMatches, recentMatches, topPrediction } from './nextMatch'
import { makeUser } from '../../leaderboard/testFixtures'
import type { GroupMatch } from '../../shared/types'

// Kickoffs are Israel time (UTC+3):
//   A1 -> 11 Jun 19:00Z
//   A2 -> 12 Jun 02:00Z
//   B1 -> 12 Jun 17:00Z
//   C1 -> 13 Jun 19:00Z
//   D1 -> 14 Jun 19:00Z
//   E1 -> 15 Jun 19:00Z
const MATCHES: GroupMatch[] = [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00' },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', matchDate: '12 ביוני', kickoffIST: '05:00' },
  { id: 'B1', homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', matchDate: '12 ביוני', kickoffIST: '20:00' },
  { id: 'C1', homeTeam: 'Qatar', awayTeam: 'Ecuador', matchDate: '13 ביוני', kickoffIST: '22:00' },
  { id: 'D1', homeTeam: 'Belgium', awayTeam: 'Egypt', matchDate: '14 ביוני', kickoffIST: '22:00' },
  { id: 'E1', homeTeam: 'France', awayTeam: 'Senegal', matchDate: '15 ביוני', kickoffIST: '22:00' },
]

const ids = (matches: GroupMatch[]) => matches.map(m => m.id)

test('nextMatches returns every match within 24h of the closest, across calendar days', () => {
  // Before the tournament A1 (11th 22:00) is closest. A2 (12th 05:00, +7h) and
  // B1 (12th 20:00, +22h) fall inside the 24h window though on the next calendar
  // day; C1 (13th) is two days out and excluded.
  const now = new Date('2026-06-10T12:00:00Z')
  expect(ids(nextMatches(MATCHES, now))).toEqual(['A1', 'A2', 'B1'])
})

test('nextMatches drops a match more than 24h after the closest one', () => {
  // X is closest; Y kicks off 23h later (in), Z 25h later (out).
  const spread: GroupMatch[] = [
    { id: 'X', homeTeam: 'A', awayTeam: 'B', matchDate: '11 ביוני', kickoffIST: '12:00' }, // 11 Jun 09:00Z
    { id: 'Y', homeTeam: 'C', awayTeam: 'D', matchDate: '12 ביוני', kickoffIST: '11:00' }, // +23h
    { id: 'Z', homeTeam: 'E', awayTeam: 'F', matchDate: '12 ביוני', kickoffIST: '13:00' }, // +25h
  ]
  const now = new Date('2026-06-11T00:00:00Z')
  expect(ids(nextMatches(spread, now))).toEqual(['X', 'Y'])
})

test('nextMatches returns matches in chronological order regardless of source order', () => {
  const now = new Date('2026-06-10T12:00:00Z')
  const shuffled = [MATCHES[2], MATCHES[0], MATCHES[1]]
  expect(ids(nextMatches(shuffled, now))).toEqual(['A1', 'A2', 'B1'])
})

test('nextMatches keeps a match in progress until its score is recorded', () => {
  const now = new Date('2026-06-11T20:00:00Z') // A1 kicked off at 19:00Z, no score yet
  expect(nextMatches(MATCHES, now)[0].id).toBe('A1')
})

test('nextMatches drops a started match once it has a final score', () => {
  const matches: GroupMatch[] = [
    { ...MATCHES[0], scores: { home: 2, away: 1 } },
    ...MATCHES.slice(1),
  ]
  const now = new Date('2026-06-11T20:00:00Z')
  expect(nextMatches(matches, now)[0].id).toBe('A2')
})

test('nextMatches keeps a scoreless match through a long delay (still inside the window)', () => {
  const now = new Date('2026-06-11T23:30:00Z') // A1 kicked off at 19:00Z, 4.5h ago and rain-delayed
  expect(nextMatches(MATCHES, now)[0].id).toBe('A1')
})

test('nextMatches gives up on a scoreless match once the window has passed', () => {
  const now = new Date('2026-06-12T01:30:00Z') // A1 kicked off at 19:00Z, 6.5h ago, fetcher never delivered
  expect(nextMatches(MATCHES, now)[0].id).toBe('A2')
})

test('nextMatches returns empty when no match remains', () => {
  const now = new Date('2026-06-20T12:00:00Z')
  expect(nextMatches(MATCHES, now)).toEqual([])
})

test('nextMatches returns both matches of a simultaneous kickoff', () => {
  const round3: GroupMatch[] = [
    { id: 'A3', homeTeam: 'Czech Republic', awayTeam: 'South Africa', matchDate: '24 ביוני', kickoffIST: '22:00' },
    { id: 'A4', homeTeam: 'Mexico', awayTeam: 'South Korea', matchDate: '24 ביוני', kickoffIST: '22:00' },
  ]
  const now = new Date('2026-06-24T12:00:00Z')
  expect(ids(nextMatches(round3, now))).toEqual(['A3', 'A4'])
})

test('nextMatches drops a tied match once its score is in but keeps the other', () => {
  const round3: GroupMatch[] = [
    { id: 'A3', homeTeam: 'Czech Republic', awayTeam: 'South Africa', matchDate: '24 ביוני', kickoffIST: '22:00', scores: { home: 1, away: 0 } },
    { id: 'A4', homeTeam: 'Mexico', awayTeam: 'South Korea', matchDate: '24 ביוני', kickoffIST: '22:00' },
  ]
  const now = new Date('2026-06-24T20:00:00Z') // both kicked off at 19:00Z, only A3 has a score
  expect(ids(nextMatches(round3, now))).toEqual(['A4'])
})

// Mirror of nextMatches: the last few matches that already have a final score,
// most recent first. Built from the same fixture, with scores filled in.
const SCORED: GroupMatch[] = MATCHES.map(m => ({ ...m, scores: { home: 1, away: 0 } }))

test('recentMatches returns every played match within 24h of the most recent, newest first', () => {
  // By now A1 (11th), A2 and B1 (12th) have been played. B1 (12th 20:00) is the
  // most recent; A2 (-15h) and A1 (-22h) fall inside the 24h window, newest first.
  const now = new Date('2026-06-13T00:00:00Z')
  expect(ids(recentMatches(SCORED, now))).toEqual(['B1', 'A2', 'A1'])
})

test('recentMatches ignores matches without a final score', () => {
  // A2 sits inside B1's 24h window but has no score, so only A1 and B1 show.
  const matches: GroupMatch[] = [
    { ...MATCHES[0], scores: { home: 2, away: 1 } }, // A1 settled
    MATCHES[1], // A2 no score
    { ...MATCHES[2], scores: { home: 0, away: 0 } }, // B1 settled
  ]
  const now = new Date('2026-06-20T12:00:00Z')
  expect(ids(recentMatches(matches, now))).toEqual(['B1', 'A1'])
})

test('recentMatches only counts matches whose kickoff has passed', () => {
  // At noon on the 12th only A1 and A2 have kicked off; B1 (20:00) is still to
  // come. A2 is the most recent, with A1 (-7h) inside its 24h window.
  const now = new Date('2026-06-12T12:00:00Z')
  expect(ids(recentMatches(SCORED, now))).toEqual(['A2', 'A1'])
})

test('recentMatches returns empty before any match is settled', () => {
  const now = new Date('2026-06-10T12:00:00Z')
  expect(recentMatches(SCORED, now)).toEqual([])
})

test('topPrediction returns the most common predicted score and its count', () => {
  const users = [
    makeUser({ predictions: { A2: { home: 2, away: 1 } } }),
    makeUser({ predictions: { A2: { home: 2, away: 1 } } }),
    makeUser({ predictions: { A2: { home: 0, away: 0 } } }),
    makeUser({ predictions: {} }),
  ]
  expect(topPrediction(users, 'A2')).toEqual({ home: 2, away: 1, count: 2, total: 3 })
})

test('topPrediction returns null when nobody predicted the match', () => {
  expect(topPrediction([makeUser()], 'A2')).toBeNull()
})
