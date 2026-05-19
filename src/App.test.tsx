import { render, screen, within } from '@testing-library/react'
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

describe('Slice 3b — group standings table', () => {
  test('standings table shows all 4 Group A teams', () => {
    render(<App />)
    const table = screen.getByRole('table')
    expect(within(table).getByText('Mexico')).toBeInTheDocument()
    expect(within(table).getByText('South Africa')).toBeInTheDocument()
    expect(within(table).getByText('South Korea')).toBeInTheDocument()
    expect(within(table).getByText('Czech Republic')).toBeInTheDocument()
  })

  test('entering scores updates the standings', async () => {
    const { user, mexicoInput, southAfricaInput } = setup()
    await user.type(mexicoInput, '2')
    await user.type(southAfricaInput, '1')

    // After Mexico 2-1 South Africa: Mexico gets 3 pts, South Africa gets 0
    // "3" only appears in Mexico's points cell; "0" only in South Africa's points cell
    expect(within(screen.getByRole('row', { name: /Mexico/ })).getByText('3')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /South Africa/ })).getAllByText('0').length).toBeGreaterThan(0)
  })

  test('changing a score updates standings immediately', async () => {
    const { user, mexicoInput, southAfricaInput } = setup()
    await user.type(mexicoInput, '1')
    await user.type(southAfricaInput, '0')

    const mexicoRow = screen.getByRole('row', { name: /Mexico/ })
    expect(within(mexicoRow).getByText('3')).toBeInTheDocument()

    await user.clear(southAfricaInput)
    await user.type(southAfricaInput, '2')

    const southAfricaRow = screen.getByRole('row', { name: /South Africa/ })
    expect(within(southAfricaRow).getByText('3')).toBeInTheDocument()
  })
})
