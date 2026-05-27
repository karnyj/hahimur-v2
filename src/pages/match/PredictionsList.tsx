import { isUnpredicted } from '../../shared/types'
import type { User } from '../../users/index'
import { compareScores } from './matchUtils'

export default function PredictionsList({ matchId, users }: { matchId: string; users: User[] }) {
  if (users.length === 0) {
    return <p className="match-predictions__empty">אין תחזיות למשחק זה</p>
  }

  const score = (v: number | null) => v !== null ? String(v) : '–'

  const sorted = [...users].sort((a, b) => {
    const pa = a.predictions[matchId], pb = b.predictions[matchId]
    const ua = !pa || isUnpredicted(pa), ub = !pb || isUnpredicted(pb)
    if (ua && ub) return a.label.localeCompare(b.label, 'he')
    if (ua) return 1
    if (ub) return -1
    return compareScores(pa.home!, pa.away!, pb.home!, pb.away!) || a.label.localeCompare(b.label, 'he')
  })

  return (
    <>
      {sorted.map((u, i) => {
        const p = u.predictions[matchId]
        const unpredicted = !p || isUnpredicted(p)
        return (
          <div
            key={u.label}
            className={`prediction-row${unpredicted ? ' prediction-row--unpredicted' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="prediction-row__name">{u.label}</span>
            <div className="prediction-row__score">
              <span className="prediction-row__digit">{score(p?.away ?? null)}</span>
              <span className="prediction-row__sep">–</span>
              <span className="prediction-row__digit">{score(p?.home ?? null)}</span>
            </div>
          </div>
        )
      })}
    </>
  )
}
