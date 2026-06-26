import { render, screen } from '@testing-library/react'
import GroupPicker from './GroupPicker'

function chip(name: RegExp) {
  return screen.getByText(name).closest('.stats-group-chip') as HTMLElement
}

test('flags finished groups with the finished class and a done badge', () => {
  render(<GroupPicker finishedGroups={new Set(['A'])} />)

  const finished = chip(/בית א/)
  expect(finished).toHaveClass('stats-group-chip--finished')
  expect(finished.querySelector('.stats-group-chip__done')).not.toBeNull()
})

test('leaves unfinished groups unmarked', () => {
  render(<GroupPicker finishedGroups={new Set(['A'])} />)

  const unfinished = chip(/בית ב/)
  expect(unfinished).not.toHaveClass('stats-group-chip--finished')
  expect(unfinished.querySelector('.stats-group-chip__done')).toBeNull()
})

test('the done badge is decorative so the link/label name is unchanged', () => {
  render(<GroupPicker finishedGroups={new Set(['A'])} />)

  expect(screen.getByRole('link', { name: /^בית א$/ })).toBeInTheDocument()
})

test('the active finished group keeps both its active and finished marks', () => {
  render(<GroupPicker activeGroup="A" finishedGroups={new Set(['A'])} />)

  const active = chip(/בית א/)
  expect(active).toHaveClass('stats-group-chip--active')
  expect(active).toHaveClass('stats-group-chip--finished')
  expect(active.querySelector('.stats-group-chip__done')).not.toBeNull()
})
