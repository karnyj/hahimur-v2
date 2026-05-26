import FormPage from './pages/form/FormPage'
import FormsPage from './pages/forms/FormsPage'
import GroupPage from './pages/group/GroupPage'
import HomePage from './pages/home/HomePage'
import MatchPredictionsPage from './pages/match/MatchPredictionsPage'
import ResultsPage from './pages/results/ResultsPage'
import { GROUPS } from './shared/groups'
import { computeGroupVotes } from './pages/group/groupVotes'
import { USERS } from './users/index'
import * as results from './results'
import { useUpdateCheck } from './shared/useUpdateCheck'
import UpdateBanner from './shared/UpdateBanner'

const FIVE_MINUTES = 5 * 60 * 1000
const FAST_CHECK = 5 * 1000

export default function App() {
  const pathname = window.location.pathname.toLowerCase()
  const interval = new URLSearchParams(window.location.search).has('fastCheck') ? FAST_CHECK : FIVE_MINUTES
  const { updateAvailable } = useUpdateCheck(interval)
  const matchId = pathname.startsWith('/match/') ? pathname.slice('/match/'.length).toUpperCase() : null

  return (
    <>
      <UpdateBanner updateAvailable={updateAvailable} />
      {matchId                            ? <MatchPredictionsPage matchId={matchId} /> :
       pathname === '/results'            ? <ResultsPage results={results} /> :
       pathname === '/forms'              ? <FormsPage /> :
       pathname === '/form'               ? <FormPage /> :
       pathname.startsWith('/group/')     ? <GroupPage groupName={`בית ${GROUPS['A'].he}`} votes={computeGroupVotes(USERS)} /> :
       <HomePage />}
    </>
  )
}
