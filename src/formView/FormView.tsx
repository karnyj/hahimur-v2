import { useMemo, useState } from 'react'
import type { PredictionsState, Standing, ThirdPlaceQualification, KnockoutMatch } from '../shared/types'
import { GROUP_MATCHES, GROUP_HEBREW, ALL_GROUP_LETTERS, type GroupLetter } from '../shared/groups'
import { calculateStandings } from '../shared/standings'
import { useTournament } from '../shared/useTournament'
import MatchRow from './groupStage/MatchRow'
import StandingsTable from './groupStage/StandingsTable'
import ThirdPlaceTable from './thirdPlace/ThirdPlaceTable'
import KnockoutTable from './knockout/KnockoutTable'
import ChampionBanner from './knockout/ChampionBanner'

interface Props {
  predictions: PredictionsState
  topGoalscorer: string
  groupTables?: Record<string, Standing[]>
  thirdPlaceQualification?: ThirdPlaceQualification
  knockoutBracket?: KnockoutMatch[]
  predictedChampion?: string
}

const noop = () => {}

export default function FormView({
  predictions,
  topGoalscorer,
  groupTables,
  thirdPlaceQualification,
  knockoutBracket,
  predictedChampion,
}: Props) {
  const [activeGroup, setActiveGroup] = useState<GroupLetter>('A')
  const activeMatches = GROUP_MATCHES[activeGroup] ?? []

  const { standings: computedStandings } = useMemo(
    () => calculateStandings(activeMatches, predictions),
    [activeGroup, predictions]
  )
  const activeStandings = groupTables?.[activeGroup] ?? computedStandings

  const tournament = useTournament(predictions)
  const thirdPlaceQual = thirdPlaceQualification ?? tournament.thirdPlaceQual
  const allGroupsFilled = thirdPlaceQualification != null ? true : tournament.allGroupsFilled
  const finalWinner = predictedChampion ?? tournament.finalWinner

  const r32   = knockoutBracket?.filter(m => m.matchNum >= 73  && m.matchNum <= 88)  ?? tournament.round32Matches
  const r16   = knockoutBracket?.filter(m => m.matchNum >= 89  && m.matchNum <= 96)  ?? tournament.knockout.r16
  const qf    = knockoutBracket?.filter(m => m.matchNum >= 97  && m.matchNum <= 100) ?? tournament.knockout.qf
  const sf    = knockoutBracket?.filter(m => m.matchNum >= 101 && m.matchNum <= 102) ?? tournament.knockout.sf
  const third = knockoutBracket?.filter(m => m.matchNum === 103) ?? [tournament.knockout.thirdPlace]
  const fin   = knockoutBracket?.filter(m => m.matchNum === 104) ?? [tournament.knockout.final]

  return (
    <>
      <div className="group-grid">
        {ALL_GROUP_LETTERS.map(letter => {
          const hasData = letter in GROUP_MATCHES
          const cls = [
            'group-cell',
            activeGroup === letter && 'group-cell--active',
            !hasData && 'group-cell--empty',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={letter}
              className={cls}
              onClick={() => hasData && setActiveGroup(letter)}
              disabled={!hasData}
            >
              {GROUP_HEBREW[letter]}
            </button>
          )
        })}
      </div>

      <section className="content-section">
        {activeMatches.map(match => (
          <MatchRow
            key={match.id}
            match={match}
            scores={predictions[match.id] ?? { home: null, away: null }}
            onChange={noop}
            readOnly
          />
        ))}
        <StandingsTable standings={activeStandings} />
      </section>

      <section className="content-section">
        <div className="section-tag">דירוג נבחרות במקום השלישי</div>
        <ThirdPlaceTable qualification={thirdPlaceQual} allGroupsFilled={allGroupsFilled} />
      </section>

      <section className="content-section">
        <div className="section-tag">שלב ה-32</div>
        <KnockoutTable matches={r32} predictions={predictions} onChange={noop} readOnly />
      </section>

      <section className="content-section">
        <div className="section-tag">שמינית גמר</div>
        <KnockoutTable matches={r16} predictions={predictions} onChange={noop} readOnly />
      </section>

      <section className="content-section">
        <div className="section-tag">רבע גמר</div>
        <KnockoutTable matches={qf} predictions={predictions} onChange={noop} readOnly />
      </section>

      <section className="content-section">
        <div className="section-tag">חצי גמר</div>
        <KnockoutTable matches={sf} predictions={predictions} onChange={noop} readOnly />
      </section>

      <section className="content-section">
        <div className="section-tag">מקום שלישי</div>
        <KnockoutTable matches={third} predictions={predictions} onChange={noop} readOnly />
      </section>

      <section className="content-section">
        <div className="section-tag">גמר</div>
        <KnockoutTable matches={fin} predictions={predictions} onChange={noop} readOnly />
      </section>

      {topGoalscorer && (
        <section className="content-section">
          <div className="section-tag">מלך השערים</div>
          <div className="goalscorer-card" dir="rtl">
            <span className="goalscorer-input">{topGoalscorer}</span>
          </div>
        </section>
      )}

      {finalWinner && <ChampionBanner winner={finalWinner} />}
    </>
  )
}
