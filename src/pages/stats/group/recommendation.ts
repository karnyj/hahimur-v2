import type { GroupMatch, MatchScores, PredictionsState, TournamentResults } from '../../../shared/types'
import type { User } from '../../../users'
import { GROUP_MATCHES, TEAMS } from '../../../shared/groups'
import { calculateStandings } from '../../../shared/standings'
import {
  viewerScenario,
  deepestStage,
  type ExpectedBreakdown,
  type ViewerScenarioEval,
} from '../../../../sim-core'
import { singleMatchPoints, PLACE_POINT, OLEH_POINTS } from '../../../leaderboard/points'
import { realPlayedState } from '../../../leaderboard/winprob/realPlayed'

// A wanted real-world result for one remaining match, from the player's POV.
export type Want = 'home' | 'draw' | 'away'

// "What's best for me" in this group's last round is judged purely on *my own
// expected points* over the rest of the tournament — my standings bet, my
// advancement bet and (when a result helps a team I carry deep) the cross. No
// other players. We only run the cross-aware score when the group is near its
// end, which keeps the combinatorics tiny: at most 3^MAX_REMAINING scenarios.
const MAX_REMAINING_TO_SCORE = 3

// Viewer-only sims are cheap (no rival scoring), so a modest budget gives a fast,
// stable read: a quick scan ranks the candidates, then the front-runner and the
// obvious pick are re-run at higher precision (with reach tracking) for the
// displayed advice.
const DEFAULT_SCAN_BUDGET = 6_000
const MIN_SIMS_PER_CANDIDATE = 400
const MAX_SIMS_PER_CANDIDATE = 2_000
const REFINE_SIMS = 3_000
const DEFAULT_SEED = 0x5eed
// Only steer the player off their own predicted result when it adds a real,
// stable slice of *their* expected points (paired comparison via common random
// numbers). Below this the results are a wash and we stay on their prediction.
const MIN_POINTS_GAIN = 1.0
// A deep-pick's reach probability has to move this much between scenarios before
// we call it out (8 percentage points — below that it's noise).
const MIN_REACH_SWING = 0.08
// An expected-points category (place, match, continuation) has to move this much.
const CAT_SWING = 0.5

const he = (team: string) => TEAMS[team]?.he ?? team

function dir(s?: MatchScores): Want | null {
  if (!s || s.home == null || s.away == null) return null
  if (s.home > s.away) return 'home'
  if (s.away > s.home) return 'away'
  return 'draw'
}

// The scoreline we feed the model for a wanted outcome. When the player's own
// prediction already points that way we reuse it, so the recommended scenario
// doubles as their צליפה target; otherwise a minimal canonical margin.
function repScore(want: Want, pred?: MatchScores): MatchScores {
  if (pred && dir(pred) === want) return { home: pred.home, away: pred.away }
  if (want === 'home') return { home: 1, away: 0 }
  if (want === 'away') return { home: 0, away: 1 }
  return { home: 1, away: 1 }
}

export function remainingGroupMatches(groupLetter: string, realPlayed: PredictionsState): GroupMatch[] {
  return (GROUP_MATCHES[groupLetter] ?? []).filter(m => !realPlayed[m.id])
}

// The matches whose final score is locked in. A match in progress carries a
// provisional live score, but it is NOT settled: we keep it in "remaining" and
// reason about its final outcome, rather than baking the current minute in.
export function settledState(results: TournamentResults): PredictionsState {
  const live = results.live ?? {}
  const settled: PredictionsState = {}
  for (const [id, s] of Object.entries(realPlayedState(results))) {
    if (!live[id]) settled[id] = s
  }
  return settled
}

// Cheap, simulation-free: which of this group's matches still need a result.
// Lets the UI decide whether to show the card before paying for the heavy score.
export function remainingForGroup(groupLetter: string, results: TournamentResults): GroupMatch[] {
  return remainingGroupMatches(groupLetter, settledState(results))
}

function allWantCombos(n: number): Want[][] {
  if (n === 0) return [[]]
  const rest = allWantCombos(n - 1)
  const out: Want[][] = []
  for (const w of ['home', 'draw', 'away'] as Want[]) {
    for (const r of rest) out.push([w, ...r])
  }
  return out
}

function choiceText(m: GroupMatch, want: Want): string {
  if (want === 'draw') return `תיקו בין ${he(m.homeTeam)} ל${he(m.awayTeam)}`
  const winner = want === 'home' ? m.homeTeam : m.awayTeam
  const loser = want === 'home' ? m.awayTeam : m.homeTeam
  return `${he(winner)} מנצחת את ${he(loser)}`
}

