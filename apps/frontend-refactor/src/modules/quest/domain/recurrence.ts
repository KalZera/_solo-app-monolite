export const RECURRENCES = ['NONE', 'DAILY', 'WEEKLY', 'CUSTOM'] as const
export type Recurrence = (typeof RECURRENCES)[number]

// CUSTOM is modelled on the backend but not schedulable yet, so the create form
// only offers these options.
export const SCHEDULABLE_RECURRENCES = ['NONE', 'DAILY', 'WEEKLY'] as const
export type SchedulableRecurrence = (typeof SCHEDULABLE_RECURRENCES)[number]
