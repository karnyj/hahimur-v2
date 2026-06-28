import { expect, test } from 'vitest'
import type { KnockoutMatch } from '../../shared/types'
import type { User } from '../../users/index'
import { knownSideTeam, knownSideCallers } from './survivors'

const makeUser = (label: string, home: string, away: string): User =>
  ({
    label,
    knockoutStages: { r32: [{ matchNum: 73, home, away, resolved: true }], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
  } as unknown as User)

// Half-resolved match 73: away slot resolved to Canada (Group B runner-up),
// home slot still the descriptor "סגנית א" because Group A hasn't finished.
const half: KnockoutMatch = { matchNum: 73, home: 'סגנית א', away: 'Canada', resolved: false }

test('knownSideTeam returns the single resolved team when exactly one side is real', () => {
  expect(knownSideTeam(half)).toBe('Canada')
})

test('knownSideTeam returns null when neither side is resolved', () => {
  expect(knownSideTeam({ matchNum: 73, home: 'סגנית א', away: 'סגנית ב', resolved: false })).toBeNull()
})

test('knownSideTeam returns null when both sides are resolved', () => {
  expect(knownSideTeam({ matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true })).toBeNull()
})

test('knownSideCallers picks bettors who predicted the known team on either side', () => {
  const users = [
    makeUser('ניחש קנדה בית', 'Canada', 'South Korea'),
    makeUser('ניחש קנדה חוץ', 'Mexico', 'Canada'),
    makeUser('לא ניחש קנדה', 'Mexico', 'Switzerland'),
  ]
  expect(knownSideCallers(half, users).map(u => u.label)).toEqual(['ניחש קנדה בית', 'ניחש קנדה חוץ'])
})

test('counts a bettor who advanced the team through a different slot of the same round', () => {
  // Reality has Canada arriving in slot 73; this bettor predicted Canada into r32
  // too, but at slot 80 (their group finishes route it differently). They still
  // "advanced" Canada to this round, so they're alive on the known side.
  const u = makeUser('סלוט אחר', 'Mexico', 'Switzerland')
  u.knockoutStages.r32 = [{ matchNum: 80, home: 'Canada', away: 'Japan', resolved: true }]
  expect(knownSideCallers(half, [u]).map(user => user.label)).toEqual(['סלוט אחר'])
})

test('does not count the team predicted in a different round', () => {
  // Bettor put Canada in their r16, not r32 — they did not advance it to this round.
  const u = makeUser('סיבוב אחר', 'Mexico', 'Switzerland')
  u.knockoutStages.r16 = [{ matchNum: 89, home: 'Canada', away: 'Japan', resolved: true }]
  expect(knownSideCallers(half, [u])).toEqual([])
})

test('a bettor with no prediction for this match is not a caller', () => {
  const empty = { label: 'ריק', knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] } } as unknown as User
  expect(knownSideCallers(half, [empty])).toEqual([])
})

test('callers are empty when the match is not half-resolved', () => {
  const resolved: KnockoutMatch = { matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true }
  const users = [makeUser('ניחש קנדה', 'Mexico', 'Canada')]
  expect(knownSideCallers(resolved, users)).toEqual([])
})
