import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach } from 'vitest'
import UserPicker from './UserPicker'

afterEach(() => localStorage.clear())

test('defaults to the placeholder when no one is identified', () => {
  render(<UserPicker />)
  expect(screen.getByRole('combobox')).toHaveValue('')
  expect(screen.getByRole('option', { name: 'בחר את השם שלך' })).toBeInTheDocument()
})

test('lists every participant as an option', () => {
  render(<UserPicker />)
  expect(screen.getByRole('option', { name: 'עידן מלמד' })).toBeInTheDocument()
})

test('picking a name persists the choice', () => {
  render(<UserPicker />)
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'עידן מלמד' } })
  expect(screen.getByRole('combobox')).toHaveValue('עידן מלמד')
  expect(localStorage.getItem('hahimur.me')).toBe('עידן מלמד')
})
