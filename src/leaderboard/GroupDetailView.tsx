import { useMemo, useState } from 'react'
import { ALL_GROUP_LETTERS, GROUPS } from '../shared/groups'
import type { GroupLetter } from '../shared/groups'
import type { Standing } from '../shared/types'
import { isGroupComplete } from './points'
import type { GroupTeamHit } from './points'
import type { GroupDetailRow } from './leaderboardRows'
import { OLEH_PTS, PLACE_PTS, olehDetailPoints } from './leaderboardRows'
import { competitionRanks } from './rank'
import { MEDALS } from './medals'
import { TeamChip } from './LeaderboardTable'
import StandingsTable from '../formView/groupStage/StandingsTable'

type GroupSel = 'all' | GroupLetter

// One bettor's hits narrowed to the chosen group (or all), with their tally —
// the unit the cards sort and render from.
interface ScopedDetail {
  label: string
  advancement: GroupTeamHit[]
  places: GroupTeamHit[]
  points: number
}

function scopeRow(row: GroupDetailRow, sel: GroupSel): ScopedDetail {
  const keep = (h: GroupTeamHit) => sel === 'all' || h.group === sel
  const advancement = row.advancement.filter(keep)
  const places = row.places.filter(keep)
  return { label: row.label, advancement, places, points: olehDetailPoints(advancement, places) }
}

// A labelled section of team chips (עולות / מיקומים) with its running tally.
function ChipSection({ title, hint, hits, pts, perHit, renderTag }: {
  title: string
  hint: string
  hits: GroupTeamHit[]
  pts: number
  perHit: number
  renderTag: (h: GroupTeamHit) => string
}) {
  return (
    <section className="gd-sec">
      <div className="gd-sec-head">
        <span className="gd-sec-title">{title}</span>
        {hits.length > 0 ? (
          <span className="gd-sec-sum">{hits.length} × {perHit} = <b>{pts}</b></span>
        ) : (
          <span className="gd-sec-empty">{hint}</span>
        )}
      </div>
      {hits.length > 0 && (
        <div className="lb-bd-chips">
          {hits.map(h => (
            <TeamChip key={`${title}-${h.group}-${h.team}-${h.position ?? ''}`} team={h.team} tag={renderTag(h)} />
          ))}
        </div>
      )}
    </section>
  )
}

