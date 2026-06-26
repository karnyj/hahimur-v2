import { ALL_GROUP_LETTERS, GROUP_HEBREW } from '../../shared/groups'
import type { GroupLetter } from '../../shared/groups'
import { finishedGroupLetters } from '../../shared/standings'
import { tournamentResults } from '../../tournament-results'
import './GroupPicker.css'

interface Props {
  activeGroup?: GroupLetter
  // Group letters whose real fixtures are all played out; defaults to the baked
  // tournament results so callers don't have to thread it through.
  finishedGroups?: Set<string>
}

export default function GroupPicker({
  activeGroup,
  finishedGroups = finishedGroupLetters(tournamentResults),
}: Props) {
  return (
    <nav className="stats-group-picker" aria-label="סטטיסטיקות לפי בית">
      {ALL_GROUP_LETTERS.map(letter => {
        const isFinished = finishedGroups.has(letter)
        const isActive = letter === activeGroup
        const className = [
          'stats-group-chip',
          isActive && 'stats-group-chip--active',
          isFinished && 'stats-group-chip--finished',
        ].filter(Boolean).join(' ')
        const label = (
          <>
            בית {GROUP_HEBREW[letter]}
            {isFinished && (
              <span className="stats-group-chip__done" aria-hidden="true" title="הבית הסתיים">✓</span>
            )}
          </>
        )
        return isActive ? (
          <span key={letter} className={className} aria-current="page">
            {label}
          </span>
        ) : (
          <a key={letter} href={`/stats/groups/${letter.toLowerCase()}`} className={className}>
            {label}
          </a>
        )
      })}
    </nav>
  )
}
