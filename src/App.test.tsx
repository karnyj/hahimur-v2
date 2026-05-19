import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('predictions page shows title', () => {
  render(<App />)
  expect(screen.getByText('2026 World Cup Predictions')).toBeInTheDocument()
})

describe('Slice 2 — one match, fillable', () => {
  test('user enters valid scores for both teams', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '2')
    await user.type(screen.getByLabelText('South Africa score'), '1')

    expect(screen.getByLabelText('Mexico score')).toHaveValue('2')
    expect(screen.getByLabelText('South Africa score')).toHaveValue('1')
  })

  test('valid input: zero is accepted', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '0')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('0')
  })

  test('non-digit characters are blocked: minus sign is ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '-1')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('1')
  })

  test('non-digit characters are blocked: decimal point is ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '1.5')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('15')
  })

  test('non-digit characters are blocked: letters are ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), 'abc')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('')
  })

  test('non-digit characters are blocked: letter after digit is ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '1a')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('1')
  })

  test('non-digit characters are blocked: space is ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), ' ')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('')
  })

  test('non-digit characters are blocked: special character is ignored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '!')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('')
  })

  test('leading zeros are stripped: 0123 becomes 123', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Mexico score'), '0123')
    expect(screen.getByLabelText('Mexico score')).toHaveValue('123')
  })
})
