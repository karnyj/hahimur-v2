import { render, screen } from '@testing-library/react'
import GroupStatsPage, { splitByFinished } from './GroupStatsPage'
import type { Match, MatchScores } from '../../../shared/types'
import { vi } from 'vitest'

vi.mock('../../../users/index', () => ({ get USERS() { return [] } }))
// Global chrome is covered by Nav.test; stub it out of page-level assertions.
vi.mock('../../../Nav', () => ({ default: () => null, USER_STORAGE_EVENT: 'userStorageUpdated' }))

test('renders group A heading', () => {
  render(<GroupStatsPage groupLetter="A" />)
  expect(screen.getByRole('heading', { name: /קבוצה א/i })).toBeInTheDocument()
})

test('shows standings section', () => {
  render(<GroupStatsPage groupLetter="A" />)
  expect(screen.getByText(/טבלת הבית/)).toBeInTheDocument()
})

test('shows predictions section', () => {
  render(<GroupStatsPage groupLetter="A" />)
  expect(screen.getByText('תחזיות הקבוצה')).toBeInTheDocument()
})

test('shows matches section', () => {
  render(<GroupStatsPage groupLetter="A" />)
  expect(screen.getByText('תוצאות הבית')).toBeInTheDocument()
})

test('shows group A teams', () => {
  render(<GroupStatsPage groupLetter="A" />)
  expect(screen.getAllByText('מקסיקו').length).toBeGreaterThan(0)
})

describe('splitByFinished', () => {
  const m = (id: string): Match => ({ id, homeTeam: 'A', awayTeam: 'B' })
  const scores: Record<string, MatchScores> = {
    A1: { home: 2, away: 0 }, // finished
    A2: { home: null, away: null }, // not played
    A3: { home: 1, away: null }, // in progress / partial → not finished
  }

  test('a match with both scores recorded is finished', () => {
    const { finished } = splitByFinished([m('A1')], scores)
    expect(finished.map(x => x.id)).toEqual(['A1'])
  })

  test('matches without both scores stay in remaining', () => {
    const { remaining } = splitByFinished([m('A2'), m('A3')], scores)
    expect(remaining.map(x => x.id)).toEqual(['A2', 'A3'])
  })

  test('a match missing from the scores map counts as remaining', () => {
    const { remaining, finished } = splitByFinished([m('A9')], scores)
    expect(remaining.map(x => x.id)).toEqual(['A9'])
    expect(finished).toEqual([])
  })

  test('preserves the original order within each bucket', () => {
    const { remaining, finished } = splitByFinished([m('A1'), m('A2'), m('A3')], scores)
    expect(finished.map(x => x.id)).toEqual(['A1'])
    expect(remaining.map(x => x.id)).toEqual(['A2', 'A3'])
  })
})
