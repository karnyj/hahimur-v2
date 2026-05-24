import { TEAMS } from '../../shared/groups'

export default function TeamSlot({ name }: { name: string }) {
  const info = TEAMS[name]
  return (
    <div className={`ko-slot ${info ? 'ko-slot--resolved' : 'ko-slot--pending'}`}>
      {info ? (
        <span className={`fi fi-${info.iso} ko-slot-flag`} />
      ) : (
        <span className="ko-slot-flag-ph" />
      )}
      <span className="ko-slot-name">{info ? info.he : name}</span>
    </div>
  )
}
