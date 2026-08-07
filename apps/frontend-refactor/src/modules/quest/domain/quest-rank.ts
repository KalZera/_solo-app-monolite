// Rank → XP mirrors the backend authority (quest domain / business_rules.md).
// Used ONLY for an optimistic reward preview in the create form — the server
// always derives the real reward from the rank (the client value is ignored).
export const QUEST_RANKS = ['E', 'D', 'C', 'B', 'A', 'S'] as const
export type QuestRank = (typeof QUEST_RANKS)[number]

const QUEST_RANK_XP: Record<QuestRank, number> = {
  E: 10,
  D: 20,
  C: 50,
  B: 100,
  A: 250,
  S: 500,
}

export function xpForQuestRank(rank: QuestRank): number {
  return QUEST_RANK_XP[rank]
}

export function isQuestRank(value: string): value is QuestRank {
  return (QUEST_RANKS as readonly string[]).includes(value)
}
