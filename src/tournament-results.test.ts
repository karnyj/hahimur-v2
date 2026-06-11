// @vitest-environment node
import { expect, test } from 'vitest'
import { derivePlayerGoals, tournamentResults } from './tournament-results'

test('derivePlayerGoals sums each player\'s goals across matches', () => {
  expect(derivePlayerGoals({
    'קיליאן אמבפה': { C1: 1, F2: 2 },
    'הארי קיין': { B2: 1 },
  })).toEqual({ 'קיליאן אמבפה': 3, 'הארי קיין': 1 })
})

test('tournamentResults carries per-match goals and derives the cumulative tally from them', () => {
  expect(tournamentResults.playerMatchGoals).toBeDefined()
  expect(tournamentResults.playerGoals).toEqual(derivePlayerGoals(tournamentResults.playerMatchGoals!))
})
