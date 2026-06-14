import { render, screen } from '@testing-library/react'
import StatsPage from './StatsPage'
import { ALL_GROUP_LETTERS, GROUP_HEBREW } from '../../shared/groups'

test('shows a link to each group stats page', () => {
  render(<StatsPage users={[]} />)
  for (const letter of ALL_GROUP_LETTERS) {
    const link = screen.getByRole('link', { name: new RegExp(`בית ${GROUP_HEBREW[letter]}$`) })
    expect(link).toHaveAttribute('href', `/stats/groups/${letter.toLowerCase()}`)
  }
})
