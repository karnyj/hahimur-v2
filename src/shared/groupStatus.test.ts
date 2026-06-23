// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { deriveGroupStatus } from './groupStatus'
import type { PredictionsState } from './types'

// Symmetric 3-way cycle in Group A: Mexico/South Korea/Czech all end level on
// points, GD and goals — an unresolvable tie even with every match filled.
const tiedGroupA: PredictionsState = {
  A1: { home: 1, away: 1 },
  A2: { home: 0, away: 1 },
  A3: { home: 1, away: 1 },
  A4: { home: 0, away: 1 },
  A5: { home: 0, away: 1 },
  A6: { home: 1, away: 1 },
}

const completeGroupA: PredictionsState = {
  A1: { home: 2, away: 1 },
  A2: { home: 1, away: 0 },
  A3: { home: 3, away: 0 },
  A4: { home: 1, away: 2 },
  A5: { home: 0, away: 0 },
  A6: { home: 2, away: 2 },
}

test('no predictions: no ties, nothing complete, no group filled', () => {
  const { groupsWithTies, completedGroups, allGroupsFilled, allGroupData } = deriveGroupStatus({})
  expect(groupsWithTies.size).toBe(0)
  expect(completedGroups.size).toBe(0)
  expect(allGroupsFilled).toBe(false)
  expect(allGroupData.every(d => !d.allFilled && !d.isComplete)).toBe(true)
})

describe('a fully-filled group with no tie', () => {
  const { groupsWithTies, completedGroups } = deriveGroupStatus(completeGroupA)

  test('is marked complete', () => {
    expect(completedGroups.has('A')).toBe(true)
  })

  test('is not flagged as tied', () => {
    expect(groupsWithTies.has('A')).toBe(false)
  })
})

describe('a fully-filled group that is unresolvably tied', () => {
  const status = deriveGroupStatus(tiedGroupA)
  const groupA = status.allGroupData.find(d => d.group === 'A')!

  test('is flagged as tied', () => {
    expect(status.groupsWithTies.has('A')).toBe(true)
  })

  test('is not marked complete', () => {
    expect(status.completedGroups.has('A')).toBe(false)
    expect(groupA.allFilled).toBe(true)
    expect(groupA.isComplete).toBe(false)
  })
})

test('a partially-filled group is neither complete nor tied', () => {
  const { groupsWithTies, completedGroups, allGroupData } = deriveGroupStatus({ A1: { home: 2, away: 1 } })
  const groupA = allGroupData.find(d => d.group === 'A')!
  expect(groupA.allFilled).toBe(false)
  expect(completedGroups.has('A')).toBe(false)
  expect(groupsWithTies.has('A')).toBe(false)
})

test('allGroupsFilled stays false while only one group is filled', () => {
  expect(deriveGroupStatus(completeGroupA).allGroupsFilled).toBe(false)
})
