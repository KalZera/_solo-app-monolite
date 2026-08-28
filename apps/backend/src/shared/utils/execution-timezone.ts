// Execution timezone for scheduled jobs. Cron fires and the "current day" is resolved in
// GMT-3 (America/Sao_Paulo, no DST), while everything persisted stays UTC — see
// `resolveExecutionDay`.
export const EXECUTION_TIMEZONE = 'America/Sao_Paulo'

// GMT-3 is a fixed −3h offset (Brazil no longer observes DST).
const GMT_MINUS_3_OFFSET_MS = 3 * 60 * 60 * 1000

/**
 * The calendar day that is "today" in GMT-3, expressed as a UTC-midnight Date so the value
 * persisted to `@db.Date` columns stays UTC. At 23:50 GMT-3 (≈ 02:50 UTC the next day) this
 * still resolves to the local day the job is closing — using the raw UTC day would roll over
 * a day early.
 */
export const resolveExecutionDay = (now: Date = new Date()): Date => {
  const shifted = new Date(now.getTime() - GMT_MINUS_3_OFFSET_MS)
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()))
}
