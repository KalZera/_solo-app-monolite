import type { Character, CharacterRepository } from '../../character/domain/character'
import { GrantExperienceUseCase } from '../../progression/use-cases/grant-experience'
import { eventBus, type DomainEvent } from '../../../shared/events/domain-event'
import type { QuestRepository } from '../domain/quest'
import type { QuestInstanceRepository } from '../domain/quest-instance'
import { OBJECTIVE_COMPLETION_THRESHOLD, isTerminalStatus, objectivesCompletionRatio } from '../domain/quest-instance'
import { createQuestCompletedEvent } from '../domain/events'
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/app-error'

interface CompleteQuestInput {
  userId: string
  questInstanceId: string
}

const COMPLETED_PROGRESS = 100

export class CompleteQuestUseCase {
  constructor (
    private readonly questInstanceRepository: QuestInstanceRepository,
    private readonly questRepository: QuestRepository,
    private readonly characterRepository: CharacterRepository,
    private readonly grantExperience: GrantExperienceUseCase,
    private readonly publishEvent: (event: DomainEvent) => Promise<void> = (event) => eventBus.publish(event)
  ) {}

  async execute (input: CompleteQuestInput) {
    const characters = await this.characterRepository.findByUserId(input.userId)
    const character = characters[0] ?? null
    if (!character) throw new NotFoundError('Character', input.userId)

    const instance = await this.questInstanceRepository.findById(input.questInstanceId)
    if (!instance) throw new NotFoundError('QuestInstance', input.questInstanceId)

    const quest = await this.questRepository.findById(instance.questId)
    if (!quest || quest.characterId !== character.id) {
      throw new NotFoundError('QuestInstance', input.questInstanceId)
    }

    // COMPLETED is immutable, FAILED never returns, EXPIRED is final.
    if (isTerminalStatus(instance.status)) {
      throw new ConflictError(`A quest instance with status "${instance.status}" cannot be completed`)
    }

    // Instances WITH objectives need > 70% done (empty objectives → ratio 1, always allowed).
    if (objectivesCompletionRatio(instance.objectives) <= OBJECTIVE_COMPLETION_THRESHOLD) {
      throw new ValidationError('A quest requires more than 70% of its objectives to be completed')
    }

    const updatedInstance = await this.questInstanceRepository.save(instance.id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      progress: COMPLETED_PROGRESS,
      rewardGranted: true,
    })

    await this.publishEvent(
      createQuestCompletedEvent(updatedInstance.id, quest.id, character.id, quest.title, quest.rewardXp)
    )

    // XP is granted synchronously by the Progression Engine (ADR-003). EXPIRED/FAILED never reach here.
    const { progression, levelsGained } = await this.grantExperience.execute({
      characterId: character.id,
      amount: quest.rewardXp,
      source: 'quest',
    })

    const updatedCharacter: Character = {
      ...character,
      level: progression.level,
      experience: progression.experience,
      stats: progression.stats,
      powerScore: progression.powerScore,
    }

    return { instance: updatedInstance, character: updatedCharacter, levelsGained }
  }
}
