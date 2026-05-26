import { ALL_GROUP_LETTERS, GROUP_HEBREW, GROUP_MATCHES } from '../../shared/groups'
import { calculateStandings } from '../../shared/standings'
import { computeGroupVotes } from '../group/groupVotes'
import { USERS } from '../../users/index'
import type { PredictionsState, Standing, Match, MatchScores } from '../../shared/types'
import type { GroupVotes } from '../group/groupVotes'

export interface GroupOption {
  letter: string
  hebrew: string
}

export interface GroupData {
  standings: Standing[]
  votes: GroupVotes
  matches: Match[]
  scores: Record<string, MatchScores>
}

export interface ResultsPageData {
  groups: GroupOption[]
  byGroup: Record<string, GroupData>
}

export function prepareResultsData(predictions: PredictionsState): ResultsPageData {
  const groups = ALL_GROUP_LETTERS.map(letter => ({ letter, hebrew: GROUP_HEBREW[letter] }))

  const byGroup = Object.fromEntries(
    ALL_GROUP_LETTERS.map(letter => {
      const matches = GROUP_MATCHES[letter] ?? []
      const { standings } = calculateStandings(matches, predictions)
      const votes = computeGroupVotes(USERS, letter)
      const scores = Object.fromEntries(
        matches.map(m => [m.id, predictions[m.id] ?? { home: null, away: null }])
      )
      return [letter, { standings, votes, matches, scores }]
    })
  )

  return { groups, byGroup }
}