function groupTeams(groupLetter: string): string[] {
  const set = new Set<string>()
  for (const m of GROUP_MATCHES[groupLetter] ?? []) { set.add(m.homeTeam); set.add(m.awayTeam) }
  return [...set]
}

export interface OutcomeChoice {
  matchId: string
  homeHe: string
  awayHe: string
  want: Want
  text: string
}

export interface ScenarioEval {
  choices: OutcomeChoice[]
  order: string[]          // team codes in final group order (1st, 2nd, 3rd, 4th)
  orderHe: string[]
  points: number           // the viewer's own expected points (the basis for ranking)
  breakdown: ExpectedBreakdown
  reach: { team: string; rank: number; label: string; prob: number }[]
}

// One concrete, illustrated line in the "why this is best for you" explanation,
// grounded purely in the player's own bet. `good` tints it (a plus or a minus).
export interface OutcomeReason {
  good: boolean
  textHe: string
}

// The simple, no-simulation read: for each still-unplayed group match, the result
// that's best for the player *within this group only* — the one that balances the
// final-standings points (exact place + top-2 advancement) against the match
// צליפה/פגיעה points. No cross, no rank, no other groups.
export interface NeededOutcome {
  matchId: string
  homeHe: string
  awayHe: string
  want: Want | null
  // Whether this best result is also the direction the player predicted (so the
  // card can flag a deviation that's worth a place/advancement point).
  matchesPrediction: boolean
  text: string
}

// Points-only, goal-difference-free read of what's already mathematically decided
// in the group — sound regardless of remaining scorelines, so it's safe to state
// as fact. `advances` covers the player's predicted top-2 picks; `orderPossible`
// is whether their exact predicted standings can still happen at all.
export interface AdvanceStatus {
  teamHe: string
  slotWord: string   // 'ראשון' / 'שני' — the exact slot the player predicted
  // 'position'   = the *exact* predicted slot is clinched (place point + cross locked)
  // 'advance'    = top-2 (direct advancement) clinched, but the exact slot is still open
  // 'eliminated' = can no longer finish in the top two
  status: 'position' | 'advance' | 'eliminated'
}

export interface GroupContext {
  advances: AdvanceStatus[]
  orderStillPossible: boolean
}

export interface GroupRecommendation {
  remaining: GroupMatch[]
  // Cross-aware part (only when the group is near its end and a player is set):
  scored: boolean
  best?: ScenarioEval
  naive?: ScenarioEval
  // The final group order the player themselves predicted (1st→4th), so the card
  // can anchor its advice on "the standings you gave".
  predictedOrderHe: string[]
  // The basic "what needs to happen" list for every remaining group match, from
  // the player's own predictions — shown before the smart (cross-aware) reco kicks
  // in, so the card is useful in every round, not just the last one.
  neededOutcomes: NeededOutcome[]
  counterIntuitive: boolean
  // Why the recommended last-round result is best for *your bet* — grounded in
  // your scoreline prediction, your group ordering and your continuation picks.
  reasons: OutcomeReason[]
  groupContext: GroupContext
}

// The final order of *this* group is fully determined once its own matches are
// fixed (real + the candidate's representative scorelines), so we read it off a
// plain standings calc rather than the simulation.
function groupOrder(groupLetter: string, state: PredictionsState): string[] {
  return calculateStandings(GROUP_MATCHES[groupLetter] ?? [], state).standings.map(s => s.team)
}

function evalScenario(
  user: User,
  base: PredictionsState,
  groupLetter: string,
  remaining: GroupMatch[],
  wants: Want[],
  realGoals: Record<string, number> | undefined,
  sims: number,
  seed: number,
  trackTeams: string[],
): ScenarioEval {
  const state: PredictionsState = { ...base }
  remaining.forEach((m, i) => {
    state[m.id] = repScore(wants[i], user.predictions[m.id])
  })
  // Same seed for every candidate ⇒ the rest of the tournament is drawn the same
  // way, so candidates differ only by this group's outcome (paired comparison).
  const ev: ViewerScenarioEval = viewerScenario(user, state, sims, seed, realGoals ?? {}, trackTeams)
  const order = groupOrder(groupLetter, state)
  return {
    choices: remaining.map((m, i) => ({
      matchId: m.id,
      homeHe: he(m.homeTeam),
      awayHe: he(m.awayTeam),
      want: wants[i],
      text: choiceText(m, wants[i]),
    })),
    order,
    orderHe: order.map(he),
    points: ev.stages.total,
    breakdown: ev.stages,
    reach: ev.reach,
  }
}

