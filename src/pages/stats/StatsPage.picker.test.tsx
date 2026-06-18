import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import StatsPage from './StatsPage'
import { ALL_GROUP_LETTERS, GROUP_HEBREW } from '../../shared/groups'

// StatsPage defaults `users` to the USERS barrel; these tests pass their own
// prop, so stub it to skip loading the 27 prediction files.
vi.mock('../../users/index', () => ({ get USERS() { return [] }, get USERS_SORTED() { return [] } }))

test('shows a link to each group stats page', () => {
  render(<StatsPage users={[]} />)
  for (const letter of ALL_GROUP_LETTERS) {
    const link = screen.getByRole('link', { name: new RegExp(`בית ${GROUP_HEBREW[letter]}$`) })
    expect(link).toHaveAttribute('href', `/stats/groups/${letter.toLowerCase()}`)
  }
})
