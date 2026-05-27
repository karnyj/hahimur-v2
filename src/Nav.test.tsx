import { render, screen } from '@testing-library/react'
import Nav from './Nav'

beforeEach(() => localStorage.clear())

test('regular user sees home and form links', () => {
  render(<Nav />)
  expect(screen.getByText('בית')).toBeInTheDocument()
  expect(screen.getByText('הטופס')).toBeInTheDocument()
  expect(screen.queryByText('תוצאות')).not.toBeInTheDocument()
})

test('ליכטטור sees admin links but not home link', () => {
  localStorage.setItem('userName', 'ליכטטור')
  render(<Nav />)
  expect(screen.queryByText('בית')).not.toBeInTheDocument()
  expect(screen.getByText('הטופס')).toBeInTheDocument()
  expect(screen.getByText('טפסים')).toBeInTheDocument()
  expect(screen.getByText('הטבלה')).toBeInTheDocument()
})

test('ליכטטור sees stats link', () => {
  localStorage.setItem('userName', 'ליכטטור')
  render(<Nav />)
  expect(screen.getByText('סטטיסטיקות')).toBeInTheDocument()
})

test('regular user does not see stats link', () => {
  render(<Nav />)
  expect(screen.queryByText('סטטיסטיקות')).not.toBeInTheDocument()
})
