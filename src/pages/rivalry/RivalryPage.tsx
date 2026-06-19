import { useMemo, useState } from 'react'
import PageLayout from '../../shared/PageLayout'
import { USERS } from '../../users/index'
import { useLiveResults } from '../../shared/useLiveResults'
import { realPlayedState } from '../../leaderboard/winprob/realPlayed'
import { buildRivalry, buildShareText, findRivals, type RivalryStats, type TopStep } from './rivalryStats'
import { useRivalryOdds, ODDS_N } from './useRivalryOdds'
import { buildShareImage } from './shareImage'
import elradPhoto from './elrad.png'
import eldadPhoto from './eldad.png'
import './RivalryPage.css'

type ShareNavigator = Navigator & {
  canShare?: (data?: { files?: File[] }) => boolean
  share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>
}

const PAGE_TITLE = 'קרב האל[רד]דים'

const firstName = (label: string) => label.split(' ')[0]

export default function RivalryPage() {
  const results = useLiveResults()
  const rivals = useMemo(() => findRivals(USERS), [])
  // A fresh random seed per page visit picks different phrasings for variety,
  // while every number/which-line still comes from the live results below — so it
  // re-randomises on each refresh but stays stable (no jitter) within the visit.
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000))
  const [sharing, setSharing] = useState(false)
  const stats = useMemo(
    () => (rivals ? buildRivalry(rivals.elrad, rivals.eldad, USERS, results, seed) : null),
    [rivals, results, seed],
  )

  const played = useMemo(() => realPlayedState(results), [results])
  const playerGoals = useMemo(() => {
    const out: Record<string, number> = {}
    for (const [player, byMatch] of Object.entries(results.playerMatchGoals ?? {})) {
      let s = 0
      for (const g of Object.values(byMatch)) s += g
      if (s > 0) out[player] = s
    }
    return out
  }, [results])
  const odds = useRivalryOdds(played, playerGoals, rivals?.elrad.label ?? '', rivals?.eldad.label ?? '')

  if (!stats) {
    return (
      <PageLayout title={PAGE_TITLE}>
        <main dir="rtl" className="rivalry rivalry--empty">
          <p>הקרב הגדול בין אלרד לאלדד עוד מחכה ליריבים — חזרו כשהשמות יהיו במערכת.</p>
        </main>
      </PageLayout>
    )
  }

  const aFirst = firstName(stats.a.label)
  const bFirst = firstName(stats.b.label)
  const shareUrl =
    (typeof window !== 'undefined' ? window.location.origin : 'https://hahimur.vercel.app') + '/rivalry'
  const waHref = `https://wa.me/?text=${encodeURIComponent(buildShareText(stats, shareUrl))}`

  // Share the VS scoreboard as a real image where supported (mostly mobile), and
  // fall back to the WhatsApp text+link otherwise. A native-share cancel is silent.
  async function handleShare() {
    if (!stats || sharing) return
    const text = buildShareText(stats, shareUrl)
    setSharing(true)
    try {
      const nav = navigator as ShareNavigator
      if (nav.canShare && nav.share) {
        const blob = await buildShareImage(stats, elradPhoto, eldadPhoto)
        const file = new File([blob], 'kerav-haeldadim.png', { type: 'image/png' })
        if (nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], text })
          return
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    } finally {
      setSharing(false)
    }
    window.open(waHref, '_blank', 'noopener,noreferrer')
  }

  // Extra pulse stats derived from data already on hand.
  const aTop = stats.timeline.filter(s => s.top === 'a').length
  const bTop = stats.timeline.filter(s => s.top === 'b').length
  const domName = aTop === bTop ? null : aTop > bTop ? aFirst : bFirst
  const domCount = Math.max(aTop, bTop)
  const trailerFirst = stats.leader === 'a' ? bFirst : aFirst
  const catchHint =
    stats.gap <= 4
      ? 'צליפה אחת מדויקת והכתר מתהפך'
      : stats.gap <= 8
        ? 'שניים-שלושה משחקים טובים והוא מעל'
        : 'צריך ריצה רצינית כדי להפוך את זה'
  const aHits = stats.a.tzelifa + stats.a.pgiya
  const bHits = stats.b.tzelifa + stats.b.pgiya
  const sharperFirst = aHits === bHits ? null : aHits > bHits ? aFirst : bFirst
  // Recent-form leader (last few matches), for bolding the hotter name.
  const rf = stats.recentForm
  const rfLeadFirst = rf ? (rf.a > rf.b ? aFirst : rf.b > rf.a ? bFirst : null) : null
  // Gap trend vs the all-time peak: only "narrative" when it shrank meaningfully.
  const gapClosing =
    !!stats.peakGap && stats.leader !== 'tie' && stats.gap > 0 && stats.peakGap.gap - stats.gap >= 2
  const showPulse =
    !!stats.momentum ||
    !!stats.peakGap ||
    !!domName ||
    !!sharperFirst ||
    !!rf ||
    (stats.leader !== 'tie' && stats.gap > 0)

  return (
    <PageLayout title={PAGE_TITLE}>
      <main dir="rtl" className="rivalry">
        <header className="rivalry__hero">
          <div className="rivalry__crest" aria-hidden="true">⚔️</div>
          <h2 className="rivalry__title">{PAGE_TITLE}</h2>
          <p className="rivalry__subtitle">אלרד נגד אלדד · המאבק החשוב באמת</p>
        </header>

        {stats.upset && (
          <div className="rivalry__banner" role="status">
            <span aria-hidden="true">🔄</span> הפיכה! {firstName(stats.upset.newTop === 'a' ? stats.a.label : stats.b.label)}{' '}
            עקף את {firstName(stats.upset.passed === 'a' ? stats.a.label : stats.b.label)} בטבלה.
          </div>
        )}

        <section className={`rivalry__scoreboard${stats.leader === 'tie' ? ' rivalry__scoreboard--tie' : ''}`}>
          <div className={`rivalry__side rivalry__side-card--a ${stats.leader === 'a' ? 'rivalry__side--leading' : ''}`}>
            <div className="rivalry__avatar-wrap">
              {stats.leader === 'a' && <span className="rivalry__crown" aria-hidden="true">👑</span>}
              <img className="rivalry__avatar" src={elradPhoto} alt={stats.a.label} />
            </div>
            <div className="rivalry__rank">מקום {stats.a.rank}</div>
            <div className="rivalry__name">{stats.a.label}</div>
            <div className="rivalry__points" dir="ltr">{stats.a.total}</div>
          </div>
          <div className="rivalry__vs">
            <span className="rivalry__vs-swords" aria-hidden="true">⚔️</span>
            <span>VS</span>
            {stats.leader !== 'tie' && <span className="rivalry__gap">פער {stats.gap}</span>}
          </div>
          <div className={`rivalry__side rivalry__side-card--b ${stats.leader === 'b' ? 'rivalry__side--leading' : ''}`}>
            <div className="rivalry__avatar-wrap">
              {stats.leader === 'b' && <span className="rivalry__crown" aria-hidden="true">👑</span>}
              <img className="rivalry__avatar" src={eldadPhoto} alt={stats.b.label} />
            </div>
            <div className="rivalry__rank">מקום {stats.b.rank}</div>
            <div className="rivalry__name">{stats.b.label}</div>
            <div className="rivalry__points" dir="ltr">{stats.b.total}</div>
          </div>
        </section>

        <p className="rivalry__verdict">{stats.verdict}</p>

        <div className="rivalry__odds" aria-live="polite">
          {odds.status === 'unsupported' ? (
            <span className="rivalry__odds-text rivalry__odds-text--muted">הדפדפן הזה לא תומך בחישוב הסיכויים</span>
          ) : odds.status === 'loading' ? (
            <span className="rivalry__odds-text rivalry__odds-text--muted">
              <span className="rivalry__odds-spinner" aria-hidden="true" /> מחשבים מי צפוי לנצח את הקרב…
            </span>
          ) : (() => {
            const aFav = odds.aAbove >= odds.bAbove
            const favFirst = aFav ? aFirst : bFirst
            const otherFirst = aFav ? bFirst : aFirst
            const pct = Math.round((aFav ? odds.aAbove : odds.bAbove) * 100)
            return (
              <>
                <span className="rivalry__odds-pct" dir="ltr">{pct}%</span>
                <span className="rivalry__odds-text">
                  ש<b>{favFirst}</b> יסיים מעל <b>{otherFirst}</b> בסוף הטורניר
                </span>
                <span className="rivalry__odds-sub">לפי {ODDS_N.toLocaleString('he-IL')} סימולציות מונטה-קרלו</span>
              </>
            )
          })()}
        </div>

        {showPulse && (
          <div className="rivalry__pulse">
            {stats.momentum && (
              <span className="rivalry__pulse-item">
                🔥 <b>{firstName(stats.momentum.side === 'a' ? stats.a.label : stats.b.label)}</b> בכיוון —
                {' '}{stats.momentum.count} משחקים רצופים שצבר יותר מ{firstName(stats.momentum.side === 'a' ? stats.b.label : stats.a.label)}
              </span>
            )}
            {rf && (
              <span className="rivalry__pulse-item">
                📊 פורמה ({rf.window} אחרונים):{' '}
                {rfLeadFirst === aFirst ? <b>{aFirst} {rf.a}</b> : <>{aFirst} {rf.a}</>}
                {' · '}
                {rfLeadFirst === bFirst ? <b>{bFirst} {rf.b}</b> : <>{bFirst} {rf.b}</>}
                {rf.tie ? ` · תיקו ${rf.tie}` : ''}
              </span>
            )}
            {stats.leader !== 'tie' && stats.gap > 0 && (
              <span className="rivalry__pulse-item">
                📍 <b>{trailerFirst}</b> במרחק {stats.gap} נק׳ — {catchHint}
              </span>
            )}
            {gapClosing && (
              <span className="rivalry__pulse-item">
                📉 הפער הצטמצם מ-{stats.peakGap!.gap} ל-{stats.gap} נק׳ — <b>{trailerFirst}</b> מצמצם
              </span>
            )}
            {domName && stats.timeline.length > 1 && (
              <span className="rivalry__pulse-item">
                👑 <b>{domName}</b> היה מעל ב-{domCount} מתוך {stats.timeline.length} המשחקים
              </span>
            )}
            {sharperFirst && (
              <span className="rivalry__pulse-item">
                🎯 <b>{sharperFirst}</b> מדייק יותר — {Math.max(aHits, bHits)} ניחושים מוצלחים מול {Math.min(aHits, bHits)} (צליפות + פגיעות)
              </span>
            )}
            {stats.peakGap && (
              <span className="rivalry__pulse-item">
                📈 הפער הגדול ביותר עד כה: <b>{stats.peakGap.gap}</b> נק׳ (אחרי משחק {stats.peakGap.matchday})
              </span>
            )}
          </div>
        )}

        <button className="rivalry__share" type="button" onClick={handleShare} disabled={sharing}>
          <span aria-hidden="true">📲</span> {sharing ? 'מכין…' : 'שתף'}
        </button>

        <section className="rivalry__h2h" aria-label="ראש בראש">
          <h3 className="rivalry__section-title">ראש בראש · משחקים שהסתיימו</h3>
          <div className="rivalry__h2h-row">
            <div className="rivalry__h2h-side rivalry__side--a">
              <span className="rivalry__h2h-num" dir="ltr">{stats.h2h.a}</span>
              <span className="rivalry__h2h-name">{aFirst}{stats.h2h.a > stats.h2h.b ? ' 🔥' : ''}</span>
            </div>
            <div className="rivalry__h2h-mid">
              <span className="rivalry__h2h-num" dir="ltr">{stats.h2h.tie}</span>
              <span className="rivalry__h2h-name">תיקו</span>
            </div>
            <div className="rivalry__h2h-side rivalry__side--b">
              <span className="rivalry__h2h-num" dir="ltr">{stats.h2h.b}</span>
              <span className="rivalry__h2h-name">{bFirst}{stats.h2h.b > stats.h2h.a ? ' 🔥' : ''}</span>
            </div>
          </div>
          <p className="rivalry__h2h-hint">מי הביא יותר נקודות בכל משחק שכבר נגמר</p>
        </section>

        <section className="rivalry__chips">
          <div className="rivalry__chip">
            <span className="rivalry__chip-value" dir="ltr">{stats.agreement.identicalPct}%</span>
            <span className="rivalry__chip-label">ניחושים זהים</span>
          </div>
          <div className="rivalry__chip">
            <span className="rivalry__chip-value" dir="ltr">{stats.aboveBelow.leadChanges}</span>
            <span className="rivalry__chip-label">חילופי הובלה</span>
          </div>
          <div className="rivalry__chip">
            <span className="rivalry__chip-value rivalry__chip-value--pair">
              <span className={`rivalry__side--a${stats.a.tzelifa > stats.b.tzelifa ? ' is-ahead' : ''}`}>{aFirst} {stats.a.tzelifa}</span>
              <span className={`rivalry__side--b${stats.b.tzelifa > stats.a.tzelifa ? ' is-ahead' : ''}`}>{bFirst} {stats.b.tzelifa}</span>
            </span>
            <span className="rivalry__chip-label">צליפות (תוצאה מדויקת)</span>
          </div>
          <div className="rivalry__chip">
            <span className="rivalry__chip-value rivalry__chip-value--pair">
              <span className={`rivalry__side--a${stats.a.pgiya > stats.b.pgiya ? ' is-ahead' : ''}`}>{aFirst} {stats.a.pgiya}</span>
              <span className={`rivalry__side--b${stats.b.pgiya > stats.a.pgiya ? ' is-ahead' : ''}`}>{bFirst} {stats.b.pgiya}</span>
            </span>
            <span className="rivalry__chip-label">פגיעות (כיוון נכון)</span>
          </div>
        </section>

        {stats.biggestBlowout && (
          <p className="rivalry__blowout">
            הפער הגדול ביותר במשחק יחיד: <strong>{stats.biggestBlowout.matchHe}</strong> —{' '}
            {stats.biggestBlowout.winner === 'a' ? aFirst : bFirst} הביא {stats.biggestBlowout.margin} נקודות יותר מהיריב.
          </p>
        )}

        <section className="rivalry__quips">
          {stats.quips.map((quip, i) => (
            <p key={i} className="rivalry__quip">{quip}</p>
          ))}
        </section>

        {stats.timeline.length > 1 && (
          <section className="rivalry__timeline">
            <h3 className="rivalry__section-title">המיקום בטבלה לאורך הטורניר</h3>
            <RankGraph stats={stats} />
            <div className="rivalry__graph-xaxis">
              <span>תחילת הטורניר</span>
              <span>עכשיו</span>
            </div>{/* container forces ltr so start-of-tournament sits on the left */}
            <p className="rivalry__legend">
              <span className="rivalry__legend-item"><span className="rivalry__swatch rivalry__side--a" /> {stats.a.label}</span>
              <span className="rivalry__legend-item"><span className="rivalry__swatch rivalry__side--b" /> {stats.b.label}</span>
            </p>
          </section>
        )}

        <p className="rivalry__live-note">⏱ מתעדכן בזמן אמת — חזרו לכאן מיד אחרי כל משחק.</p>
      </main>
    </PageLayout>
  )
}

