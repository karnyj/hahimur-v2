import { useState, useMemo } from 'react'
import type { PredictionsState } from '../../shared/types'
import { GROUP_MATCHES, GROUP_HEBREW, ALL_GROUP_LETTERS, type GroupLetter } from '../../shared/groups'
import { calculateStandings } from '../../shared/standings'
import { computeGroupVotes } from '../group/groupVotes'
import { USERS } from '../../users/index'
import PageLayout from '../../shared/PageLayout'
import MatchRow from '../../formView/groupStage/MatchRow'
import StandingsTable from '../../formView/groupStage/StandingsTable'
import GroupVoteMatrix from '../../shared/GroupVoteMatrix'
import './ResultsPage.css'

interface Results {
  predictions: PredictionsState
  topGoalscorer: string
}

interface Props {
  results: Results
}

const noop = () => {}

export default function ResultsPage({ results }: Props) {
  const [activeGroup, setActiveGroup] = useState<GroupLetter>('A')

  const matches = GROUP_MATCHES[activeGroup] ?? []
  const { standings } = useMemo(
    () => calculateStandings(matches, results.predictions),
    [activeGroup, results.predictions]
  )
  const votes = useMemo(() => computeGroupVotes(USERS, activeGroup), [activeGroup])

  return (
    <PageLayout title="תוצאות">
      <main className="results-main">
        <div className="results-group-select" dir="rtl">
          <select
            value={activeGroup}
            onChange={e => setActiveGroup(e.target.value as GroupLetter)}
            aria-label="בחר בית"
          >
            {ALL_GROUP_LETTERS.map(letter => (
              <option key={letter} value={letter}>
                בית {GROUP_HEBREW[letter]}
              </option>
            ))}
          </select>
        </div>

        <section className="content-section">
          {matches.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              scores={results.predictions[match.id] ?? { home: null, away: null }}
              onChange={noop}
              readOnly
            />
          ))}
          <StandingsTable standings={standings} />
        </section>

        <section className="content-section results-votes">
          <div className="section-tag">תחזיות הבית</div>
          <GroupVoteMatrix votes={votes} />
        </section>
      </main>
    </PageLayout>
  )
}
