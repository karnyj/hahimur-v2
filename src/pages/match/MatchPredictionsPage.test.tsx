import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import MatchPredictionsPage from './MatchPredictionsPage'

type MockUser = { label: string; predictions: Record<string, { home: number | null; away: number | null }>; topGoalscorer: string }
let mockUsers: MockUser[] = []

vi.mock('../../users/index', () => ({
  get USERS() { return mockUsers },
}))

function getCounts() {
  return screen.getAllByTestId('pred-count').map(el => el.textContent)
}

test('shows Hebrew message when there are no users', () => {
  mockUsers = []
  render(<MatchPredictionsPage />)
  expect(screen.getByText('אין תחזיות למשחק זה')).toBeInTheDocument()
})

test('shows summary table even when no one predicted the game', () => {
  mockUsers = []
  render(<MatchPredictionsPage />)
  expect(getCounts()).toEqual(['0', '0', '0'])
})

test('shows user name when one user has a prediction for A1', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 2, away: 1 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(screen.getByText(/שחקן א/)).toBeInTheDocument()
  expect(screen.queryByText('אין תחזיות למשחק זה')).not.toBeInTheDocument()
})

test('shows user with – for a partially unpredicted A1 match', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 2, away: null } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(screen.getByText(/שחקן א/)).toBeInTheDocument()
  expect(screen.queryByText('אין תחזיות למשחק זה')).not.toBeInTheDocument()
})

test('shows user with – scores when A1 prediction is null', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: null, away: null } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(screen.getByText(/שחקן א/)).toBeInTheDocument()
  expect(screen.queryByText('אין תחזיות למשחק זה')).not.toBeInTheDocument()
})

test('shows all user names when multiple users have predictions for A1', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 2, away: 1 } }, topGoalscorer: '' },
    { label: 'שחקן ב', predictions: { A1: { home: 0, away: 0 } }, topGoalscorer: '' },
    { label: 'שחקן ג', predictions: { A1: { home: 3, away: 2 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(screen.getByText(/שחקן א/)).toBeInTheDocument()
  expect(screen.getByText(/שחקן ב/)).toBeInTheDocument()
  expect(screen.getByText(/שחקן ג/)).toBeInTheDocument()
})

test('shows summary counts: 2 home wins, 1 draw, 0 away wins', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 2, away: 1 } }, topGoalscorer: '' },
    { label: 'שחקן ב', predictions: { A1: { home: 0, away: 0 } }, topGoalscorer: '' },
    { label: 'שחקן ג', predictions: { A1: { home: 3, away: 2 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(getCounts()).toEqual(['2', '1', '0'])
})

test('shows summary counts: 0 home wins, 0 draws, 1 away win', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 0, away: 2 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(getCounts()).toEqual(['0', '0', '1'])
})

test('always shows draw count as 0 when no one predicted a draw', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: 2, away: 1 } }, topGoalscorer: '' },
    { label: 'שחקן ב', predictions: { A1: { home: 1, away: 0 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  const counts = getCounts()
  expect(counts).toHaveLength(3)
  expect(counts[1]).toBe('0')
})

test('excludes unpredicted entries from summary counts', () => {
  mockUsers = [
    { label: 'שחקן א', predictions: { A1: { home: null, away: null } }, topGoalscorer: '' },
    { label: 'שחקן ב', predictions: { A1: { home: 1, away: 0 } }, topGoalscorer: '' },
  ]
  render(<MatchPredictionsPage />)
  expect(getCounts()).toEqual(['1', '0', '0'])
})
