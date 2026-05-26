import { render, screen } from '@testing-library/react'
import GroupPage from './GroupPage'

test('shows the group heading', () => {
  render(<GroupPage groupName="בית א" votes={{}} />)
  expect(screen.getByText('בית א')).toBeInTheDocument()
})

test('shows a message when there are no votes', () => {
  render(<GroupPage groupName="בית א" votes={{}} />)
  expect(screen.getByText('אין הצבעות')).toBeInTheDocument()
})

test('shows the Hebrew name for a team', () => {
  render(<GroupPage groupName="בית א" votes={{ Mexico: [1, 0, 0, 0] }} />)
  expect(screen.getByText('מקסיקו')).toBeInTheDocument()
})

test('shows all 4 position vote counts for a team', () => {
  render(<GroupPage groupName="בית א" votes={{ Mexico: [3, 1, 0, 1] }} />)
  expect(screen.getByTestId('Mexico-1')).toHaveTextContent('3')
  expect(screen.getByTestId('Mexico-2')).toHaveTextContent('1')
  expect(screen.getByTestId('Mexico-3')).toHaveTextContent('0')
  expect(screen.getByTestId('Mexico-4')).toHaveTextContent('1')
})

test('shows correct vote counts for all positions across multiple teams', () => {
  const votes = {
    Mexico:           [2, 1, 1, 1],
    'South Africa':   [1, 2, 1, 1],
    'South Korea':    [1, 1, 2, 1],
    'Czech Republic': [1, 1, 1, 2],
  }
  render(<GroupPage groupName="בית א" votes={votes} />)
  expect(screen.getByTestId('Mexico-1')).toHaveTextContent('2')
  expect(screen.getByTestId('South Africa-2')).toHaveTextContent('2')
  expect(screen.getByTestId('South Korea-3')).toHaveTextContent('2')
  expect(screen.getByTestId('Czech Republic-4')).toHaveTextContent('2')
})
