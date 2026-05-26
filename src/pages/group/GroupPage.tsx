import { TEAMS } from '../../shared/groups'
import type { GroupVotes } from './groupVotes'

interface Props {
  groupName: string
  votes: GroupVotes
}

export default function GroupPage({ groupName, votes }: Props) {
  const teams = Object.keys(votes)

  return (
    <>
      <h1>{groupName}</h1>
      {teams.length === 0
        ? <p>אין הצבעות</p>
        : <ul>
            {teams.map(team => (
              <li key={team}>
                {TEAMS[team].he}
                {votes[team].map((count, i) => (
                  <span key={i} data-testid={`${team}-${i + 1}`}>{count}</span>
                ))}
              </li>
            ))}
          </ul>
      }
    </>
  )
}
