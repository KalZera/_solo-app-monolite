// Period boundaries for each recurrence, computed in GMT-3 (business_rules.md NFR: quest
// timezone is GMT-3) independent of the server's local timezone. We shift the instant into
// GMT-3 wall-clock time (manipulating it via UTC getters/setters), snap to the boundary, then
// shift back to a real UTC instant. Brazil has no DST, so a fixed -3h offset is exact.
//
// Each recurrence is a small strategy object (Strategy/OCP) — new recurrences are added by
// providing another strategy, never by editing a conditional.

import type { Quest } from '../domain/quest'

const GMT_MINUS_3_OFFSET_MS = 3 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const DAYS_IN_WEEK = 7

// Default deadline (in days from creation) for a NONE-recurrence quest when
// `Quest.deadlineDate` is not set (business_rules.md — every quest expires, regardless of
// recurrence). Mirrors the pre-ADR-004 "main quest" default window.
export const DEFAULT_NONE_DEADLINE_DAYS = 28

function toWall (instant: Date): Date {
  return new Date(instant.getTime() - GMT_MINUS_3_OFFSET_MS)
}

function fromWall (wall: Date): Date {
  return new Date(wall.getTime() + GMT_MINUS_3_OFFSET_MS)
}

function startOfDay (instant: Date): Date {
  const wall = toWall(instant)
  wall.setUTCHours(0, 0, 0, 0)
  return fromWall(wall)
}

function endOfDay (periodStart: Date): Date {
  const wall = toWall(periodStart)
  wall.setUTCHours(23, 59, 59, 999)
  return fromWall(wall)
}

function startOfWeek (instant: Date): Date {
  const wall = toWall(instant)
  wall.setUTCHours(0, 0, 0, 0)
  const daysSinceMonday = (wall.getUTCDay() + 6) % 7 // getUTCDay: 0=Sun..6=Sat → 0=Mon..6=Sun
  wall.setUTCDate(wall.getUTCDate() - daysSinceMonday)
  return fromWall(wall)
}

function startOfMonth (instant: Date): Date {
  const wall = toWall(instant)
  wall.setUTCHours(0, 0, 0, 0)
  wall.setUTCDate(1)
  return fromWall(wall)
}

function startOfNextMonth (periodStart: Date): Date {
  const wall = toWall(periodStart)
  wall.setUTCMonth(wall.getUTCMonth() + 1)
  return fromWall(wall)
}

export interface RecurrenceStrategy {
  // The canonical key of the period that `reference` falls into.
  periodStart(reference: Date): Date
  // The last instant of the period. `quest` is only consulted by NoneStrategy
  // (for its configurable deadlineDays); other strategies derive it from the period alone.
  periodEnd(periodStart: Date, quest: Quest): Date | null
  // The periodStart of the following occurrence.
  next(periodStart: Date): Date
}

export class NoneStrategy implements RecurrenceStrategy {
  periodStart (reference: Date): Date {
    return startOfDay(reference)
  }

  // Single lifetime instance, but it still expires — every quest does, regardless of
  // recurrence (business_rules.md). The deadline is always 23:59:59.999 GMT-3 of the last
  // day: the quest's own `deadlineDate` (normalised to its GMT-3 calendar day) when set,
  // otherwise DEFAULT_NONE_DEADLINE_DAYS after creation.
  periodEnd (periodStart: Date, quest: Quest): Date {
    if (quest.deadlineDate) return endOfDay(startOfDay(quest.deadlineDate))
    return new Date(periodStart.getTime() + DEFAULT_NONE_DEADLINE_DAYS * DAY_MS - 1)
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
  periodStart (reference: Date): Date {
    return startOfWeek(reference)
  }

  periodEnd (periodStart: Date): Date {
    return new Date(periodStart.getTime() + DAYS_IN_WEEK * DAY_MS - 1)
  }

  next (periodStart: Date): Date {
    return new Date(periodStart.getTime() + DAYS_IN_WEEK * DAY_MS)
  }
}

export class MonthlyStrategy implements RecurrenceStrategy {
  periodStart (reference: Date): Date {
    return startOfMonth(reference)
  }

  periodEnd (periodStart: Date): Date {
    return new Date(startOfNextMonth(periodStart).getTime() - 1)
  }

  next (periodStart: Date): Date {
    return startOfNextMonth(periodStart)
  }
}

export class CustomStrategy implements RecurrenceStrategy {
  private unsupported (): never {
    throw new Error('CUSTOM recurrence is not schedulable yet')
  }

  periodStart (): Date {
    return this.unsupported()
  }

  periodEnd (): Date | null {
    return this.unsupported()
  }

  next (): Date {
    return this.unsupported()
  }
}
