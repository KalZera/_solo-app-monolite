export type DateFilter = {
  start: Date
  end: Date
}

/**
 * Returns the given date (or now, if omitted) as a closed day range:
 * `start` at 00:00:00.000 and `end` at 23:59:59.999, discarding the
 * original time component.
 */
export const getDateFilter = (date: Date = new Date()): DateFilter => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
