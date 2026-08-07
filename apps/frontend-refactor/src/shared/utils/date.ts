/** Locale-aware absolute date, e.g. "04 Aug 2026". */
export function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return new Date(iso).toDateString()
  }
}

/** Compact relative time, e.g. "2 hours ago". Falls back to an absolute date. */
export function formatRelativeTime(iso: string, locale: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime()
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const minutes = Math.round(diffMs / 60000)
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
    const days = Math.round(hours / 24)
    return rtf.format(-days, 'day')
  } catch {
    return formatDate(iso, locale)
  }
}
