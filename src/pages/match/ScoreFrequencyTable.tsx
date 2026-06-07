import { isUnpredicted } from '../../shared/types'
import type { User } from '../../users/index'
import { compareScores } from './matchUtils'

export default function ScoreFrequencyTable({ matchId, users }: { matchId: string; users: User[] }) {
  const counts = new Map<string, number>()
  for (const u of users) {
    const p = u.predictions[matchId]
    if (!p || isUnpredicted(p)) continue
    const key = `${p.home}-${p.away}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  const parseKey = (key: string) => { const [h, aw] = key.split('-').map(Number); return { h, aw } }
  const maxCount = Math.max(...counts.values())
  const rows = [...counts.entries()]
    .sort((a, b) => { const pa = parseKey(a[0]), pb = parseKey(b[0]); return compareScores(pa.h, pa.aw, pb.h, pb.aw) })
    .map(([key, count]) => ({ key, count, pct: Math.round((count / total) * 100), isLeader: count === maxCount }))

  if (rows.length === 0) return null

  return (
    <div data-testid="score-freq-table" className="score-freq">
      {rows.map(({ key, count, pct, isLeader }, i) => (
        <div
          key={key}
          data-testid="score-freq-row"
          className={`score-freq__row${isLeader ? ' score-freq__row--leader' : ''}`}
          style={{ '--bar-pct': `${pct}%`, '--row-delay': `${i * 80}ms`, animationDelay: `${i * 80}ms` } as React.CSSProperties}
        >
          <div className="score-freq__content">
            <span className="score-freq__score">{key.split('-').reverse().join('–')}</span>
            <div className="score-freq__meta">
              <span className="score-freq__count">{count}</span>
              <span className="score-freq__pct">{pct}%</span>
            </div>
          </div>
          <div className="score-freq__track">
            <div className="score-freq__fill" />
          </div>
        </div>
      ))}
    </div>
  )
}
