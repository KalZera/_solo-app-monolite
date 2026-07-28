import type { CharacterProfile } from '../types'

export const mockCharacterProfile: CharacterProfile = {
  id: 'char-mock-001',
  userId: 'user-mock-001',
  name: 'Sung Jinwoo',
  avatar: null,
  title: 'The Weakest Hunter',
  class: 'warrior',
  level: 24,
  experience: 4200,
  powerScore: 1600,
  rank: 'C',
  restPoints: 5,
  stats: {
    strength: 420,
    intelligence: 260,
    agility: 380,
    vitality: 350,
    luck: 190,
  },
  createdAt: '2026-01-04T10:00:00.000Z',
  updatedAt: '2026-07-20T18:30:00.000Z',
}
