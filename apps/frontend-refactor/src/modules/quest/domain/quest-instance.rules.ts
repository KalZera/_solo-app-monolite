import type {
  QuestInstance,
  QuestInstanceObjective,
  QuestInstanceStatus,
} from './quest-instance.types'

// Mirrors the backend's quest-instance domain so the UI can predict which actions
// are allowed. The server remains the single source of truth.
export const OBJECTIVE_COMPLETION_THRESHOLD = 0.7

const TERMINAL_STATUSES: QuestInstanceStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED']

export function isTerminalStatus(status: QuestInstanceStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/** Ratio of completed objectives (0..1). No objectives is treated as unblocked. */
export function objectivesCompletionRatio(objectives: QuestInstanceObjective[]): number {
  if (objectives.length === 0) return 1
  const completed = objectives.filter((objective) => objective.completed).length
  return completed / objectives.length
}

export function canStart(instance: QuestInstance): boolean {
  return instance.status === 'PENDING'
}

/** Completable once started/pending and more than 70% of objectives are done. */
export function canComplete(instance: QuestInstance): boolean {
  if (isTerminalStatus(instance.status)) return false
  return objectivesCompletionRatio(instance.objectives) > OBJECTIVE_COMPLETION_THRESHOLD
}
