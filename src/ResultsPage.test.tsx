import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultsLoader from './ResultsLoader'
import ResultsPage from './ResultsPage'

// --- Slice 1: /results route renders a heading ---

test('results page shows תוצאות heading', () => {
  render(<ResultsPage results={{ predictions: {}, topGoalscorer: '' }} />)
  expect(screen.getByRole('heading', { name: 'תוצאות' })).toBeInTheDocument()
})

test('results page does not show the prediction form title', () => {
  render(<ResultsPage results={{ predictions: {}, topGoalscorer: '' }} />)
  expect(screen.queryByText('ההימור 2026')).not.toBeInTheDocument()
})

// --- Slice 2: Results page loads results.json ---

test('shows loading state while fetching', () => {
  vi.stubGlobal('fetch', () => new Promise(() => {})) // never resolves
  render(<ResultsLoader />)
  expect(screen.getByText(/טוען/)).toBeInTheDocument()
  vi.unstubAllGlobals()
})

test('renders results page after successful fetch', async () => {
  const mockResults = { predictions: {}, topGoalscorer: '' }
  vi.stubGlobal('fetch', () =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockResults) } as Response)
  )
  render(<ResultsLoader />)
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'תוצאות' })).toBeInTheDocument()
  )
  vi.unstubAllGlobals()
})

test('shows error message when results.json cannot be fetched', async () => {
  vi.stubGlobal('fetch', () => Promise.resolve({ ok: false, status: 404 } as Response))
  render(<ResultsLoader />)
  await waitFor(() =>
    expect(screen.getByRole('alert')).toBeInTheDocument()
  )
  vi.unstubAllGlobals()
})

// --- Slice 3: Match scores shown read-only, no inputs ---

test('results page has no input elements', () => {
  render(<ResultsPage results={{ predictions: {}, topGoalscorer: '' }} />)
  expect(document.querySelectorAll('input')).toHaveLength(0)
})

// --- Slice 4: Group selector navigation ---

test('clicking group ב shows group B label', async () => {
  const user = userEvent.setup()
  render(<ResultsPage results={{ predictions: {}, topGoalscorer: '' }} />)
  await user.click(screen.getByRole('button', { name: 'ב' }))
  expect(screen.getByRole('button', { name: 'ב' })).toHaveClass('group-cell--active')
})

// --- Slice 5: Champion banner ---

test('champion banner not shown when final has no result', () => {
  render(<ResultsPage results={{ predictions: {}, topGoalscorer: '' }} />)
  expect(screen.queryByText('אלופת העולם 2026')).not.toBeInTheDocument()
})
