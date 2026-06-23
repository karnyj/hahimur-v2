import { render, screen, within } from '@testing-library/react'
import RoundOf16Venn from './RoundOf16Venn'
import type { KnockoutMatch } from '../../shared/types'
import type { User } from '../../users/index'

// A user whose Round-of-16 stage (matches 89-96) is exactly the given fixtures.
function makeUser(label: string, r16: KnockoutMatch[]): User {
  return {
    label,
    knockoutStages: { r32: [], r16, qf: [], sf: [], thirdPlace: [], final: [] },
  } as unknown as User
}

const ko = (matchNum: number, home: string, away: string): KnockoutMatch =>
  ({ matchNum, home, away, resolved: true, scores: { home: 1, away: 0 } })

const both = makeUser('AB', [ko(90, 'South Korea', 'Morocco'), ko(95, 'Canada', 'Egypt')])
const aOnly = makeUser('A', [ko(90, 'South Korea', 'Morocco')])
const bOnly = makeUser('B', [ko(90, 'Canada', 'Morocco')])

test('lists each bettor under the matching region', () => {
  render(<RoundOf16Venn teamA="South Korea" teamB="Canada" users={[both, aOnly, bOnly]} />)

  expect(within(screen.getByTestId('venn-region-a')).getByText('A')).toBeInTheDocument()
  expect(within(screen.getByTestId('venn-region-b')).getByText('B')).toBeInTheDocument()
  expect(within(screen.getByTestId('venn-region-both')).getByText('AB')).toBeInTheDocument()
})

test('a team counts whether it sits home or away in the bettor\'s R16, regardless of path', () => {
  const homeSide = makeUser('home', [ko(90, 'South Korea', 'Morocco')])
  const awaySide = makeUser('away', [ko(95, 'Argentina', 'South Korea')])
  render(<RoundOf16Venn teamA="South Korea" teamB="Canada" users={[homeSide, awaySide]} />)

  const a = screen.getByTestId('venn-region-a')
  expect(within(a).getByText('home')).toBeInTheDocument()
  expect(within(a).getByText('away')).toBeInTheDocument()
})

test('the diagram tallies each region and the legend carries the team totals', () => {
  render(<RoundOf16Venn teamA="South Korea" teamB="Canada" users={[both, aOnly, bOnly]} />)

  expect(screen.getByText('דרום קוריאה')).toBeInTheDocument()
  expect(screen.getByText('קנדה')).toBeInTheDocument()
  expect(screen.getByTestId('venn-count-a')).toHaveTextContent('1')
  expect(screen.getByTestId('venn-count-both')).toHaveTextContent('1')
  expect(screen.getByTestId('venn-count-b')).toHaveTextContent('1')
})

test('a crowded lobe still names everyone in its list below', () => {
  const crowd = Array.from({ length: 25 }, (_, i) =>
    makeUser(`fan${i}`, [ko(90, 'South Korea', 'Morocco')]))
  render(<RoundOf16Venn teamA="South Korea" teamB="Canada" users={crowd} />)

  const a = screen.getByTestId('venn-region-a')
  expect(within(a).getAllByTestId('venn-name')).toHaveLength(25)
  expect(screen.getByTestId('venn-count-a')).toHaveTextContent('25')
})

test('omits a region list entirely when nobody falls in it', () => {
  render(<RoundOf16Venn teamA="South Korea" teamB="Canada" users={[aOnly]} />)

  expect(screen.queryByTestId('venn-region-b')).not.toBeInTheDocument()
  expect(screen.queryByTestId('venn-region-both')).not.toBeInTheDocument()
})
