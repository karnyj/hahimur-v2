import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import KnockoutMatchPage from './KnockoutMatchPage'
import { findKnockoutMatch } from './koMatch'

// Nav renders a participant picker we don't care about here.
vi.mock('../../Nav', () => ({ default: () => null, USER_STORAGE_EVENT: 'userStorageUpdated' }))

// Keep the real bracket/labels, but make findKnockoutMatch swappable so a test
// can stand in a resolved fixture without the dev-only ?mockko path.
vi.mock('./koMatch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./koMatch')>()
  return { ...actual, findKnockoutMatch: vi.fn(actual.findKnockoutMatch) }
})

// Groups A and B aren't complete yet, so match 73's two slots are both
// unresolved: we show the descriptors ("סגנית א" / "סגנית ב") rather than
// team names, with no flags. The round and kickoff are fixed regardless.
test('shows descriptors for both unresolved slots of match 73', () => {
  render(<KnockoutMatchPage matchNum={73} />)
  expect(screen.getByText('סגנית א')).toBeInTheDocument()
  expect(screen.getByText('סגנית ב')).toBeInTheDocument()
  expect(screen.getByText(/שלב ה-32/)).toBeInTheDocument()
  expect(screen.getByText('28 ביוני')).toBeInTheDocument()
  expect(document.querySelector('.fi')).toBeNull()
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
