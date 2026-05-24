import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import MatchPredictionsPage from './MatchPredictionsPage'

type MockUser = { label: string; predictions: Record<string, { home: number | null; away: number | null }>; topGoalscorer: string }
let mockUsers: MockUser[] = []

vi.mock('../../users/index', () => ({
  get USERS() { return mockUsers },
}))

function setup() {
  mockUsers = []
  const user = userEvent.setup()
  render(<MatchPredictionsPage />)
  const mexicoInput = screen.getByLabelText('מקסיקו')
  const southAfricaInput = screen.getByLabelText('דרום אפריקה')
  return { user, mexicoInput, southAfricaInput }
}

describe('score inputs', () => {
  test('accepts valid digit for home team', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '2')
    expect(mexicoInput).toHaveValue('2')
  })

  test('accepts zero', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '0')
    expect(mexicoInput).toHaveValue('0')
  })

  test('accepts valid digit for away team', async () => {
    const { user, southAfricaInput } = setup()
    await user.type(southAfricaInput, '1')
    expect(southAfricaInput).toHaveValue('1')
  })

  test('blocks minus sign', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '-1')
    expect(mexicoInput).toHaveValue('1')
  })

  test('blocks decimal point', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '1.5')
    expect(mexicoInput).toHaveValue('15')
  })

  test('blocks letters', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, 'abc')
    expect(mexicoInput).toHaveValue('')
  })

  test('blocks spaces', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, ' ')
    expect(mexicoInput).toHaveValue('')
  })

  test('strips leading zeros', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '0123')
    expect(mexicoInput).toHaveValue('123')
  })
})

test('shows Hebrew message when there are no users', () => {
  mockUsers = []
  render(<MatchPredictionsPage />)
  expect(screen.getByText('אין תחזיות למשחק זה')).toBeInTheDocument()
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