// How many of the recommended results differ from the player's own prediction.
function diffsFromNaive(best: Want[], naive: Want[]): number {
  return best.reduce((n, w, i) => n + (w === naive[i] ? 0 : 1), 0)
}

// The player's own predicted final order for the group. Place points are scored
// against user.groupTables (their explicit standings bet), so that's the target
// we optimise toward; fall back to the order implied by their scores if unset.
function selfPredictedOrder(user: User, groupLetter: string): string[] {
  const tbl = user.groupTables[groupLetter]
  if (tbl && tbl.length) return tbl.map(s => s.team)
  return groupOrder(groupLetter, user.predictions)
}

// What's already mathematically settled in the group, from points alone (no GD,
// no enumeration — so every claim is sound whatever the remaining scorelines):
//   • a team is top-2 SECURED if at most one rival can even reach its floor
//   • a team is top-2 ELIMINATED if two rivals have already clinched above its ceiling
//   • the exact predicted order is impossible once any predicted-lower team has
//     clinched above a predicted-higher one
function buildGroupContext(groupLetter: string, settled: PredictionsState, predOrder: string[]): GroupContext {
  const teams = groupTeams(groupLetter)
  const gamesPerTeam = Math.max(0, teams.length - 1)
  const standings = calculateStandings(GROUP_MATCHES[groupLetter] ?? [], settled).standings
  const byTeam = new Map(standings.map(s => [s.team, s]))
  const info = new Map(teams.map(t => {
    const s = byTeam.get(t)
    const cur = s?.points ?? 0
    const played = s?.played ?? 0
    return [t, { cur, max: cur + 3 * Math.max(0, gamesPerTeam - played) }]
  }))

  const advances: AdvanceStatus[] = []
  predOrder.slice(0, 2).forEach((t, idx) => {
    const me = info.get(t)
    if (!me) return
    const others = teams.filter(x => x !== t).map(x => info.get(x)!).filter(Boolean)
    const canReachMyFloor = others.filter(o => o.max >= me.cur).length
    const clinchedAboveMe = others.filter(o => o.cur > me.max).length
    const slotWord = idx === 0 ? 'ראשון' : 'שני'
    // Exact 1st is clinched when nobody else can even reach my points floor — that
    // holds whatever the goal differences do. (We don't claim a clinched 2nd: it
    // hinges on a head-to-head/GD margin, so 'advance' is the honest call there.)
    if (idx === 0 && others.every(o => o.max < me.cur)) {
      advances.push({ teamHe: he(t), slotWord, status: 'position' })
    } else if (canReachMyFloor <= 1) {
      advances.push({ teamHe: he(t), slotWord, status: 'advance' })
    } else if (clinchedAboveMe >= 2) {
      advances.push({ teamHe: he(t), slotWord, status: 'eliminated' })
    }
  })

  let orderStillPossible = true
  for (let i = 0; i < predOrder.length && orderStillPossible; i++) {
    for (let j = i + 1; j < predOrder.length; j++) {
      const a = info.get(predOrder[i]); const b = info.get(predOrder[j])
      if (a && b && b.cur > a.max) { orderStillPossible = false; break }
    }
  }

  return { advances, orderStillPossible }
}

// Pick the best remaining-match results for the player *within this group only*.
// We score every direction combo deterministically (no simulation) on the three
// group-local point sources and keep the highest total:
//   • exact place      — PLACE_POINT per team that lands in its predicted slot
//   • top-2 advancement — OLEH_POINTS.group per predicted top-2 team that advances
//   • match points      — צליפה for each match we root for as the player predicted
// This captures the real tension: occasionally it's worth steering a result off
// your scoreline pick (losing its צליפה) to recover a place/advancement point.
// Ties keep you on your own pick (fewest deviations). No cross, rank, or others.
function recommendSelfOutcomes(
  user: User,
  groupLetter: string,
  settled: PredictionsState,
  remaining: GroupMatch[],
): NeededOutcome[] {
  if (remaining.length === 0) return []
  const predOrder = selfPredictedOrder(user, groupLetter)
  const predTop2 = predOrder.slice(0, 2)
  const predDirs = remaining.map(m => dir(user.predictions[m.id]))
  const naiveWants: Want[] = predDirs.map(d => d ?? 'home')

  const scoreSelf = (wants: Want[]): number => {
    const state: PredictionsState = { ...settled }
    remaining.forEach((m, i) => { state[m.id] = repScore(wants[i], user.predictions[m.id]) })
    const order = groupOrder(groupLetter, state)
    let place = 0
    for (let i = 0; i < order.length; i++) if (order[i] === predOrder[i]) place++
    const top2 = new Set(order.slice(0, 2))
    let adv = 0
    for (const t of predTop2) if (top2.has(t)) adv++
    let match = 0
    remaining.forEach((m, i) => {
      const pred = user.predictions[m.id]
      if (pred && dir(pred) === wants[i]) match += singleMatchPoints(m.id, pred, pred)
    })
    return place * PLACE_POINT + adv * OLEH_POINTS.group + match
  }

  const deviations = (w: Want[]) => w.reduce((n, x, i) => n + (x === naiveWants[i] ? 0 : 1), 0)

  let bestWants = naiveWants
  let bestScore = scoreSelf(naiveWants)
  let bestDev = 0
  for (const wants of allWantCombos(remaining.length)) {
    const s = scoreSelf(wants)
    const dev = deviations(wants)
    if (s > bestScore + 1e-9 || (Math.abs(s - bestScore) < 1e-9 && dev < bestDev)) {
      bestWants = wants; bestScore = s; bestDev = dev
    }
  }

  return remaining.map((m, i) => ({
    matchId: m.id,
    homeHe: he(m.homeTeam),
    awayHe: he(m.awayTeam),
    want: bestWants[i],
    matchesPrediction: predDirs[i] === bestWants[i],
    text: choiceText(m, bestWants[i]),
  }))
}

