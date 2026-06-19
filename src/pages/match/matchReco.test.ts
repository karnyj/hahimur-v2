import { describe, test, expect } from 'vitest'
import { recommendMatchOutcome } from './matchReco'
import { GROUP_MATCHES } from '../../shared/groups'
import { USERS } from '../../users'
import type { GroupMatch, MatchScores, TournamentResults } from '../../shared/types'

const user = USERS[0]

// Group A with the first `playedCount` matches scored, the rest open. Only the
// pieces the engine reads (groupMatches scores) need to be present; the
// simulation samples every other group from the canonical fixtures.
function resultsForGroupA(playedCount: number): TournamentResults {
  const score: MatchScores = { home: 1, away: 0 }
  const aMatches: GroupMatch[] = GROUP_MATCHES['A'].map((m, i) => ({
    ...m,
    scores: i < playedCount ? score : undefined,
  }))
  return {
    groupMatches: { A: aMatches },
    groupTables: {},
    thirdPlaceQualification: { resolved: false, all: [], tied: [] },
    knockoutStages: { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] },
  }
}

// Small but seeded so the suite is fast and deterministic; the invariants under
// test hold for any sample size.
const opts = { simBudget: 600, seed: 7 }

describe('recommendMatchOutcome', () => {
  test('returns three scored outcomes for an open match', () => {
    const rec = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    expect(rec.decided).toBe(false)
    expect(rec.scored).toBe(true)
    expect(rec.outcomes).toHaveLength(3)
    expect(rec.best).toBeDefined()
    expect(rec.naive).toBeDefined()
  })

  test('outcomes are sorted best (most expected points) first', () => {
    const rec = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    const pts = rec.outcomes.map(o => o.expPoints)
    expect([...pts].sort((a, b) => b - a)).toEqual(pts)
  })

  test('the recommended outcome never scores worse than the obvious one', () => {
    const rec = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    expect(rec.best!.expPoints).toBeGreaterThanOrEqual(rec.naive!.expPoints - 1e-9)
  })

  test('counterIntuitive iff the recommendation differs from the obvious pick', () => {
    const rec = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    expect(rec.counterIntuitive).toBe(rec.best!.want !== rec.naive!.want)
  })

  test('is deterministic for a fixed seed', () => {
    const a = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    const b = recommendMatchOutcome(user, 'A5', resultsForGroupA(4), opts)!
    expect(a.best!.want).toBe(b.best!.want)
    expect(a.best!.expPoints).toBe(b.best!.expPoints)
  })

  test('a finished match is marked decided with nothing to advise', () => {
    const rec = recommendMatchOutcome(user, 'A1', resultsForGroupA(4), opts)!
    expect(rec.decided).toBe(true)
    expect(rec.scored).toBe(false)
  })

  test('a live (in-progress) match is still advised, not treated as final', () => {
    const results = resultsForGroupA(4)
    results.live = { A5: { clock: "30'" } }
    // A5 carries a provisional live score but must stay open to advise on.
    results.groupMatches['A'] = results.groupMatches['A'].map(m =>
      m.id === 'A5' ? { ...m, scores: { home: 1, away: 0 } } : m,
    )
    const rec = recommendMatchOutcome(user, 'A5', results, opts)!
    expect(rec.decided).toBe(false)
    expect(rec.scored).toBe(true)
  })

  test('returns null for an unknown match id', () => {
    expect(recommendMatchOutcome(user, 'Z9', resultsForGroupA(4), opts)).toBeNull()
  })
})
