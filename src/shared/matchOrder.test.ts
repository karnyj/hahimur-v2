import { kickoffDate } from './matchOrder'

test('kickoffDate converts Israel daylight time to UTC', () => {
  expect(kickoffDate('11 ביוני', '22:00')!.toISOString()).toBe('2026-06-11T19:00:00.000Z')
  expect(kickoffDate('12 ביולי', '04:00')!.toISOString()).toBe('2026-07-12T01:00:00.000Z')
})

test('kickoffDate returns null without a date or time', () => {
  expect(kickoffDate(undefined, '22:00')).toBeNull()
  expect(kickoffDate('11 ביוני', undefined)).toBeNull()
})
