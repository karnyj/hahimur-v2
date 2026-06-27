import { describe, expect, test } from 'vitest'
import { buildStageSurvival, buildLiveTeamsStanding, buildLiveStages } from './survivorsStats'
import { EMPTY_RESULTS, makeUser } from '../../leaderboard/testFixtures'
import type { KnockoutMatch, TournamentResults } from '../../shared/types'

function ko(matchNum: number, home: string, away: string, scores?: KnockoutMatch['scores']): KnockoutMatch {
  return { matchNum, home, away, resolved: scores != null, scores }
}

const user = makeUser({
  predictedChampion: 'France',
  knockoutStages: {
    r32: [ko(73, 'France', 'England'), ko(74, 'Brazil', 'Germany')],
    r16: [ko(89, 'France', 'Brazil')],
    qf: [],
    sf: [],
    thirdPlace: [],
    final: [ko(104, 'France', 'Brazil')],
  },
})

describe('buildStageSurvival', () => {
  test('with no results everyone the user picked is still alive', () => {
    const stages = buildStageSurvival(user, EMPTY_RESULTS)
    const r32 = stages.find(s => s.key === 'r32')!
    expect(r32.total).toBe(4)
    expect(r32.alive).toBe(4)
    expect(r32.teams.every(t => t.alive)).toBe(true)

    const champion = stages.find(s => s.key === 'champion')!
    expect(champion.total).toBe(1)
    expect(champion.alive).toBe(1)
  })

  test('counts only teams still in the real tournament as alive', () => {
    // Real bracket: France knocks out England; Brazil and Germany are in the
    // bracket but their match isn't resolved, so they survive.
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      knockoutStages: {
        ...EMPTY_RESULTS.knockoutStages,
        r32: [ko(73, 'France', 'England', { home: 2, away: 0 }), ko(74, 'Brazil', 'Germany')],
      },
    }
    const stages = buildStageSurvival(user, results)

    const r32 = stages.find(s => s.key === 'r32')!
    expect(r32.total).toBe(4)
    expect(r32.alive).toBe(3) // England is out
    expect(r32.teams.find(t => t.team === 'England')!.alive).toBe(false)
    expect(r32.teams.find(t => t.team === 'France')!.alive).toBe(true)

    const r16 = stages.find(s => s.key === 'r16')!
    expect(r16.total).toBe(2)
    expect(r16.alive).toBe(2) // France + Brazil both still in

    const champion = stages.find(s => s.key === 'champion')!
    expect(champion.alive).toBe(1)
  })

  test('skips the champion row when no champion was picked', () => {
    const noChamp = makeUser({ knockoutStages: user.knockoutStages })
    const stages = buildStageSurvival(noChamp, EMPTY_RESULTS)
    expect(stages.some(s => s.key === 'champion')).toBe(false)
  })

  test('ignores unresolved descriptor slots, counting only real teams', () => {
    const withDescriptors = makeUser({
      knockoutStages: {
        ...EMPTY_RESULTS.knockoutStages,
        r32: [ko(73, 'France', 'סגנית א')],
      },
    })
    const stages = buildStageSurvival(withDescriptors, EMPTY_RESULTS)
    const r32 = stages.find(s => s.key === 'r32')!
    expect(r32.total).toBe(1)
    expect(r32.teams[0].team).toBe('France')
  })
})

describe('buildLiveTeamsStanding', () => {
  const wide = makeUser({
    label: 'רחב',
    knockoutStages: { ...EMPTY_RESULTS.knockoutStages, r32: [ko(73, 'France', 'England'), ko(74, 'Brazil', 'Germany')] },
  })
  const narrow = makeUser({
    label: 'צר',
    knockoutStages: { ...EMPTY_RESULTS.knockoutStages, r32: [ko(73, 'France', 'England')] },
  })

  test('counts distinct bracket teams still alive for every bettor', () => {
    const stand = buildLiveTeamsStanding([wide, narrow], EMPTY_RESULTS)
    const w = stand.find(s => s.label === 'רחב')!
    expect(w.total).toBe(4)
    expect(w.alive).toBe(4)
    expect(w.aliveTeams).toContain('France')
  })

  test('drops eliminated teams and ranks most-alive first', () => {
    // Real bracket: France knocks England out; Brazil/Germany are in but unplayed.
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      knockoutStages: {
        ...EMPTY_RESULTS.knockoutStages,
        r32: [ko(73, 'France', 'England', { home: 2, away: 0 }), ko(74, 'Brazil', 'Germany')],
      },
    }
    const stand = buildLiveTeamsStanding([narrow, wide], results)
    // wide: France + Brazil + Germany alive (England out) = 3 ; narrow: France = 1
    expect(stand.map(s => s.label)).toEqual(['רחב', 'צר']) // ranked by alive desc
    expect(stand[0].alive).toBe(3)
    expect(stand[0].outTeams).toEqual(['England'])
    expect(stand[1].alive).toBe(1)
  })

  test('counts a deduplicated set across stages plus the predicted champion', () => {
    const u = makeUser({
      label: 'אלוף',
      predictedChampion: 'Spain',
      knockoutStages: {
        ...EMPTY_RESULTS.knockoutStages,
        r32: [ko(73, 'France', 'England')],
        r16: [ko(89, 'France', 'England')], // same teams — must not double count
      },
    })
    const stand = buildLiveTeamsStanding([u], EMPTY_RESULTS)
    expect(stand[0].total).toBe(3) // France, England, Spain
  })
})

