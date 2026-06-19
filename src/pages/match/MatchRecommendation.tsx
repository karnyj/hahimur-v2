import { useEffect, useState } from 'react'
import type { TournamentResults } from '../../shared/types'
import type { User } from '../../users'
import type { MatchRecommendation as MatchReco, OutcomeEval, Want } from './matchReco'
import type { MatchRecoRequest, MatchRecoResponse } from './matchRecoWorker'

interface Props {
  matchId: string
  currentUser?: User
  results: TournamentResults
  decided: boolean
}

// The three outcomes ordered for display: the recommended one first, then the
// rest by your expected points. Anchoring on `rec.best` (not a fresh sort) keeps
// the table consistent with the headline — when a sub-threshold gain means we
// kept you on your own predicted result, that result stays "הכי טוב לך" here too,
// instead of the table silently crowning a different, barely-higher outcome.
function rankedOutcomes(rec: MatchReco): { o: OutcomeEval; label: string }[] {
  const bestWant = rec.best!.want
  const best = rec.outcomes.find(o => o.want === bestWant)!
  const others = rec.outcomes
    .filter(o => o.want !== bestWant)
    .sort((a, b) => b.expPoints - a.expPoints)
  return [
    { o: best, label: 'הכי טוב לך' },
    ...others.map((o, i) => ({ o, label: i === others.length - 1 ? 'הכי פחות טוב' : 'באמצע' })),
  ]
}

// The single label for one outcome, using the same best-anchored ordering.
function labelFor(rec: MatchReco, want: Want): string {
  return rankedOutcomes(rec).find(r => r.o.want === want)?.label ?? 'באמצע'
}

// The "why" behind a clicked outcome: the concrete reasons the engine derived
// from your own stake (your scoreline, your group ordering, the deep teams you
// carry), each tinted plus/minus, ordered by what matters most.
function OutcomeWhy({ rec, o }: { rec: MatchReco; o: OutcomeEval }) {
  const isBest = o.want === rec.best!.want
  return (
    <>
      {o.reasons.length > 0 && (
        <ul className="match-reco__why-list">
          {o.reasons.map((r, i) => (
            <li key={i} className={r.good ? 'match-reco__why-good' : 'match-reco__why-bad'}>
              {r.textHe}
            </li>
          ))}
        </ul>
      )}
      {!isBest && o.matchesBracket && (
        <p className="match-reco__modal-foot">שים לב: זו דווקא התוצאה שהברקט שלך ניחש — אבל בראייה הכוללת היא לא הכי טובה לך.</p>
      )}
    </>
  )
}

// "What's best for you?" on the match page — the result that gives the viewer
// the best *finish across the field*, found by Monte-Carlo over the rest of the
// tournament. Heavy, so it runs in a Web Worker and arrives asynchronously.
export default function MatchRecommendation({ matchId, currentUser, results, decided }: Props) {
  const [rec, setRec] = useState<MatchReco | null>(null)
  const [loading, setLoading] = useState(false)
  // Which outcome's "why" modal is open (by its wanted direction), if any.
  const [whyWant, setWhyWant] = useState<Want | null>(null)

  useEffect(() => {
    if (!currentUser || decided) {
      setRec(null)
      setLoading(false)
      setWhyWant(null)
      return
    }
    // A fresh compute (e.g. a live score update) invalidates any open explanation.
    setWhyWant(null)
    // No Web Worker in test/SSR environments — skip the heavy compute rather
    // than crash; the card just stays in its loading state.
    if (typeof Worker === 'undefined') return
    // Own a fresh worker per run and tear it down in this same cleanup. Crucial
    // under React StrictMode (dev), which mounts → unmounts → remounts: a worker
    // kept in a ref and terminated by a separate effect would be posted to *after*
    // it was killed, and the response would never arrive (endless spinner).
    const worker = new Worker(new URL('./matchRecoWorker.ts', import.meta.url), { type: 'module' })
    setLoading(true)
    const onMessage = (e: MessageEvent<MatchRecoResponse>) => {
      setRec(e.data.rec)
      setLoading(false)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', () => setLoading(false))
    worker.postMessage({ reqId: 1, userLabel: currentUser.label, matchId, results } satisfies MatchRecoRequest)
    return () => worker.terminate()
  }, [currentUser, matchId, results, decided])

  useEffect(() => {
    if (!whyWant) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setWhyWant(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [whyWant])

  if (decided) return null

  const whyOutcome = whyWant && rec ? rec.outcomes.find(o => o.want === whyWant) : null

  return (
    <>
      <header className="section-heading" dir="rtl">
        <span className="section-heading__eyebrow">ההמלצה שלך</span>
        <h2 className="section-heading__title">מה הכי טוב לך?</h2>
      </header>

      <section className="match-reco" dir="rtl">
        {!currentUser ? (
          <p className="match-reco__empty">בחרו את עצמכם (בורר המשתמש) כדי לראות איזו תוצאה הכי עוזרת לכם בדירוג.</p>
        ) : loading || !rec ? (
          <p className="match-reco__loading">מחשב את התוצאה הכי טובה עבורך…</p>
        ) : !rec.scored || !rec.best ? (
          <p className="match-reco__empty">אין מספיק מידע להמלצה על המשחק הזה.</p>
        ) : (
          <>
            {rec.noPreference ? (
              <p className="match-reco__lead">
                כל תוצאה כאן כמעט שקולה עבורך — אין תוצאה שמשנה לך משמעותית בדירוג.
              </p>
            ) : (
              <>
                <p className="match-reco__lead">
                  {rec.counterIntuitive
                    ? 'לא מה שהיית מצפה — אבל ככה הכי טוב לך:'
                    : 'התוצאה שהכי עוזרת לך:'}
                </p>
                <p className="match-reco__pick">{rec.best.text}</p>
              </>
            )}

            {!rec.noPreference && (
              <table className="match-reco__table">
                <thead>
                  <tr>
                    <th>תוצאה</th>
                    <th>למה זה טוב לך</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedOutcomes(rec).map(({ o, label }) => (
                    <tr key={o.want} className={o.want === rec.best!.want ? 'match-reco__row--best' : ''}>
                      <td>{o.text}</td>
                      <td>
                        <button
                          type="button"
                          className="match-reco__why-btn"
                          onClick={() => setWhyWant(o.want)}
                        >
                          {label}
                          <span className="match-reco__why-hint" aria-hidden> ⓘ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <p className="match-reco__note">
              ההשוואה מבוססת על אלפי הגרלות של המשך הטורניר — איזו תוצאה שווה לך הכי הרבה נקודות
              מההימור שלך. לחצו על "למה זה טוב לך" כדי לראות למה.
            </p>
          </>
        )}

        {whyOutcome && rec && (
          <div
            className="match-reco__modal"
            role="dialog"
            aria-modal="true"
            onClick={() => setWhyWant(null)}
          >
            <div className="match-reco__modal-card" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="match-reco__modal-close"
                onClick={() => setWhyWant(null)}
                aria-label="סגירה"
              >
                ×
              </button>
              <div className="match-reco__modal-label">{labelFor(rec, whyOutcome.want)}</div>
              <h3 className="match-reco__modal-title">{whyOutcome.text}</h3>
              <div className="match-reco__modal-body">
                <OutcomeWhy rec={rec} o={whyOutcome} />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
