import { useEffect, useMemo, useState } from 'react'
import type { GroupLetter } from '../../../shared/groups'
import type { TournamentResults } from '../../../shared/types'
import type { User } from '../../../users'
import { remainingForGroup, type GroupRecommendation as GroupReco } from './recommendation'
import type { RecoRequest, RecoResponse } from './recoWorker'

interface Props {
  groupLetter: GroupLetter
  currentUser?: User
  results: TournamentResults
}

const sameOrder = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => t === b[i])

// "What's best for you?" — for the chosen player, what they should root for in
// this group's remaining matches. The cross-aware score is a Monte-Carlo
// expectation over the rest of the tournament, so it runs in a Web Worker and
// arrives asynchronously; the loading line covers that wait.
export default function GroupRecommendation({ groupLetter, currentUser, results }: Props) {
  const [rec, setRec] = useState<GroupReco | null>(null)
  const [loading, setLoading] = useState(false)

  // Cheap, no-simulation gate so a finished group renders nothing at all and an
  // active group can show its frame immediately while the score is computed.
  const remaining = useMemo(
    () => (currentUser ? remainingForGroup(groupLetter, results) : []),
    [currentUser, groupLetter, results],
  )

  useEffect(() => {
    if (!currentUser || remaining.length === 0) {
      setRec(null)
      setLoading(false)
      return
    }
    // No Web Worker in test/SSR environments — skip the heavy compute rather
    // than crash; the card just stays in its loading state.
    if (typeof Worker === 'undefined') return
    // Own a fresh worker per run and tear it down in this same cleanup. Crucial
    // under React StrictMode (dev), which mounts → unmounts → remounts: a worker
    // kept in a ref and terminated by a separate effect would be posted to *after*
    // it was killed, and the response would never arrive (endless spinner).
    const worker = new Worker(new URL('./recoWorker.ts', import.meta.url), { type: 'module' })
    setLoading(true)
    const onMessage = (e: MessageEvent<RecoResponse>) => {
      setRec(e.data.rec)
      setLoading(false)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', () => setLoading(false))
    worker.postMessage({ reqId: 1, userLabel: currentUser.label, groupLetter, results } satisfies RecoRequest)
    return () => worker.terminate()
  }, [currentUser, groupLetter, results, remaining.length])

  if (!currentUser) {
    return (
      <section className="reco" dir="rtl">
        <h2>מה הכי טוב לך?</h2>
        <p className="reco__empty">בחרו את עצמכם (למעלה, בורר המשתמש) כדי לראות מה כדאי לכם שיקרה במחזור האחרון.</p>
      </section>
    )
  }

  if (remaining.length === 0) return null

  const ctx = rec?.groupContext
  const contextBlock =
    ctx && (ctx.advances.length > 0 || !ctx.orderStillPossible) ? (
      <div className="reco__context">
        {ctx.advances.map(a => (
          <p
            key={a.teamHe}
            className={
              a.status === 'position'
                ? 'reco__ctx reco__ctx--good'
                : a.status === 'advance'
                  ? 'reco__ctx reco__ctx--warn'
                  : 'reco__ctx reco__ctx--bad'
            }
          >
            {a.status === 'position' ? (
              <>{a.teamHe} כבר מובטחת במקום ה{a.slotWord} כמו שניחשת — נקודת המיקום, העלייה וההצלבה מהמקום הזה כבר בטוחות.</>
            ) : a.status === 'advance' ? (
              <>{a.teamHe} כבר מובטחת עלייה מהבית — אבל עוד לא את המקום ה{a.slotWord} שניחשת, וזה עדיין משפיע על נקודת המיקום וההצלבה שלך.</>
            ) : (
              <>{a.teamHe} כבר לא תסיים בשתיים הראשונות — העלייה הישירה ירדה (עדיין ייתכן מהמקום השלישי, תלוי בבתים אחרים).</>
            )}
          </p>
        ))}
        {!ctx.orderStillPossible && (
          <p className="reco__ctx reco__ctx--bad">
            הסידור המדויק שניחשת כבר לא יושג במלואו — חלק מנקודות המיקום כבר ירדו, אז כדאי להתמקד במה שעוד פתוח.
          </p>
        )}
      </div>
    ) : null

  return (
    <section className="reco" dir="rtl">
      <h2>מה הכי טוב לך? · {currentUser.label}</h2>

      {loading || !rec ? (
        <p className="reco__loading">מחשב את התרחיש הכי טוב עבורך…</p>
      ) : rec.scored && rec.best ? (
        <>
          <div className="reco__lead">
            {rec.counterIntuitive
              ? 'לא מה שהיית מצפה — אבל ככה הכי טוב לך:'
              : 'מה שכדאי לך שיקרה במחזור האחרון:'}
          </div>

          <ul className="reco__wants">
            {rec.best.choices.map(c => (
              <li key={c.matchId} className="reco__want">{c.text}</li>
            ))}
          </ul>

          <p className="reco__order">
            <span className="reco__order-label">ניחשת שהבית ייסגר כך:</span>{' '}
            {rec.predictedOrderHe.map((t, i) => `${i + 1}. ${t}`).join(' · ')}
          </p>
          {rec.counterIntuitive && !sameOrder(rec.predictedOrderHe, rec.best.orderHe) && (
            <p className="reco__order reco__order--alt">
              <span className="reco__order-label">אבל עדיף לך שייסגר כך:</span>{' '}
              {rec.best.orderHe.map((t, i) => `${i + 1}. ${t}`).join(' · ')}
            </p>
          )}

          {contextBlock}

          {rec.counterIntuitive && rec.reasons.length > 0 && (
            <div className="reco__why-block">
              <div className="reco__why-title">למה דווקא ככה עדיף לך:</div>
              <ul className="reco__why-list">
                {rec.reasons.map((r, i) => (
                  <li key={i} className={r.good ? 'reco__why-good' : 'reco__why-bad'}>
                    {r.textHe}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </>
      ) : rec && rec.predictedOrderHe.length > 0 ? (
        <>
          <p className="reco__order">
            <span className="reco__order-label">ניחשת שהבית ייסגר כך:</span>{' '}
            {rec.predictedOrderHe.map((t, i) => `${i + 1}. ${t}`).join(' · ')}
          </p>

          {contextBlock}

          {rec.neededOutcomes.length > 0 && (
            <>
              <div className="reco__lead">מה הכי כדאי לך שיקרה במחזורים הקרובים:</div>
              <ul className="reco__wants">
                {rec.neededOutcomes.map(o => (
                  <li
                    key={o.matchId}
                    className={o.matchesPrediction ? 'reco__want' : 'reco__want reco__want--alt'}
                  >
                    {o.text}
                    {!o.matchesPrediction && (
                      <span className="reco__want-note"> · שונה מהניחוש שלך, אבל שווה לך נקודת מיקום</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="reco__assume">
            מבט פשוט על הבית בלבד — האיזון בין המיקום הסופי שלך (מיקום מדויק + עולות) לבין נקודות
            הצליפה/פגיעה במשחקים. בלי הצלבות והמשך — ההמלצה החכמה המלאה תופיע לקראת המחזור האחרון.
          </p>
        </>
      ) : (
        <p className="reco__empty">ההמלצה החכמה תופיע לקראת המחזור האחרון של הבית.</p>
      )}
    </section>
  )
}
