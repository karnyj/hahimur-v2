import type { Score } from '../shared/types'

const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']

const isDigit = (key: string) => /^\d$/.test(key)
const isControlKey = (key: string) => CONTROL_KEYS.includes(key)
const stripLeadingZeros = (value: string) => value.replace(/^0+(\d)/, '$1')

interface Props {
  label: string
  value: Score
  onChange: (v: Score) => void
  disabled?: boolean
}

export default function ScoreInput({ label, value, onChange, disabled = false }: Props) {
  return (
    <input
      className="score-input"
      type="text"
      inputMode="numeric"
      placeholder="—"
      aria-label={label}
      disabled={disabled}
      value={value !== null ? String(value) : ''}
      onKeyDown={(e) => {
        if (!isDigit(e.key) && !isControlKey(e.key)) e.preventDefault()
      }}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === '') { onChange(null); return }
        onChange(Number(stripLeadingZeros(raw)))
      }}
    />
  )
}
