import { useState, useEffect } from 'react'
import { clampGoals } from './ResultsPage'

interface Props {
  players: string[]
  realGoals: Record<string, number>
  defaultWinner: string | undefined
  pickersByPlayer?: Record<string, string[]>
  onChange: (goals: Record<string, number>, winner: string | undefined) => void
}

export default function GoalScorerSection({ players, realGoals, defaultWinner, pickersByPlayer, onChange }: Props) {
  const [playerGoals, setPlayerGoals] = useState<Record<string, number>>(realGoals)
  const [goldenBootWinner, setGoldenBootWinner] = useState<string | undefined>(defaultWinner)

  const maxGoals = Math.max(0, ...players.map(p => playerGoals[p] ?? 0))

  useEffect(() => {
    setGoldenBootWinner(prev => {
      if (!prev) return prev
      return maxGoals === 0 || (playerGoals[prev] ?? 0) < maxGoals ? undefined : prev
    })
  }, [playerGoals])

  useEffect(() => {
    onChange(playerGoals, goldenBootWinner)
  }, [playerGoals, goldenBootWinner])

  return (
    <div className="pg-scorer-list">
      {players.map(player => (
        <div key={player} className={`pg-scorer-row${goldenBootWinner === player ? ' pg-scorer-row--winner' : ''}`}>
          <input
            type="checkbox"
            aria-label={player}
            className="pg-scorer-checkbox"
            checked={goldenBootWinner === player}
            disabled={maxGoals === 0 || (playerGoals[player] ?? 0) < maxGoals}
            onChange={() => setGoldenBootWinner(prev => prev === player ? undefined : player)}
          />
          <div className="pg-scorer-player">
            <span className="pg-scorer-name">{player}</span>
            {pickersByPlayer?.[player]?.length ? (
              <div className="pg-scorer-pickers">
                {pickersByPlayer[player].map(label => (
                  <span key={label} className="pg-scorer-picker">{label}</span>
                ))}
              </div>
            ) : null}
          </div>
          <input
            type="number"
            aria-label={player}
            min={realGoals[player] ?? 0}
            className="pg-scorer-input"
            value={playerGoals[player] ?? 0}
            onChange={e => setPlayerGoals(prev => ({ ...prev, [player]: clampGoals(realGoals[player] ?? 0, Number(e.target.value)) }))}
          />
        </div>
      ))}
    </div>
  )
}
