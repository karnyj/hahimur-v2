import { TEAMS } from '../../shared/groups'
import type { KnockoutMatch } from '../../shared/types'
import type { User } from '../../users/index'
import { roundKeyForMatch } from '../../formView/knockout/koRounds'

// A slot string is "known" once it holds a real team name (in TEAMS) rather than
// a descriptor like "סגנית א" / "שלישית א/ב/ג".
const isRealTeam = (slot: string) => slot in TEAMS

// The single resolved team of a half-resolved knockout match: exactly one of the
// two slots is a real team. Returns null when both or neither are real — i.e. the
// match is fully resolved or fully unresolved, neither of which is our case.
export function knownSideTeam(match: KnockoutMatch): string | null {
  const homeReal = isRealTeam(match.home)
  const awayReal = isRealTeam(match.away)
  if (homeReal === awayReal) return null
  return homeReal ? match.home : match.away
}

// Bettors still "alive" on the known side: those who predicted the resolved team
// into this *round* (any slot, either side) — i.e. who "advanced" it this far.
// Matched by round, NOT bracket slot: a bettor whose group finishes route the team
// through a different slot of the same round still called it through, the same way
// the rest of the KO surfaces credit a pairing wherever its two teams meet.
export function knownSideCallers(match: KnockoutMatch, users: User[]): User[] {
  const team = knownSideTeam(match)
  if (!team) return []
  const round = roundKeyForMatch(match.matchNum)
  if (!round) return []
  return users.filter(u =>
    (u.knockoutStages?.[round] ?? []).some(m => m.home === team || m.away === team))
}
