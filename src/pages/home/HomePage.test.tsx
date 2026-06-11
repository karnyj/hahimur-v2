import { render, screen } from '@testing-library/react'
import { vi, afterEach } from 'vitest'
import HomePage from './HomePage'

afterEach(() => {
  vi.useRealTimers()
})

test('home page shows the next match card during the group stage', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-12T00:00:00Z'))
  render(<HomePage />)
  expect(screen.getByTestId('next-match')).toBeInTheDocument()
})

test('home page shows title', () => {
  render(<HomePage />)
  expect(screen.getByText('ההימור 2026')).toBeInTheDocument()
})

test('home page shows welcome message', () => {
  render(<HomePage />)
  expect(screen.getByText('ברוכים הבאים להימור המסורתי שלנו!')).toBeInTheDocument()
})
