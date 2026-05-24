import FormPage from './pages/form/FormPage'
import FormsPage from './pages/forms/FormsPage'
import HomePage from './pages/home/HomePage'
import MatchPredictionsPage from './pages/match/MatchPredictionsPage'
import ResultsPage from './pages/results/ResultsPage'
import * as results from './results'

export default function App() {
  const pathname = window.location.pathname.toLowerCase()
  return (
    <>
      {pathname === '/match/a1' ? <MatchPredictionsPage /> :
       pathname === '/results'  ? <ResultsPage results={results} /> :
       pathname === '/forms'    ? <FormsPage /> :
       pathname === '/form'     ? <FormPage /> :
       <HomePage />}
    </>
  )
}
