import { render, screen, fireEvent } from '@testing-library/react'
import ResultsPage from './ResultsPage'
import { prepareResultsData } from './prepareResultsData'

const emptyData = prepareResultsData({})

// --- Slice 1: /results route renders a heading ---

test('results page shows תוצאות heading', () => {
  render(<ResultsPage data={emptyData} />)
  expect(screen.getByRole('heading', { name: 'תוצאות' })).toBeInTheDocument()
})

test('results page does not show the prediction form title', () => {
  render(<ResultsPage data={emptyData} />)
  expect(screen.queryByText('ההימור 2026')).not.toBeInTheDocument()
})

// --- Slice 3: Match scores shown read-only, no inputs ---

test('results page has no input elements', () => {
  render(<ResultsPage data={emptyData} />)
  expect(document.querySelectorAll('input')).toHaveLength(0)
})

// --- Slice 4: Group selector navigation ---

test('results page shows a group dropdown trigger', () => {
  render(<ResultsPage data={emptyData} />)
  expect(screen.getByRole('button', { name: /בית/ })).toBeInTheDocument()
})

test('selecting group B from dropdown switches the active group', () => {
  render(<ResultsPage data={emptyData} />)
  const trigger = screen.getByRole('button', { name: /בית/ })
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('option', { name: 'ב' }))
  expect(trigger).toHaveTextContent('ב')
})
