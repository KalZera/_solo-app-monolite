import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from './icons'
import { colors } from '../theme/colors'
import type { NotificationVariant } from '../notifications/notification.store'

interface VariantStyle {
  Icon: LucideIcon
  color: string
  border: string
}

/** Shared visual language for toasts and inline notices. */
export const variantStyles: Record<NotificationVariant, VariantStyle> = {
  success: { Icon: CheckCircle2, color: colors.success, border: 'border-success/40' },
  error: { Icon: XCircle, color: colors.danger, border: 'border-danger/40' },
  warning: { Icon: AlertTriangle, color: colors.warning, border: 'border-warning/40' },
  info: { Icon: Info, color: colors.primary, border: 'border-primary/40' },
}
