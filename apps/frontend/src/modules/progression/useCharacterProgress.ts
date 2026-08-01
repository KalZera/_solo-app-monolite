import { useMemo } from 'react'
import { progressionEngine, type LevelProgress } from './engine/progression.engine'

// Adapts a character's accumulated XP into the full analytical progression
// snapshot. All the math lives in the pure engine; this hook only memoizes the
// result so screens re-render only when the XP total actually changes.
//
// `totalXp` is the character's *accumulated* XP ("XP Total"): the engine is the
// single source of truth and derives level, progress and attribute points from
// it — nothing is recomputed by the components.
export function useCharacterProgress(totalXp: number): LevelProgress {
  return useMemo(() => progressionEngine.getProgress(totalXp), [totalXp])
}
