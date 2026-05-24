import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

vi.mock('./users/index', () => ({
  get USERS() { return [] },
}))

test('renders MatchPredictionsPage at /match/A1', () => {
  vi.stubGlobal('location', { pathname: '/match/a1' })
  render(<App />)
  expect(screen.getByText('אין תחזיות למשחק זה')).toBeInTheDocument()
})
