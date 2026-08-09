// Same shape as `CharacterStats` in modules/profile/domain/character.types.ts. Declared
// independently here so `shared/` never depends on a feature module — both mirror the
// backend's CharacterStats and stay in sync by construction (same API response).
export interface CharacterAttributes {
  strength: number
  intelligence: number
  agility: number
  vitality: number
  luck: number
}

export type AllocatableAttribute = keyof CharacterAttributes

export type CharacterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'Monarch'

/**
 * A character's progression snapshot — everything Dashboard/Status need to render level,
 * XP, attributes, power score and rank. Backed by `GET /characters/` (the character
 * profile endpoint), the only place these fields are actually computed server-side today.
 *
 * NOTE: the backend also has a dedicated `domains/progression/api/routes.ts`, but it is
 * disabled in `app.ts` and returns hardcoded placeholder data (not real state) — it is
 * intentionally NOT used here. Swap the implementation in `progression.requests.ts` if/when
 * that endpoint becomes real.
 */
export interface ProgressionSnapshot {
  characterId: string
  level: number
  experience: number
  attributes: CharacterAttributes
  powerScore: number
  rank: CharacterRank
  restPoints: number
}

// Partial: only the attributes being spent on need to be present (e.g. { strength: 2, luck: 1 }).
export interface AllocateAttributePointsInput {
  allocations: Partial<Record<AllocatableAttribute, number>>
}

/**
 * Result of spending a rest point. Unlike `ProgressionSnapshot`, this does NOT include
 * `rank` — the allocate endpoint returns the updated character as-is, and rank is only
 * (re)computed by `GET /characters/`. Callers that need the authoritative rank after
 * allocating should refetch `getProgression()` rather than deriving it client-side (never
 * recompute a server-owned rule).
 */
export interface AllocateAttributePointResult {
  characterId: string
  level: number
  experience: number
  attributes: CharacterAttributes
  powerScore: number
  restPoints: number
}
