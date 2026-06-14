import { GROUPS, TEAMS } from '../../shared/groups'
import type { GroupMatch } from '../../shared/types'
import type { User } from '../../users/index'
import { tournamentResults } from '../../tournament-results'
import { nextMatches, topPrediction } from './nextMatch'
import './NextMatchCard.css'

const SCORED_MATCHES = Object.values(tournamentResults.groupMatches).flat()

type Props = { users: User[]; now?: Date; matches?: GroupMatch[]; currentUser?: User }

function SingleMatchCard({ users, match, isNext, currentUser }: { users: User[]; match: GroupMatch; isNext: boolean; currentUser?: User }) {
  const home = TEAMS[match.homeTeam]
  const away = TEAMS[match.awayTeam]
  const consensus = topPrediction(users, match.id)
  const mine = currentUser?.predictions[match.id]

  return (
    <div dir="rtl" className="next-match" data-testid="next-match">
      <div className="next-match__heading">{isNext ? 'המשחק הבא · ' : ''}בית {GROUPS[match.id[0]].he}</div>

      <div className="next-match__teams">
        <div className="next-match__team">
          <span className={`fi fi-${home.iso} next-match__flag`} />
          <span className="next-match__name">{home.he}</span>
        </div>
        <div className="next-match__kickoff">
          <span className="next-match__date">{match.matchDate}</span>
          <span className="next-match__time">{match.kickoffIST}</span>
        </div>
        <div className="next-match__team">
          <span className={`fi fi-${away.iso} next-match__flag`} />
          <span className="next-match__name">{away.he}</span>
        </div>
      </div>

      {consensus && (
        <div className="next-match__consensus" data-testid="consensus">
          הניחוש הנפוץ: <strong dir="ltr">{consensus.away}–{consensus.home}</strong>
          {' '}({consensus.count} מתוך {consensus.total})
        </div>
      )}

      {mine && (
        <div className="next-match__mine" data-testid="your-prediction">
          הניחוש שלך: <strong dir="ltr">{mine.away}–{mine.home}</strong>
        </div>
      )}

      <a className="next-match__link" href={`/matches/${match.id}`}>לעמוד המשחק ›</a>
    </div>
  )
}

export default function NextMatchCard({ users, now = new Date(), matches = SCORED_MATCHES, currentUser }: Props) {
  const upcoming = nextMatches(matches, now)
  // nextMatches is sorted by kickoff, so the earliest slot is upcoming[0]'s.
  // Every match sharing that slot is "next" (round 3 plays two simultaneously).
  const next = upcoming[0]

  return (
    <>
      {upcoming.map(match => (
        <SingleMatchCard
          key={match.id}
          users={users}
          match={match}
          isNext={match.matchDate === next.matchDate && match.kickoffIST === next.kickoffIST}
          currentUser={currentUser}
        />
      ))}
    </>
  )
}
