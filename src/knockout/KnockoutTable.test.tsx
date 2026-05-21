import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KnockoutTable from './KnockoutTable'
import type { KnockoutMatch, MatchScores } from '../shared/types'
import { vi } from 'vitest'

const noop = vi.fn()
const emptyPredictions: Record<string, MatchScores> = {}

const resolvedMatch: KnockoutMatch = {
  matchNum: 89, home: 'Germany', away: 'Mexico', resolved: true,
}

const unresolvedMatch: KnockoutMatch = {
  matchNum: 90, home: 'מנצח 73', away: 'מנצח 75', resolved: false,
}

// Partially resolved set: one known team, one placeholder (match unresolved overall)
const PARTIAL_MATCHES: KnockoutMatch[] = [
  { matchNum: 73, home: 'Mexico', away: 'סגן-אלוף ב', resolved: false },
  { matchNum: 74, home: 'Germany', away: 'Haiti', resolved: true },
  { matchNum: 75, home: 'מנצח קבוצה ו', away: '?', resolved: false },
]

describe('KnockoutTable — team name display', () => {
  test('shows Hebrew name for a known team', () => {
    render(<KnockoutTable matches={PARTIAL_MATCHES} predictions={emptyPredictions} onChange={noop} />)
    expect(screen.getByText('מקסיקו')).toBeInTheDocument()
    expect(screen.queryByText('Mexico')).not.toBeInTheDocument()
  })

  test('shows flag for a known team', () => {
    render(<KnockoutTable matches={PARTIAL_MATCHES} predictions={emptyPredictions} onChange={noop} />)
    expect(document.querySelector('.fi-mx')).not.toBeNull()
  })

  test('shows placeholder box (not flag) for an unknown slot', () => {
    render(<KnockoutTable matches={PARTIAL_MATCHES} predictions={emptyPredictions} onChange={noop} />)
    expect(document.querySelectorAll('.ko-slot-flag-ph').length).toBeGreaterThan(0)
  })

  test('shows Hebrew placeholder text for unresolved slots', () => {
    render(<KnockoutTable matches={PARTIAL_MATCHES} predictions={emptyPredictions} onChange={noop} />)
    expect(screen.getByText('סגן-אלוף ב')).toBeInTheDocument()
    expect(screen.getByText('מנצח קבוצה ו')).toBeInTheDocument()
  })

  test('renders correct number of match cards', () => {
    render(<KnockoutTable matches={PARTIAL_MATCHES} predictions={emptyPredictions} onChange={noop} />)
    expect(document.querySelectorAll('.ko-card')).toHaveLength(3)
  })
})

describe('KnockoutTable — score inputs enabled/disabled by resolved state', () => {
  test('score inputs are enabled for resolved matches', () => {
    render(<KnockoutTable matches={[resolvedMatch]} predictions={emptyPredictions} onChange={noop} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('.score-input')
    expect(inputs).toHaveLength(2)
    inputs.forEach(input => expect(input.disabled).toBe(false))
  })

  test('score inputs are disabled for unresolved matches', () => {
    render(<KnockoutTable matches={[unresolvedMatch]} predictions={emptyPredictions} onChange={noop} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('.score-input')
    expect(inputs).toHaveLength(2)
    inputs.forEach(input => expect(input.disabled).toBe(true))
  })

  test('shows inputs for all matches — enabled for resolved, disabled for unresolved', () => {
    render(<KnockoutTable matches={[resolvedMatch, unresolvedMatch]} predictions={emptyPredictions} onChange={noop} />)
    // 2 matches × 2 inputs = 4 total
    expect(document.querySelectorAll('.score-input')).toHaveLength(4)
  })
})

describe('KnockoutTable — unresolved match scores are null', () => {
  test('shows empty inputs for unresolved match even when predictions exist', () => {
    const predictions: Record<string, MatchScores> = { '90': { home: 3, away: 1 } }
    render(<KnockoutTable matches={[unresolvedMatch]} predictions={predictions} onChange={noop} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('.score-input')
    expect(inputs[0].value).toBe('')
    expect(inputs[1].value).toBe('')
  })
})

describe('KnockoutTable — onChange', () => {
  test('fires with correct matchNum key and scores when home score typed', async () => {
    const onChange = vi.fn()
    render(<KnockoutTable matches={[resolvedMatch]} predictions={emptyPredictions} onChange={onChange} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('.score-input')
    await userEvent.type(inputs[0], '2')
    expect(onChange).toHaveBeenCalledWith('89', { home: 2, away: null })
  })

  test('does not fire onChange when typing into a disabled (unresolved) input', async () => {
    const onChange = vi.fn()
    render(<KnockoutTable matches={[unresolvedMatch]} predictions={emptyPredictions} onChange={onChange} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('.score-input')
    await userEvent.type(inputs[0], '2')
    expect(onChange).not.toHaveBeenCalled()
  })
})