describe('buildLiveStages', () => {
  const u = makeUser({
    label: 'א',
    predictedChampion: 'France',
    knockoutStages: {
      ...EMPTY_RESULTS.knockoutStages,
      r32: [ko(73, 'France', 'England'), ko(74, 'Brazil', 'Germany')],
      final: [ko(104, 'France', 'England')],
      thirdPlace: [ko(103, 'Brazil', 'Germany')],
    },
  })

  test('references each stage to the teams the player sent there (final X/2, champion X/1)', () => {
    const stages = buildLiveStages([u], EMPTY_RESULTS)
    expect(stages.map(s => s.key)).toEqual(['r32', 'r16', 'qf', 'sf', 'thirdPlace', 'final', 'champion'])

    const final = stages.find(s => s.key === 'final')!
    expect(final.standings[0].total).toBe(2)
    expect(final.standings[0].alive).toBe(2)

    const champ = stages.find(s => s.key === 'champion')!
    expect(champ.standings[0].total).toBe(1)
    expect(champ.standings[0].alive).toBe(1)

    const third = stages.find(s => s.key === 'thirdPlace')!
    expect(third.standings[0].total).toBe(2)
  })

  test('drops a team knocked out on the pitch from its stage count', () => {
    // England loses its real R32 match → the predicted final is now 1 of 2 alive.
    const results: TournamentResults = {
      ...EMPTY_RESULTS,
      knockoutStages: {
        ...EMPTY_RESULTS.knockoutStages,
        r32: [ko(73, 'France', 'England', { home: 2, away: 0 }), ko(74, 'Brazil', 'Germany')],
      },
    }
    const final = buildLiveStages([u], results).find(s => s.key === 'final')!
    expect(final.standings[0].total).toBe(2)
    expect(final.standings[0].alive).toBe(1)
    expect(final.standings[0].outTeams).toEqual(['England'])
  })

  test('with no bracket given, reachable equals alive and nothing collides', () => {
    const final = buildLiveStages([u], EMPTY_RESULTS).find(s => s.key === 'final')!
    expect(final.standings[0].alive).toBe(2)
    expect(final.standings[0].reachable).toBe(2)
    expect(final.standings[0].collisions).toEqual([])
  })

  test('flags two finalists that must meet before the final (reachable < alive)', () => {
    const u2 = makeUser({
      label: 'מתנגש',
      knockoutStages: { ...EMPTY_RESULTS.knockoutStages, final: [ko(104, 'France', 'England')] },
    })
    // Real bracket: France in R32 #73, England in R32 #75 — same R16 match (90),
    // so they'd meet in the round of 16; both can't reach the final.
    const bracket: KnockoutMatch[] = [ko(73, 'France', 'Spain'), ko(75, 'England', 'Italy')]
    const final = buildLiveStages([u2], EMPTY_RESULTS, bracket).find(s => s.key === 'final')!
    const row = final.standings[0]
    expect(row.alive).toBe(2)
    expect(row.reachable).toBe(1)
    expect(row.collisions).toHaveLength(1)
    expect([...row.collisions[0].teams].sort()).toEqual(['England', 'France'])
    expect(row.collisions[0].roundLabel).toBe('שמינית')
  })

  test('no collision when the two finalists sit in opposite halves of the bracket', () => {
    const u2 = makeUser({
      label: 'נקי',
      knockoutStages: { ...EMPTY_RESULTS.knockoutStages, final: [ko(104, 'France', 'England')] },
    })
    // France #73 (top half → SF 101), England #76 (bottom half → SF 102).
    const bracket: KnockoutMatch[] = [ko(73, 'France', 'Spain'), ko(76, 'England', 'Italy')]
    const final = buildLiveStages([u2], EMPTY_RESULTS, bracket).find(s => s.key === 'final')!
    expect(final.standings[0].reachable).toBe(2)
    expect(final.standings[0].collisions).toHaveLength(0)
  })

  test('two R16 picks in the same R32 match collide at the round of 32', () => {
    const u2 = makeUser({
      label: 'ר16',
      knockoutStages: { ...EMPTY_RESULTS.knockoutStages, r16: [ko(89, 'France', 'England')] },
    })
    const bracket: KnockoutMatch[] = [ko(73, 'France', 'England')]
    const r16 = buildLiveStages([u2], EMPTY_RESULTS, bracket).find(s => s.key === 'r16')!
    expect(r16.standings[0].reachable).toBe(1)
    expect(r16.standings[0].collisions[0].roundLabel).toBe('שלב 32')
  })

  test('ranks a clashing bracket below a clean one of equal alive count', () => {
    const clash = makeUser({ label: 'מתנגש', knockoutStages: { ...EMPTY_RESULTS.knockoutStages, final: [ko(104, 'France', 'England')] } })
    const clean = makeUser({ label: 'נקי', knockoutStages: { ...EMPTY_RESULTS.knockoutStages, final: [ko(104, 'Brazil', 'Argentina')] } })
    // clash: France #73 & England #75 — same half (reachable 1).
    // clean: Brazil #73 & Argentina #76 — opposite halves (reachable 2).
    const bracket: KnockoutMatch[] = [ko(73, 'France', 'Brazil'), ko(75, 'England', 'Italy'), ko(76, 'Argentina', 'Spain')]
    const final = buildLiveStages([clash, clean], EMPTY_RESULTS, bracket).find(s => s.key === 'final')!
    expect(final.standings.map(s => s.label)).toEqual(['נקי', 'מתנגש'])
    expect(final.standings[0].reachable).toBe(2)
    expect(final.standings[1].reachable).toBe(1)
  })
})