// Why the recommended last-round result is the best play for *your bet*, grounded
// only in your own picks (no other players): the tradeoff between your group
// scoreline points, your group ordering (place + advancement) and your
// continuation picks (a team you carry deep getting closer/further from the stage
// you predicted). Read off the paired best-vs-obvious breakdowns + reach.
function buildGroupReasons(best: ScenarioEval, naive: ScenarioEval): OutcomeReason[] {
  const reasons: OutcomeReason[] = []
  const b = best.breakdown, n = naive.breakdown

  const matchD = b.group.matchPoints - n.group.matchPoints
  if (Math.abs(matchD) >= CAT_SWING) {
    reasons.push({
      good: matchD > 0,
      textHe: matchD > 0
        ? 'מרוויח לך נקודות צליפה/פגיעה במשחקי הבית.'
        : 'מוותר על נקודות צליפה/פגיעה באחד ממשחקי הבית — אבל מרוויח במקום אחר.',
    })
  }

  const placeD = b.group.placePoints - n.group.placePoints
  if (Math.abs(placeD) >= CAT_SWING) {
    reasons.push({
      good: placeD > 0,
      textHe: placeD > 0
        ? 'הסידור שניחשת בבית מסתדר טוב יותר — יותר נקודות מיקום.'
        : 'הסידור שניחשת בבית פחות מסתדר — פחות נקודות מיקום.',
    })
  }

  const advD = b.group.advancementPoints - n.group.advancementPoints
  if (Math.abs(advD) >= CAT_SWING) {
    reasons.push({
      good: advD > 0,
      textHe: advD > 0
        ? 'יותר מהקבוצות שניחשת עולות מהבית.'
        : 'פחות מהקבוצות שניחשת עולות מהבית.',
    })
  }

  // Continuation: each team you carry deep, and whether this result moves it
  // toward the stage you predicted for it.
  const naiveByTeam = new Map(naive.reach.map(r => [r.team, r]))
  for (const r of best.reach) {
    const delta = r.prob - (naiveByTeam.get(r.team)?.prob ?? r.prob)
    if (Math.abs(delta) < MIN_REACH_SWING) continue
    reasons.push({
      good: delta > 0,
      textHe: delta > 0
        ? `${he(r.team)} (${r.label}) — מקרב את הניחוש הזה שלך להתממש.`
        : `${he(r.team)} (${r.label}) — מרחיק את הניחוש הזה שלך מלהתממש.`,
    })
  }

  // Continuation fallback when no tracked team moved: the aggregate knockout swing.
  if (!best.reach.some(r => Math.abs(r.prob - (naiveByTeam.get(r.team)?.prob ?? r.prob)) >= MIN_REACH_SWING)) {
    const cross = (e: ExpectedBreakdown) => e.r32 + e.r16 + e.qf + e.sf + e.third + e.final
    const crossD = cross(b) - cross(n)
    if (Math.abs(crossD) >= CAT_SWING) {
      reasons.push({
        good: crossD > 0,
        textHe: crossD > 0
          ? 'הניחושים שלך להמשך (הצלבה ומעבר) מרוויחים בתרחיש הזה.'
          : 'הניחושים שלך להמשך (הצלבה ומעבר) נפגעים בתרחיש הזה.',
      })
    }
  }

  return reasons.slice(0, 4)
}

export interface RecommendOptions {
  simBudget?: number
  refineSims?: number
  seed?: number
}

