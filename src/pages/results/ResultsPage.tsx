import { useState, useRef, useEffect } from 'react'
import type { ResultsPageData } from './prepareResultsData'
import PageLayout from '../../shared/PageLayout'
import MatchRow from '../../formView/groupStage/MatchRow'
import StandingsTable from '../../formView/groupStage/StandingsTable'
import GroupVoteMatrix from '../group/GroupVoteMatrix'
import './ResultsPage.css'

interface Props {
  data: ResultsPageData
}

const noop = () => {}

export default function ResultsPage({ data }: Props) {
  const [activeGroup, setActiveGroup] = useState(data.groups[0].letter)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const { standings, votes, matches, scores } = data.byGroup[activeGroup]

  return (
    <PageLayout title="תוצאות">
      <main className="results-main">
        <div
          className={`group-picker${dropdownOpen ? ' group-picker--open' : ''}`}
          ref={dropdownRef}
          dir="rtl"
        >
          <button
            type="button"
            className="group-picker__trigger"
            onClick={() => setDropdownOpen(o => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="group-picker__trigger-he">בית {data.groups.find(g => g.letter === activeGroup)?.hebrew}</span>
            <svg className="group-picker__chevron" width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
              <path d="M1 1L5.5 6L10 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="group-picker__panel" role="listbox" aria-label="בחר בית">
              <div className="group-picker__eyebrow">בחר בית</div>
              <div className="group-picker__grid">
                {data.groups.map(({ letter, hebrew }) => (
                  <button
                    key={letter}
                    type="button"
                    role="option"
                    aria-selected={letter === activeGroup}
                    className={`group-picker__item${letter === activeGroup ? ' group-picker__item--active' : ''}`}
                    onClick={() => { setActiveGroup(letter); setDropdownOpen(false) }}
                  >
                    <span className="group-picker__item-letter">{hebrew}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className="content-section">
          <header className="section-heading" dir="rtl">
            <span className="section-heading__eyebrow">דירוג</span>
            <h2 className="section-heading__title">טבלת הבית</h2>
          </header>
          <StandingsTable standings={standings} />
        </section>

        <section className="content-section results-votes">
          <header className="section-heading" dir="rtl">
            <span className="section-heading__eyebrow">ניחושים</span>
            <h2 className="section-heading__title">תחזיות הקבוצה</h2>
          </header>
          <GroupVoteMatrix votes={votes} />
        </section>

        <section className="content-section results-matches">
          <header className="section-heading" dir="rtl">
            <span className="section-heading__eyebrow">משחקים</span>
            <h2 className="section-heading__title">תוצאות הבית</h2>
          </header>
          {matches.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              scores={scores[match.id] ?? { home: null, away: null }}
              onChange={noop}
              readOnly
            />
          ))}
        </section>
      </main>
    </PageLayout>
  )
}
