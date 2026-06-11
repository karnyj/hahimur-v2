import { render, screen } from '@testing-library/react'
import NextMatchCard from './NextMatchCard'
import { makeUser } from '../../leaderboard/testFixtures'
import type { GroupMatch } from '../../shared/types'

const NOW = new Date('2026-06-11T20:00:00Z') // A1 finished (score in), A2 is next

// Fixture matches so tests don't depend on the live results file.
const MATCHES: GroupMatch[] = [
  { id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00', scores: { home: 2, away: 1 } },
  { id: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', matchDate: '12 ביוני', kickoffIST: '05:00' },
]

const users = [
  makeUser({ predictions: { A2: { home: 2, away: 1 } } }),
  makeUser({ predictions: { A2: { home: 2, away: 1 } } }),
  makeUser({ predictions: { A2: { home: 0, away: 0 } } }),
]

test('shows the next match teams, kickoff and a link to its page', () => {
  render(<NextMatchCard users={users} now={NOW} matches={MATCHES} />)
  expect(screen.getByText('דרום קוריאה')).toBeInTheDocument()
  expect(screen.getByText('צ׳כיה')).toBeInTheDocument()
  expect(screen.getByText(/12 ביוני/)).toBeInTheDocument()
  expect(screen.getByText(/05:00/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /לעמוד המשחק/ })).toHaveAttribute('href', '/matches/A2')
})

test('home team comes first in DOM so it renders on the right in RTL', () => {
  render(<NextMatchCard users={users} now={NOW} matches={MATCHES} />)
  const names = [...document.querySelectorAll('.next-match__name')].map(e => e.textContent)
  expect(names).toEqual(['דרום קוריאה', 'צ׳כיה']) // A2: South Korea (home) vs Czech Republic (away)
})

test('shows the most common prediction', () => {
  render(<NextMatchCard users={users} now={NOW} matches={MATCHES} />)
  expect(screen.getByTestId('consensus')).toHaveTextContent('1–2')
  expect(screen.getByTestId('consensus')).toHaveTextContent('2 מתוך 3')
})

test('shows a card per match when two matches kick off simultaneously', () => {
  const round3: GroupMatch[] = [
    { id: 'A3', homeTeam: 'Czech Republic', awayTeam: 'South Africa', matchDate: '24 ביוני', kickoffIST: '22:00' },
    { id: 'A4', homeTeam: 'Mexico', awayTeam: 'South Korea', matchDate: '24 ביוני', kickoffIST: '22:00' },
  ]
  render(<NextMatchCard users={users} now={new Date('2026-06-24T12:00:00Z')} matches={round3} />)
  expect(screen.getAllByTestId('next-match')).toHaveLength(2)
  const links = screen.getAllByRole('link', { name: /לעמוד המשחק/ })
  expect(links.map(l => l.getAttribute('href'))).toEqual(['/matches/A3', '/matches/A4'])
})

test('renders nothing when the group stage is over', () => {
  const { container } = render(<NextMatchCard users={users} now={new Date('2026-07-20T00:00:00Z')} matches={MATCHES} />)
  expect(container).toBeEmptyDOMElement()
})
