import { describe, it, expect } from 'vitest'
import { deriveKnockoutStages } from './deriveKnockoutStages'
import type { MatchScores, PredictionsState } from '../../shared/types'

// No group results: every R32 fixture is still an unresolved placeholder, but a
// koScores entry must still attach to the right match in the right bucket. This
// isolates the score-attachment + bucketing from team resolution.
describe('deriveKnockoutStages', () => {
  const noGroups: PredictionsState = {}

  it('attaches a koScores entry to its match in r32', () => {
    const ko: Record<string, MatchScores> = { '73': { home: 2, away: 1 } }
    const stages = deriveKnockoutStages(noGroups, ko)
    const m73 = stages.r32.find(m => m.matchNum === 73)
    expect(m73?.scores).toEqual({ home: 2, away: 1 })
  })

  it('carries drawWinner through to the match', () => {
    const ko: Record<string, MatchScores> = { '73': { home: 1, away: 1, drawWinner: 'away' } }
    const stages = deriveKnockoutStages(noGroups, ko)
    expect(stages.r32.find(m => m.matchNum === 73)?.scores).toEqual({ home: 1, away: 1, drawWinner: 'away' })
  })

  it('leaves matches without a koScores entry without scores', () => {
    const stages = deriveKnockoutStages(noGroups, { '73': { home: 2, away: 1 } })
    expect(stages.r32.find(m => m.matchNum === 74)?.scores).toBeUndefined()
  })

  it('buckets each matchNum into the right round', () => {
    const stages = deriveKnockoutStages(noGroups, {})
    expect(stages.r32.map(m => m.matchNum)).toContain(73)
    expect(stages.r32.map(m => m.matchNum)).toContain(88)
    expect(stages.r16.map(m => m.matchNum)).toContain(89)
    expect(stages.qf.map(m => m.matchNum)).toContain(97)
    expect(stages.sf.map(m => m.matchNum)).toContain(101)
    expect(stages.thirdPlace.map(m => m.matchNum)).toEqual([103])
    expect(stages.final.map(m => m.matchNum)).toEqual([104])
  })
})
