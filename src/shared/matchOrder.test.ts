import { kickoffDate, isLive, latestBySortKey } from './matchOrder'

describe('latestBySortKey', () => {
  test('returns the chronologically last match', () => {
    const a = { id: 'a', matchDate: '11 ביוני', kickoffIST: '22:00' }
    const b = { id: 'b', matchDate: '12 ביוני', kickoffIST: '19:00' }
    expect(latestBySortKey([a, b])).toBe(b)
    expect(latestBySortKey([b, a])).toBe(b)
  })

  test('on a kickoff tie, prefers the later-listed match', () => {
    // Each group\'s final two matches kick off simultaneously; the group is
    // decided at its last listed match (e.g. A6, not A5), so the tie breaks last.
    const a5 = { id: 'A5', matchDate: '25 ביוני', kickoffIST: '04:00' }
    const a6 = { id: 'A6', matchDate: '25 ביוני', kickoffIST: '04:00' }
    expect(latestBySortKey([a5, a6])).toBe(a6)
  })

  test('returns null for an empty list', () => {
    expect(latestBySortKey([])).toBeNull()
  })
})

test('kickoffDate converts Israel daylight time to UTC', () => {
  expect(kickoffDate('11 ביוני', '22:00')!.toISOString()).toBe('2026-06-11T19:00:00.000Z')
  expect(kickoffDate('12 ביולי', '04:00')!.toISOString()).toBe('2026-07-12T01:00:00.000Z')
})

test('kickoffDate returns null without a date or time', () => {
  expect(kickoffDate(undefined, '22:00')).toBeNull()
  expect(kickoffDate('11 ביוני', undefined)).toBeNull()
})

describe('isLive', () => {
  // '11 ביוני' at 22:00 Israel daylight time = 2026-06-11T19:00Z
  const match = { matchDate: '11 ביוני', kickoffIST: '22:00' }

  test('false before kickoff', () => {
    expect(isLive(match, new Date('2026-06-11T18:59:00Z'))).toBe(false)
  })

  test('true at kickoff', () => {
    expect(isLive(match, new Date('2026-06-11T19:00:00Z'))).toBe(true)
  })

  test('true late in the match window', () => {
    expect(isLive(match, new Date('2026-06-11T21:59:00Z'))).toBe(true)
  })

  test('false after the match window ends', () => {
    expect(isLive(match, new Date('2026-06-11T22:00:00Z'))).toBe(false)
  })

  test('false when kickoff is unknown', () => {
    expect(isLive({}, new Date('2026-06-11T19:30:00Z'))).toBe(false)
  })
})
