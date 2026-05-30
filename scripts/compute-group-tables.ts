import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import { GROUPS } from '../src/shared/groups.ts'
import { calculateStandings } from '../src/shared/standings.ts'
import { getThirdPlaceTeams, qualifyBestThirdPlace } from '../src/formView/thirdPlace/thirdPlace.ts'
import type { Standing, ThirdPlaceStanding } from '../src/shared/types'

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

function serializeStanding(s: Standing): string {
  return `    { team: '${s.team}', played: ${s.played}, won: ${s.won}, drawn: ${s.drawn}, lost: ${s.lost}, goalsFor: ${s.goalsFor}, goalsAgainst: ${s.goalsAgainst}, points: ${s.points} }`
}

function serializeThirdPlaceStanding(s: ThirdPlaceStanding): string {
  return `    { team: '${s.team}', played: ${s.played}, won: ${s.won}, drawn: ${s.drawn}, lost: ${s.lost}, goalsFor: ${s.goalsFor}, goalsAgainst: ${s.goalsAgainst}, points: ${s.points}, group: '${s.group}' }`
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

const allBlocks = [...groupBlock, ...teamsBlock, ...qualBlock].join('\n')

let content = readFileSync(absPath, 'utf8')

const neededTypes = ['Standing', 'ThirdPlaceStanding', 'ThirdPlaceQualification']
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
