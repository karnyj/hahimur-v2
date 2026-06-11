import { render, screen } from '@testing-library/react'
import MatchHeader from './MatchHeader'

const home = { iso: 'mx', he: 'מקסיקו' }
const away = { iso: 'za', he: 'דרום אפריקה' }
const match = { id: 'A1', matchDate: '2026-06-11', kickoffIST: '21:00' }
const noop = () => {}
const scoreProps = { homeScore: null, awayScore: null, onHomeScore: noop, onAwayScore: noop }

test('renders home team name', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  expect(screen.getAllByText('מקסיקו').length).toBeGreaterThan(0)
})

test('renders away team name', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  expect(screen.getAllByText('דרום אפריקה').length).toBeGreaterThan(0)
})

test('renders match date', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  expect(screen.getByText('2026-06-11')).toBeInTheDocument()
})

test('renders kickoff time', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  expect(screen.getByText('21:00')).toBeInTheDocument()
})

test('renders group badge with group letter and match number', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  const badge = document.querySelector('.match-header__group-badge')!
  expect(badge.textContent).toContain('1')
})

test('shows live indicator and what-if hint when live', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} live />)
  expect(screen.getByTestId('live-indicator')).toBeInTheDocument()
  expect(screen.getByText('המשחק בעיצומו')).toBeInTheDocument()
  expect(screen.getByText('הזינו את התוצאה הנוכחית וראו מי לוקח נקודות')).toBeInTheDocument()
})

test('hides kickoff time while live', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} live />)
  expect(screen.queryByText('21:00')).not.toBeInTheDocument()
})

test('shows no live indicator by default', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} />)
  expect(screen.queryByTestId('live-indicator')).not.toBeInTheDocument()
})

test('final score wins over live: no live indicator once a real score exists', () => {
  render(<MatchHeader match={match} home={home} away={away} {...scoreProps} live realScore={{ home: 2, away: 1 }} />)
  expect(screen.queryByTestId('live-indicator')).not.toBeInTheDocument()
  expect(screen.getByTestId('real-score')).toBeInTheDocument()
})
