import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import FormView from './FormView'

afterEach(() => {
  vi.unstubAllGlobals()
})

declare global {
  interface Window { happyDOM: { setURL(url: string): void } }
}

test('switching to by-date reports the click to /api/date-view-click', async () => {
  window.happyDOM.setURL('https://hahimur.vercel.app/')
  const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}'))
  vi.stubGlobal('fetch', fetchMock)
  render(<FormView predictions={{}} topGoalscorer="" />)

  await userEvent.click(screen.getByRole('button', { name: 'לפי תאריך' }))

  expect(fetchMock).toHaveBeenCalledWith('/api/date-view-click', { method: 'POST' })
})

test('clicks from localhost are not counted', async () => {
  window.happyDOM.setURL('http://localhost:5173/')
  const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}'))
  vi.stubGlobal('fetch', fetchMock)
  render(<FormView predictions={{}} topGoalscorer="" />)

  await userEvent.click(screen.getByRole('button', { name: 'לפי תאריך' }))

  expect(fetchMock).not.toHaveBeenCalled()
})

test('the view still switches when the click report fails', async () => {
  window.happyDOM.setURL('https://hahimur.vercel.app/')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
  render(<FormView predictions={{}} topGoalscorer="" />)

  await userEvent.click(screen.getByRole('button', { name: 'לפי תאריך' }))

  // no crash — the by-date view rendered (first match is June 11)
  expect(screen.getByText('11 ביוני')).toBeInTheDocument()
})
