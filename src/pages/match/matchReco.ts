import type { GroupMatch, MatchScores, PredictionsState, TournamentResults } from '../../shared/types'
import type { User } from '../../users'
import { USERS } from '../../users'
import { GROUP_MATCHES, TEAMS } from '../../shared/groups'
import { viewerScenario, deepestStage, type ViewerScenarioEval } from '../../../sim-core'
import { realPlayedState } from '../../leaderboard/winprob/realPlayed'

export type Want = 'home' | 'draw' | 'away'

// Spread the simulation budget over the three outcomes. Viewer-only sims are
// cheap (no rival scoring), so a modest budget gives a fast, stable read.
const DEFAULT_SIM_BUDGET = 9_000
const MIN_SIMS_PER_OUTCOME = 2_000
const MAX_SIMS_PER_OUTCOME = 6_000
const DEFAULT_SEED = 0x5eed
// Only call a result "better for you" when it adds a real, stable slice of
// expected points (paired comparison via common random numbers). Below this the
// three outcomes are a wash and we stay on your own predicted result.
const MIN_POINTS_GAIN = 1.0
// A deep-pick's reach probability has to move this much between outcomes before
// we call it out (8 percentage points — below that it's noise).
const REACH_SWING = 0.08
// Likewise for an expected-points category (place points, continuation).
const CAT_SWING = 0.5

const he = (team: string) => TEAMS[team]?.he ?? team

function dir(s?: MatchScores): Want | null {
  if (!s || s.home == null || s.away == null) return null
  if (s.home > s.away) return 'home'
  if (s.away > s.home) return 'away'
  return 'draw'
}

