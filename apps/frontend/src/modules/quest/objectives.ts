import type { QuestObjective } from './types'

// Mirrors MAIN_QUEST_COMPLETION_THRESHOLD / calculateObjectivesCompletionRatio in the backend's
// quest domain (apps/backend/src/domains/quest/domain/quest.ts).
export const MAIN_QUEST_COMPLETION_THRESHOLD = 0.7

export function calculateObjectivesCompletionRatio(objectives: QuestObjective[]): number {
  if (objectives.length === 0) return 1
  const completedCount = objectives.filter((objective) => objective.completed).length
  return completedCount / objectives.length
}
