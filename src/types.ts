export type Score = number | null

export interface Match {
  homeTeam: string
  awayTeam: string
}

export interface MatchScores {
  home: Score
  away: Score
}
