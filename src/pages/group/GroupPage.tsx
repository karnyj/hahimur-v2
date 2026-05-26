import type { GroupVotes } from './groupVotes'
import GroupVoteMatrix from '../../shared/GroupVoteMatrix'
import PageLayout from '../../shared/PageLayout'
import './GroupPage.css'

interface Props {
  groupName: string
  votes: GroupVotes
}

export default function GroupPage({ groupName, votes }: Props) {
  return (
    <PageLayout title={groupName}>
      <div className="group-body">
        <GroupVoteMatrix votes={votes} />
      </div>
    </PageLayout>
  )
}
