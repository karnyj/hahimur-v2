import { useMemo } from 'react'
import type { TournamentResults } from '../../shared/types'
import type { User } from '../../users'
import { buildRivalry, findRivals } from '../rivalry/rivalryStats'
import elradPhoto from '../rivalry/elrad.png'
import eldadPhoto from '../rivalry/eldad.png'
import './RivalryEntry.css'

type Props = { users: User[]; results: TournamentResults }

/** Live teaser card for the אלרד-vs-אלדד rivalry. Lives on the home page (not in
 *  the main nav) and hides itself if either rival is missing. */
export default function RivalryEntry({ users, results }: Props) {
  const rivals = useMemo(() => findRivals(users), [users])
  const stats = useMemo(
    () => (rivals ? buildRivalry(rivals.elrad, rivals.eldad, users, results) : null),
    [rivals, users, results],
  )
  if (!stats) return null

  return (
    <a dir="rtl" className="rivalry-entry" href="/rivalry" aria-label="קרב האל[רד]דים">
      <div className="rivalry-entry__title">
        <span aria-hidden="true">⚔️</span> קרב האל[רד]דים
      </div>

      <div className="rivalry-entry__board">
        <div className={`rivalry-entry__side ${stats.leader === 'a' ? 'is-leading' : ''}`}>
          <div className="rivalry-entry__avatar-wrap">
            {stats.leader === 'a' && <span className="rivalry-entry__crown" aria-hidden="true">👑</span>}
            <img className="rivalry-entry__avatar rivalry-entry__avatar--a" src={elradPhoto} alt={stats.a.label} />
          </div>
          <span className="rivalry-entry__pts" dir="ltr">{stats.a.total}</span>
        </div>

        <span className="rivalry-entry__vs" aria-hidden="true">VS</span>

        <div className={`rivalry-entry__side ${stats.leader === 'b' ? 'is-leading' : ''}`}>
          <div className="rivalry-entry__avatar-wrap">
            {stats.leader === 'b' && <span className="rivalry-entry__crown" aria-hidden="true">👑</span>}
            <img className="rivalry-entry__avatar rivalry-entry__avatar--b" src={eldadPhoto} alt={stats.b.label} />
          </div>
          <span className="rivalry-entry__pts" dir="ltr">{stats.b.total}</span>
        </div>
      </div>

      <div className="rivalry-entry__cta">לקרב המלא ←</div>
    </a>
  )
}
