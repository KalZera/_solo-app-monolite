import type { Quest } from '../domain/quest'
import type { Recurrence } from '../domain/recurrence'
import type { CreateQuestInstanceData } from '../domain/quest-instance'
import {
  CustomStrategy,
  DailyStrategy,
  MonthlyStrategy,
  NoneStrategy,
  WeeklyStrategy,
  type RecurrenceStrategy,
} from './recurrence.strategy'

// Pure, I/O-free engine that owns "which QuestInstance should exist for this template right
// now?". It never creates instances in bulk and never talks to persistence — it only computes
// the plan for the current period. Duplicate prevention is guaranteed by the (questId,
// scheduledDate) unique index plus the caller checking `findByQuestAndScheduledDate` first.
//
// Strategies are injectable so alternative curves/timezones (or a future CUSTOM rule) can be
// swapped in without touching this class (Open/Closed).
export class RecurrenceEngine {
  private readonly strategies: Record<Recurrence, RecurrenceStrategy>

  constructor (strategies?: Partial<Record<Recurrence, RecurrenceStrategy>>) {
    this.strategies = {
      NONE: new NoneStrategy(),
      DAILY: new DailyStrategy(),
      WEEKLY: new WeeklyStrategy(),
      MONTHLY: new MonthlyStrategy(),
      CUSTOM: new CustomStrategy(),
      ...strategies,
    }
  }

  private strategyFor (recurrence: Recurrence): RecurrenceStrategy {
    return this.strategies[recurrence]
  }

  // For NONE the reference is the quest's creation day (a single lifetime instance);
  // for recurring types it is `now` (the current period).
  scheduledDateFor (quest: Quest, now: Date): Date {
    const reference = quest.recurrence === 'NONE' ? quest.createdAt : now
    return this.strategyFor(quest.recurrence).periodStart(reference)
  }

  deadlineFor (quest: Quest, scheduledDate: Date): Date {
    return this.strategyFor(quest.recurrence).periodEnd(scheduledDate, quest)
  }

  // A ready-to-persist plan for the current period's instance, with objectives copied from the
  // template so each execution tracks its own progress.
  planFor (quest: Quest, now: Date): CreateQuestInstanceData {
    const scheduledDate = this.scheduledDateFor(quest, now)

    return {
      questId: quest.id,
      scheduledDate,
      deadline: this.deadlineFor(quest, scheduledDate),
      objectives: quest.objectiveTemplates.map((objective) => ({
        description: objective.description,
        target: objective.target,
      })),
    }
  }

  nextOccurrence (recurrence: Recurrence, scheduledDate: Date): Date {
    return this.strategyFor(recurrence).next(scheduledDate)
  }
}
