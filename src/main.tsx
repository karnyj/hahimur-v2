import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'
import App from './App.tsx'
import ResultsLoader from './ResultsLoader.tsx'

const isResultsPage = window.location.pathname === '/results'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isResultsPage ? <ResultsLoader /> : <App />}
  </StrictMode>,
)
