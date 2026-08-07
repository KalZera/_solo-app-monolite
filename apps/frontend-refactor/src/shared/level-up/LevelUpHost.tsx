import { useLevelUpStore } from './level-up.store'
import { LevelUpModal } from './LevelUpModal'

/** Renders the level-up modal whenever an event is queued. Mount once at the root. */
export function LevelUpHost() {
  const event = useLevelUpStore((state) => state.event)
  const dismiss = useLevelUpStore((state) => state.dismiss)

  if (!event) return null

  return <LevelUpModal event={event} onConfirm={dismiss} />
}
