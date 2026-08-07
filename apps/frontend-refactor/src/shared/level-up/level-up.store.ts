import { create } from 'zustand'
import type { LevelUpEvent } from './level-up.types'

interface LevelUpState {
  event: LevelUpEvent | null
  show: (event: LevelUpEvent) => void
  dismiss: () => void
}

export const useLevelUpStore = create<LevelUpState>((set) => ({
  event: null,
  show: (event) => set({ event }),
  dismiss: () => set({ event: null }),
}))

/** Imperative trigger for non-component callers (e.g. a mutation's onSuccess). */
export function showLevelUp(event: LevelUpEvent): void {
  useLevelUpStore.getState().show(event)
}
