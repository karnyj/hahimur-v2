import type { TournamentResults } from './shared/types'

export const tournamentResults: TournamentResults = {
  groupMatches: {},
  groupTables: {},
  thirdPlaceQualification: { resolved: false, all: [], tied: [] },
  knockoutStages: {
    r32: [],
    r16: [],
    qf: [],
    sf: [],
    thirdPlace: [],
    final: [],
  },
}
