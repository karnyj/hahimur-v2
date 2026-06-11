import { nextMatches, topPrediction } from './nextMatch'
import { makeUser } from '../../leaderboard/testFixtures'
import type { GroupMatch } from '../../shared/types'

const MATCHES: GroupMatch[] = [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00' },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', matchDate: '12 ביוני', kickoffIST: '05:00' },
  { id: 'B1', homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', matchDate: '12 ביוני', kickoffIST: '22:00' },
]

const ids = (matches: GroupMatch[]) => matches.map(m => m.id)

test('nextMatches keeps returning a match in progress until its score is recorded', () => {
  const now = new Date('2026-06-11T20:00:00Z') // A1 kicked off at 19:00Z, no score yet
  expect(ids(nextMatches(MATCHES, now))).toEqual(['A1'])
})

test('nextMatches moves on once a started match has a final score', () => {
  const matches: GroupMatch[] = [
    { ...MATCHES[0], scores: { home: 2, away: 1 } },
    ...MATCHES.slice(1),
  ]
  const now = new Date('2026-06-11T20:00:00Z')
  expect(ids(nextMatches(matches, now))).toEqual(['A2'])
})

test('nextMatches gives up on a scoreless match three hours after kickoff', () => {
  const now = new Date('2026-06-11T22:30:00Z') // A1 kicked off at 19:00Z, fetcher never delivered
  expect(ids(nextMatches(MATCHES, now))).toEqual(['A2'])
})

test('nextMatches returns the first match before the tournament starts', () => {
  const now = new Date('2026-06-10T12:00:00Z')
  expect(ids(nextMatches(MATCHES, now))).toEqual(['A1'])
})

test('nextMatches returns empty when all matches have kicked off', () => {
  const now = new Date('2026-06-13T12:00:00Z')
  expect(nextMatches(MATCHES, now)).toEqual([])
})

test('nextMatches returns both matches of a simultaneous round-3 kickoff', () => {
  const round3: GroupMatch[] = [
    { id: 'A3', homeTeam: 'Czech Republic', awayTeam: 'South Africa', matchDate: '24 ביוני', kickoffIST: '22:00' },
    { id: 'A4', homeTeam: 'Mexico', awayTeam: 'South Korea', matchDate: '24 ביוני', kickoffIST: '22:00' },
    { id: 'B3', homeTeam: 'Canada', awayTeam: 'Qatar', matchDate: '25 ביוני', kickoffIST: '01:00' },
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