function RankGraph({ stats }: { stats: RivalryStats }) {
  const t: TopStep[] = stats.timeline
  const W = 320
  const H = 132
  const padX = 12
  const padY = 14

  const ranks = t.flatMap(s => [s.aRank, s.bRank])
  let min = Math.min(...ranks)
  let max = Math.max(...ranks)
  if (min === max) {
    min -= 1
    max += 1
  }
  const n = t.length
  // Time reads left-to-right: first match on the left, the latest on the right.
  const x = (i: number) => (n <= 1 ? W / 2 : padX + (i / (n - 1)) * (W - 2 * padX))
  // Lower rank number (better) sits higher on the chart.
  const y = (r: number) => padY + ((r - min) / (max - min)) * (H - 2 * padY)

  const path = (key: 'aRank' | 'bRank') => t.map((s, i) => `${x(i).toFixed(1)},${y(s[key]).toFixed(1)}`).join(' ')

  return (
    <div className="rivalry__graph-frame">
      <span className="rivalry__graph-ylabel rivalry__graph-ylabel--top">מקום {min}</span>
      <span className="rivalry__graph-ylabel rivalry__graph-ylabel--bottom">מקום {max}</span>
      <svg className="rivalry__graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="גרף מיקום בטבלה לאורך הטורניר">
        <polyline className="rivalry__graph-line rivalry__graph-line--a" points={path('aRank')} fill="none" />
        <polyline className="rivalry__graph-line rivalry__graph-line--b" points={path('bRank')} fill="none" />
        {t.map((s, i) => (
          <circle key={`a${i}`} cx={x(i)} cy={y(s.aRank)} r={2.6} className="rivalry__graph-dot rivalry__graph-dot--a" />
        ))}
        {t.map((s, i) => (
          <circle key={`b${i}`} cx={x(i)} cy={y(s.bRank)} r={2.6} className="rivalry__graph-dot rivalry__graph-dot--b" />
        ))}
      </svg>
    </div>
  )
}
