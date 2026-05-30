import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'
import { GROUPS } from '../src/shared/groups.ts'
import { calculateStandings } from '../src/shared/standings.ts'
import type { Standing } from '../src/shared/types'

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

function serializeStanding(s: Standing): string {
  return `    { team: '${s.team}', played: ${s.played}, won: ${s.won}, drawn: ${s.drawn}, lost: ${s.lost}, goalsFor: ${s.goalsFor}, goalsAgainst: ${s.goalsAgainst}, points: ${s.points} }`
}

const blockLines: string[] = [`export const groupTables: Record<string, Standing[]> = {`]
for (const [letter, standings] of Object.entries(groupTables)) {
  blockLines.push(`  ${letter}: [`)
  for (const s of standings) blockLines.push(`${serializeStanding(s)},`)
  blockLines.push(`  ],`)
}
blockLines.push(`}`)
blockLines.push(``)
const block = blockLines.join('\n')

let content = readFileSync(absPath, 'utf8')

if (!content.includes('Standing')) {
  content = content.replace(
    /import type \{ ([^}]+) \} from '\.\.\/shared\/types'/,
    (_, inner) => `import type { ${inner}, Standing } from '../shared/types'`
  )
}

const markerIdx = content.indexOf('export const groupTables')
if (markerIdx !== -1) {
  content = content.slice(0, markerIdx) + block
} else {
  content = content.trimEnd() + '\n\n' + block
}

writeFileSync(absPath, content)
console.log(`Updated: ${absPath}`)
