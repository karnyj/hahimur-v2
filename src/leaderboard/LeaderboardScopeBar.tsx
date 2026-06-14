import { useState } from 'react'
import { GROUPS, ALL_GROUP_LETTERS } from '../shared/groups'
import type { GroupLetter } from '../shared/groups'
import type { Scope } from './leaderboardRows'

const isGroupScope = (s: Scope): s is GroupLetter => s !== 'all' && s !== 'lastX' && s !== 'asOf'

export default function LeaderboardScopeBar({ scope, onScopeChange, lastX, onLastXChange, asOfIndex, onAsOfChange, playedMatchIds }: {
  scope: Scope
  onScopeChange: (s: Scope) => void
  lastX: number
  onLastXChange: (n: number) => void
  asOfIndex: number
  onAsOfChange: (n: number) => void
  playedMatchIds: string[]
}) {
  // remembered so re-entering "לפי בית" lands on the group you were viewing
  const [lastGroup, setLastGroup] = useState<GroupLetter>(isGroupScope(scope) ? scope : 'A')
  const mode = scope === 'all' ? 'all' : scope === 'lastX' ? 'lastX' : scope === 'asOf' ? 'asOf' : 'group'
  const playedCount = playedMatchIds.length
  const currentMatchId = playedMatchIds[asOfIndex - 1]

  const modeBtn = (active: boolean) =>
    `lb-scope-mode${active ? ' lb-scope-mode--active' : ''}`

  return (
    <div className="lb-scope-bar">
      <div className="lb-scope-modes">
        <button
          type="button"
          className={modeBtn(mode === 'all')}
          aria-pressed={mode === 'all'}
          onClick={() => onScopeChange('all')}
        >הכל</button>
        <button
          type="button"
          className={modeBtn(mode === 'group')}
          aria-pressed={mode === 'group'}
          onClick={() => onScopeChange(lastGroup)}
        >לפי בית</button>
        <button
          type="button"
          className={modeBtn(mode === 'lastX')}
          aria-pressed={mode === 'lastX'}
          onClick={() => onScopeChange('lastX')}
        >משחקים אחרונים</button>
        <button
          type="button"
          className={modeBtn(mode === 'asOf')}
          aria-pressed={mode === 'asOf'}
          onClick={() => onScopeChange('asOf')}
        >לפי משחק</button>
      </div>

      {mode === 'group' && (
        <div className="lb-scope-row">
          {ALL_GROUP_LETTERS.map(letter => (
            <button
              key={letter}
              type="button"
              className={`lb-scope-group${scope === letter ? ' lb-scope-group--active' : ''}`}
              aria-pressed={scope === letter}
              onClick={() => { setLastGroup(letter); onScopeChange(letter) }}
            >{GROUPS[letter].he}</button>
          ))}
        </div>
      )}

      {mode === 'lastX' && (
        <div className="lb-scope-row">
          <div className="lb-lastx-stepper" role="group" aria-label="מספר משחקים אחרונים">
            <button
              type="button"
              className="lb-lastx-step"
              onClick={() => onLastXChange(lastX + 1)}
              aria-label="עוד משחק"
            >+</button>
            <input
              type="number"
              className="lb-lastx-input"
              min={1}
              value={lastX}
              onChange={e => onLastXChange(Math.max(1, Number(e.target.value) || 1))}
              aria-label="מספר משחקים אחרונים"
            />
            <button
              type="button"
              className="lb-lastx-step"
              onClick={() => onLastXChange(Math.max(1, lastX - 1))}
              disabled={lastX <= 1}
              aria-label="פחות משחק"
            >−</button>
          </div>
          <span className="lb-lastx-caption">משחקים אחרונים ששוחקו</span>
        </div>
      )}

      {mode === 'asOf' && (
        <div className="lb-scope-row">
          {playedCount === 0 ? (
            <span className="lb-lastx-caption">אין עדיין משחקים ששוחקו</span>
          ) : (
            <>
              <input
                type="range"
                className="lb-asof-slider"
                min={1}
                max={playedCount}
                value={asOfIndex}
                onChange={e => onAsOfChange(Number(e.target.value))}
                aria-label="מצב הטבלה אחרי משחק"
              />
              <span className="lb-lastx-caption">
                אחרי משחק {asOfIndex}/{playedCount} · {currentMatchId}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
