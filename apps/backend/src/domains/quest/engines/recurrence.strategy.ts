// Period boundaries for each recurrence, computed in UTC — independent of the server's
// local timezone (no wall-clock shifting needed; UTC getters/setters snap directly to
// the boundary).
//
// Each recurrence is a small strategy object (Strategy/OCP) — new recurrences are added by
// providing another strategy, never by editing a conditional.

import type { Quest } from '../domain/quest'

const DAY_MS = 24 * 60 * 60 * 1000
const DAYS_IN_WEEK = 7

function startOfDay (instant: Date): Date {
  const start = new Date(instant)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function endOfDay (periodStart: Date): Date {
  const end = new Date(periodStart)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

export interface RecurrenceStrategy {
  // The canonical key of the period that `reference` falls into.
  periodStart(reference: Date): Date
  // The last instant of the period. `quest` is consulted by NoneStrategy (its deadline IS
  // the quest's own deadlineDate) and WeeklyStrategy (which caps the 7-day span at it);
  // DailyStrategy derives it from the period alone.
  periodEnd(periodStart: Date, quest: Quest): Date
  // The periodStart of the following occurrence.
  next(periodStart: Date): Date
}

export class NoneStrategy implements RecurrenceStrategy {
  periodStart (reference: Date): Date {
    return startOfDay(reference)
  }

  // Single lifetime instance, but it still expires — every quest does, regardless of
  // recurrence (business_rules.md). The deadline is always 23:59:59.999 UTC of the quest's
  // own `deadlineDate`, normalised to its UTC calendar day.
  periodEnd (periodStart: Date, quest: Quest): Date {
    return endOfDay(startOfDay(quest.deadlineDate))
  }

  next (periodStart: Date): Date {
    return periodStart // single lifetime instance — there is no next occurrence
  }
}

export class DailyStrategy implements RecurrenceStrategy {
  periodStart (reference: Date): Date {
    return startOfDay(reference)
  }

  periodEnd (periodStart: Date): Date {
    return endOfDay(periodStart)
  }

  next (periodStart: Date): Date {
    return new Date(periodStart.getTime() + DAY_MS)
  }
}

export class WeeklyStrategy implements RecurrenceStrategy {
  // No calendar-week (Monday) anchor — a WEEKLY quest's period simply starts on whichever
  // day it's first evaluated; `next()` then chains every following period exactly 7 days
  // after the previous one.
  periodStart (reference: Date): Date {
    return startOfDay(reference)
  }

  // Always 7 days after this period's start — unless the quest template's own deadlineDate
  // falls sooner, in which case that's the hard cap (a WEEKLY instance never outlives its
  // template).
  periodEnd (periodStart: Date, quest: Quest): Date {
    const sevenDaysOut = new Date(periodStart.getTime() + DAYS_IN_WEEK * DAY_MS - 1)
    const questDeadline = endOfDay(startOfDay(quest.deadlineDate))
    return sevenDaysOut < questDeadline ? sevenDaysOut : questDeadline
  }

  next (periodStart: Date): Date {
    return new Date(periodStart.getTime() + DAYS_IN_WEEK * DAY_MS)
  }
}


export class CustomStrategy implements RecurrenceStrategy {
  private unsupported (): never {
    throw new Error('CUSTOM recurrence is not schedulable yet')
  }

  periodStart (): Date {
    return this.unsupported()
  }

  periodEnd (): Date {
    return this.unsupported()
  }

  next (): Date {
    return this.unsupported()
  }
}
