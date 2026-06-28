import type { KnockoutStages } from './types'
import TeamSlot from '../formView/knockout/TeamSlot'
import './Bracket.css'

// Read-only view of the derived knockout bracket. R32 carries real teams once
// the group stage is finished; later rounds carry placeholder strings (e.g.
// "מנצח 74"). TeamSlot renders whichever string is present — a flag + Hebrew
// name for a known team, the raw string otherwise — so nothing is special-cased.
const ROUNDS: { key: keyof KnockoutStages; label: string }[] = [
  { key: 'r32',        label: 'שלב ה-32' },
  { key: 'r16',        label: 'שמינית גמר' },
  { key: 'qf',         label: 'רבע גמר' },
  { key: 'sf',         label: 'חצי גמר' },
  { key: 'thirdPlace', label: 'מקום שלישי' },
  { key: 'final',      label: 'גמר' },
]

export default function Bracket({ stages }: { stages: KnockoutStages }) {
  return (
    <div className="bracket" dir="rtl">
      {ROUNDS.map(({ key, label }) => (
        <section key={key} className="bracket-round">
          <h2 className="bracket-round-title">{label}</h2>
          <div className="bracket-matches">
            {stages[key].map(m => (
              <div key={m.matchNum} className="bracket-match">
                <span className="bracket-match-num">{m.matchNum}</span>
                <TeamSlot name={m.home} />
                <TeamSlot name={m.away} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
