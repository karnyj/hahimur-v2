import { render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import Nav from './Nav'

afterEach(() => localStorage.clear())

test('shows all nav links', () => {
  render(<Nav />)
  expect(screen.getByText('בית')).toBeInTheDocument()
  expect(screen.getByText('טפסים')).toBeInTheDocument()
  expect(screen.getByText('תוצאות')).toBeInTheDocument()
  expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument()
})

// The nav is the one element rendered on every page, so carrying the global
// identity picker here is what makes it appear everywhere.
test('carries the global user picker', () => {
  render(<Nav />)
  expect(screen.getByRole('combobox')).toBeInTheDocument()
})
