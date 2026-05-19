interface Props {
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  onChange: (home: number | null, away: number | null) => void
}

function ScoreInput({
  team,
  value,
  onChange,
}: {
  team: string
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <label>
      {team} score
      <input
        type="text"
        inputMode="numeric"
        aria-label={`${team} score`}
        value={value !== null ? String(value) : ''}
        onKeyDown={(e) => {
          const isDigit = /^\d$/.test(e.key)
          const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(e.key)
          if (!isDigit && !isControl) e.preventDefault()
        }}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') { onChange(null); return }
          const stripped = raw.replace(/^0+(\d)/, '$1')
          onChange(Number(stripped))
        }}
      />
    </label>
  )
}

export default function MatchRow({ homeTeam, awayTeam, homeScore, awayScore, onChange }: Props) {
  return (
    <div>
      <ScoreInput team={homeTeam} value={homeScore} onChange={(v) => onChange(v, awayScore)} />
      <span>vs</span>
      <ScoreInput team={awayTeam} value={awayScore} onChange={(v) => onChange(homeScore, v)} />
    </div>
  )
}
