import { useState } from 'react'
import { useMe } from '@/modules/auth/application/useMe'
import { useCompleteTutorial } from '@/modules/auth/application/useCompleteTutorial'
import { TutorialSheet } from './TutorialSheet'

/**
 * Auto-opens the tutorial the first time a Hunter reaches the app (isCompleteTutorial === false),
 * then marks it complete on dismiss so it never auto-opens again. Mounted once in the tabs layout,
 * so it only fires after the Hunter is authenticated and past character onboarding.
 *
 * Visibility is derived from the loaded Hunter + a local "dismissed" latch, so there is no effect
 * syncing state: the sheet shows while the tutorial is incomplete and hides the moment it is
 * dismissed (the mutation then persists completion so it stays hidden on the next launch).
 */
export function TutorialGate() {
  const { data: me } = useMe()
  const completeTutorial = useCompleteTutorial()
  const [dismissed, setDismissed] = useState(false)

  const visible = !!me && !me.isCompleteTutorial && !dismissed

  function handleClose() {
    setDismissed(true)
    if (me && !me.isCompleteTutorial) {
      completeTutorial.mutate(true)
    }
  }

  return <TutorialSheet visible={visible} onClose={handleClose} />
}
