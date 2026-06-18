import { render, screen, within } from '@testing-library/react'
import MatchLeaderboard from './MatchLeaderboard'
import type { GroupMatch, MatchScores, TournamentResults } from '../../shared/types'
import type { User } from '../../users/index'

const A1: GroupMatch = { id: 'A1', homeTeam: 'X', awayTeam: 'Y', matchDate: '11 ביוני', kickoffIST: '19:00', scores: { home: 2, away: 1 } }
const A2: GroupMatch = { id: 'A2', homeTeam: 'X', awayTeam: 'Z', matchDate: '12 ביוני', kickoffIST: '19:00', scores: { home: 0, away: 0 } }

const results: TournamentResults = {
  groupMatches: { A: [A1, A2] }, groupTables: {},
  thirdPlaceQualification: { resolved: false, all: [], tied: [] },
  knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
}

const u = (label: string, a1: MatchScores, a2: MatchScores): User => ({
  label, predictions: { A1: a1, A2: a2 }, topGoalscorer: '',
  groupMatches: { A: [{ ...A1, scores: a1 }, { ...A2, scores: a2 }] },
  groupTables: {}, thirdPlaceQualification: { resolved: false, all: [], tied: [] },
  knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
})

const alice = u('Alice', { home: 2, away: 1 }, { home: 1, away: 0 })
const bob = u('Bob', { home: 1, away: 0 }, { home: 0, away: 0 })

test('renders prediction, this-match points and total per bettor', () => {
  render(<MatchLeaderboard matchId="A1" users={[alice, bob]} results={results} />)
  const rows = screen.getAllByTestId('match-lb-row')
  expect(within(rows[0]).getByText('Alice')).toBeInTheDocument()
  expect(within(rows[0]).getByText('1–2')).toBeInTheDocument() // away–home
  expect(rows[0].querySelector('.match-lb__pts')!.textContent).toBe('4')   // this match
  expect(rows[0].querySelector('.match-lb__total')!.textContent).toBe('4') // cumulative
})

test('shows a downward move for a bettor who lost a place on this match', () => {
  render(<MatchLeaderboard matchId="A2" users={[alice, bob]} results={results} />)
  const rows = screen.getAllByTestId('match-lb-row')
  // Bob climbs to first on A2, Alice drops.
  expect(within(rows[0]).getByText('Bob')).toBeInTheDocument()
  expect(rows[0].querySelector('.match-lb__move--up')!.textContent).toBe('▲1')
  expect(rows[1].querySelector('.match-lb__move--down')!.textContent).toBe('▼1')
})

test('flags the current user with a pennant and a highlighted row', () => {
  render(<MatchLeaderboard matchId="A1" users={[alice, bob]} results={results} me="Bob" />)
  const bobRow = screen.getAllByTestId('match-lb-row').find(r => within(r).queryByText('Bob'))!
  expect(bobRow).toHaveClass('match-lb__row--me')
  expect(within(bobRow).getByText('אני')).toBeInTheDocument()
  // only the viewer's row is flagged
  expect(screen.getAllByText('אני')).toHaveLength(1)
})

test('flags no one when the viewer has not identified themselves', () => {
  render(<MatchLeaderboard matchId="A1" users={[alice, bob]} results={results} />)
  expect(screen.queryByText('אני')).not.toBeInTheDocument()
  expect(document.querySelector('.match-lb__row--me')).toBeNull()
})

test('shows nothing when there are no bettors', () => {
  const { container } = render(<MatchLeaderboard matchId="A1" users={[]} results={results} />)
  expect(container.firstChild).toBeNull()
})
