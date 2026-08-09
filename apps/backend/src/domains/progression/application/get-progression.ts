import type { ID } from '../../../shared/types/index'
import type { CharacterRepository } from '../../character/domain/character'
import type { CharacterRestPointRepository } from '../../character/domain/character-rest-point'
import { NotFoundError } from '../../../shared/errors/app-error'
import { ProgressionEngine } from '../engines/progression.engine'
import type { ProgressionResponse } from '../domain/progression'

interface GetProgressionInput {
  userId: ID
}

// Builds the read-only progression snapshot (level/XP/progress/attribute points) for the
// authenticated user's character. All the math is delegated to ProgressionEngine (the
// accumulated-XP curve) — this use case only resolves ownership and feeds it the right input.
//
// NOTE (business_rules.md, CARD-201 — pending migration): `GrantExperienceUseCase` (the flow
// that actually awards XP on quest completion) still persists `Character.experience` as
// XP-within-the-current-level, using the older per-level curve in `engines/level.engine.ts`,
// NOT ProgressionEngine's accumulated-XP curve. Until that migration lands, there is no
// single stored "lifetime total XP" to hand to ProgressionEngine directly. This use case
// reconstructs one by anchoring on the character's stored `level` (via
// `calculateTotalXpForLevel`, which round-trips exactly back to that level) and layering the
// stored in-level `experience` on top. That keeps `level` correct for realistic XP amounts,
// but `progress` / `xpIntoCurrentLevel` are therefore an approximation (a stand-in for the
// current level's span under the *old* curve), not the exact accumulated-XP truth — they
// will only be fully accurate once grant-experience.ts is migrated to ProgressionEngine.
export class GetProgressionUseCase {
  constructor (
    private readonly characterRepository: CharacterRepository,
    private readonly characterRestPointRepository: CharacterRestPointRepository,
    private readonly engine: ProgressionEngine = new ProgressionEngine()
  ) {}

  async execute (input: GetProgressionInput): Promise<ProgressionResponse> {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null

    if (!character) {
      throw new NotFoundError('Character', input.userId)
    }

    const totalXp = this.engine.calculateTotalXpForLevel(character.level) + character.experience
    const restPoints = await this.characterRestPointRepository.findByCharacterId(character.id)

    return this.engine.getProgress(totalXp, restPoints?.restPoints ?? 0)
  }
}
