import { useTranslation } from 'react-i18next'
import { Badge, type BadgeTone } from '@/shared/components'
import type { QuestInstanceStatus } from '../../domain/quest-instance.types'

const statusTone: Record<QuestInstanceStatus, BadgeTone> = {
  PENDING: 'muted',
  STARTED: 'primary',
  COMPLETED: 'success',
  FAILED: 'danger',
  EXPIRED: 'warning',
}

export function QuestStatusBadge({ status }: { status: QuestInstanceStatus }) {
  const { t } = useTranslation()
  return <Badge label={t(`quest.status.${status}`)} tone={statusTone[status]} />
}
