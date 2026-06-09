export type Mode = 'points' | 'hits'

export default function LeaderboardModeBar({ mode, onModeChange }: {
  mode: Mode
  onModeChange: (m: Mode) => void
}) {
  return (
    <div className="lb-mode-bar">
      <button
        type="button"
        className={`lb-scope-btn${mode === 'points' ? ' lb-scope-btn--active' : ''}`}
        onClick={() => onModeChange('points')}
      >נקודות</button>
      <button
        type="button"
        className={`lb-scope-btn${mode === 'hits' ? ' lb-scope-btn--active' : ''}`}
        onClick={() => onModeChange('hits')}
      >פגיעות</button>
    </div>
  )
}
