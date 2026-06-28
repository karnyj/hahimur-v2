import type { VercelRequest, VercelResponse } from '@vercel/node'

// Self-contained on purpose (imports nothing from src), like live-scores.ts: a
// dumb ESPN proxy. The scoreboard list returns the after-extra-time score and
// null linescores, so the 90' regulation score a knockout prediction is judged
// against is only recoverable from the PER-EVENT summary's period linescores.
// This endpoint fetches one such summary and slims it to the competitors the
// client's extractor (src/shared/espnKnockout.ts) needs.

const ESPN_SUMMARY = (event: string) =>
  `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event}`

interface SlimCompetitor {
  homeAway: 'home' | 'away'
  winner: boolean
  team: string | null // ESPN displayName, so the client can orient to our bracket
  linescores: { displayValue: string }[]
}

interface EspnCompetitor {
  homeAway?: string
  winner?: boolean
  team?: { displayName?: string }
  linescores?: { displayValue?: string }[]
}

interface EspnSummary {
  header?: { competitions?: { competitors?: EspnCompetitor[] }[] }
}

function slimCompetitors(summary: EspnSummary): SlimCompetitor[] {
  const competitors = summary.header?.competitions?.[0]?.competitors ?? []
  return competitors
    .filter(c => c.homeAway === 'home' || c.homeAway === 'away')
    .map(c => ({
      homeAway: c.homeAway as 'home' | 'away',
      winner: !!c.winner,
      team: c.team?.displayName ?? null,
      linescores: (c.linescores ?? []).map(ls => ({ displayValue: ls?.displayValue ?? '' })),
    }))
}

// Test/dev hook: ?fakeLinescores=1-1:0-1 simulates an event whose home team led
// 1-1 over the two regulation periods and the away team scored in extra time —
// i.e. a match the away side won past 90'. Lets the frozen-90' overlay be
// exercised end-to-end without a real game reaching extra time.
// Format: <homePeriods>:<awayPeriods>, each a '-' separated per-period list; an
// optional &fakeWinner=away names the advancer (default home).
function fakeSummary(spec: string, winner: string | undefined): SlimCompetitor[] {
  const [homeRaw, awayRaw] = spec.split(':')
  const toLines = (raw: string | undefined) =>
    (raw ?? '').split('-').map(v => ({ displayValue: v }))
  return [
    { homeAway: 'home', winner: winner !== 'away', team: null, linescores: toLines(homeRaw) },
    { homeAway: 'away', winner: winner === 'away', team: null, linescores: toLines(awayRaw) },
  ]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fetchedAt = new Date().toISOString()

  const fakeLinescores = req.query.fakeLinescores
  if (typeof fakeLinescores === 'string') {
    const winner = typeof req.query.fakeWinner === 'string' ? req.query.fakeWinner : undefined
    return res.status(200).json({ competitors: fakeSummary(fakeLinescores, winner), fetchedAt })
  }

  const event = req.query.event
  if (typeof event !== 'string' || !/^\d+$/.test(event)) {
    return res.status(200).json({ competitors: [], fetchedAt, error: 'missing event id' })
  }

  try {
    const upstream = await fetch(ESPN_SUMMARY(event), { signal: AbortSignal.timeout(8000) })
    if (!upstream.ok) {
      return res.status(200).json({ competitors: [], fetchedAt, error: `ESPN ${upstream.status}` })
    }
    const summary = (await upstream.json()) as EspnSummary
    // Short shared CDN cache so heavy viewing hits ESPN at most ~once per 30s.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=30')
    return res.status(200).json({ competitors: slimCompetitors(summary), fetchedAt })
  } catch (err) {
    // Never break the client: an empty result just means "no regulation score yet".
    return res.status(200).json({ competitors: [], fetchedAt, error: String(err) })
  }
}
