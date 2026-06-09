import React from 'react'
import type { HitsRow } from './leaderboardRows'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function HitsRows({ rows, delayMs }: { rows: HitsRow[]; delayMs: number }) {
  return rows.map((row, i) => {
    const rank = i + 1
    const rankClass = rank <= 3 ? `lb-row--rank-${rank}` : 'lb-row--other'
    return (
      <tr
        key={row.label}
        className={`lb-row ${rankClass}`}
        style={{ '--delay': `${i * delayMs}ms` } as React.CSSProperties}
      >
        <td className="lb-td lb-td--rank">{rank <= 3 ? MEDALS[rank] : rank}</td>
        <td className="lb-td lb-td--name">{row.label}</td>
        <td className="lb-td lb-td--scope-col">{row.tzelifaCount || '—'}</td>
        <td className="lb-td lb-td--scope-col">{row.pgiyaCount || '—'}</td>
      </tr>
    )
  })
}

export default function HitsTable({ rows }: { rows: HitsRow[] }) {
  return (
    <>
      <div className="lb-scroll lb-desktop">
        <table className="lb-table">
          <thead>
            <tr className="lb-th-phase-row">
              <th className="lb-th lb-th--rank" rowSpan={2}>#</th>
              <th className="lb-th lb-th--name" rowSpan={2}>מהמר</th>
              <th className="lb-th lb-th--phase lb-th--phase-group" colSpan={2}>פגיעות</th>
            </tr>
            <tr>
              <th className="lb-th lb-th--round">צליפות</th>
              <th className="lb-th lb-th--round">פגיעות</th>
            </tr>
          </thead>
          <tbody>
            <HitsRows rows={rows} delayMs={90} />
          </tbody>
        </table>
      </div>

      <div className="lb-mobile">
        <table className="lb-table lb-table--mobile">
          <thead>
            <tr>
              <th className="lb-th lb-th--rank">#</th>
              <th className="lb-th lb-th--name">מהמר</th>
              <th className="lb-th lb-th--round">צליפות</th>
              <th className="lb-th lb-th--round">פגיעות</th>
            </tr>
          </thead>
          <tbody>
            <HitsRows rows={rows} delayMs={60} />
          </tbody>
        </table>
      </div>
    </>
  )
}
