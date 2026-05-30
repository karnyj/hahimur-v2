import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import { GROUPS } from '../src/shared/groups.ts'
import { calculateStandings } from '../src/shared/standings.ts'
import { getThirdPlaceTeams, qualifyBestThirdPlace } from '../src/formView/thirdPlace/thirdPlace.ts'
import { buildKnockoutBracket } from '../src/formView/knockout/knockout.ts'
import type { Standing, ThirdPlaceStanding, KnockoutMatch } from '../src/shared/types'

const [userFilePath] = process.argv.slice(2)

if (!userFilePath) {
  console.error('Usage: node --experimental-strip-types scripts/compute-group-tables.ts <user-file>')
  console.error('Example: node --experimental-strip-types scripts/compute-group-tables.ts src/users/eldad-levi.ts')
  process.exit(1)
}

const absPath = resolve(userFilePath)
const userModule = await import(pathToFileURL(absPath).href)
const { predictions } = userModule

const groupTables: Record<string, Standing[]> = {}
for (const [letter, { matches }] of Object.entries(GROUPS)) {
  const { standings } = calculateStandings(matches, predictions)
  groupTables[letter] = standings
}

const groupStandings = Object.entries(groupTables).map(([group, standings]) => ({ group, standings }))

const thirdPlaceTeams = getThirdPlaceTeams(groupStandings)
const thirdPlaceQualification = qualifyBestThirdPlace(thirdPlaceTeams)

const knockoutBracket = buildKnockoutBracket(predictions)

function bracketWinner(matchNum: number): string | undefined {
  const m = knockoutBracket.find(b => b.matchNum === matchNum)
  if (!m || !m.home || !m.away) return undefined
  const pred = predictions[String(matchNum)]
  if (!pred || pred.home === null || pred.away === null) return undefined
  if (pred.home > pred.away) return m.home
  if (pred.away > pred.home) return m.away
  if (pred.drawWinner === 'home') return m.home
  if (pred.drawWinner === 'away') return m.away
  return undefined
}

const predictedChampion = bracketWinner(104)
const predictedThirdPlaceWinner = bracketWinner(103)

function serializeStanding(s: Standing): string {
  return `    { team: '${s.team}', played: ${s.played}, won: ${s.won}, drawn: ${s.drawn}, lost: ${s.lost}, goalsFor: ${s.goalsFor}, goalsAgainst: ${s.goalsAgainst}, points: ${s.points} }`
}

function serializeThirdPlaceStanding(s: ThirdPlaceStanding): string {
  return `    { team: '${s.team}', played: ${s.played}, won: ${s.won}, drawn: ${s.drawn}, lost: ${s.lost}, goalsFor: ${s.goalsFor}, goalsAgainst: ${s.goalsAgainst}, points: ${s.points}, group: '${s.group}' }`
}

function serializeKOMatch(m: KnockoutMatch): string {
  const s = predictions[String(m.matchNum)]
  const fields: string[] = [
    `matchNum: ${m.matchNum}`,
    `home: '${m.home}'`,
    `away: '${m.away}'`,
    `resolved: ${m.resolved}`,
  ]
  if (s && s.home !== null && s.away !== null) {
    let scores = `{ home: ${s.home}, away: ${s.away}`
    if (s.drawWinner) scores += `, drawWinner: '${s.drawWinner}'`
    scores += ' }'
    fields.push(`scores: ${scores}`)
  }
  if (m.matchDate) fields.push(`matchDate: '${m.matchDate}'`)
  if (m.kickoffIST) fields.push(`kickoffIST: '${m.kickoffIST}'`)
  return `  { ${fields.join(', ')} }`
}

const groupBlock: string[] = [`export const groupTables: Record<string, Standing[]> = {`]
for (const [letter, standings] of Object.entries(groupTables)) {
  groupBlock.push(`  ${letter}: [`)
  for (const s of standings) groupBlock.push(`${serializeStanding(s)},`)
  groupBlock.push(`  ],`)
}
groupBlock.push(`}`)
groupBlock.push(``)

const teamsBlock: string[] = [`export const thirdPlaceTeams: ThirdPlaceStanding[] = [`]
for (const s of thirdPlaceTeams) teamsBlock.push(`${serializeThirdPlaceStanding(s)},`)
teamsBlock.push(`]`)
teamsBlock.push(``)

const qualBlock: string[] = [`export const thirdPlaceQualification: ThirdPlaceQualification = {`]
qualBlock.push(`  resolved: ${thirdPlaceQualification.resolved},`)
qualBlock.push(`  all: [`)
for (const s of thirdPlaceQualification.all) qualBlock.push(`${serializeThirdPlaceStanding(s)},`)
qualBlock.push(`  ],`)
if (thirdPlaceQualification.resolved) {
  qualBlock.push(`  qualifiers: [`)
  for (const s of thirdPlaceQualification.qualifiers) qualBlock.push(`${serializeThirdPlaceStanding(s)},`)
  qualBlock.push(`  ],`)
} else {
  qualBlock.push(`  tied: [`)
  for (const s of thirdPlaceQualification.tied) qualBlock.push(`${serializeThirdPlaceStanding(s)},`)
  qualBlock.push(`  ],`)
}
qualBlock.push(`}`)
qualBlock.push(``)

const bracketBlock: string[] = [`export const knockoutBracket: KnockoutMatch[] = [`]
for (const m of knockoutBracket) bracketBlock.push(`${serializeKOMatch(m)},`)
bracketBlock.push(`]`)
bracketBlock.push(``)

const winnerLines: string[] = []
if (predictedChampion !== undefined) {
  winnerLines.push(`export const predictedChampion = '${predictedChampion}'`)
}
if (predictedThirdPlaceWinner !== undefined) {
  winnerLines.push(`export const predictedThirdPlaceWinner = '${predictedThirdPlaceWinner}'`)
}
if (winnerLines.length > 0) winnerLines.push(``)

const allBlocks = [...groupBlock, ...teamsBlock, ...qualBlock, ...bracketBlock, ...winnerLines].join('\n')

let content = readFileSync(absPath, 'utf8')

const neededTypes = ['Standing', 'ThirdPlaceStanding', 'ThirdPlaceQualification', 'KnockoutMatch']
for (const typeName of neededTypes) {
  if (!content.includes(typeName)) {
    content = content.replace(
      /import type \{ ([^}]+) \} from '\.\.\/shared\/types'/,
      (_: string, inner: string) => `import type { ${inner}, ${typeName} } from '../shared/types'`
    )
  }
}

const markerIdx = content.indexOf('export const groupTables')
if (markerIdx !== -1) {
  content = content.slice(0, markerIdx) + allBlocks
} else {
  content = content.trimEnd() + '\n\n' + allBlocks
}

writeFileSync(absPath, content)
console.log(`Updated: ${absPath}`)
