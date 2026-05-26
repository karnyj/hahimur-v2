import type { PredictionsState } from '../../shared/types'
import FormView from '../../formView/FormView'
import PageLayout from '../../shared/PageLayout'

interface Results {
  predictions: PredictionsState
  topGoalscorer: string
}

interface Props {
  results: Results
}

export default function ResultsPage({ results }: Props) {
  return (
    <PageLayout title="תוצאות">
      <main>
        <FormView predictions={results.predictions} topGoalscorer={results.topGoalscorer} />
      </main>
    </PageLayout>
  )
}
