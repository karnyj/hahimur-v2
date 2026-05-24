import type { PredictionsState } from '../shared/types'

import * as elrad_gome from './elrad-gome'
import * as idan_melamed from './idan-melamed'

export interface User {
  label: string
  number: string
  predictions: PredictionsState
  topGoalscorer: string
}

export const USERS: User[] = [
  elrad_gome,
  idan_melamed,
]
