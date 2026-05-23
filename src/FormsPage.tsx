import { useState } from 'react'
import PredictionsView from './PredictionsView'
import Nav from './Nav'
import { predictions as talPredictions, topGoalscorer as talGoalscorer } from './users/tal-lichter'
import { predictions as idanPredictions, topGoalscorer as idanGoalscorer } from './users/idan-melamed'
import { predictions as alradPredictions, topGoalscorer as alradGoalscorer } from './users/alrad-guma'

const USERS = [
  { label: 'טל ליכטר', predictions: talPredictions, topGoalscorer: talGoalscorer },
  { label: 'עידן מלמד', predictions: idanPredictions, topGoalscorer: idanGoalscorer },
  { label: 'אלרד גומא', predictions: alradPredictions, topGoalscorer: alradGoalscorer },
]

export default function FormsPage() {
  const [selectedLabel, setSelectedLabel] = useState('')
  const selected = USERS.find(u => u.label === selectedLabel)

  return (
    <>
      <header className="poster-header">
        <div className="poster-bar poster-bar--top" />
        <div className="poster-center">
          <p className="poster-overline">גביע העולם FIFA</p>
          <div className="poster-mundial">MUNDIAL <span className="poster-year">2026</span></div>
          <h1 className="poster-subtitle">הטפסים</h1>
        </div>
        <div className="poster-bar poster-bar--bottom" />
      </header>
      <Nav />

      <main>
        <select aria-label="בחר משתתף" value={selectedLabel} onChange={e => setSelectedLabel(e.target.value)}>
          <option value="">בחר משתתף</option>
          {USERS.map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
        </select>

        {selected
          ? (
            <section>
              <h2>{selected.label}</h2>
              <PredictionsView predictions={selected.predictions} topGoalscorer={selected.topGoalscorer} />
            </section>
          )
          : <p>בחר משתתף</p>
        }
      </main>
    </>
  )
}
