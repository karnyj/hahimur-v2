import PageLayout from '../../shared/PageLayout'
import type { User } from '../../users/index'
import { TEAMS } from '../../shared/groups'
import { findKnockoutMatch, mockEnabled, roundLabel } from './koMatch'
import KnockoutParticipantsList from './KnockoutParticipantsList'
import RoundOf16Venn from './RoundOf16Venn'
import './MatchPredictionsPage.css'

// One team slot. A resolved slot is a real team name → its flag + Hebrew name;
// an unresolved slot is a descriptor string ("סגנית א", "שלישית א/ב/ג/ד/ו"), shown
// as-is with no flag.
function TeamSlot({ slot }: { slot: string }) {
  const team = TEAMS[slot]
  return (
    <div className="match-team">
      {team && <span className={`fi fi-${team.iso} match-team__flag`} />}
      <span className="match-team__name">{team ? team.he : slot}</span>
    </div>
  )
}

export default function KnockoutMatchPage({ matchNum, users = [] }: { matchNum: number; users?: User[] }) {
  const match = findKnockoutMatch(matchNum)

  if (!match) {
    return (
      <PageLayout title="ההימור 2026">
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>משחק לא נמצא</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="ההימור 2026">
      <div className="match-header" data-testid="knockout-match-page">
        <span className="match-header__group-badge" dir="rtl">{roundLabel(matchNum)} · משחק {matchNum}</span>

        <div className="match-header__teams">
          <TeamSlot slot={match.away} />
          <div className="match-header__vs"><span className="match-header__vs-text">–</span></div>
          <TeamSlot slot={match.home} />
        </div>

        {match.matchDate && (
          <div className="match-header__meta">
            <span>{match.matchDate}</span>
            <span className="match-header__meta-dot" />
            <span>{match.kickoffIST}</span>
            <span className="match-header__meta-dot" />
            <span>שעון ישראל</span>
          </div>
        )}
      </div>

      {match.resolved && (
        <div className="match-predictions">
          <header className="section-heading" dir="rtl">
            <span className="section-heading__eyebrow">משתתפים</span>
            <h2 className="section-heading__title">מי ניחש את המשחק</h2>
          </header>
          <KnockoutParticipantsList actualMatch={match} users={users} />
        </div>
      )}

      {matchNum === 73 && mockEnabled() && (
        <div className="match-predictions">
          <header className="section-heading" dir="rtl">
            <span className="section-heading__eyebrow">שמינית גמר</span>
            <h2 className="section-heading__title">מי ניחש את קוריאה ואת קנדה</h2>
          </header>
          <RoundOf16Venn teamA={match.home} teamB={match.away} users={users} />
        </div>
      )}
    </PageLayout>
  )
}
