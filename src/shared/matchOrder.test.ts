import { kickoffDate, isLive } from './matchOrder'

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
