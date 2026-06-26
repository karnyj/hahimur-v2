import { knockoutParticipantScore, userKnockoutMatch, orientToActual } from './koParticipants'
import type { KnockoutMatch } from '../../shared/types'
import type { User } from '../../users/index'

function makeUser(label: string, match: KnockoutMatch): User {
  return {
    label,
    knockoutStages: { r32: [match], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
  } as unknown as User
}

const ko = (home: string, away: string, h = 1, a = 0, drawWinner?: 'home' | 'away'): KnockoutMatch =>
  ({ matchNum: 73, home, away, resolved: true, scores: { home: h, away: a, drawWinner } })

const actual: KnockoutMatch = { matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true }

test('finds the bettor predicted fixture by match number across rounds', () => {
  const u = makeUser('א', ko('South Korea', 'Canada'))
  expect(userKnockoutMatch(u, 73)).toBeDefined()
  expect(userKnockoutMatch(u, 99)).toBeUndefined()
})

test('returns null for a bettor who did not predict both real teams', () => {
  const u = makeUser('לא משתתף', ko('Mexico', 'Canada'))
  expect(knockoutParticipantScore(actual, u)).toBeNull()
})

test('orients a straight prediction to the real home/away', () => {
  const u = makeUser('ישר', ko('South Korea', 'Canada', 2, 0))
  expect(knockoutParticipantScore(actual, u)).toEqual({ home: 2, away: 0, drawWinner: undefined })
})

test('flips a reversed prediction (and its draw winner) onto the real orientation', () => {
  // stored reversed: Canada 1 - South Korea 1, Canada advancing (drawWinner home)
  const u = makeUser('הפוך', ko('Canada', 'South Korea', 1, 1, 'home'))
  expect(knockoutParticipantScore(actual, u)).toEqual({ home: 1, away: 1, drawWinner: 'away' })
})

test('orientToActual leaves an aligned fixture untouched', () => {
  expect(orientToActual(actual, ko('South Korea', 'Canada', 3, 1))).toEqual({ home: 3, away: 1, drawWinner: undefined })
})
