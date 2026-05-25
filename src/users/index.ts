import type { PredictionsState } from '../shared/types'

import * as eldad_levi from './eldad-levi'
import * as elrad_gome from './elrad-gome'
import * as idan_melamed from './idan-melamed'
import * as tal_lichter from './tal-lichter'

export interface User {
  label: string
  predictions: PredictionsState
  topGoalscorer: string
}

export const USERS: User[] = [
  eldad_levi,
  elrad_gome,
  idan_melamed,
  tal_lichter,
]