// A neutral scoreline to feed the model for a wanted outcome: the field's most
// common predicted scoreline in that direction (so everyone's match points land
// realistically), falling back to a minimal canonical margin.
function representativeScore(matchId: string, want: Want, users: User[]): MatchScores {
  const counts = new Map<string, number>()
  for (const u of users) {
    const p = u.predictions[matchId]
    if (dir(p) === want) {
      const key = `${p!.home}-${p!.away}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  let bestKey: string | null = null
  let bestN = 0
  for (const [k, c] of counts) if (c > bestN) { bestN = c; bestKey = k }
  if (bestKey) {
    const [h, a] = bestKey.split('-').map(Number)
    return { home: h, away: a }
  }
  if (want === 'home') return { home: 1, away: 0 }
  if (want === 'away') return { home: 0, away: 1 }
  return { home: 1, away: 1 }
}

function choiceText(m: GroupMatch, want: Want): string {
  if (want === 'draw') return `תיקו בין ${he(m.homeTeam)} ל${he(m.awayTeam)}`
  const winner = want === 'home' ? m.homeTeam : m.awayTeam
  const loser = want === 'home' ? m.awayTeam : m.homeTeam
  return `${he(winner)} מנצחת את ${he(loser)}`
}

// One concrete, illustrated line in the "why this result is good/bad for you"
// explanation. `good` tints it (a plus or a minus for the viewer).
export interface OutcomeReason {
  good: boolean
  textHe: string
}

export interface OutcomeEval {
  want: Want
  text: string
  // The viewer's own expected points (across the rest of the tournament) under
  // this result. Higher is better — this is the whole basis of the ranking now.
  expPoints: number
  // How many expected points worse this outcome is than the best one
  // (0 for the best; larger = it costs you more of your own bet).
  gapFromBest: number
  // Whether this is the result your own bracket roots for.
  matchesBracket: boolean
  // The concrete, illustrated reasons this result helps or hurts *your bet* —
  // your scoreline prediction, your group ordering, and your continuation picks.
  reasons: OutcomeReason[]
}

export interface MatchRecommendation {
  decided: boolean        // the match already has a final score — nothing to advise
  matchId: string
  homeHe: string
  awayHe: string
  scored: boolean
  outcomes: OutcomeEval[]  // sorted best (most expected points) first
  best?: OutcomeEval
  naive?: OutcomeEval      // the result your own bracket roots for
  counterIntuitive: boolean
  noPreference: boolean    // all three outcomes are a wash for your bet
}

export interface MatchRecommendOptions {
  simBudget?: number
  seed?: number
  users?: User[]
}

function findGroupMatch(matchId: string): GroupMatch | null {
  return (GROUP_MATCHES[matchId[0]] ?? []).find(m => m.id === matchId) ?? null
}

// The result the viewer's own bracket roots for: their predicted direction, else
// the side whose team they carry deeper in the bracket, else home.
function naiveWant(user: User, m: GroupMatch): Want {
  const pred = dir(user.predictions[m.id])
  if (pred) return pred
  const home = deepestStage(user, m.homeTeam).rank
  const away = deepestStage(user, m.awayTeam).rank
  if (home !== away) return home > away ? 'home' : 'away'
  return 'home'
}

// The competitive recommendation for `matchId` from `user`'s point of view: the
// result that gives them the best *finish* across the whole field, found by
// simulating the rest of the tournament under each outcome (common random
// numbers, so the three are a paired comparison). When that result differs from
// what their own bracket wants, the engine names the rival who benefits from the
// instinctive result — the heart of "root against your own pick".
export function recommendMatchOutcome(
  user: User,
  matchId: string,
  results: TournamentResults,
  opts: MatchRecommendOptions = {},
): MatchRecommendation | null {
  const m = findGroupMatch(matchId)
  if (!m) return null

  const live = results.live ?? {}
  const settled: PredictionsState = {}
  for (const [id, s] of Object.entries(realPlayedState(results))) {
    if (!live[id]) settled[id] = s
  }

  const base = { decided: false, matchId, homeHe: he(m.homeTeam), awayHe: he(m.awayTeam), counterIntuitive: false, noPreference: false }

  // Already finished (final score, not a live in-progress one) → decided.
  if (settled[matchId]) {
    return { ...base, decided: true, scored: false, outcomes: [] }
  }

  const users = opts.users ?? USERS
  const realGoals = results.playerGoals ?? {}
  const seed = opts.seed ?? DEFAULT_SEED
  // An explicit budget is taken at face value (tests run tiny); the default path
  // keeps a floor so the live read is precise enough to trust.
  const perOutcome = Math.round((opts.simBudget ?? DEFAULT_SIM_BUDGET) / 3)
  const sims = opts.simBudget
    ? Math.max(1, Math.min(MAX_SIMS_PER_OUTCOME, perOutcome))
    : Math.max(MIN_SIMS_PER_OUTCOME, Math.min(MAX_SIMS_PER_OUTCOME, perOutcome))

  type RawOutcome = { want: Want; text: string; expPoints: number }
  const wants: Want[] = ['home', 'draw', 'away']
  const evals = new Map<Want, ViewerScenarioEval>()
  const raw: RawOutcome[] = []
  // Track the viewer's own stake in the two teams of *this* match, so the
  // explanation can talk about their deep picks (reach probabilities) directly.
  const trackTeams = [m.homeTeam, m.awayTeam]
  for (const want of wants) {
    const played: PredictionsState = { ...settled, [matchId]: representativeScore(matchId, want, users) }
    const ev = viewerScenario(user, played, sims, seed, realGoals, trackTeams)
    evals.set(want, ev)
    raw.push({ want, text: choiceText(m, want), expPoints: ev.stages.total })
  }

  const naiveW = naiveWant(user, m)
  const naiveRaw = raw.find(o => o.want === naiveW)!

  // Best = most of *your* expected points; ties broken by staying on the result
  // your own bracket predicted (never nudge for nothing).
  const points = (w: Want) => evals.get(w)!.stages.total
  const bestW = [...wants].sort((a, b) => {
    if (Math.abs(points(a) - points(b)) > 1e-9) return points(b) - points(a)
    return a === naiveW ? -1 : b === naiveW ? 1 : 0
  })[0]
  let bestRaw = raw.find(o => o.want === bestW)!

  const pointsSpread = Math.max(...raw.map(o => o.expPoints)) - Math.min(...raw.map(o => o.expPoints))
  const gain = bestRaw.expPoints - naiveRaw.expPoints
  const meaningful = bestRaw.want !== naiveRaw.want && gain >= MIN_POINTS_GAIN
  if (!meaningful) bestRaw = naiveRaw

  const crossPoints = (e: ViewerScenarioEval) =>
    e.stages.r32 + e.stages.r16 + e.stages.qf + e.stages.sf + e.stages.third + e.stages.final

  // The concrete "why" for one outcome, grounded purely in the viewer's own bet
  // and compared against a reference: the best result for the losing/middle ones
  // (so it reads "what you give up"), and the *worst* alternative for the best
  // result (so it reads "what you secure"). No other players involved.
  const reasonsFor = (want: Want): OutcomeReason[] => {
    const isBest = want === bestRaw.want
    const refWant = isBest
      ? [...wants].filter(w => w !== want).sort((a, b) => points(a) - points(b))[0]
      : bestRaw.want
    const cur = evals.get(want)!
    const ref = evals.get(refWant)!
    const reasons: OutcomeReason[] = []

    // 1) Your scoreline — match points, hit (direction) vs bullseye (exact).
    //    Shown on *every* outcome: a plus when this result matches what you
    //    predicted, a minus when it misses it. This is usually the biggest swing
    //    in a group game, so surfacing the loss on the other results is what makes
    //    clear *why* one result is recommended over another.
    const pred = user.predictions[m.id]
    const predDir = dir(pred)
    if (pred && predDir) {
      if (predDir === want) {
        reasons.push({
          good: true,
          textHe: `ניחשת ${pred.home}–${pred.away}: אם הכיוון ייצא — פגיעה, ואם זו גם התוצאה המדויקת — צליפה.`,
        })
      } else {
        reasons.push({
          good: false,
          textHe: `ניחשת ${pred.home}–${pred.away}, אז תוצאה כזו מפספסת את נקודות הניחוש שלך על המשחק (צליפה/פגיעה).`,
        })
      }
    }

    // 2) Your group ordering — exact place + top-2 advancement.
    const placeDelta = cur.stages.group.placePoints - ref.stages.group.placePoints
    if (Math.abs(placeDelta) >= CAT_SWING) {
      reasons.push({
        good: placeDelta > 0,
        textHe: placeDelta > 0
          ? 'הסידור שניחשת בבית מסתדר טוב יותר בתרחיש הזה — יותר נקודות מיקום.'
          : 'הסידור שניחשת בבית פחות מסתדר בתרחיש הזה — פחות נקודות מיקום.',
      })
    }
    const advDelta = cur.stages.group.advancementPoints - ref.stages.group.advancementPoints
    if (Math.abs(advDelta) >= CAT_SWING) {
      reasons.push({
        good: advDelta > 0,
        textHe: advDelta > 0
          ? 'יותר מהקבוצות שניחשת עולות מהבית בתרחיש הזה.'
          : 'פחות מהקבוצות שניחשת עולות מהבית בתרחיש הזה.',
      })
    }

    // 3) Your continuation picks — a team you carry deep moving toward/away from
    //    the stage you predicted for it.
    const refReach = new Map(ref.reach.map(r => [r.team, r.prob]))
    let hadReach = false
    for (const r of cur.reach) {
      const delta = r.prob - (refReach.get(r.team) ?? r.prob)
      if (Math.abs(delta) < REACH_SWING) continue
      hadReach = true
      const teamHe = he(r.team)
      reasons.push({
        good: delta > 0,
        textHe: delta > 0
          ? `${teamHe} (${r.label}) — תוצאה כזו מקרבת את הניחוש הזה שלך להתממש.`
          : `${teamHe} (${r.label}) — תוצאה כזו מרחיקה את הניחוש הזה שלך מלהתממש.`,
      })
    }

    // Continuation fallback when neither team is a deep pick: the aggregate
    // knockout (cross + beyond) swing from your bracket.
    if (!hadReach) {
      const crossDelta = crossPoints(cur) - crossPoints(ref)
      if (Math.abs(crossDelta) >= CAT_SWING) {
        reasons.push({
          good: crossDelta > 0,
          textHe: crossDelta > 0
            ? 'הניחושים שלך להמשך (הצלבה ומעבר) מרוויחים בתרחיש הזה.'
            : 'הניחושים שלך להמשך (הצלבה ומעבר) נפגעים בתרחיש הזה.',
        })
      }
    }

    return reasons.slice(0, 4)
  }

  const outcomes: OutcomeEval[] = raw.map(o => ({
    ...o,
    gapFromBest: bestRaw.expPoints - o.expPoints,
    matchesBracket: o.want === naiveW,
    reasons: reasonsFor(o.want),
  }))
  const best = outcomes.find(o => o.want === bestRaw.want)!
  const naive = outcomes.find(o => o.want === naiveW)!

  return {
    ...base,
    scored: true,
    outcomes: [...outcomes].sort((a, b) => b.expPoints - a.expPoints),
    best,
    naive,
    counterIntuitive: meaningful,
    noPreference: pointsSpread < MIN_POINTS_GAIN,
  }
}
