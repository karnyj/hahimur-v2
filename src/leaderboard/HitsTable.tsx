import React from 'react'
import type { HitsRow } from './leaderboardRows'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function HitsRows({ rows, delayMs, sortBy }: { rows: HitsRow[]; delayMs: number; sortBy: 'pgiya' | 'tzelifa' }) {
  return rows.map((row, i) => {
    const rank = i + 1
    const rankClass = rank <= 3 ? `lb-row--rank-${rank}` : 'lb-row--other'
    const count = sortBy === 'tzelifa' ? row.tzelifaCount : row.pgiyaCount
    return (
      <tr
        key={row.label}
        className={`lb-row ${rankClass}`}
        style={{ '--delay': `${i * delayMs}ms` } as React.CSSProperties}
      >
        <td className="lb-td lb-td--rank">{rank <= 3 ? MEDALS[rank] : rank}</td>
        <td className="lb-td lb-td--name">{row.label}</td>
        <td className="lb-td lb-td--scope-col">{count || '—'}</td>
      </tr>
    )
  })
}

export default function HitsTable({ rows, sortBy = 'tzelifa' }: { rows: HitsRow[]; sortBy?: 'pgiya' | 'tzelifa' }) {
  const colLabel = sortBy === 'tzelifa' ? 'צליפות' : 'פגיעות'

  return (
    <>
      <div className="lb-scroll lb-desktop">
        <table className="lb-table">
          <thead>
            <tr>
              <th className="lb-th lb-th--rank">#</th>
              <th className="lb-th lb-th--name">מהמר</th>
              <th className="lb-th lb-th--round">{colLabel}</th>
            </tr>
          </thead>
          <tbody>
            <HitsRows rows={rows} delayMs={90} sortBy={sortBy} />
          </tbody>
        </table>
      </div>

      <div className="lb-mobile">
        <table className="lb-table lb-table--mobile">
          <thead>
            <tr>
              <th className="lb-th lb-th--rank">#</th>
              <th className="lb-th lb-th--name">מהמר</th>
              <th className="lb-th lb-th--round">{colLabel}</th>
            </tr>
          </thead>
          <tbody>
            <HitsRows rows={rows} delayMs={60} sortBy={sortBy} />
          </tbody>
        </table>
      </div>
    </>
  )
}
