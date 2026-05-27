import { render, screen } from '@testing-library/react'
import StatsPage from './StatsPage'

test('stats page shows heading', () => {
  render(<StatsPage />)
  expect(screen.getByRole('heading', { name: /stats/i })).toBeInTheDocument()
})

test('stats page shows link for group א', () => {
  render(<StatsPage />)
  expect(screen.getByRole('link', { name: /קבוצה א/ })).toHaveAttribute('href', '/stats/groups/A')
})

test('stats page shows all 12 group links', () => {
  render(<StatsPage />)
  const groupLinks = screen
    .getAllByRole('link')
    .filter(link => link.getAttribute('href')?.startsWith('/stats/groups/'))
  expect(groupLinks).toHaveLength(12)
})
