import { useState, useEffect, useRef } from 'react'
import { TEAMS } from '../../shared/groups'
import type { GroupVotes, GroupVotePickers } from './groupVotes'
import './GroupVoteMatrix.css'

interface Props {
  votes: GroupVotes
  pickers?: GroupVotePickers
}

interface Popup {
  pickerList: string[]
  teamName: string
  posLabel: string
  left: number
  top: number
  above: boolean
  arrowLeft: number
}

const POS_LABELS: Record<number, string> = { 0: 'מקום 1', 1: 'מקום 2', 2: 'מקום 3', 3: 'מקום 4' }

export default function GroupVoteMatrix({ votes, pickers }: Props) {
  const teams = Object.keys(votes)

  const [popup, setPopup] = useState<Popup | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!popup) return
    const onMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopup(null)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPopup(null) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [popup])

  const openPopup = (e: React.MouseEvent<HTMLDivElement>, pickerList: string[], teamName: string, posIdx: number) => {
    if (!pickerList.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const popupWidth = 190
    const rawLeft = rect.left + rect.width / 2 - popupWidth / 2
    const clampedLeft = Math.max(8, Math.min(rawLeft, window.innerWidth - popupWidth - 8))
    const above = rect.bottom + 160 > window.innerHeight
    setPopup({
      pickerList,
      teamName,
      posLabel: POS_LABELS[posIdx],
      left: clampedLeft,
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
      arrowLeft: rect.left + rect.width / 2 - clampedLeft,
    })
  }

  if (teams.length === 0) {
    return <p className="group-empty">אין הצבעות</p>
  }

  const sortedTeams = [...teams].sort((a, b) => {
    const wa = votes[a].reduce((sum, v, i) => sum + v * (4 - i), 0)
    const wb = votes[b].reduce((sum, v, i) => sum + v * (4 - i), 0)
    return wb - wa
  })

  const maxCount = Math.max(...teams.flatMap(t => votes[t]), 1)

  return (
    <>
      <div className="group-matrix">
        <div className="group-matrix__head">
          <div className="group-matrix__spacer" />
          {[1, 2, 3, 4].map(pos => (
            <div key={pos} className={`group-matrix__pos-head gm-pos--${pos}`}>
              <span className="gm-pos-num">{pos}</span>
              <span className="gm-pos-lbl">מקום</span>
            </div>
          ))}
        </div>

        {sortedTeams.map((team, rowIdx) => {
          const teamVotes = votes[team]
          const teamPickers = pickers?.[team]
          const teamMax = Math.max(...teamVotes)
          const { iso, he } = TEAMS[team]

          return (
            <div
              key={team}
              className="group-matrix__row"
              style={{ '--row-delay': `${rowIdx * 65}ms` } as React.CSSProperties}
            >
              <div className="group-matrix__team">
                <span className={`fi fi-${iso} gm-flag`} />
                <span className="gm-name">{he}</span>
              </div>

              {teamVotes.map((count, posIdx) => {
                const isTop = count > 0 && count === teamMax
                const fillPct = Math.round((count / maxCount) * 100)
                const cellPickers = teamPickers?.[posIdx] ?? []
                const interactive = pickers !== undefined && cellPickers.length > 0

                return (
                  <div
                    key={posIdx}
                    data-testid={`${team}-${posIdx + 1}`}
                    className={`group-matrix__cell${isTop ? ' gm-cell--top' : ''}${interactive ? ' gm-cell--interactive' : ''}`}
                    style={{
                      '--fill': `${fillPct}%`,
                      '--cell-delay': `${rowIdx * 65 + posIdx * 35}ms`,
                    } as React.CSSProperties}
                    onClick={interactive ? (e) => openPopup(e, cellPickers, he, posIdx) : undefined}
                  >
                    <span className="gm-count">{count}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {popup && (
        <div
          ref={popupRef}
          className={`stage-popup${popup.above ? ' stage-popup--above' : ''}`}
          style={{
            left: popup.left,
            top: popup.above ? undefined : popup.top,
            bottom: popup.above ? window.innerHeight - popup.top : undefined,
            '--arrow-left': `${popup.arrowLeft}px`,
          } as React.CSSProperties}
        >
          <div className="stage-popup-header">
            <span className="stage-popup-team">{popup.teamName}</span>
            <span className="stage-popup-stage">{popup.posLabel}</span>
          </div>
          <div className="stage-popup-pickers">
            {popup.pickerList.map(name => (
              <span key={name} className="stage-popup-picker">{name}</span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
