import { renderHook, act } from '@testing-library/react'
import { afterEach } from 'vitest'
import { useCurrentUser } from './useCurrentUser'

afterEach(() => localStorage.clear())

test('defaults to no user when nothing is stored', () => {
  const { result } = renderHook(() => useCurrentUser())
  expect(result.current.me).toBe('')
  expect(result.current.currentUser).toBeUndefined()
})

test('picking a participant resolves the user and persists the choice', () => {
  const { result } = renderHook(() => useCurrentUser())
  act(() => result.current.pickMe('עידן מלמד'))
  expect(result.current.currentUser?.label).toBe('עידן מלמד')
  expect(localStorage.getItem('hahimur.me')).toBe('עידן מלמד')
})

test('seeds the stored choice on mount', () => {
  localStorage.setItem('hahimur.me', 'עידן מלמד')
  const { result } = renderHook(() => useCurrentUser())
  expect(result.current.currentUser?.label).toBe('עידן מלמד')
})

test('separate consumers stay in sync when one picks', () => {
  const header = renderHook(() => useCurrentUser())
  const card = renderHook(() => useCurrentUser())
  act(() => header.result.current.pickMe('עידן מלמד'))
  expect(card.result.current.currentUser?.label).toBe('עידן מלמד')
})

test('clearing the choice removes the stored key', () => {
  localStorage.setItem('hahimur.me', 'עידן מלמד')
  const { result } = renderHook(() => useCurrentUser())
  act(() => result.current.pickMe(''))
  expect(result.current.currentUser).toBeUndefined()
  expect(localStorage.getItem('hahimur.me')).toBeNull()
})
