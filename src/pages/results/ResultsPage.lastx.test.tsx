import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import ResultsPage from './ResultsPage'
import { makeUser } from '../../leaderboard/testFixtures'

// One real played match (A1, locked) where Dana's pick scored twice
vi.mock('../../tournament-results', () => ({
  tournamentResults: {
    groupMatches: {
      A: [{ id: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', matchDate: '11 ביוני', kickoffIST: '22:00', scores: { home: 2, away: 0 } }],
    },
    groupTables: {},
    playerMatchGoals: { 'קיליאן אמבפה': { A1: 2 } },
    playerGoals: { 'קיליאן אמבפה': 2 },
    thirdPlaceQualification: { resolved: false, all: [], tied: [] },
    knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
  },
}))

test('last-X scope on the results page shows goal points from real per-match data', async () => {
  const dana = makeUser({ label: 'Dana', topGoalscorer: 'קיליאן אמבפה' })
  render(<ResultsPage users={[dana]} />)

  await userEvent.click(screen.getByRole('button', { name: 'משחקים אחרונים' }))

  // 2 real goals in A1 (inside the window) × 3 pts = 6
  const danaRow = screen.getAllByRole('row').find(r => within(r).queryByText('Dana'))
  expect(danaRow).toBeDefined()
  expect(within(danaRow!).getAllByText('6').length).toBeGreaterThan(0)
})
