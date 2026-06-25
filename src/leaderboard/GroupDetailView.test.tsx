import { render, screen, within, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import GroupDetailView from './GroupDetailView'
import type { GroupDetailRow } from './leaderboardRows'

// teams are referenced by their key in shared/groups; pick real keys so TeamChip
// can resolve a Hebrew name + flag.
const ROWS: GroupDetailRow[] = [
  {
    label: 'דנה',
    advancement: [
      { team: 'ESP', group: 'A' },
      { team: 'BRA', group: 'B' },
    ],
    places: [{ team: 'ESP', group: 'A', position: 1 }],
  },
  {
    label: 'יוסי',
    advancement: [{ team: 'ESP', group: 'A' }],
    places: [],
  },
]

test('ranks bettors by their עולות+מיקומים points, leader first', () => {
  render(<GroupDetailView rows={ROWS} />)
  const cards = screen.getAllByRole('article')
  // דנה: 2×4 + 1×1 = 9 ; יוסי: 1×4 = 4 → דנה leads
  expect(within(cards[0]).getByText('דנה')).toBeInTheDocument()
  expect(within(cards[0]).getByTestId('gd-total-דנה')).toHaveTextContent('9 נק׳')
  expect(within(cards[1]).getByText('יוסי')).toBeInTheDocument()
  expect(within(cards[1]).getByTestId('gd-total-יוסי')).toHaveTextContent('4 נק׳')
})

test('offers a group selector and filters the detail to one group', () => {
  render(<GroupDetailView rows={ROWS} />)
  // both groups that produced points are offered, plus "all"
  expect(screen.getByRole('button', { name: 'כל הבתים' })).toBeInTheDocument()
  const groupB = screen.getByRole('button', { name: 'ב' })
  fireEvent.click(groupB)
  // in group B only דנה has a hit (BRA advance, 4 pts); יוסי drops to 0
  const cards = screen.getAllByRole('article')
  expect(within(cards[0]).getByTestId('gd-total-דנה')).toHaveTextContent('4 נק׳')
  // יוסי's group-A hit is filtered out → 0 points in this scope
  expect(within(cards[1]).getByTestId('gd-total-יוסי')).toHaveTextContent('0 נק׳')
})

const STANDING = (team: string, points: number): import('../shared/types').Standing =>
  ({ team, played: 3, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points })

test('shows the final group table and my bet only once a group is selected', () => {
  const actualTables = { A: [STANDING('Mexico', 9), STANDING('South Korea', 6), STANDING('Czech Republic', 3), STANDING('South Africa', 0)] }
  const myTables = { A: [STANDING('Mexico', 9), STANDING('Czech Republic', 4), STANDING('South Korea', 4), STANDING('South Africa', 0)] }
  render(<GroupDetailView rows={ROWS} me="דנה" actualTables={actualTables} myTables={myTables} />)

  // not shown in the "all" overview
  expect(screen.queryByText('הבית הסופי')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'א' }))
  expect(screen.getByText('הבית הסופי')).toBeInTheDocument()
  expect(screen.getByText('ההימור שלי')).toBeInTheDocument()
})

test('marks the viewer and shows an empty state before any group resolves', () => {
  const { rerender } = render(<GroupDetailView rows={ROWS} me="יוסי" />)
  const meCard = screen.getAllByRole('article').find(c => within(c).queryByText('אני'))
  expect(meCard).toBeTruthy()
  expect(within(meCard!).getByText('יוסי')).toBeInTheDocument()

  rerender(<GroupDetailView rows={[{ label: 'דנה', advancement: [], places: [] }]} />)
  expect(screen.queryByRole('article')).not.toBeInTheDocument()
  expect(screen.getByText(/שלב הבתים עוד לא הוכרע/)).toBeInTheDocument()
})
