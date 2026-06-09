import { GROUPS, ALL_GROUP_LETTERS } from '../shared/groups'
import type { Scope } from './leaderboardRows'

export default function LeaderboardScopeBar({ scope, onScopeChange }: {
  scope: Scope
  onScopeChange: (s: Scope) => void
}) {
  return (
    <div className="lb-scope-bar">
      <button
        type="button"
        className={`lb-scope-btn lb-scope-btn--reset${scope === 'all' ? ' lb-scope-btn--active' : ''}`}
        onClick={() => onScopeChange('all')}
      >הכל</button>
      {ALL_GROUP_LETTERS.map(letter => (
        <button
          key={letter}
          type="button"
          className={`lb-scope-btn${scope === letter ? ' lb-scope-btn--active' : ''}`}
          onClick={() => onScopeChange(letter)}
        >{GROUPS[letter].he}</button>
      ))}
    </div>
  )
}
