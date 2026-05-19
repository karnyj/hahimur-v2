import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

function setup() {
  const user = userEvent.setup()
  render(<App />)
  const mexicoInput = screen.getByLabelText('Mexico score')
  const southAfricaInput = screen.getByLabelText('South Africa score')
  return { user, mexicoInput, southAfricaInput }
}

test('predictions page shows title', () => {
  render(<App />)
  expect(screen.getByText('2026 World Cup Predictions')).toBeInTheDocument()
})

describe('Slice 2 — one match, fillable', () => {
  test('user enters valid scores for both teams', async () => {
    const { user, mexicoInput, southAfricaInput } = setup()
    await user.type(mexicoInput, '2')
    await user.type(southAfricaInput, '1')
    expect(mexicoInput).toHaveValue('2')
    expect(southAfricaInput).toHaveValue('1')
  })

  test('valid input: zero is accepted', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '0')
    expect(mexicoInput).toHaveValue('0')
  })

  test('non-digit characters are blocked: minus sign is ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '-1')
    expect(mexicoInput).toHaveValue('1')
  })

  test('non-digit characters are blocked: decimal point is ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '1.5')
    expect(mexicoInput).toHaveValue('15')
  })

  test('non-digit characters are blocked: letters are ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, 'abc')
    expect(mexicoInput).toHaveValue('')
  })

  test('non-digit characters are blocked: letter after digit is ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '1a')
    expect(mexicoInput).toHaveValue('1')
  })

  test('non-digit characters are blocked: space is ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, ' ')
    expect(mexicoInput).toHaveValue('')
  })

  test('non-digit characters are blocked: special character is ignored', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '!')
    expect(mexicoInput).toHaveValue('')
  })

  test('leading zeros are stripped: 0123 becomes 123', async () => {
    const { user, mexicoInput } = setup()
    await user.type(mexicoInput, '0123')
    expect(mexicoInput).toHaveValue('123')
  })
})
