import { render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import KnockoutMatchPage from './KnockoutMatchPage'
import { findKnockoutMatch } from './koMatch'
import type { KnockoutMatch } from '../../shared/types'
import type { User } from '../../users/index'

// Nav renders a participant picker we don't care about here.
vi.mock('../../Nav', () => ({ default: () => null, USER_STORAGE_EVENT: 'userStorageUpdated' }))

// Pin the baked results to empty so the knockout points table reflects only the
// bettors' knockout predictions, not whatever live group scores happen to exist.
vi.mock('../../tournament-results', () => ({
  tournamentResults: { groupMatches: {}, groupTables: {}, playerMatchGoals: {}, knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] }, thirdPlaceQualification: { resolved: false, all: [], tied: [] } },
  derivePlayerGoals: () => ({}),
}))

// Keep the real bracket/labels, but make findKnockoutMatch swappable so a test
// can stand in a resolved fixture without the dev-only ?mockko path.
vi.mock('./koMatch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./koMatch')>()
  return { ...actual, findKnockoutMatch: vi.fn(actual.findKnockoutMatch) }
})

// When one slot has resolved to a real team but the other is still pending, the
// header mixes a flagged team name with a bare descriptor. Use a fixture so this
// doesn't depend on which groups happen to be complete in the live results.
test('shows a descriptor for the pending slot and the resolved team', () => {
  vi.mocked(findKnockoutMatch).mockReturnValueOnce({
    matchNum: 73, home: 'סגנית א', away: 'Canada', resolved: false,
    scores: { home: null, away: null }, matchDate: '28 ביוני', kickoffIST: '22:00',
  })
  render(<KnockoutMatchPage matchNum={73} />)
  const teamNames = Array.from(document.querySelectorAll('.match-team__name')).map(n => n.textContent)
  expect(teamNames).toEqual(expect.arrayContaining(['סגנית א', 'קנדה']))
  expect(screen.getByText(/שלב ה-32/)).toBeInTheDocument()
  expect(screen.getByText('28 ביוני')).toBeInTheDocument()
  // The pending slot has no flag; the resolved one shows Canada's.
  expect(document.querySelector('.match-header__teams .fi-ca')).toBeInTheDocument()
  expect(document.querySelectorAll('.match-header__teams .fi')).toHaveLength(1)
})

// Match 74's away slot is a 3rd-place/allocation slot: before the qualification
// resolves we can't name the single source group, but the matrix narrows it to a
// fixed set of 5, so we list them instead of a bare placeholder.
test('lists the possible source groups for an unresolved third-place slot', () => {
  render(<KnockoutMatchPage matchNum={74} />)
  expect(screen.getByText('מנצח ה')).toBeInTheDocument()
  expect(screen.getByText('שלישית א/ב/ג/ד/ו')).toBeInTheDocument()
})

// Once the slots resolve to real teams, the header shows Hebrew names with flags.
test('shows Hebrew team names and flags for a resolved match', () => {
  vi.mocked(findKnockoutMatch).mockReturnValueOnce({
    matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true,
    scores: { home: 1, away: 0 }, matchDate: '28 ביוני', kickoffIST: '22:00',
  })
  render(<KnockoutMatchPage matchNum={73} />)
  expect(screen.getByText('דרום קוריאה')).toBeInTheDocument()
  expect(screen.getByText('קנדה')).toBeInTheDocument()
  expect(document.querySelector('.fi-kr')).toBeInTheDocument()
  expect(document.querySelector('.fi-ca')).toBeInTheDocument()
})

// Parity with the group header: a finished knockout match shows its real score in
// the header, with the "נגמר" badge — not a bare dash.
test('shows the real score in the header for a finished match', () => {
  vi.mocked(findKnockoutMatch).mockReturnValueOnce({
    matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true,
    scores: { home: 1, away: 0 }, matchDate: '28 ביוני', kickoffIST: '22:00',
  })
  render(<KnockoutMatchPage matchNum={73} />)
  const score = screen.getByTestId('real-score')
  // Away (Canada) digit first, then home (South Korea) — same orientation as the
  // rest of the page.
  expect(score.textContent).toContain('0')
  expect(score.textContent).toContain('1')
  expect(screen.getByText('נגמר')).toBeInTheDocument()
})

// Step to the neighbouring knockout matches in kickoff order, not by number: the
// bracket numbers run by round, so 74 (Jun 29 23:30) sits between 76 (Jun 29 20:00)
// and 75 (Jun 30 04:00) on the clock.
test('links prev/next to the chronologically neighbouring knockout matches', () => {
  render(<KnockoutMatchPage matchNum={74} />)
  expect(screen.getByLabelText('המשחק הקודם')).toHaveAttribute('href', '/matches/76')
  expect(screen.getByLabelText('המשחק הבא')).toHaveAttribute('href', '/matches/75')
})

// The knockout opener (73) is the seam with the group stage: its "previous" steps
// back into the last group match played (J6), and its "next" stays in the bracket.
test('the knockout opener links back to the last group match', () => {
  render(<KnockoutMatchPage matchNum={73} />)
  expect(screen.getByLabelText('המשחק הקודם')).toHaveAttribute('href', '/matches/j6')
  expect(screen.getByLabelText('המשחק הבא')).toHaveAttribute('href', '/matches/76')
})

// The points table mirrors the group match page: each bettor's predicted score
// for the fixture and the points it earned them.
const koUser = (label: string, r32: KnockoutMatch[]): User => ({
  label, predictions: {}, topGoalscorer: '',
  groupMatches: {}, groupTables: {}, thirdPlaceQualification: { resolved: false, all: [], tied: [] },
  knockoutStages: { r32, r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
})

test('shows a points table for the bettors on a resolved knockout match', () => {
  const resolved: KnockoutMatch = {
    matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true,
    scores: { home: 1, away: 0 }, matchDate: '28 ביוני', kickoffIST: '22:00',
  }
  vi.mocked(findKnockoutMatch).mockReturnValueOnce(resolved)
  const users = [
    koUser('Alice', [{ matchNum: 73, home: 'South Korea', away: 'Canada', resolved: true, scores: { home: 1, away: 0 }, matchDate: '28 ביוני', kickoffIST: '22:00' }]),
    koUser('Bob', []),
  ]
  render(<KnockoutMatchPage matchNum={73} users={users} />)
  const lb = screen.getByTestId('match-leaderboard')
  const aliceRow = within(lb).getAllByTestId('match-lb-row').find(r => within(r).queryByText('Alice'))!
  // Exact R32 score → tzelifa, 7 points; away score shown first (0–1).
  expect(within(aliceRow).getByText('0–1')).toBeInTheDocument()
  expect(aliceRow.querySelector('.match-lb__pts')!.textContent).toBe('7')
})
