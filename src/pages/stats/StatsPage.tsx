import PageLayout from '../../shared/PageLayout'
import { ALL_GROUP_LETTERS, GROUPS, GROUP_HEBREW, TEAMS } from '../../shared/groups'
import './StatsPage.css'

export default function StatsPage() {
  return (
    <PageLayout title="Stats">
      <main className="stats-main">
        <p className="stats-eyebrow">בחר קבוצה</p>
        <div className="stats-grid">
          {ALL_GROUP_LETTERS.map((letter, i) => {
            const group = GROUPS[letter]
            const teams = [...new Set(group.matches.flatMap(m => [m.homeTeam, m.awayTeam]))]
            const hebrew = GROUP_HEBREW[letter]
            return (
              <a
                key={letter}
                href={`/stats/groups/${letter}`}
                className="group-card"
                aria-label={`קבוצה ${hebrew}`}
                style={{ '--card-index': i } as React.CSSProperties}
              >
                <div className="group-card__watermark">{letter}</div>
                <div className="group-card__body">
                  <div className="group-card__meta">
                    <span className="group-card__overline">קבוצה</span>
                    <span className="group-card__hebrew">{hebrew}</span>
                  </div>
                  <ul className="group-card__teams">
                    {teams.map(team => (
                      <li key={team}>{TEAMS[team]?.he ?? team}</li>
                    ))}
                  </ul>
                </div>
                <div className="group-card__footer">
                  <span className="group-card__cta">סטטיסטיקות ←</span>
                </div>
              </a>
            )
          })}
        </div>
      </main>
    </PageLayout>
  )
}
