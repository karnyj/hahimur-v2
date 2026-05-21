import type { R32Match } from '../types'
import { TEAMS } from '../lib/groups'

interface Props {
  matches: R32Match[]
}

function TeamCell({ name, resolved }: { name: string; resolved: boolean }) {
  const info = TEAMS[name]
  return (
    <span className={['r32-team', !resolved && 'r32-team--pending'].filter(Boolean).join(' ')}>
      {info && (
        <span className={`fi fi-${info.iso} r32-flag`} />
      )}
      {info ? info.he : name}
    </span>
  )
}

export default function Round32Table({ matches }: Props) {
  return (
    <table className="r32-table">
      <thead>
        <tr>
          <th>#</th>
          <th className="r32-team-col">בית</th>
          <th></th>
          <th className="r32-team-col">חוץ</th>
        </tr>
      </thead>
      <tbody>
        {matches.map(m => (
          <tr key={m.matchNum} className={m.resolved ? '' : 'r32-row--pending'}>
            <td className="r32-num">{m.matchNum}</td>
            <td className="r32-home">
              <TeamCell name={m.home} resolved={m.resolved} />
            </td>
            <td className="r32-vs">נגד</td>
            <td className="r32-away">
              <TeamCell name={m.away} resolved={m.resolved} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
