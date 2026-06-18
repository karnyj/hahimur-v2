import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import ResultsPage from './ResultsPage'

// Skip the 27 prediction files that load transitively via useCurrentUser.
vi.mock('../../users/index', () => ({ get USERS() { return [] }, get USERS_SORTED() { return [] } }))

afterEach(() => {
  vi.restoreAllMocks()
})

test('switching the group stage to by-date scrolls the next unplayed match into view', async () => {
  const scrollSpy = vi
    .spyOn(Element.prototype, 'scrollIntoView')
    .mockImplementation(() => {})
  render(<ResultsPage users={[]} />)

  // open the group-stage accordion, then switch to the chronological view
  await userEvent.click(screen.getByRole('button', { name: 'שלב הבתים' }))
  await userEvent.click(screen.getByRole('button', { name: 'לפי תאריך' }))

  expect(scrollSpy).toHaveBeenCalled()
})
