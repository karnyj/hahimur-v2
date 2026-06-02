import { render, within } from '@testing-library/react'
import StatsPage from './StatsPage'
import type { User } from '../../users/index'
import type { ThirdPlaceQualification, KnockoutStages, GroupMatch } from '../../shared/types'

const emptyKO: KnockoutStages = { r32: [], r16: [], qf: [], sf: [], thirdPlace: [], final: [] }
const emptyTP: ThirdPlaceQualification = { resolved: false, all: [], tied: [] }

function makeUser(label: string, predictedChampion: string, predictedFinalTeams?: string[]): User {
  return {
    label,
    predictions: {},
    topGoalscorer: '',
    groupTables: {},
    thirdPlaceQualification: emptyTP,
    groupMatches: {} as Record<string, GroupMatch[]>,
    knockoutStages: emptyKO,
    predictedChampion,
    predictedFinalTeams,
  }
}

const USERS: User[] = [
  makeUser('עידן', 'France', ['France', 'Brazil']),
  makeUser('ינייב', 'France', ['France', 'Argentina']),
  makeUser('תומר', 'France', ['France', 'Argentina']),
  makeUser('אורן', 'Brazil', ['France', 'Brazil']),
  makeUser('אלדד', 'Brazil', ['France', 'Brazil']),
  makeUser('טל', 'Portugal', ['Spain', 'Portugal']),
  makeUser('אלרד', 'Portugal', ['France', 'Portugal']),
  makeUser('רועי', 'Spain', ['Spain', 'Portugal']),
]

function getFinalsSection() {
  return document.querySelector('[data-section="finals"]')!
}

test('each team appears exactly once in finals section', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  expect(within(finals as HTMLElement).getAllByText('צרפת')).toHaveLength(1)
  expect(within(finals as HTMLElement).getAllByText('ברזיל')).toHaveLength(1)
  expect(within(finals as HTMLElement).getAllByText('ארגנטינה')).toHaveLength(1)
})

test('France row shows champion count 3', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  const row = within(finals as HTMLElement).getByText('צרפת').closest('li')!
  expect(row.querySelector('[data-col="champion"]')).toHaveTextContent('3')
})

test('France row shows runner-up count 3', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  const row = within(finals as HTMLElement).getByText('צרפת').closest('li')!
  expect(row.querySelector('[data-col="runner-up"]')).toHaveTextContent('3')
})

test('Argentina appears with champion count 0 and runner-up count 2', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  const row = within(finals as HTMLElement).getByText('ארגנטינה').closest('li')!
  expect(row.querySelector('[data-col="champion"]')).toHaveTextContent('0')
  expect(row.querySelector('[data-col="runner-up"]')).toHaveTextContent('2')
})

test('France row appears before Argentina row (sorted by champion count)', () => {
  render(<StatsPage users={USERS} />)
  const rows = Array.from(getFinalsSection().querySelectorAll('li'))
  const franceIdx = rows.findIndex(r => r.textContent?.includes('צרפת'))
  const argIdx = rows.findIndex(r => r.textContent?.includes('ארגנטינה'))
  expect(franceIdx).toBeLessThan(argIdx)
})

test('France row shows total finals count of 6 out of 8', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  const row = within(finals as HTMLElement).getByText('צרפת').closest('li')!
  expect(row.querySelector('[data-col="total"]')).toHaveTextContent('6 מתוך 8 העלו אותה לגמר')
})

test('France row shows champion pickers', () => {
  render(<StatsPage users={USERS} />)
  const finals = getFinalsSection()
  const row = within(finals as HTMLElement).getByText('צרפת').closest('li')!
  expect(row).toHaveTextContent('עידן')
  expect(row).toHaveTextContent('ינייב')
  expect(row).toHaveTextContent('תומר')
})

// ── Matchups section ────────────────────────────────────────────

test('matchups section shows France vs Brazil with count 3', () => {
  render(<StatsPage users={USERS} />)
  const list = document.querySelector('[data-section="matchups"]')!
  const row = Array.from(list.querySelectorAll('li')).find(
    li => li.textContent?.includes('צרפת') && li.textContent?.includes('ברזיל')
  )!
  expect(row.querySelector('[data-col="count"]')).toHaveTextContent('3')
})

test('matchups section shows each unique final once', () => {
  render(<StatsPage users={USERS} />)
  const list = document.querySelector('[data-section="matchups"]')!
  const rows = list.querySelectorAll('li')
  expect(rows.length).toBe(4)
})

test('France vs Brazil matchup appears before France vs Argentina (higher count)', () => {
  render(<StatsPage users={USERS} />)
  const list = document.querySelector('[data-section="matchups"]')!
  const rows = Array.from(list.querySelectorAll('li'))
  const fbIdx = rows.findIndex(r => r.textContent?.includes('צרפת') && r.textContent?.includes('ברזיל'))
  const faIdx = rows.findIndex(r => r.textContent?.includes('צרפת') && r.textContent?.includes('ארגנטינה'))
  expect(fbIdx).toBeLessThan(faIdx)
})

test('matchup row shows picker names', () => {
  render(<StatsPage users={USERS} />)
  const list = document.querySelector('[data-section="matchups"]')!
  const fbRow = Array.from(list.querySelectorAll('li')).find(
    li => li.textContent?.includes('צרפת') && li.textContent?.includes('ברזיל')
  )!
  expect(fbRow).toHaveTextContent('עידן')
  expect(fbRow).toHaveTextContent('אורן')
  expect(fbRow).toHaveTextContent('אלדד')
})
