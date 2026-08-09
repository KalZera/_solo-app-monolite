import { httpClient } from '../api/http-client'
import type {
  AllocateAttributePointResult,
  AllocateAttributePointsInput,
  CharacterAttributes,
  CharacterRank,
  ProgressionSnapshot,
} from './progression.types'

// Shape returned by GET /characters/ (GetCharacterProfileUseCase): the raw Character record
// plus the server-computed `powerScore`, `rank` and `restPoints`.
interface CharacterProfileResponse {
  id: string
  level: number
  experience: number
  powerScore: number
  rank: CharacterRank
  restPoints: number
  stats: CharacterAttributes
}

function toProgressionSnapshot(profile: CharacterProfileResponse): ProgressionSnapshot {
  return {
    characterId: profile.id,
    level: profile.level,
    experience: profile.experience,
    attributes: profile.stats,
    powerScore: profile.powerScore,
    rank: profile.rank,
    restPoints: profile.restPoints,
  }
}

/** Fetches the current character's full progression snapshot (level, XP, attributes,
 * power score, rank, rest points). */
export function getProgression(): Promise<ProgressionSnapshot> {
  return httpClient.get<CharacterProfileResponse>('/characters/').then(toProgressionSnapshot)
}

// Shape returned by POST /characters/attributes/allocate (AllocateAttributePointsUseCase).
interface AllocateAttributePointResponse {
  character: {
    id: string
    level: number
    experience: number
    powerScore: number
    stats: CharacterAttributes
  }
  restPoints: number
}

function toAllocateResult(response: AllocateAttributePointResponse): AllocateAttributePointResult {
  return {
    characterId: response.character.id,
    level: response.character.level,
    experience: response.character.experience,
    attributes: response.character.stats,
    powerScore: response.character.powerScore,
    restPoints: response.restPoints,
  }
}

/**
 * Spends rest points across one or more attributes in a single call (e.g.
 * { allocations: { strength: 2, luck: 1 } }). The response has no `rank` (see
 * AllocateAttributePointResult) — refetch `getProgression()` afterwards to get the
 * authoritative post-allocation snapshot.
 */
export function allocateAttributePoints(
  input: AllocateAttributePointsInput,
): Promise<AllocateAttributePointResult> {
  return httpClient
    .post<AllocateAttributePointResponse>('/characters/attributes/allocate', input)
    .then(toAllocateResult)
}