// The two tables that explain a group at a glance: how it actually finished, and
// the table the viewer predicted — with their exact-position hits highlighted so
// the מיקומים points map straight onto the rows that earned them.
function GroupCompare({ letter, actual, mine, placeHits }: {
  letter: GroupLetter
  actual?: Standing[]
  mine?: Standing[]
  placeHits: string[]
}) {
  if (!actual || actual.length === 0) return null
  const finalCaption = isGroupComplete(actual) ? 'הבית הסופי' : 'הבית עד כה'
  return (
    <div className="gd-compare">
      <span className="gd-compare-title">בית {GROUPS[letter].he}</span>
      <div className="gd-compare-tables">
        <div className="gd-compare-col">
          <StandingsTable standings={actual} caption={finalCaption} />
        </div>
        {mine && mine.length > 0 && (
          <div className="gd-compare-col">
            <StandingsTable standings={mine} caption="ההימור שלי" highlightTeams={placeHits} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function GroupDetailView({ rows, me, actualTables, myTables }: {
  rows: GroupDetailRow[]
  me?: string
  actualTables?: Record<string, Standing[]>
  myTables?: Record<string, Standing[]>
}) {
  const [sel, setSel] = useState<GroupSel>('all')

  // only offer groups that have actually produced points for someone
  const groupsWithData = useMemo(() => {
    const present = new Set<string>()
    for (const r of rows) {
      for (const h of r.advancement) present.add(h.group)
      for (const h of r.places) present.add(h.group)
    }
    return ALL_GROUP_LETTERS.filter(l => present.has(l))
  }, [rows])

  const scoped = useMemo(() => {
    const eff: GroupSel = sel !== 'all' && !groupsWithData.includes(sel) ? 'all' : sel
    return rows
      .map(r => scopeRow(r, eff))
      .sort((a, b) =>
        b.points - a.points ||
        b.advancement.length - a.advancement.length ||
        b.places.length - a.places.length ||
        a.label.localeCompare(b.label, 'he'))
  }, [rows, sel, groupsWithData])

  // the viewer's own exact-position hits in the selected group — highlighted in
  // the "ההימור שלי" table so the מיקומים points point at the rows that earned them
  const myPlaceHits = useMemo(() => {
    if (sel === 'all' || !me) return []
    const mine = rows.find(r => r.label === me)
    return (mine?.places ?? []).filter(p => p.group === sel).map(p => p.team)
  }, [rows, me, sel])

  const ranks = competitionRanks(scoped, r => r.points)
  const anyData = groupsWithData.length > 0
  const showGroupTag = sel === 'all'

  return (
    <div className="lb-prob gd-view" dir="rtl">
      <p className="lb-prob-caption">
        מי ניחש נכון את העולות והמיקומים בשלב הבתים — <b>{OLEH_PTS} נק׳</b> לכל קבוצה שעלתה,
        ו<b>{PLACE_PTS} נק׳</b> לכל מיקום מדויק בטבלה.
      </p>

      {!anyData ? (
        <div className="lb-empty-state">
          <div className="lb-empty-icon">⏳</div>
          <p className="lb-empty-text">שלב הבתים עוד לא הוכרע — הפירוט יתמלא כשבתים יסתיימו</p>
        </div>
      ) : (
        <>
          <div className="lb-scope-row gd-groups">
            <button
              type="button"
              className={`lb-scope-group lb-scope-summary${sel === 'all' ? ' lb-scope-group--active' : ''}`}
              aria-pressed={sel === 'all'}
              onClick={() => setSel('all')}
            >כל הבתים</button>
            {groupsWithData.map(letter => (
              <button
                key={letter}
                type="button"
                className={`lb-scope-group${sel === letter ? ' lb-scope-group--active' : ''}`}
                aria-pressed={sel === letter}
                onClick={() => setSel(letter)}
              >{GROUPS[letter].he}</button>
            ))}
          </div>

          {sel !== 'all' && (
            <GroupCompare
              letter={sel}
              actual={actualTables?.[sel]}
              mine={me ? myTables?.[sel] : undefined}
              placeHits={myPlaceHits}
            />
          )}

          <div className="gd-cards">
            {scoped.map((r, i) => {
              const rank = ranks[i]
              const isMe = r.label === me
              const rankClass = rank <= 3 ? ` gd-card--rank-${rank}` : ''
              return (
                <article
                  key={r.label}
                  className={`gd-card${rankClass}${isMe ? ' gd-card--me' : ''}`}
                >
                  <header className="gd-card-head">
                    <span className="gd-rank">{rank <= 3 ? MEDALS[rank] : rank}</span>
                    <span className="gd-name">
                      {r.label}
                      {isMe && <span className="lb-me-badge">אני</span>}
                    </span>
                    <span className="gd-total" data-testid={`gd-total-${r.label}`}><b>{r.points}</b> נק׳</span>
                  </header>
                  <div className="gd-card-body">
                    <ChipSection
                      title="עולות"
                      hint="אף עלייה לא נוחשה כאן"
                      hits={r.advancement}
                      pts={r.advancement.length * OLEH_PTS}
                      perHit={OLEH_PTS}
                      renderTag={h => (showGroupTag ? `בית ${h.group}` : 'עלתה')}
                    />
                    <ChipSection
                      title="מיקומים"
                      hint="אף מיקום מדויק לא נוחש כאן"
                      hits={r.places}
                      pts={r.places.length * PLACE_PTS}
                      perHit={PLACE_PTS}
                      renderTag={h => (showGroupTag ? `מקום ${h.position} · בית ${h.group}` : `מקום ${h.position}`)}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
