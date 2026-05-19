import type { Match, Prediction, Standing } from '../types'

function emptyStanding(team: string): Standing {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
}

export function calculateStandings(matches: Match[], predictions: Prediction[]): Standing[] {
  const byTeam = new Map<string, Standing>()
  for (const m of matches) {
    if (!byTeam.has(m.homeTeam)) byTeam.set(m.homeTeam, emptyStanding(m.homeTeam))
    if (!byTeam.has(m.awayTeam)) byTeam.set(m.awayTeam, emptyStanding(m.awayTeam))
  }

  const predictionByMatchId = new Map(predictions.map(p => [p.matchId, p]))

  for (const match of matches) {
    const pred = predictionByMatchId.get(match.id)
    if (!pred || pred.home === null || pred.away === null) continue

    const home = byTeam.get(match.homeTeam)!
    const away = byTeam.get(match.awayTeam)!

    home.played++; away.played++
    home.goalsFor += pred.home;    away.goalsFor += pred.away
    home.goalsAgainst += pred.away; away.goalsAgainst += pred.home
    home.goalDifference = home.goalsFor - home.goalsAgainst
    away.goalDifference = away.goalsFor - away.goalsAgainst

    if (pred.home > pred.away) {
      home.won++; home.points += 3; away.lost++
    } else if (pred.away > pred.home) {
      away.won++; away.points += 3; home.lost++
    } else {
      home.drawn++; home.points++; away.drawn++; away.points++
    }
  }

  return [...byTeam.values()].sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team)
  )
}
