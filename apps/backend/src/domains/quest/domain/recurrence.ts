// A Quest template repeats according to its recurrence. The period boundaries
// (scheduledDate / deadline / next occurrence) are computed by the RecurrenceEngine
// (see engines/recurrence.engine.ts) — this file only owns the type and its guard.
export type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'

export const RECURRENCES: Recurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']

// CUSTOM is modelled but not yet schedulable — the structure is ready for a future
// user-defined recurrence rule.
export const SCHEDULABLE_RECURRENCES: Recurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']

export function isRecurrence (value: string): value is Recurrence {
  return (RECURRENCES as string[]).includes(value)
}
