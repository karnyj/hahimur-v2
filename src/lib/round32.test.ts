import { describe, it, expect } from 'vitest'
import { resolveRound32 } from './round32'
import type { ThirdPlaceQualification } from '../types'

// Minimal standing with known team name for testing
function standing(team: string) {
  return { team, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, points: 6 }
}

function groupData(group: string, first: string, second: string, third: string, allFilled = true) {
  return { group, allFilled, standings: [standing(first), standing(second), standing(third)] }
}

// Groups A-L with distinct team names; qualifying 3rd-place groups ABCDEFGH (scenario 1)
const ALL_GROUPS = [
  groupData('A', 'Mexico',      'South Africa',  'South Korea'),
  groupData('B', 'Canada',      'Switzerland',   'Qatar'),
  groupData('C', 'Brazil',      'Morocco',       'Haiti'),
  groupData('D', 'USA',         'Turkey',        'Australia'),
  groupData('E', 'Germany',     'Netherlands',   'Ivory Coast'),
  groupData('F', 'Netherlands2','Japan',         'Sweden'),
  groupData('G', 'Belgium',     'Egypt',         'Iran'),
  groupData('H', 'Spain',       'Cape Verde',    'Saudi Arabia'),
  groupData('I', 'Argentina',   'Chile',         'Peru'),
  groupData('J', 'France',      'Portugal',      'Italy'),
  groupData('K', 'England',     'Croatia',       'Ghana'),
  groupData('L', 'Brazil2',     'Colombia',      'Ecuador'),
]

// Resolved qualification: groups A-H qualify (scenario 1 of the matrix)
// 1A→3C, 1B→3A, 1D→3B, 1E→3F, 1G→3D, 1I→3G, 1K→3E, 1L→3H
const QUAL_ABCDEFGH: ThirdPlaceQualification = {
  resolved: true,
  all: [],
  qualifiers: [
    { ...standing('South Korea'),  group: 'A' },
    { ...standing('Qatar'),        group: 'B' },
    { ...standing('Haiti'),        group: 'C' },
    { ...standing('Australia'),    group: 'D' },
    { ...standing('Ivory Coast'),  group: 'E' },
    { ...standing('Sweden'),       group: 'F' },
    { ...standing('Iran'),         group: 'G' },
    { ...standing('Saudi Arabia'), group: 'H' },
  ],
}

describe('resolveRound32', () => {
  it('returns 16 matches', () => {
    const result = resolveRound32(ALL_GROUPS, QUAL_ABCDEFGH)
    expect(result).toHaveLength(16)
    expect(result.map(m => m.matchNum)).toEqual([73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88])
  })

  it('resolves all matches when groups are fully filled and qualification is resolved', () => {
    const result = resolveRound32(ALL_GROUPS, QUAL_ABCDEFGH)
    expect(result.every(m => m.resolved)).toBe(true)
  })

  it('resolves fixed runner-up matches from group standings', () => {
    const result = resolveRound32(ALL_GROUPS, QUAL_ABCDEFGH)
    const m73 = result.find(m => m.matchNum === 73)!
    expect(m73.home).toBe('South Africa')  // runner-up A
    expect(m73.away).toBe('Switzerland')   // runner-up B

    const m75 = result.find(m => m.matchNum === 75)!
    expect(m75.home).toBe('Netherlands2')  // winner F
    expect(m75.away).toBe('Morocco')       // runner-up C
  })

  it('resolves allocation-based matches via the matrix (scenario ABCDEFGH)', () => {
    const result = resolveRound32(ALL_GROUPS, QUAL_ABCDEFGH)
    // Combination 495 (ABCDEFGH): 1A→3H, 1B→3G, 1D→3B, 1E→3C, 1G→3A, 1I→3F, 1K→3D, 1L→3E
    const m79 = result.find(m => m.matchNum === 79)!  // 1A vs 3H
    expect(m79.home).toBe('Mexico')        // winner A
    expect(m79.away).toBe('Saudi Arabia')  // 3rd of H

    const m74 = result.find(m => m.matchNum === 74)!  // 1E vs 3C
    expect(m74.home).toBe('Germany')  // winner E
    expect(m74.away).toBe('Haiti')    // 3rd of C

    const m87 = result.find(m => m.matchNum === 87)!  // 1K vs 3D
    expect(m87.home).toBe('England')    // winner K
    expect(m87.away).toBe('Australia')  // 3rd of D
  })

  it('shows Hebrew placeholders when a group is not fully filled', () => {
    const partial = ALL_GROUPS.map(d =>
      d.group === 'A' ? { ...d, allFilled: false } : d
    )
    const result = resolveRound32(partial, QUAL_ABCDEFGH)

    const m73 = result.find(m => m.matchNum === 73)!
    expect(m73.resolved).toBe(false)
    expect(m73.home).toMatch(/מנצח|סגן/)  // Hebrew placeholder

    const m79 = result.find(m => m.matchNum === 79)!
    expect(m79.resolved).toBe(false)
    expect(m79.home).toMatch(/מנצח/)  // winner A placeholder
  })

  it('shows placeholder for allocation slots when third-place is unresolved', () => {
    const unresolved: ThirdPlaceQualification = {
      resolved: false,
      all: [],
      tied: [],
    }
    const result = resolveRound32(ALL_GROUPS, unresolved)

    // Allocation-based matches should be unresolved
    const allocMatches = [74, 77, 79, 80, 81, 82, 85, 87]
    for (const num of allocMatches) {
      const m = result.find(r => r.matchNum === num)!
      expect(m.resolved).toBe(false)
      expect(m.away).toBe('?')
    }

    // Fixed matches should still resolve
    const m73 = result.find(m => m.matchNum === 73)!
    expect(m73.resolved).toBe(true)
  })
})
