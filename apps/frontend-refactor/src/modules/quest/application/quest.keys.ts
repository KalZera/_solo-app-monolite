import type { QuestTab } from '../infrastructure/quest.requests'

export const questKeys = {
  all: ['quests'] as const,
  list: () => [...questKeys.all, 'list'] as const,
  today: () => [...questKeys.all, 'today'] as const,
  active: () => [...questKeys.all, 'today', 'active'] as const,
  byTab: (tab: QuestTab) => [...questKeys.all, 'today', tab] as const,
  categories: () => ['quest-categories'] as const,
}