// The smart recommendation for `groupLetter` from `user`'s point of view, given
// the real results so far. Every possible last-round outcome is ranked by the
// player's *expected finish vs the field* over many simulated completions of the
// rest of the tournament (other groups + the whole knockout), so a result that
// helps the knockout cross — or that quietly hurts a close rival — can beat the
// obvious one, without pretending we already know how the other groups end.
// Heavy: meant to run off the main thread.
export function recommendGroupOutcomes(
  user: User,
  groupLetter: string,
  results: TournamentResults,
  opts: RecommendOptions = {},
): GroupRecommendation {
  const realPlayed = settledState(results)
  const remaining = remainingGroupMatches(groupLetter, realPlayed)

  const predOrder = selfPredictedOrder(user, groupLetter)
  const predictedOrderHe = predOrder.map(he)
  const neededOutcomes = recommendSelfOutcomes(user, groupLetter, realPlayed, remaining)
  const groupContext = buildGroupContext(groupLetter, realPlayed, predOrder)

  const empty: GroupRecommendation = {
    remaining,
    scored: false,
    predictedOrderHe,
    neededOutcomes,
    counterIntuitive: false,
    reasons: [],
    groupContext,
  }

  if (remaining.length === 0 || remaining.length > MAX_REMAINING_TO_SCORE) return empty

  // Only the real results so far are fixed; the simulation samples everything
  // else, so the recommendation never assumes how the other groups finish.
  const base: PredictionsState = { ...realPlayed }
  const realGoals = results.playerGoals

  // The teams in this group the player carries into the knockout — the ones whose
  // fate the last round can swing, and the heart of the "stay eligible" insight.
  // rank >= 1 so a pick to advance *as a best third* (the most margin-sensitive
  // bet of all) is tracked too, not just top-2 finishes and deeper knockout picks.
  const tracked = groupTeams(groupLetter).filter(t => deepestStage(user, t).rank >= 1)

  const combos = allWantCombos(remaining.length)
  const seed = opts.seed ?? DEFAULT_SEED
  // An explicit budget is taken at face value (tests run tiny); the default path
  // keeps a floor so the ranking is precise enough to trust.
  const perCombo = Math.round((opts.simBudget ?? DEFAULT_SCAN_BUDGET) / combos.length)
  const scanSims = opts.simBudget
    ? Math.max(1, Math.min(MAX_SIMS_PER_CANDIDATE, perCombo))
    : Math.max(MIN_SIMS_PER_CANDIDATE, Math.min(MAX_SIMS_PER_CANDIDATE, perCombo))
  const refineSims = opts.refineSims ?? (opts.simBudget ? scanSims : REFINE_SIMS)

  const naiveWants: Want[] = remaining.map(m => dir(user.predictions[m.id]) ?? 'home')

  // More of *your own* expected points wins; ties go to staying on your own
  // predicted result (never nudge for nothing).
  const beats = (a: ScenarioEval, aw: Want[], b: ScenarioEval, bw: Want[]): boolean => {
    if (Math.abs(a.points - b.points) > 1e-9) return a.points > b.points
    return diffsFromNaive(aw, naiveWants) < diffsFromNaive(bw, naiveWants)
  }

  // Scan: rank every candidate by your expected points (lighter, no reach tracking).
  let bestWants = naiveWants
  let bestScan = evalScenario(user, base, groupLetter, remaining, naiveWants, realGoals, scanSims, seed, [])
  for (const wants of combos) {
    const evald = evalScenario(user, base, groupLetter, remaining, wants, realGoals, scanSims, seed, [])
    if (beats(evald, wants, bestScan, bestWants)) { bestScan = evald; bestWants = wants }
  }

  // Refine the obvious pick and the front-runner at higher precision (with reach
  // tracking). Common random numbers (same seed) make best-vs-obvious a paired
  // comparison, so the points gain that drives the nudge is stable.
  const naive = evalScenario(user, base, groupLetter, remaining, naiveWants, realGoals, refineSims, seed, tracked)
  const sameAsNaive = diffsFromNaive(bestWants, naiveWants) === 0
  let best = sameAsNaive
    ? naive
    : evalScenario(user, base, groupLetter, remaining, bestWants, realGoals, refineSims, seed, tracked)

  const meaningful = !sameAsNaive && best.points - naive.points >= MIN_POINTS_GAIN
  if (!meaningful) best = naive

  return {
    remaining,
    scored: true,
    best,
    naive,
    predictedOrderHe,
    neededOutcomes,
    counterIntuitive: meaningful,
    reasons: meaningful ? buildGroupReasons(best, naive) : [],
    groupContext,
  }
}
