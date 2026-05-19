import { render, screen } from '@testing-library/react'
import App from './App'

test('predictions page shows title', () => {
  render(<App />)
  expect(screen.getByText('2026 World Cup Predictions')).toBeInTheDocument()
})
