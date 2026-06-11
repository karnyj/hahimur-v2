import { nextMatch, topPrediction } from './nextMatch'
import { makeUser } from '../../leaderboard/testFixtures'
import type { GroupMatch } from '../../shared/types'

const MATCHES: GroupMatch[] = [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00' },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', matchDate: '12 ביוני', kickoffIST: '05:00' },
  { id: 'B1', homeTeam: 'Canada', awayTeam: 'Bosnia and Herzegovina', matchDate: '12 ביוני', kickoffIST: '22:00' },
]

test('nextMatch keeps returning a match in progress until its score is recorded', () => {
  const now = new Date('2026-06-11T20:00:00Z') // A1 kicked off at 19:00Z, no score yet
  expect(nextMatch(MATCHES, now)?.id).toBe('A1')
})

test('nextMatch moves on once a started match has a final score', () => {
  const matches: GroupMatch[] = [
    { ...MATCHES[0], scores: { home: 2, away: 1 } },
    ...MATCHES.slice(1),
  ]
  const now = new Date('2026-06-11T20:00:00Z')
  expect(nextMatch(matches, now)?.id).toBe('A2')
})

test('nextMatch gives up on a scoreless match three hours after kickoff', () => {
  const now = new Date('2026-06-11T22:30:00Z') // A1 kicked off at 19:00Z, fetcher never delivered
  expect(nextMatch(MATCHES, now)?.id).toBe('A2')
})

test('nextMatch returns the first match before the tournament starts', () => {
  const now = new Date('2026-06-10T12:00:00Z')
  expect(nextMatch(MATCHES, now)?.id).toBe('A1')
})

test('nextMatch returns null when all matches have kicked off', () => {
  const now = new Date('2026-06-13T12:00:00Z')
  expect(nextMatch(MATCHES, now)).toBeNull()
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
