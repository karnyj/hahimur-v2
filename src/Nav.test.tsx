import { render, screen } from '@testing-library/react'
import Nav from './Nav'

beforeEach(() => localStorage.clear())

test('regular user sees only home and form links', () => {
  render(<Nav />)
  expect(screen.getByText('בית')).toBeInTheDocument()
  expect(screen.getByText('הטופס')).toBeInTheDocument()
  expect(screen.queryByText('תוצאות')).not.toBeInTheDocument()
})

test('ליכטטור sees forms and results links in addition to regular links', () => {
  localStorage.setItem('userName', 'ליכטטור')
  render(<Nav />)
  expect(screen.getByText('בית')).toBeInTheDocument()
  expect(screen.getByText('הטופס')).toBeInTheDocument()
  expect(screen.getByText('טפסים')).toBeInTheDocument()
  expect(screen.getByText('תוצאות')).toBeInTheDocument()
})
